import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@/lib/supabase';
import { ensureStripeCustomer } from '@/lib/stripe-sync';
import { createProfileData } from '@/lib/database-utils';

/**
 * API route to create Stripe customer and user profile after successful signup
 * Called from auth callback after email confirmation
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and email' },
        { status: 400 }
      );
    }

    const supabase = await createServerComponentClient();

    // Check if profile already exists (idempotency)
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingProfile) {
      console.log(`[CREATE CUSTOMER] Profile already exists for user: ${userId}`);
      return NextResponse.json({ 
        success: true, 
        message: 'Customer and profile already exist' 
      });
    }

    // Create Stripe customer (this handles idempotency internally)
    let stripeCustomerId: string;
    try {
      stripeCustomerId = await ensureStripeCustomer(userId, email);
      console.log(`[CREATE CUSTOMER] Stripe customer created/found: ${stripeCustomerId}`);
    } catch (stripeError) {
      console.error('[CREATE CUSTOMER] Stripe customer creation failed:', stripeError);
      return NextResponse.json(
        { error: 'Failed to create Stripe customer' },
        { status: 500 }
      );
    }

    // Create user profile
    try {
      const profileData = createProfileData(userId, email);
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (profileError) {
        console.error('[CREATE CUSTOMER] Profile creation failed:', profileError);
        return NextResponse.json(
          { error: 'Failed to create user profile' },
          { status: 500 }
        );
      }

      console.log(`[CREATE CUSTOMER] Profile created successfully for user: ${userId}`);
      
      return NextResponse.json({
        success: true,
        message: 'Customer and profile created successfully',
        data: {
          stripeCustomerId,
          profileId: profile.id
        }
      });

    } catch (profileError) {
      console.error('[CREATE CUSTOMER] Profile creation error:', profileError);
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('[CREATE CUSTOMER] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 