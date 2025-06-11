import { NextRequest, NextResponse } from 'next/server';
import { ensureCustomerExists } from '@/lib/customer-service';

/**
 * API route to create Stripe customer and user profile after successful signup
 * Uses atomic database functions to prevent race conditions
 * Called from auth callback after email confirmation or directly from client
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, email, fullName } = await request.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and email' },
        { status: 400 }
      );
    }

    console.log(`[CREATE CUSTOMER API] Starting customer creation for user: ${userId}`);

    // Use our race-condition-safe customer service
    const result = await ensureCustomerExists(userId, email, fullName);

    if (!result.success) {
      console.error('[CREATE CUSTOMER API] Customer creation failed:', result.error);
      return NextResponse.json(
        { error: result.error || 'Failed to create customer and profile' },
        { status: 500 }
      );
    }

    console.log(`[CREATE CUSTOMER API] Customer creation successful:`, {
      userId,
      profileId: result.profile?.id,
      stripeCustomerId: result.stripeCustomerId,
      isNewCustomer: result.isNewCustomer,
      isNewProfile: result.isNewProfile
    });

    return NextResponse.json({
      success: true,
      message: result.isNewProfile ? 'Customer and profile created successfully' : 'Customer and profile already exist',
      data: {
        stripeCustomerId: result.stripeCustomerId,
        profileId: result.profile?.id,
        isNewCustomer: result.isNewCustomer,
        isNewProfile: result.isNewProfile
      }
    });

  } catch (error) {
    console.error('[CREATE CUSTOMER API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 