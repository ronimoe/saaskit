/**
 * @jest-environment node
 * 
 * Stripe Utilities Test Suite
 */

// Mock Stripe SDK
const mockConstructEvent = jest.fn();
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    webhooks: {
      constructEvent: mockConstructEvent,
    },
  }));
});

// Mock @stripe/stripe-js
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(),
}));

import {
  SUBSCRIPTION_PLANS,
  formatPrice,
  getPlanByPriceId,
  isSubscriptionActive,
  isSubscriptionCanceling,
  verifyWebhookSignature,
  getStripe,
  type SubscriptionPlan,
  type StripeSubscription,
} from '../stripe';
import type Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

const mockLoadStripe = loadStripe as jest.MockedFunction<typeof loadStripe>;

describe('Stripe Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe('Environment-dependent constants', () => {
    it('should use environment variables for SUBSCRIPTION_PLANS', async () => {
      await jest.isolateModules(async () => {
        // Set environment variables before importing
        process.env.STRIPE_SECRET_KEY = 'sk_test_123456789';
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123456789';
        process.env.STRIPE_STARTER_PRICE_ID = 'price_starter_123';
        process.env.STRIPE_PRO_PRICE_ID = 'price_pro_123';
        process.env.STRIPE_ENTERPRISE_PRICE_ID = 'price_enterprise_123';

        const { SUBSCRIPTION_PLANS } = await import('../stripe');

        expect(SUBSCRIPTION_PLANS.STARTER).toEqual({
          name: 'Starter',
          description: 'Perfect for getting started',
          priceId: 'price_starter_123',
          price: 9.99,
          features: [
            'Up to 3 projects',
            'Basic analytics',
            'Email support',
            '5GB storage',
          ],
        });

        expect(SUBSCRIPTION_PLANS.PRO).toEqual({
          name: 'Pro',
          description: 'For growing businesses',
          priceId: 'price_pro_123',
          price: 29.99,
          features: [
            'Up to 10 projects',
            'Advanced analytics',
            'Priority support',
            '50GB storage',
            'Team collaboration',
          ],
        });

        expect(SUBSCRIPTION_PLANS.ENTERPRISE).toEqual({
          name: 'Enterprise',
          description: 'For large organizations',
          priceId: 'price_enterprise_123',
          price: 99.99,
          features: [
            'Unlimited projects',
            'Custom analytics',
            '24/7 phone support',
            '500GB storage',
            'Advanced team features',
            'Custom integrations',
          ],
        });
      });
    });
  });

  describe('Pure functions (no environment dependency)', () => {
    it('should format prices correctly in USD', async () => {
      await jest.isolateModules(async () => {
        const { formatPrice } = await import('../stripe');
        
        expect(formatPrice(9.99)).toBe('$9.99');
        expect(formatPrice(29.99)).toBe('$29.99');
        expect(formatPrice(99.99)).toBe('$99.99');
        expect(formatPrice(0)).toBe('$0.00');
        expect(formatPrice(1000)).toBe('$1,000.00');
      });
    });

    it('should check subscription status correctly', async () => {
      await jest.isolateModules(async () => {
        const { isSubscriptionActive } = await import('../stripe');
        
        expect(isSubscriptionActive('active')).toBe(true);
        expect(isSubscriptionActive('trialing')).toBe(true);
        expect(isSubscriptionActive('canceled')).toBe(false);
        expect(isSubscriptionActive('incomplete')).toBe(false);
        expect(isSubscriptionActive('incomplete_expired')).toBe(false);
        expect(isSubscriptionActive('past_due')).toBe(false);
        expect(isSubscriptionActive('unpaid')).toBe(false);
      });
    });

    it('should check if subscription is canceling', async () => {
      await jest.isolateModules(async () => {
        const stripe = await import('../stripe');
        const { isSubscriptionCanceling } = stripe;
        type StripeSubscription = stripe.StripeSubscription;
        
        const activeSubscription: StripeSubscription = {
          id: 'sub_123',
          customerId: 'cus_123',
          status: 'active',
          priceId: 'price_123',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(),
          cancelAtPeriodEnd: true,
        };

        const notCancelingSubscription: StripeSubscription = {
          ...activeSubscription,
          cancelAtPeriodEnd: false,
        };

        const canceledSubscription: StripeSubscription = {
          ...activeSubscription,
          status: 'canceled',
        };

        expect(isSubscriptionCanceling(activeSubscription)).toBe(true);
        expect(isSubscriptionCanceling(notCancelingSubscription)).toBe(false);
        expect(isSubscriptionCanceling(canceledSubscription)).toBe(false);
      });
    });
  });

  describe('Functions with environment dependency', () => {
    it('should return correct plan for valid price IDs', async () => {
      await jest.isolateModules(async () => {
        process.env.STRIPE_STARTER_PRICE_ID = 'price_starter_123';
        process.env.STRIPE_PRO_PRICE_ID = 'price_pro_123';
        process.env.STRIPE_ENTERPRISE_PRICE_ID = 'price_enterprise_123';

        const { getPlanByPriceId } = await import('../stripe');
        
        expect(getPlanByPriceId('price_starter_123')).toBe('STARTER');
        expect(getPlanByPriceId('price_pro_123')).toBe('PRO');
        expect(getPlanByPriceId('price_enterprise_123')).toBe('ENTERPRISE');
        expect(getPlanByPriceId('invalid_price_id')).toBeNull();
        expect(getPlanByPriceId('')).toBeNull();
      });
    });

    it('should verify webhook signature correctly', async () => {
      await jest.isolateModules(async () => {
        const { verifyWebhookSignature } = await import('../stripe');
        
        const mockEvent = { id: 'evt_123', type: 'payment_intent.succeeded' } as any;
        mockConstructEvent.mockReturnValue(mockEvent);

        const payload = 'webhook_payload';
        const signature = 'webhook_signature';
        const secret = 'webhook_secret';

        const result = verifyWebhookSignature(payload, signature, secret);

        expect(mockConstructEvent).toHaveBeenCalledWith(payload, signature, secret);
        expect(result).toBe(mockEvent);
      });
    });

    it('should handle Buffer payload in webhook verification', async () => {
      await jest.isolateModules(async () => {
        const { verifyWebhookSignature } = await import('../stripe');
        
        const mockEvent = { id: 'evt_123', type: 'payment_intent.succeeded' } as any;
        mockConstructEvent.mockReturnValue(mockEvent);

        const payload = Buffer.from('webhook_payload');
        const signature = 'webhook_signature';
        const secret = 'webhook_secret';

        const result = verifyWebhookSignature(payload, signature, secret);

        expect(mockConstructEvent).toHaveBeenCalledWith(payload, signature, secret);
        expect(result).toBe(mockEvent);
      });
    });

    it('should load Stripe correctly with publishable key', async () => {
      await jest.isolateModules(async () => {
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123456789';

        const { loadStripe } = await import('@stripe/stripe-js');
        const mockLoadStripe = loadStripe as jest.MockedFunction<typeof loadStripe>;
        const { getStripe } = await import('../stripe');
        
        const mockStripe = {} as any;
        mockLoadStripe.mockResolvedValue(mockStripe);

        const result = await getStripe();

        expect(mockLoadStripe).toHaveBeenCalledWith('pk_test_123456789');
        expect(result).toBe(mockStripe);
      });
    });

    it('should handle null return from loadStripe', async () => {
      await jest.isolateModules(async () => {
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123456789';

        const { loadStripe } = await import('@stripe/stripe-js');
        const mockLoadStripe = loadStripe as jest.MockedFunction<typeof loadStripe>;
        const { getStripe } = await import('../stripe');
        
        mockLoadStripe.mockResolvedValue(null);

        const result = await getStripe();

        expect(result).toBeNull();
      });
    });

    it('should reuse existing promise on subsequent calls', async () => {
      await jest.isolateModules(async () => {
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123456789';

        const { loadStripe } = await import('@stripe/stripe-js');
        const mockLoadStripe = loadStripe as jest.MockedFunction<typeof loadStripe>;
        const { getStripe } = await import('../stripe');
        
        const mockStripe = {} as any;
        mockLoadStripe.mockResolvedValue(mockStripe);

        // First call
        const result1 = await getStripe();
        
        // Second call
        const result2 = await getStripe();

        // loadStripe should only be called once due to promise caching
        expect(mockLoadStripe).toHaveBeenCalledTimes(1);
        expect(result1).toBe(mockStripe);
        expect(result2).toBe(mockStripe);
      });
    });
  });
}); 