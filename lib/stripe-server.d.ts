import Stripe from 'stripe';

export const stripe: {
  checkout: {
    sessions: {
      retrieve: (sessionId: string, options?: any) => Promise<Stripe.Checkout.Session>;
    };
  };
  customers: {
    retrieve: (customerId: string) => Promise<Stripe.Customer>;
  };
  subscriptions: {
    retrieve: (subscriptionId: string) => Promise<Stripe.Subscription>;
  };
  prices: {
    retrieve: (priceId: string) => Promise<Stripe.Price>;
  };
  products: {
    retrieve: (productId: string) => Promise<Stripe.Product>;
  };
  webhooks: {
    constructEvent: (payload: string | Buffer, signature: string, secret: string) => Stripe.Event;
  };
};

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

export function isSubscriptionActive(status: Stripe.Subscription.Status): boolean;
export function isSubscriptionCanceling(subscription: StripeSubscription): boolean;
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event; 