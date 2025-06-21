/**
 * Jest setup file for Stripe checkout verification tests
 * This file contains mocks for the Stripe modules used in the tests.
 * It is imported by the test files but is not a test file itself.
 */

// Mock modules for Stripe tests
jest.mock('@/lib/stripe-server', () => ({
  __esModule: true,
  stripe: {
    checkout: {
      sessions: {
        retrieve: jest.fn()
      }
    },
    customers: {
      retrieve: jest.fn()
    },
    subscriptions: {
      retrieve: jest.fn()
    },
    prices: {
      retrieve: jest.fn()
    },
    products: {
      retrieve: jest.fn()
    }
  }
}));

// Define a complete mock for the SubscriptionData type
const mockSubscriptionData = {
  subscriptionId: 'sub_123',
  status: 'active',
  priceId: 'price_123',
  planName: 'Pro Plan',
  currentPeriodStart: 1672531200, // 2023-01-01
  currentPeriodEnd: 1735689600, // 2025-01-01
  cancelAtPeriodEnd: false,
  trialEnd: null,
  currency: 'usd',
  unitAmount: 1500,
  interval: 'month',
  paymentMethod: {
    brand: 'visa',
    last4: '4242'
  }
};

jest.mock('@/lib/stripe-sync', () => ({
  __esModule: true,
  syncStripeCustomerData: jest.fn().mockResolvedValue(mockSubscriptionData)
}));

jest.mock('@supabase/supabase-js'); 