import { NextRequest, NextResponse } from 'next/server';
import { syncStripeCustomerData } from '@/lib/stripe-sync';
import { getCustomerByUserId } from '@/lib/customer-service';

/**
 * API endpoint to force synchronization with Stripe
 * This is useful for debugging and ensuring database consistency
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      );
    }

    console.log(`[SYNC] Forcing Stripe data sync for user: ${userId}`);

    // Get user's Stripe customer ID
    const customerResult = await getCustomerByUserId(userId);
    
    if (!customerResult.success || !customerResult.stripeCustomerId) {
      console.error('[SYNC] No Stripe customer found for user:', userId);
      return NextResponse.json(
        { error: 'No billing account found' },
        { status: 404 }
      );
    }

    const stripeCustomerId = customerResult.stripeCustomerId;
    console.log(`[SYNC] Found customer: ${stripeCustomerId} for user: ${userId}`);

    // Force sync with Stripe
    const subscriptionData = await syncStripeCustomerData(stripeCustomerId);

    return NextResponse.json({
      success: true,
      message: 'Synchronization completed',
      subscriptionData
    });

  } catch (error) {
    console.error('[SYNC] Error synchronizing with Stripe:', error);
    
    return NextResponse.json(
      { error: 'Failed to synchronize with Stripe' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 