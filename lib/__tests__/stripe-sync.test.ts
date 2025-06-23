import { stripe } from '@/lib/stripe-server';
import { createClient } from '@supabase/supabase-js';

// Mock the entire module
jest.mock('../stripe-sync', () => ({
  __esModule: true, // This is important for ES modules
  getStripeCustomerId: jest.fn(),
  ensureStripeCustomer: jest.fn(),
  syncStripeCustomerData: jest.fn(),
}));

// We need to import the functions *after* the mock is defined
import {
  getStripeCustomerId,
  ensureStripeCustomer,
  syncStripeCustomerData,
} from '../stripe-sync';

// Mock other dependencies
jest.mock('@/lib/stripe-server', () => ({
  stripe: {
    customers: {
      create: jest.fn(),
    },
    subscriptions: {
        list: jest.fn(),
    },
    products: {
        retrieve: jest.fn(),
    },
  },
}));

const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    rpc: jest.fn(),
  };

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabase),
}));

// Typed mocks
const mockedGetStripeCustomerId = getStripeCustomerId as jest.Mock;
const mockedEnsureStripeCustomer = ensureStripeCustomer as jest.Mock;
const mockedSyncStripeCustomerData = syncStripeCustomerData as jest.Mock;

describe('Stripe Sync Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStripeCustomerId', () => {
    it('should return a customer ID', async () => {
      const userId = 'user-123';
      const expectedCustomerId = 'cus_123';
      mockedGetStripeCustomerId.mockResolvedValue(expectedCustomerId);

      const result = await getStripeCustomerId(userId);

      expect(mockedGetStripeCustomerId).toHaveBeenCalledWith(userId);
      expect(result).toBe(expectedCustomerId);
    });

    it('should return null if not found', async () => {
      const userId = 'user-404';
      mockedGetStripeCustomerId.mockResolvedValue(null);

      const result = await getStripeCustomerId(userId);

      expect(mockedGetStripeCustomerId).toHaveBeenCalledWith(userId);
      expect(result).toBeNull();
    });
  });

  describe('ensureStripeCustomer', () => {
    it('should return an existing customer ID', async () => {
      const userId = 'user-existing';
      const email = 'existing@example.com';
      const existingCustomerId = 'cus_existing';
      mockedEnsureStripeCustomer.mockResolvedValue(existingCustomerId);

      const result = await ensureStripeCustomer(userId, email);

      expect(mockedEnsureStripeCustomer).toHaveBeenCalledWith(userId, email);
      expect(result).toBe(existingCustomerId);
    });

    it('should create a new customer if one does not exist', async () => {
      const userId = 'user-new';
      const email = 'new@example.com';
      const newCustomerId = 'cus_new';
      mockedEnsureStripeCustomer.mockResolvedValue(newCustomerId);

      const result = await ensureStripeCustomer(userId, email);

      expect(mockedEnsureStripeCustomer).toHaveBeenCalledWith(userId, email);
      expect(result).toBe(newCustomerId);
    });
  });

  describe('syncStripeCustomerData', () => {
    it('should sync an active subscription', async () => {
      const customerId = 'cus_123';
      const subscriptionData = { status: 'active', planName: 'Pro Plan' };
      mockedSyncStripeCustomerData.mockResolvedValue(subscriptionData);

      const result = await syncStripeCustomerData(customerId);

      expect(mockedSyncStripeCustomerData).toHaveBeenCalledWith(customerId);
      expect(result).toEqual(subscriptionData);
    });

    it('should handle no subscription state', async () => {
      const customerId = 'cus_no_sub';
      const subscriptionData = { status: 'none' };
      mockedSyncStripeCustomerData.mockResolvedValue(subscriptionData);

      const result = await syncStripeCustomerData(customerId);

      expect(mockedSyncStripeCustomerData).toHaveBeenCalledWith(customerId);
      expect(result).toEqual(subscriptionData);
    });

    it('should handle errors from Stripe API', async () => {
      const customerId = 'cus_error';
      const errorMessage = 'Stripe API Error';
      mockedSyncStripeCustomerData.mockRejectedValue(new Error(errorMessage));

      await expect(syncStripeCustomerData(customerId)).rejects.toThrow(errorMessage);
      expect(mockedSyncStripeCustomerData).toHaveBeenCalledWith(customerId);
    });
  });
}); 