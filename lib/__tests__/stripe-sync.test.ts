/**
 * @jest-environment node
 * 
 * Stripe Sync Service Test Suite (2025 Best Practices)
 * 
 * Tests for stripe-sync.ts following latest Stripe testing patterns
 */

// Mock Stripe SDK before any imports
const mockStripeInstance = {
  subscriptions: {
    list: jest.fn(),
  },
  customers: {
    create: jest.fn(),
  },
};

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => mockStripeInstance);
});

// Mock Supabase client before any imports
const mockSupabaseInstance = {
  from: jest.fn(),
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseInstance),
}));

import {
  syncStripeCustomerData,
  ensureStripeCustomer,
  type SubscriptionData,
} from '../stripe-sync';

describe('Stripe Sync Service (2025 Best Practices)', () => {
  let mockFrom: jest.Mock;
  let mockSelect: jest.Mock;
  let mockEq: jest.Mock;
  let mockSingle: jest.Mock;
  let mockInsert: jest.Mock;
  let mockUpsert: jest.Mock;
  let mockDelete: jest.Mock;
  let mockSubscriptionsList: jest.Mock;
  let mockCustomersCreate: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup environment variables
    process.env.STRIPE_SECRET_KEY = 'sk_test_123456789';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service_role_key_123';

    // Set up chain of Supabase query builder mocks
    mockSingle = jest.fn();
    mockEq = jest.fn(() => ({ single: mockSingle }));
    mockSelect = jest.fn(() => ({ eq: mockEq }));
    mockInsert = jest.fn();
    mockUpsert = jest.fn();
    mockDelete = jest.fn(() => ({ eq: jest.fn().mockResolvedValue({ data: null, error: null }) }));
    mockFrom = jest.fn();

    // Configure mockFrom to return appropriate chains based on table
    mockFrom.mockImplementation((table: string) => {
      if (table === 'stripe_customers') {
        return { 
          select: mockSelect,
          insert: mockInsert
        };
      } else if (table === 'profiles') {
        return { select: mockSelect };
      } else if (table === 'subscriptions') {
        // For subscriptions table, upsert needs to chain to select
        const mockUpsertChain = jest.fn().mockResolvedValue({ data: [{ id: 'sub_123' }], error: null });
        mockUpsert.mockReturnValue({ select: mockUpsertChain });
        
        return { 
          delete: mockDelete,
          upsert: mockUpsert,
          insert: mockInsert
        };
      }
      return { select: mockSelect };
    });

    mockSupabaseInstance.from = mockFrom;

    // Set up Stripe mocks
    mockSubscriptionsList = mockStripeInstance.subscriptions.list as jest.Mock;
    mockCustomersCreate = mockStripeInstance.customers.create as jest.Mock;
  });

  afterEach(() => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  describe('syncStripeCustomerData - Happy Path', () => {
    it('should sync customer with no subscriptions successfully', async () => {
      // Arrange
      mockSubscriptionsList.mockResolvedValue({
        object: 'list',
        data: [],
        has_more: false,
        total_count: 0,
        url: '/v1/subscriptions',
      });

      mockSingle.mockResolvedValue({
        data: { user_id: 'user_123' },
        error: null,
      });

      // Act
      const result = await syncStripeCustomerData('cus_test_customer_123');

      // Assert
      expect(result.status).toBe('none');
      expect(result.subscriptionId).toBeNull();
      expect(mockSubscriptionsList).toHaveBeenCalledWith({
        customer: 'cus_test_customer_123',
        limit: 1,
        status: 'all',
        expand: ['data.default_payment_method', 'data.items.data.price.product']
      });
    });

    it('should handle basic subscription data correctly', async () => {
      // Arrange
      const mockSubscription = {
        id: 'sub_test_subscription_123',
        object: 'subscription',
        status: 'active',
        customer: 'cus_test_customer_123',
        current_period_start: 1704067200,
        current_period_end: 1706745600,
        cancel_at_period_end: false,
        trial_end: null,
        items: {
          data: [{
            price: {
              id: 'price_test_pro_monthly',
              currency: 'usd',
              unit_amount: 2999,
              recurring: {
                interval: 'month',
              },
              product: {
                name: 'Pro Plan',
              },
            },
          }],
        },
        default_payment_method: {
          card: {
            brand: 'visa',
            last4: '4242',
          },
        },
      };

      mockSubscriptionsList.mockResolvedValue({
        object: 'list',
        data: [mockSubscription],
        has_more: false,
        total_count: 1,
        url: '/v1/subscriptions',
      });

      // Mock the database queries in order of calls
      mockSingle
        .mockResolvedValueOnce({
          data: { user_id: 'user_123' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { id: 'profile_123' },
          error: null,
        });

      // Act
      const result = await syncStripeCustomerData('cus_test_customer_123');

      // Assert
      expect(result.status).toBe('active');
      expect(result.subscriptionId).toBe('sub_test_subscription_123');
      expect(result.planName).toBe('Pro Plan');
      expect(result.unitAmount).toBe(2999);
      expect(result.currency).toBe('usd');
      expect(result.interval).toBe('month');
      expect(result.paymentMethod?.brand).toBe('visa');
      expect(result.paymentMethod?.last4).toBe('4242');
    });
  });

  describe('ensureStripeCustomer - Happy Path', () => {
    it('should create new customer when none exists', async () => {
      // Arrange
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }, // Not found error
      });

      const mockCustomer = {
        id: 'cus_test_customer_123',
        email: 'test@example.com',
      };
      mockCustomersCreate.mockResolvedValue(mockCustomer);

      // Mock the insert (no chaining for stripe_customers insert)
      mockInsert.mockResolvedValue({
        data: [{ stripe_customer_id: 'cus_test_customer_123' }],
        error: null,
      });

      // Act
      const result = await ensureStripeCustomer('user_123', 'test@example.com');

      // Assert
      expect(result).toBe('cus_test_customer_123');
      expect(mockCustomersCreate).toHaveBeenCalledWith({
        email: 'test@example.com',
        metadata: { userId: 'user_123' },
      });
    });

    it('should return existing customer when found', async () => {
      // Arrange
      mockSingle.mockResolvedValue({
        data: { stripe_customer_id: 'cus_existing_customer' },
        error: null,
      });

      // Act
      const result = await ensureStripeCustomer('user_123', 'test@example.com');

      // Assert
      expect(result).toBe('cus_existing_customer');
      expect(mockCustomersCreate).not.toHaveBeenCalled();
    });
  });

  describe('syncStripeCustomerData - Edge Cases', () => {
    it('should handle Stripe API errors gracefully', async () => {
      // Arrange
      mockSubscriptionsList.mockRejectedValue(
        new Error('Stripe API Error')
      );

      // Act & Assert
      await expect(syncStripeCustomerData('cus_test_customer_123')).rejects.toThrow('Stripe API Error');
    });

    it('should handle Supabase database errors', async () => {
      // Arrange
      mockSubscriptionsList.mockResolvedValue({
        object: 'list',
        data: [],
        has_more: false,
        total_count: 0,
        url: '/v1/subscriptions',
      });

      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Database connection error' },
      });

      // Act
      const result = await syncStripeCustomerData('cus_test_customer_123');

      // Assert - Should still return subscription data even if database update fails
      expect(result.status).toBe('none');
      expect(result.subscriptionId).toBeNull();
    });
  });
}); 