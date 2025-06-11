import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { verifyWebhookSignature } from '@/lib/stripe';
import { syncStripeCustomerData } from '@/lib/stripe-sync';

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

  console.log(`Processing webhook event: ${event.type}`);

  // Only process events we care about
  if (!relevantEvents.has(event.type)) {
    console.log(`Ignoring event type: ${event.type}`);
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
        
        console.log(`Syncing subscription data for customer: ${customerId}`);
        await syncStripeCustomerData(customerId);
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.customer && session.mode === 'subscription') {
          const customerId = typeof session.customer === 'string' 
            ? session.customer 
            : session.customer.id;
          
          console.log(`Checkout completed for subscription, syncing customer: ${customerId}`);
          await syncStripeCustomerData(customerId);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.customer) {
          const customerId = typeof invoice.customer === 'string' 
            ? invoice.customer 
            : invoice.customer.id;
          
          console.log(`Payment succeeded for customer: ${customerId}`);
          await syncStripeCustomerData(customerId);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.customer) {
          const customerId = typeof invoice.customer === 'string' 
            ? invoice.customer 
            : invoice.customer.id;
          
          console.log(`Payment failed for customer: ${customerId}, syncing status`);
          await syncStripeCustomerData(customerId);
        }
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`Error processing webhook ${event.type}:`, error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Disable body parsing for raw webhook data
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; 