import Stripe from 'stripe';
import { jest } from '@jest/globals';

// Declare module for stripe-server
declare module '@/lib/stripe-server' {
  export const stripe: {
    checkout: {
      sessions: {
        retrieve: jest.MockedFunction<(sessionId: string, options?: any) => Promise<any>>;
      };
    };
    customers: {
      retrieve: jest.MockedFunction<(customerId: string) => Promise<any>>;
    };
    subscriptions: {
      retrieve: jest.MockedFunction<(subscriptionId: string) => Promise<any>>;
    };
    prices: {
      retrieve: jest.MockedFunction<(priceId: string) => Promise<any>>;
    };
    products: {
      retrieve: jest.MockedFunction<(productId: string) => Promise<any>>;
    };
    webhooks: {
      constructEvent: jest.MockedFunction<(payload: string | Buffer, signature: string, secret: string) => any>;
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
  ): any;
}

// Declare module for stripe-sync
declare module '@/lib/stripe-sync' {
  export type SubscriptionData = {
    subscriptionId: string | null;
    status: string | 'none';
    priceId: string | null;
    planName: string | null;
    currentPeriodStart?: number | null;
    currentPeriodEnd?: number | null;
    cancelAtPeriodEnd?: boolean;
    trialEnd?: number | null;
    currency?: string | null;
    unitAmount?: number | null;
    interval?: string | null;
    paymentMethod?: {
      brand: string | null;
      last4: string | null;
    } | null;
  };

  export function syncStripeCustomerData(stripeCustomerId: string): Promise<SubscriptionData>;
  export function ensureStripeCustomer(userId: string, email: string): Promise<string>;
  export function getStripeCustomerId(userId: string): Promise<string | null>;
}

// Declare module for database types
declare module '@/types/database' {
  export interface Database {
    public: {
      Tables: {
        profiles: {
          Row: {
            id: string;
            user_id: string;
            stripe_customer_id?: string;
            [key: string]: any;
          };
          Insert: {
            id?: string;
            user_id: string;
            stripe_customer_id?: string;
            [key: string]: any;
          };
          Update: {
            id?: string;
            user_id?: string;
            stripe_customer_id?: string;
            [key: string]: any;
          };
        };
        subscriptions: {
          Row: {
            user_id: string;
            profile_id: string;
            stripe_customer_id: string;
            stripe_subscription_id: string;
            [key: string]: any;
          };
          Insert: {
            user_id: string;
            profile_id: string;
            stripe_customer_id: string;
            stripe_subscription_id: string;
            [key: string]: any;
          };
          Update: {
            user_id?: string;
            profile_id?: string;
            stripe_customer_id?: string;
            stripe_subscription_id?: string;
            [key: string]: any;
          };
        };
        stripe_customers: {
          Row: {
            user_id: string;
            stripe_customer_id: string;
            [key: string]: any;
          };
          Insert: {
            user_id: string;
            stripe_customer_id: string;
            [key: string]: any;
          };
          Update: {
            user_id?: string;
            stripe_customer_id?: string;
            [key: string]: any;
          };
        };
      };
    };
  }
} 