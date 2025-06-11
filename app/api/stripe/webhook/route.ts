import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { verifyWebhookSignature } from '@/lib/stripe-server';
import { syncStripeCustomerData } from '@/lib/stripe-sync';
import { 
  createGuestSession, 
  isGuestCustomer, 
  markSessionConsumed,
  cleanupExpiredSessions
} from '@/lib/guest-session-manager';

const relevantEvents = new Set([
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'checkout.session.completed',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
]);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    console.error('Missing stripe-signature header');
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET environment variable');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  try {
    // Verify webhook signature
    event = verifyWebhookSignature(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  console.log(`[WEBHOOK] Processing event: ${event.type}`);

  // Only process events we care about
  if (!relevantEvents.has(event.type)) {
    console.log(`[WEBHOOK] Ignoring event type: ${event.type}`);
    return NextResponse.json({ received: true });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === 'string' 
          ? subscription.customer 
          : subscription.customer.id;
        
        await handleCustomerEvent(customerId, event.type);
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.customer) {
          const customerId = typeof invoice.customer === 'string' 
            ? invoice.customer 
            : invoice.customer.id;
          
          await handleCustomerEvent(customerId, 'invoice.payment_succeeded');
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.customer) {
          const customerId = typeof invoice.customer === 'string' 
            ? invoice.customer 
            : invoice.customer.id;
          
          await handleCustomerEvent(customerId, 'invoice.payment_failed');
        }
        break;
      }
      
      default:
        console.log(`[WEBHOOK] Unhandled event type: ${event.type}`);
    }

    // Occasionally clean up expired guest sessions
    if (Math.random() < 0.1) { // 10% chance
      await cleanupExpiredSessions();
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`[WEBHOOK] Error processing webhook ${event.type}:`, error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Enhanced checkout completion handler with guest detection
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log(`[WEBHOOK] Processing checkout completed: ${session.id}`);

  if (!session.customer || session.mode !== 'subscription') {
    console.log(`[WEBHOOK] Skipping non-subscription checkout: ${session.id}`);
    return;
  }

  const customerId = typeof session.customer === 'string' 
    ? session.customer 
    : session.customer.id;

  // Check if this is a guest customer
  const guestCheck = await isGuestCustomer(customerId);
  
  if (guestCheck.error) {
    console.error(`[WEBHOOK] Error checking guest status for ${customerId}:`, guestCheck.error);
    // Continue with normal processing as fallback
    await syncStripeCustomerData(customerId);
    return;
  }

  if (guestCheck.isGuest) {
    console.log(`[WEBHOOK] Detected guest checkout for customer: ${customerId}`);
    await handleGuestCheckoutCompleted(session);
  } else {
    console.log(`[WEBHOOK] Detected authenticated checkout for customer: ${customerId}`);
    // Normal authenticated checkout - sync data immediately
    await syncStripeCustomerData(customerId);
  }
}

/**
 * Handles guest checkout completion by creating a temporary session
 */
async function handleGuestCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    if (!session.customer) {
      console.error(`[WEBHOOK] No customer found for session: ${session.id}`);
      return;
    }

    const customerId = typeof session.customer === 'string' 
      ? session.customer 
      : session.customer.id;

    // Get customer details from Stripe
    let customer: Stripe.Customer;
    if (session.customer && typeof session.customer === 'object') {
      customer = session.customer as Stripe.Customer;
    } else {
      const { stripe } = await import('@/lib/stripe-server');
      customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
    }

    if (typeof customer === 'string' || customer.deleted || !customer.email) {
      console.error(`[WEBHOOK] Invalid customer data for guest checkout: ${customerId}`);
      return;
    }

    const subscriptionId = typeof session.subscription === 'string' 
      ? session.subscription 
      : session.subscription?.id;

    // Create guest session record
    const result = await createGuestSession({
      sessionId: session.id,
      stripeCustomerId: customerId,
      subscriptionId,
      customerEmail: customer.email,
      planName: session.metadata?.planName,
      priceId: session.metadata?.priceId,
      paymentStatus: session.payment_status === 'paid' ? 'paid' : 'pending',
      amount: session.amount_total || undefined,
      currency: session.currency || undefined,
      metadata: session.metadata || {}
    });

    if (result.success) {
      console.log(`[WEBHOOK] Created guest session for: ${customer.email}`);
    } else {
      console.error(`[WEBHOOK] Failed to create guest session:`, result.error);
    }

    // Add metadata to the Stripe customer to mark it as a guest checkout
    await import('@/lib/stripe-server').then(({ stripe }) => 
      stripe.customers.update(customerId, {
        metadata: {
          ...customer.metadata,
          is_guest_checkout: 'true',
          guest_session_id: session.id,
          guest_checkout_date: new Date().toISOString()
        }
      })
    );

    console.log(`[WEBHOOK] Guest checkout processing completed for: ${customer.email}`);

  } catch (error) {
    console.error(`[WEBHOOK] Error handling guest checkout:`, error);
  }
}

/**
 * Enhanced customer event handler with guest awareness
 */
async function handleCustomerEvent(customerId: string, eventType: string) {
  console.log(`[WEBHOOK] Processing ${eventType} for customer: ${customerId}`);

  // Check if this is a guest customer
  const guestCheck = await isGuestCustomer(customerId);
  
  if (guestCheck.error) {
    console.error(`[WEBHOOK] Error checking guest status for ${customerId}:`, guestCheck.error);
    // Continue with normal processing as fallback
    await syncStripeCustomerData(customerId);
    return;
  }

  if (guestCheck.isGuest) {
    console.log(`[WEBHOOK] Skipping sync for guest customer: ${customerId} (will sync after reconciliation)`);
    // Don't sync guest customers immediately - they'll be synced after account creation
    return;
  }

  // Normal authenticated customer - proceed with sync
  console.log(`[WEBHOOK] Syncing data for authenticated customer: ${customerId}`);
  await syncStripeCustomerData(customerId);
}

// Disable body parsing for raw webhook data
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; 