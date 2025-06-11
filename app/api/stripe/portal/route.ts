import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe-server';
import { getCustomerByUserId } from '@/lib/customer-service';
import type { Database } from '@/types/database';

// Initialize Supabase client
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    console.log(`[PORTAL] Creating portal session for user: ${userId}`);

    // Get user's Stripe customer ID
    const customerResult = await getCustomerByUserId(userId);
    
    if (!customerResult.success || !customerResult.stripeCustomerId) {
      console.error('[PORTAL] No Stripe customer found for user:', userId);
      return NextResponse.json(
        { error: 'No billing account found. Please create a subscription first.' },
        { status: 404 }
      );
    }

    const stripeCustomerId = customerResult.stripeCustomerId;
    console.log(`[PORTAL] Found customer: ${stripeCustomerId} for user: ${userId}`);

    // Create Customer Portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
    });

    console.log(`[PORTAL] Portal session created: ${portalSession.id}`);

    return NextResponse.json({
      success: true,
      url: portalSession.url,
      sessionId: portalSession.id,
    });

  } catch (error) {
    console.error('[PORTAL] Error creating portal session:', error);
    
    // Provide more specific error messages based on the error type
    if (error instanceof Error) {
      // Check for configuration error specifically
      if (error.message.includes('No configuration provided') || 
          error.message.includes('default configuration has not been created')) {
        return NextResponse.json(
          { 
            error: 'Stripe Customer Portal is not configured', 
            details: 'Please configure the Customer Portal in the Stripe Dashboard at https://dashboard.stripe.com/test/settings/billing/portal',
            type: 'configuration_error'
          },
          { status: 500 }
        );
      }
      
      // Other specific error types can be added here
    }
    
    // Default error response
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    );
  }
} 