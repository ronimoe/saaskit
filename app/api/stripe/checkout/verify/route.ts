import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe-server';
import { syncStripeCustomerData } from '@/lib/stripe-sync';
import type { Database } from '@/types/database';
import type Stripe from 'stripe';

// Initialize Supabase client
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface VerificationRequest {
  sessionId: string;
  userId?: string; // Optional for guest checkouts
  isGuest?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, userId, isGuest }: VerificationRequest = await request.json();

    // Validate required fields
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing required field: sessionId' },
        { status: 400 }
      );
    }

    // For authenticated users, userId is required
    if (!isGuest && !userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId for authenticated checkout' },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer']
    });

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment was not successful' },
        { status: 400 }
      );
    }

    // Get customer ID and email
    const customerId = typeof session.customer === 'string' 
      ? session.customer 
      : session.customer?.id;

    if (!customerId) {
      return NextResponse.json(
        { error: 'No customer found in session' },
        { status: 400 }
      );
    }

    // Get customer details from Stripe to extract email
    const stripeCustomer = await stripe.customers.retrieve(customerId);
    
    if (!stripeCustomer || stripeCustomer.deleted) {
      return NextResponse.json(
        { error: 'Customer not found in Stripe' },
        { status: 400 }
      );
    }

    const customerEmail = stripeCustomer.email;
    
    if (!customerEmail) {
      return NextResponse.json(
        { error: 'No email found for customer' },
        { status: 400 }
      );
    }

    if (isGuest) {
      // Handle guest checkout verification
      return handleGuestVerification(session, customerId, customerEmail);
    } else {
      // Handle authenticated user verification
      return handleAuthenticatedVerification(session, customerId, userId!);
    }

  } catch (error) {
    console.error('Error verifying checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to verify checkout session' },
      { status: 500 }
    );
  }
}

async function handleAuthenticatedVerification(session: any, customerId: string, userId: string) {
  // Verify session belongs to the authenticated user
  if (session.metadata?.userId !== userId) {
    return NextResponse.json(
      { error: 'Unauthorized: Session does not belong to user' },
      { status: 403 }
    );
  }

  // Sync the latest subscription data from Stripe
  const subscriptionData = await syncStripeCustomerData(customerId);

  // Format response data
  const response = {
    sessionId: session.id,
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
    },
    isGuest: false
  };

  return NextResponse.json(response);
}

async function handleGuestVerification(session: any, customerId: string, customerEmail: string) {
  try {
    // Check if user with this email already exists
    const { data: existingUser, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('Error checking existing users:', userError);
      return NextResponse.json(
        { error: 'Failed to check existing users' },
        { status: 500 }
      );
    }

    const userWithEmail = existingUser.users.find(user => user.email === customerEmail);
    
    // Get subscription data from Stripe
    const subscriptionId = typeof session.subscription === 'string' 
      ? session.subscription 
      : session.subscription?.id;

    let subscriptionData: any = null;
    
         if (subscriptionId) {
       const subscription = await stripe.subscriptions.retrieve(subscriptionId) as Stripe.Subscription;
       const priceItem = subscription.items.data[0];
       if (priceItem) {
         const price = await stripe.prices.retrieve(priceItem.price.id);
         const product = await stripe.products.retrieve(price.product as string);
         
         subscriptionData = {
           planName: product.name || session.metadata?.planName || 'Unknown Plan',
           status: subscription.status,
           priceId: price.id,
           currentPeriodEnd: new Date((subscription as any).current_period_end * 1000).toISOString(),
           subscriptionId: subscription.id,
         };
       }
     }

    const response = {
      sessionId: session.id,
      subscription: subscriptionData,
      customer: {
        id: customerId,
        email: customerEmail,
      },
      isGuest: true,
      accountStatus: {
        hasExistingAccount: !!userWithEmail,
        email: customerEmail,
        userId: userWithEmail?.id || null,
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in guest verification:', error);
    return NextResponse.json(
      { error: 'Failed to verify guest checkout' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 