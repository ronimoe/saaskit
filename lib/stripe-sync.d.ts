import Stripe from 'stripe';

export type SubscriptionData = {
  subscriptionId: string | null;
  status: Stripe.Subscription.Status | 'none';
  priceId: string | null;
  planName: string | null;
  currentPeriodStart: number | null;
  currentPeriodEnd: number | null;
  cancelAtPeriodEnd: boolean;
  trialEnd: number | null;
  currency: string | null;
  unitAmount: number | null;
  interval: string | null;
  paymentMethod: {
    brand: string | null;
    last4: string | null;
  } | null;
};

export function syncStripeCustomerData(stripeCustomerId: string): Promise<SubscriptionData>;
export function ensureStripeCustomer(userId: string, email: string): Promise<string>;
export function getStripeCustomerId(userId: string): Promise<string | null>; 