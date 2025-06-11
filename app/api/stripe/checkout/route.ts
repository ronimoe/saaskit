import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-server';
import { ensureCustomerExists, getCustomerByUserId } from '@/lib/customer-service';

interface AuthenticatedCheckoutRequest {
  priceId: string;
  userId: string;
  userEmail: string;
  fullName?: string;
  isGuest: false;
}

interface GuestCheckoutRequest {
  priceId: string;
  planName: string;
  isGuest: true;
}

type CheckoutRequest = AuthenticatedCheckoutRequest | GuestCheckoutRequest;

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json();
    const { priceId, isGuest } = body;

    // Validate required fields
    if (!priceId) {
      return NextResponse.json(
        { error: 'Missing required field: priceId' },
        { status: 400 }
      );
    }

    if (isGuest) {
      // Handle guest checkout
      return handleGuestCheckout(body as GuestCheckoutRequest);
    } else {
      // Handle authenticated user checkout
      return handleAuthenticatedCheckout(body as AuthenticatedCheckoutRequest);
    }

  } catch (error) {
    console.error('[CHECKOUT] Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

async function handleGuestCheckout(body: GuestCheckoutRequest) {
  const { priceId, planName } = body;

  console.log(`[CHECKOUT] Starting guest checkout for price: ${priceId}, plan: ${planName}`);

  try {
    console.log(`[CHECKOUT] Creating guest checkout session with params:`, {
      priceId,
      planName,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}&guest=true`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel?guest=true`,
      appUrl: process.env.NEXT_PUBLIC_APP_URL
    });

    // Create Stripe Checkout Session for guest users
    const session = await stripe.checkout.sessions.create({
      // No customer ID for guest checkout - Stripe will collect email and create customer automatically
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      // customer_creation not needed in subscription mode - Stripe creates customer automatically
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}&guest=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel?guest=true`,
      metadata: {
        isGuest: 'true',
        priceId,
        planName,
        checkoutType: 'guest'
      },
      subscription_data: {
        metadata: {
          isGuest: 'true',
          priceId,
          planName,
          checkoutType: 'guest'
        },
      },
    });

    console.log(`[CHECKOUT] Guest checkout session created: ${session.id}`);

    return NextResponse.json({ 
      sessionId: session.id, 
      url: session.url,
      isGuest: true
    });

  } catch (error) {
    console.error('[CHECKOUT] Error creating guest checkout session:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      priceId,
      planName
    });
    return NextResponse.json(
      { 
        error: 'Failed to create guest checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function handleAuthenticatedCheckout(body: AuthenticatedCheckoutRequest) {
  const { priceId, userId, userEmail, fullName } = body;

  console.log(`[CHECKOUT] Starting authenticated checkout for user: ${userId}, price: ${priceId}`);

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

  try {
    // Create Stripe Checkout Session for authenticated users
    console.log(`[CHECKOUT] Creating authenticated checkout session for customer: ${stripeCustomerId}`);
    
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
        checkoutType: 'authenticated'
      },
      subscription_data: {
        metadata: {
          userId,
          priceId,
          profileId: profileId || '',
          checkoutType: 'authenticated'
        },
      },
    });

    console.log(`[CHECKOUT] Authenticated checkout session created: ${session.id}`);

    return NextResponse.json({ 
      sessionId: session.id, 
      url: session.url,
      customerId: stripeCustomerId
    });

  } catch (error) {
    console.error('[CHECKOUT] Error creating authenticated checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create authenticated checkout session' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 