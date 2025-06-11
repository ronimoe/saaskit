import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { ensureCustomerExists, getCustomerByUserId } from '@/lib/customer-service';

export async function POST(request: NextRequest) {
  try {
    const { priceId, userId, userEmail, fullName } = await request.json();

    // Validate required fields
    if (!priceId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: priceId and userId' },
        { status: 400 }
      );
    }

    console.log(`[CHECKOUT] Starting checkout for user: ${userId}, price: ${priceId}`);

    // First, try to get existing customer
    let stripeCustomerId: string | null = null;
    let profileId: string | null = null;

    const existingCustomer = await getCustomerByUserId(userId);
    
    if (existingCustomer.success && existingCustomer.stripeCustomerId) {
      // Customer exists, use existing data
      stripeCustomerId = existingCustomer.stripeCustomerId;
      profileId = existingCustomer.profile?.id || null;
      
      console.log(`[CHECKOUT] Using existing customer: ${stripeCustomerId}`);
    } else {
      // Customer doesn't exist or is incomplete, ensure customer exists
      if (!userEmail) {
        return NextResponse.json(
          { error: 'User email is required for new customer creation' },
          { status: 400 }
        );
      }

      console.log(`[CHECKOUT] Creating new customer for user: ${userId}`);
      
      const customerResult = await ensureCustomerExists(userId, userEmail, fullName);
      
      if (!customerResult.success || !customerResult.stripeCustomerId) {
        console.error('[CHECKOUT] Failed to create customer:', customerResult.error);
        return NextResponse.json(
          { error: 'Failed to create customer. Please try again.' },
          { status: 500 }
        );
      }

      stripeCustomerId = customerResult.stripeCustomerId;
      profileId = customerResult.profile?.id || null;
      
      console.log(`[CHECKOUT] Created new customer: ${stripeCustomerId}`);
    }

    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: 'Unable to determine customer ID' },
        { status: 500 }
      );
    }

    // Create Stripe Checkout Session
    console.log(`[CHECKOUT] Creating checkout session for customer: ${stripeCustomerId}`);
    
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
      metadata: {
        userId,
        priceId,
        profileId: profileId || '',
      },
      subscription_data: {
        metadata: {
          userId,
          priceId,
          profileId: profileId || '',
        },
      },
    });

    console.log(`[CHECKOUT] Checkout session created: ${session.id}`);

    return NextResponse.json({ 
      sessionId: session.id, 
      url: session.url,
      customerId: stripeCustomerId
    });

  } catch (error) {
    console.error('[CHECKOUT] Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 