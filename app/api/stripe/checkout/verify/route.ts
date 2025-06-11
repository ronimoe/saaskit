import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';
import { syncStripeCustomerData } from '@/lib/stripe-sync';
import type { Database } from '@/types/database';

// Initialize Supabase client
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { sessionId, userId } = await request.json();

    // Validate required fields
    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId and userId' },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer']
    });

    // Verify session belongs to the authenticated user
    if (session.metadata?.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Session does not belong to user' },
        { status: 403 }
      );
    }

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment was not successful' },
        { status: 400 }
      );
    }

    // Get customer ID
    const customerId = typeof session.customer === 'string' 
      ? session.customer 
      : session.customer?.id;

    if (!customerId) {
      return NextResponse.json(
        { error: 'No customer found in session' },
        { status: 400 }
      );
    }

    // Sync the latest subscription data from Stripe
    const subscriptionData = await syncStripeCustomerData(customerId);

    // Format response data
    const response = {
      sessionId,
      subscription: {
        planName: subscriptionData.planName || 'Unknown Plan',
        status: subscriptionData.status,
        priceId: subscriptionData.priceId,
        currentPeriodEnd: subscriptionData.currentPeriodEnd !== null && subscriptionData.currentPeriodEnd !== undefined
          ? new Date(subscriptionData.currentPeriodEnd * 1000).toISOString()
          : new Date().toISOString(),
        subscriptionId: subscriptionData.subscriptionId,
      },
      customer: {
        id: customerId,
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error verifying checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to verify checkout session' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 