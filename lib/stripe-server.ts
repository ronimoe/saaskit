import Stripe from 'stripe';

// Server-side Stripe configuration
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
  typescript: true,
});

// Type definitions
export interface StripeCustomer {
  id: string;
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}

export interface StripeSubscription {
  id: string;
  customerId: string;
  status: Stripe.Subscription.Status;
  priceId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  metadata?: Record<string, string>;
}

// Helper functions
export const isSubscriptionActive = (status: Stripe.Subscription.Status): boolean => {
  return ['active', 'trialing'].includes(status);
};

export const isSubscriptionCanceling = (subscription: StripeSubscription): boolean => {
  return subscription.cancelAtPeriodEnd && subscription.status === 'active';
};

// Webhook signature verification
export const verifyWebhookSignature = (
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event => {
  return stripe.webhooks.constructEvent(payload, signature, secret);
}; 