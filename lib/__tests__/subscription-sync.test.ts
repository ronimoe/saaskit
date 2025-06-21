import type Stripe from 'stripe';

// Mock environment variables first
const mockEnvVars = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
};

Object.defineProperty(process, 'env', {
  value: { ...process.env, ...mockEnvVars },
});

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn(),
};

jest.mock('../supabase', () => ({
  createServerComponentClient: jest.fn(() => mockSupabaseClient),
}));

// Mock stripe client
const mockStripe = {
  subscriptions: {
    list: jest.fn(),
  },
};

jest.mock('../stripe', () => ({
  stripe: mockStripe,
}));

// Import after mocking
import {
  syncSubscriptionWithStripe,
  syncAllSubscriptions,
  handleSubscriptionUpdate,
  getProfileByStripeCustomerId,
  getSubscriptionByStripeId,
  getActiveSubscriptionForUser,
  cancelSubscriptionInDatabase,
} from '../subscription-sync';

describe('subscription-sync', () => {
  let mockFrom: jest.Mock;
  let mockSelect: jest.Mock;
  let mockEq: jest.Mock;
  let mockIn: jest.Mock;
  let mockNot: jest.Mock;
  let mockSingle: jest.Mock;
  let mockInsert: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockDelete: jest.Mock;
  let mockUpsert: jest.Mock;

  // Mock console methods to avoid noise in tests
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock chain for Supabase operations
    mockSingle = jest.fn();
    mockEq = jest.fn().mockReturnThis();
    mockIn = jest.fn().mockReturnThis();
    mockNot = jest.fn().mockReturnThis();
    
    // Create proper mock chains
    const mockSelectChain = { 
      eq: mockEq, 
      in: mockIn,
      not: mockNot,
      single: mockSingle 
    };
    
    const mockUpdateChain = {
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn()
        })
      })
    };

    const mockDeleteChain = {
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null })
      })
    };

    const mockUpsertChain = {
      select: jest.fn().mockReturnValue({
        single: jest.fn()
      })
    };

    mockSelect = jest.fn().mockReturnValue(mockSelectChain);
    mockInsert = jest.fn().mockReturnValue({ select: jest.fn() });
    mockUpdate = jest.fn().mockReturnValue(mockUpdateChain);
    mockDelete = jest.fn().mockReturnValue(mockDeleteChain);
    mockUpsert = jest.fn().mockReturnValue(mockUpsertChain);
    
    mockFrom = jest.fn().mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
      upsert: mockUpsert,
    });

    // Setup the mock Supabase client
    mockSupabaseClient.from = mockFrom;

    // Mock console methods
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  // Test data factories
  const createMockProfile = (overrides = {}) => ({
    id: 'profile_123',
    user_id: 'user_123',
    email: 'test@example.com',
    stripe_customer_id: 'cus_test123',
    full_name: 'Test User',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  });

  const createMockStripeSubscription = (overrides = {}): Stripe.Subscription => ({
    id: 'sub_test123',
    object: 'subscription',
    application: null,
    application_fee_percent: null,
    automatic_tax: { enabled: false, disabled_reason: null, liability: null } as unknown,
    billing_cycle_anchor: 1704067200,
    billing_thresholds: null,
    cancel_at: null,
    cancel_at_period_end: false,
    canceled_at: null,
    collection_method: 'charge_automatically',
    created: 1704067200,
    currency: 'usd',
    current_period_start: 1704067200,
    current_period_end: 1706745600,
    customer: 'cus_test123',
    days_until_due: null,
    default_payment_method: null,
    default_source: null,
    default_tax_rates: [],
    description: null,
    discount: null,
    ended_at: null,
    items: {
      object: 'list',
      data: [
        {
          id: 'si_test123',
          object: 'subscription_item',
          billing_thresholds: null,
          created: 1704067200,
          metadata: {},
          current_period_start: 1704067200,
          current_period_end: 1706745600,
          price: {
            id: 'price_starter_123',
            object: 'price',
            active: true,
            billing_scheme: 'per_unit',
            created: 1704067200,
            currency: 'usd',
            custom_unit_amount: null,
            livemode: false,
            lookup_key: null,
            metadata: {},
            nickname: 'Starter',
            product: 'prod_test123',
            recurring: {
              interval: 'month',
              interval_count: 1,
              trial_period_days: null,
              usage_type: 'licensed',
            } as unknown,
            tax_behavior: 'unspecified',
            tiers_mode: null,
            transform_quantity: null,
            type: 'recurring',
            unit_amount: 999,
            unit_amount_decimal: '999',
          },
          quantity: 1,
          subscription: 'sub_test123',
          tax_rates: [],
        } as unknown,
      ],
      has_more: false,
      total_count: 1,
      url: '/v1/subscription_items',
    } as unknown,
    latest_invoice: null,
    livemode: false,
    metadata: {},
    next_pending_invoice_item_invoice: null,
    on_behalf_of: null,
    pause_collection: null,
    payment_settings: {
      payment_method_options: null,
      payment_method_types: null,
      save_default_payment_method: 'off',
    },
    pending_invoice_item_interval: null,
    pending_setup_intent: null,
    pending_update: null,
    schedule: null,
    start_date: 1704067200,
    status: 'active',
    test_clock: null,
    transfer_data: null,
    trial_end: null,
    trial_settings: { end_behavior: { missing_payment_method: 'create_invoice' } },
    trial_start: null,
    ...overrides,
  } as unknown as Stripe.Subscription);

  describe('syncSubscriptionWithStripe', () => {
    it('successfully syncs an active subscription for a user', async () => {
      const mockProfile = createMockProfile();
      const mockSubscription = createMockStripeSubscription();

      // Mock profile lookup
      mockSingle.mockResolvedValueOnce({ data: mockProfile, error: null });

      // Mock Stripe API call
      mockStripe.subscriptions.list.mockResolvedValueOnce({
        data: [mockSubscription],
      });

      // Mock successful upsert
      mockUpsert.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: {}, error: null })
        })
      });

      const result = await syncSubscriptionWithStripe('user_123');

      expect(result.success).toBe(true);
      expect(mockFrom).toHaveBeenCalledWith('profiles');
      expect(mockStripe.subscriptions.list).toHaveBeenCalledWith({
        customer: 'cus_test123',
        status: 'all',
      });
      expect(mockUpsert).toHaveBeenCalled();
    });

    it('handles user profile not found', async () => {
      mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'Profile not found' } });

      const result = await syncSubscriptionWithStripe('user_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('User profile not found');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('handles user with no Stripe customer ID', async () => {
      const mockProfile = createMockProfile({ stripe_customer_id: null });
      mockSingle.mockResolvedValueOnce({ data: mockProfile, error: null });

      const result = await syncSubscriptionWithStripe('user_123');

      expect(result.success).toBe(true);
      expect(result.message).toBe('No Stripe customer ID found');
    });

    it('handles no active subscription found', async () => {
      const mockProfile = createMockProfile();
      mockSingle.mockResolvedValueOnce({ data: mockProfile, error: null });

      // Mock Stripe API returning no active subscriptions
      mockStripe.subscriptions.list.mockResolvedValueOnce({
        data: [createMockStripeSubscription({ status: 'canceled' })],
      });

      // Mock successful delete
      mockDelete.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null })
        })
      });

      const result = await syncSubscriptionWithStripe('user_123');

      expect(result.success).toBe(true);
      expect(result.message).toBe('No active subscription found - removed existing records');
    });

    it('handles subscription with no items', async () => {
      const mockProfile = createMockProfile();
      const mockSubscription = createMockStripeSubscription({ 
        items: { object: 'list', data: [], has_more: false, total_count: 0, url: '' }
      });

      mockSingle.mockResolvedValueOnce({ data: mockProfile, error: null });
      mockStripe.subscriptions.list.mockResolvedValueOnce({
        data: [mockSubscription],
      });

      const result = await syncSubscriptionWithStripe('user_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('No subscription items found');
    });

    it('handles database upsert errors', async () => {
      const mockProfile = createMockProfile();
      const mockSubscription = createMockStripeSubscription();

      mockSingle.mockResolvedValueOnce({ data: mockProfile, error: null });
      mockStripe.subscriptions.list.mockResolvedValueOnce({
        data: [mockSubscription],
      });

      // Mock upsert error
      mockUpsert.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ 
            data: null, 
            error: { message: 'Upsert failed' } 
          })
        })
      });

      const result = await syncSubscriptionWithStripe('user_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to update subscription');
    });
  });

  describe('syncAllSubscriptions', () => {
    it('successfully syncs all profiles with Stripe customer IDs', async () => {
      const mockProfiles = [
        { id: 'profile_1', user_id: 'user_1', stripe_customer_id: 'cus_1' },
        { id: 'profile_2', user_id: 'user_2', stripe_customer_id: 'cus_2' },
      ];

      mockSelect.mockReturnValue({ 
        not: mockNot.mockResolvedValue({ data: mockProfiles, error: null }) 
      });

      // Mock individual sync calls
      const mockSyncResult = { success: true, data: {} };
      jest.spyOn(require('../subscription-sync'), 'syncSubscriptionWithStripe')
        .mockResolvedValue(mockSyncResult);

      const result = await syncAllSubscriptions();

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(2);
    });

    it('handles database error when fetching profiles', async () => {
      mockSelect.mockReturnValue({ 
        not: mockNot.mockResolvedValue({ 
          data: null, 
          error: { message: 'Database error' } 
        }) 
      });

      const result = await syncAllSubscriptions();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch profiles');
    });
  });

  describe('handleSubscriptionUpdate', () => {
    it('successfully handles subscription update', async () => {
      const mockProfile = createMockProfile();
      const mockSubscription = createMockStripeSubscription();

      mockSingle.mockResolvedValueOnce({ data: mockProfile, error: null });

      mockUpsert.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: {}, error: null })
        })
      });

      const result = await handleSubscriptionUpdate(mockSubscription);

      expect(result.success).toBe(true);
      expect(mockFrom).toHaveBeenCalledWith('profiles');
      expect(mockUpsert).toHaveBeenCalled();
    });

    it('handles missing customer ID', async () => {
      const mockSubscription = createMockStripeSubscription({ customer: null });

      const result = await handleSubscriptionUpdate(mockSubscription);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to handle subscription update');
    });

    it('handles profile not found', async () => {
      const mockSubscription = createMockStripeSubscription();
      mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } });

      const result = await handleSubscriptionUpdate(mockSubscription);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Profile not found');
    });
  });

  describe('getProfileByStripeCustomerId', () => {
    it('successfully retrieves profile by customer ID', async () => {
      const mockProfile = createMockProfile();
      mockSingle.mockResolvedValueOnce({ data: mockProfile, error: null });

      const result = await getProfileByStripeCustomerId('cus_test123');

      expect(result).toEqual(mockProfile);
      expect(mockFrom).toHaveBeenCalledWith('profiles');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('stripe_customer_id', 'cus_test123');
    });

    it('returns null when profile is not found', async () => {
      const dbError = { code: 'PGRST116', message: 'No rows returned' };
      mockSingle.mockResolvedValueOnce({ data: null, error: dbError });

      const result = await getProfileByStripeCustomerId('cus_nonexistent');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching profile by customer ID:', dbError);
    });

    it('returns null on database error', async () => {
      const dbError = { code: '50000', message: 'Connection failed' };
      mockSingle.mockResolvedValueOnce({ data: null, error: dbError });

      const result = await getProfileByStripeCustomerId('cus_test123');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching profile by customer ID:', dbError);
    });
  });

  describe('getSubscriptionByStripeId', () => {
    it('successfully retrieves subscription by Stripe ID', async () => {
      const mockSubscription = {
        id: 'sub_local123',
        stripe_subscription_id: 'sub_test123',
        status: 'active',
        plan_name: 'Pro',
      };
      mockSingle.mockResolvedValueOnce({ data: mockSubscription, error: null });

      const result = await getSubscriptionByStripeId('sub_test123');

      expect(result).toEqual(mockSubscription);
      expect(mockFrom).toHaveBeenCalledWith('subscriptions');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('stripe_subscription_id', 'sub_test123');
    });

    it('returns null when subscription is not found', async () => {
      const dbError = { code: 'PGRST116', message: 'No rows returned' };
      mockSingle.mockResolvedValueOnce({ data: null, error: dbError });

      const result = await getSubscriptionByStripeId('sub_nonexistent');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching subscription by Stripe ID:', dbError);
    });

    it('returns null on database error', async () => {
      const dbError = { code: '50000', message: 'Connection failed' };
      mockSingle.mockResolvedValueOnce({ data: null, error: dbError });

      const result = await getSubscriptionByStripeId('sub_test123');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching subscription by Stripe ID:', dbError);
    });
  });

  describe('getActiveSubscriptionForUser', () => {
    it('successfully retrieves active subscription for user', async () => {
      const mockSubscription = {
        id: 'sub_local123',
        user_id: 'user_123',
        status: 'active',
        plan_name: 'Pro',
      };
      mockSingle.mockResolvedValueOnce({ data: mockSubscription, error: null });

      const result = await getActiveSubscriptionForUser('user_123');

      expect(result).toEqual(mockSubscription);
      expect(mockFrom).toHaveBeenCalledWith('subscriptions');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('user_id', 'user_123');
      expect(mockIn).toHaveBeenCalledWith('status', ['active', 'trialing']);
    });

    it('returns null when no active subscription found', async () => {
      const dbError = { code: 'PGRST116', message: 'No rows returned' };
      mockSingle.mockResolvedValueOnce({ data: null, error: dbError });

      const result = await getActiveSubscriptionForUser('user_123');

      expect(result).toBeNull();
      // Should not log error for common "no subscription found" case
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('returns null and logs error on database error', async () => {
      const dbError = { code: '50000', message: 'Connection failed' };
      mockSingle.mockResolvedValueOnce({ data: null, error: dbError });

      const result = await getActiveSubscriptionForUser('user_123');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching active subscription:', dbError);
    });
  });

  describe('cancelSubscriptionInDatabase', () => {
    it('successfully cancels subscription in database', async () => {
      const mockSubscription = {
        id: 'sub_local123',
        stripe_subscription_id: 'sub_test123',
        status: 'canceled',
        canceled_at: expect.any(String),
      };

      mockUpdate.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockSubscription, error: null })
          })
        })
      });

      const result = await cancelSubscriptionInDatabase('sub_test123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSubscription);
      expect(mockFrom).toHaveBeenCalledWith('subscriptions');
      expect(mockUpdate).toHaveBeenCalledWith({
        status: 'canceled',
        canceled_at: expect.any(String),
      });
    });

    it('handles database error when canceling subscription', async () => {
      const dbError = { message: 'Update failed' };
      
      mockUpdate.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: dbError })
          })
        })
      });

      const result = await cancelSubscriptionInDatabase('sub_test123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to cancel subscription');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error canceling subscription in database:', dbError);
    });
  });
}); 