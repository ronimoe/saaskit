import { stripe } from '@/lib/stripe-server';

// First, unmock the stripe-sync module so we can test the real implementation
jest.unmock('@/lib/stripe-sync');

// Mock dependencies, but NOT the functions we're testing
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

// Mock the Supabase client instance that gets created in stripe-sync
const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
  upsert: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  rpc: jest.fn(),
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabase),
}));

// Mock getPlanByPriceId to avoid dependency issues
jest.mock('@/lib/stripe-plans', () => ({
  getPlanByPriceId: jest.fn(() => 'pro'),
  SUBSCRIPTION_PLANS: {
    pro: { name: 'Pro Plan' }
  }
}));

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

// Import the actual functions we want to test (after unmocking)
import {
  getStripeCustomerId,
  ensureStripeCustomer,
  syncStripeCustomerData,
} from '../stripe-sync';

describe('Stripe Sync Service - Real Implementation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStripeCustomerId', () => {
    it('should return customer ID when found in subscriptions table', async () => {
      const userId = 'user-123';
      const expectedCustomerId = 'cus_123';
      
      mockSupabase.single.mockResolvedValue({
        data: { stripe_customer_id: expectedCustomerId },
        error: null
      });

      const result = await getStripeCustomerId(userId);

      expect(mockSupabase.from).toHaveBeenCalledWith('subscriptions');
      expect(mockSupabase.select).toHaveBeenCalledWith('stripe_customer_id');
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', userId);
      expect(result).toBe(expectedCustomerId);
    });

    it('should return null when customer not found', async () => {
      const userId = 'user-404';
      
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' }
      });

      const result = await getStripeCustomerId(userId);

      expect(result).toBeNull();
    });
  });

  describe('ensureStripeCustomer', () => {
    it('should return existing customer ID when found in subscriptions', async () => {
      const userId = 'user-existing';
      const email = 'existing@example.com';
      const existingCustomerId = 'cus_existing';
      
      // Mock that customer already exists in subscriptions table
      mockSupabase.single.mockResolvedValue({
        data: { stripe_customer_id: existingCustomerId },
        error: null
      });

      const result = await ensureStripeCustomer(userId, email);

      expect(result).toBe(existingCustomerId);
      expect(stripe.customers.create).not.toHaveBeenCalled();
    });

    it('should create new customer when none exists', async () => {
      const userId = 'user-new';
      const email = 'new@example.com';
      const newCustomerId = 'cus_new';
      
      // Mock that no customer exists in any table
      mockSupabase.single
        .mockResolvedValueOnce({ data: null, error: { message: 'Not found' } }) // subscriptions
        .mockResolvedValueOnce({ data: null, error: { message: 'Not found' } }) // profiles
        .mockResolvedValueOnce({ data: null, error: { message: 'Not found' } }); // stripe_customers
      
      // Mock Stripe customer creation
      (stripe.customers.create as jest.Mock).mockResolvedValue({
        id: newCustomerId,
        email: email
      });

      // Mock the rpc call for creating customer record
      mockSupabase.rpc.mockResolvedValue({ data: null, error: null });

      const result = await ensureStripeCustomer(userId, email);

      expect(stripe.customers.create).toHaveBeenCalledWith({
        email: email,
        metadata: { userId: userId }
      });
      expect(result).toBe(newCustomerId);
    });
  });

  describe('syncStripeCustomerData', () => {
    it('should sync subscription data successfully', async () => {
      const customerId = 'cus_123';
      const mockSubscription = {
        id: 'sub_123',
        status: 'active',
        current_period_start: 1640995200,
        current_period_end: 1643673600,
        cancel_at_period_end: false,
        trial_end: null,
        items: {
          data: [{
            price: {
              id: 'price_123',
              currency: 'usd',
              unit_amount: 2000,
              recurring: { interval: 'month' },
              product: 'prod_123'
            }
          }]
        },
        default_payment_method: {
          card: {
            brand: 'visa',
            last4: '4242'
          }
        }
      };

      // Mock Stripe subscriptions list
      (stripe.subscriptions.list as jest.Mock).mockResolvedValue({
        data: [mockSubscription]
      });

      // Mock product retrieval
      (stripe.products.retrieve as jest.Mock).mockResolvedValue({
        name: 'Pro Plan'
      });

      // Mock finding user in database - first call finds subscription
      mockSupabase.single.mockResolvedValue({
        data: { user_id: 'user-123', profile_id: 'profile-123' },
        error: null
      });

      // Mock upsert operation and select chain
      mockSupabase.select.mockResolvedValue({ data: null, error: null });

      const result = await syncStripeCustomerData(customerId);

      expect(result.subscriptionId).toBe('sub_123');
      expect(result.status).toBe('active');
      expect(result.priceId).toBe('price_123');
      expect(result.planName).toBe('Pro Plan');
      expect(result.currency).toBe('usd');
      expect(result.unitAmount).toBe(2000);
      expect(result.interval).toBe('month');

      expect(stripe.subscriptions.list).toHaveBeenCalledWith({
        customer: customerId,
        limit: 1,
        status: 'all',
        expand: ['data.default_payment_method', 'data.items.data.price']
      });
    });

    it('should handle customer with no subscription', async () => {
      const customerId = 'cus_no_sub';

      // Mock empty subscriptions list
      (stripe.subscriptions.list as jest.Mock).mockResolvedValue({
        data: []
      });

      // Mock finding user in database
      mockSupabase.single.mockResolvedValue({
        data: { user_id: 'user-123', profile_id: 'profile-123' },
        error: null
      });

      const result = await syncStripeCustomerData(customerId);

      expect(result).toEqual({
        subscriptionId: null,
        status: 'none',
        priceId: null,
        planName: null,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        trialEnd: null,
        currency: null,
        unitAmount: null,
        interval: null,
        paymentMethod: null
      });
    });

    it('should handle Stripe API errors', async () => {
      const customerId = 'cus_error';
      const errorMessage = 'Stripe API Error';

      (stripe.subscriptions.list as jest.Mock).mockRejectedValue(new Error(errorMessage));

      await expect(syncStripeCustomerData(customerId)).rejects.toThrow(errorMessage);
    });
  });
}); 