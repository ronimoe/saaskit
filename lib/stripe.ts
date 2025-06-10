import Stripe from 'stripe';
import { loadStripe, Stripe as StripeClient } from '@stripe/stripe-js';

// Server-side Stripe configuration
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
  typescript: true,
});

// Client-side Stripe configuration
let stripePromise: Promise<StripeClient | null>;

const getStripe = (): Promise<StripeClient | null> => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

// Subscription plan configuration
export const SUBSCRIPTION_PLANS = {
  STARTER: {
    name: 'Starter',
    description: 'Perfect for getting started',
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    price: 9.99,
    features: [
      'Up to 3 projects',
      'Basic analytics',
      'Email support',
      '5GB storage',
    ],
  },
  PRO: {
    name: 'Pro',
    description: 'For growing businesses',
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    price: 29.99,
    features: [
      'Up to 10 projects',
      'Advanced analytics',
      'Priority support',
      '50GB storage',
      'Team collaboration',
    ],
  },
  ENTERPRISE: {
    name: 'Enterprise',
    description: 'For large organizations',
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
    price: 99.99,
    features: [
      'Unlimited projects',
      'Custom analytics',
      '24/7 phone support',
      '500GB storage',
      'Advanced team features',
      'Custom integrations',
    ],
  },
} as const;

// Type definitions
export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;

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
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export const getPlanByPriceId = (priceId: string): SubscriptionPlan | null => {
  for (const [planKey, plan] of Object.entries(SUBSCRIPTION_PLANS)) {
    if (plan.priceId === priceId) {
      return planKey as SubscriptionPlan;
    }
  }
  return null;
};

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

// Export instances
export { stripe, getStripe };
export default stripe; 