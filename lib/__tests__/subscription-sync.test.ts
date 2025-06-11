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

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

// Mock stripe utilities
jest.mock('../stripe', () => ({
  getPlanByPriceId: jest.fn(),
  SUBSCRIPTION_PLANS: {
    STARTER: {
      name: 'Starter',
      description: 'Perfect for getting started',
      priceId: 'price_starter_123',
      price: 9.99,
    },
    PRO: {
      name: 'Pro',
      description: 'For growing businesses',
      priceId: 'price_pro_123',
      price: 29.99,
    },
    ENTERPRISE: {
      name: 'Enterprise',
      description: 'For large organizations',
      priceId: 'price_enterprise_123',
      price: 99.99,
    },
  },
}));

// Mock database-utils
jest.mock('../database-utils', () => ({
  createSubscriptionFromStripe: jest.fn(),
}));

// Import after mocking
import {
  syncSubscriptionWithStripe,
  getProfileByStripeCustomerId,
  getSubscriptionByStripeId,
  type WebhookEventType,
} from '../subscription-sync';
import { getPlanByPriceId } from '../stripe';
import { createClient } from '@supabase/supabase-js';

describe('subscription-sync', () => {
  let mockFrom: jest.Mock;
  let mockSelect: jest.Mock;
  let mockEq: jest.Mock;
  let mockSingle: jest.Mock;
  let mockInsert: jest.Mock;
  let mockUpdate: jest.Mock;

  // Mock console methods to avoid noise in tests
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock chain for Supabase operations
    mockSingle = jest.fn();
    mockEq = jest.fn().mockReturnThis();
    mockSelect = jest.fn().mockReturnValue({ eq: mockEq, single: mockSingle });
    mockInsert = jest.fn().mockReturnValue({ select: jest.fn() });
    mockUpdate = jest.fn().mockReturnValue({ eq: mockEq, select: jest.fn() });
    mockFrom = jest.fn().mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
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
    automatic_tax: { enabled: false, disabled_reason: null, liability: null } as any,
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
            nickname: null,
            product: 'prod_test123',
            recurring: {
              interval: 'month',
              interval_count: 1,
              trial_period_days: null,
              usage_type: 'licensed',
            } as any,
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
        } as any,
      ],
      has_more: false,
      total_count: 1,
      url: '/v1/subscription_items',
    } as any,
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
    it('successfully syncs a new subscription creation', async () => {
      const mockProfile = createMockProfile();
      const mockSubscription = createMockStripeSubscription();

      // Mock profile lookup
      mockSingle.mockResolvedValueOnce({ data: mockProfile, error: null });

      // Mock subscription creation (no existing subscription)
      mockSingle.mockResolvedValueOnce({ data: null, error: null });

      // Mock plan lookup
      (getPlanByPriceId as jest.Mock).mockReturnValue('STARTER');

      // Mock successful insertion
      mockInsert.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: {}, error: null }),
      });

      await expect(
        syncSubscriptionWithStripe(mockSubscription, 'customer.subscription.created')
      ).resolves.not.toThrow();

      expect(mockFrom).toHaveBeenCalledWith('profiles');
      expect(mockFrom).toHaveBeenCalledWith('subscriptions');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        `Syncing subscription ${mockSubscription.id} for event customer.subscription.created`
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        `Successfully synced subscription ${mockSubscription.id}`
      );
    });

    it('successfully syncs a subscription update', async () => {
      const mockProfile = createMockProfile();
      const mockSubscription = createMockStripeSubscription({
        status: 'past_due',
        cancel_at_period_end: true,
      });

      // Mock profile lookup
      mockSingle.mockResolvedValueOnce({ data: mockProfile, error: null });

      // Mock plan lookup
      (getPlanByPriceId as jest.Mock).mockReturnValue('STARTER');

      // Mock successful update
      mockUpdate.mockReturnValue({
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: {}, error: null }),
      });

      await expect(
        syncSubscriptionWithStripe(mockSubscription, 'customer.subscription.updated')
      ).resolves.not.toThrow();

      expect(mockFrom).toHaveBeenCalledWith('subscriptions');
    });

    it('successfully syncs a subscription deletion', async () => {
      const mockProfile = createMockProfile();
      const mockSubscription = createMockStripeSubscription({
        status: 'canceled',
        canceled_at: 1704067200,
      });

      // Mock profile lookup
      mockSingle.mockResolvedValueOnce({ data: mockProfile, error: null });

      // Mock successful update
      mockUpdate.mockReturnValue({
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: {}, error: null }),
      });

      await expect(
        syncSubscriptionWithStripe(mockSubscription, 'customer.subscription.deleted')
      ).resolves.not.toThrow();

      expect(mockUpdate).toHaveBeenCalled();
    });

    it('throws error when profile is not found', async () => {
      const mockSubscription = createMockStripeSubscription();

      // Mock profile lookup failure
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'Profile not found' },
      });

      await expect(
        syncSubscriptionWithStripe(mockSubscription, 'customer.subscription.created')
      ).rejects.toThrow('Profile not found for customer cus_test123');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Could not find profile for Stripe customer cus_test123:',
        { message: 'Profile not found' }
      );
    });

    it('throws error when profile data is null', async () => {
      const mockSubscription = createMockStripeSubscription();

      // Mock profile lookup returning null data
      mockSingle.mockResolvedValueOnce({ data: null, error: null });

      await expect(
        syncSubscriptionWithStripe(mockSubscription, 'customer.subscription.created')
      ).rejects.toThrow('Profile not found for customer cus_test123');
    });

    it('handles unhandled event types gracefully', async () => {
      const mockProfile = createMockProfile();
      const mockSubscription = createMockStripeSubscription();

      // Mock profile lookup
      mockSingle.mockResolvedValueOnce({ data: mockProfile, error: null });

      await expect(
        syncSubscriptionWithStripe(mockSubscription, 'customer.subscription.unknown' as WebhookEventType)
      ).resolves.not.toThrow();

      expect(consoleWarnSpy).toHaveBeenCalledWith('Unhandled event type: customer.subscription.unknown');
    });

    it('re-throws errors for webhook retry mechanism', async () => {
      const mockSubscription = createMockStripeSubscription();
      const testError = new Error('Database connection failed');

      // Mock profile lookup failure
      mockSingle.mockRejectedValueOnce(testError);

      await expect(
        syncSubscriptionWithStripe(mockSubscription, 'customer.subscription.created')
      ).rejects.toThrow('Database connection failed');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Failed to sync subscription ${mockSubscription.id}:`,
        testError
      );
    });

    it('throws error when subscription has no valid items', async () => {
      const mockProfile = createMockProfile();
      const mockSubscription = createMockStripeSubscription({
        items: { object: 'list', data: [], has_more: false, total_count: 0, url: '' },
      });

      mockSingle
        .mockResolvedValueOnce({ data: mockProfile, error: null }) // Profile lookup
        .mockResolvedValueOnce({ data: null, error: null }); // Existing subscription check

      await expect(
        syncSubscriptionWithStripe(mockSubscription, 'customer.subscription.created')
      ).rejects.toThrow(`Subscription ${mockSubscription.id} has no valid items or pricing`);
    });

    it('throws error when subscription item has no price', async () => {
      const mockProfile = createMockProfile();
      const mockSubscription = createMockStripeSubscription();

      // Remove price from subscription item
      mockSubscription.items.data[0].price = null as any;

      mockSingle
        .mockResolvedValueOnce({ data: mockProfile, error: null }) // Profile lookup
        .mockResolvedValueOnce({ data: null, error: null }); // Existing subscription check

      await expect(
        syncSubscriptionWithStripe(mockSubscription, 'customer.subscription.created')
      ).rejects.toThrow(`Subscription ${mockSubscription.id} has no valid items or pricing`);
    });

    it('handles database insertion errors', async () => {
      const mockProfile = createMockProfile();
      const mockSubscription = createMockStripeSubscription();
      const dbError = new Error('Unique constraint violation');

      mockSingle
        .mockResolvedValueOnce({ data: mockProfile, error: null }) // Profile lookup
        .mockResolvedValueOnce({ data: null, error: null }); // Existing subscription check

      (getPlanByPriceId as jest.Mock).mockReturnValue('STARTER');

      // Override the insert mock to return error on select
      const mockSelectWithError = jest.fn().mockRejectedValue(dbError);
      mockInsert.mockReturnValue({
        select: mockSelectWithError,
      });

      await expect(
        syncSubscriptionWithStripe(mockSubscription, 'customer.subscription.created')
      ).rejects.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Failed to sync subscription ${mockSubscription.id}:`,
        dbError
      );
    });

    it('handles update database errors', async () => {
      const mockProfile = createMockProfile();
      const mockSubscription = createMockStripeSubscription();
      const dbError = new Error('Update failed');

      mockSingle.mockResolvedValueOnce({ data: mockProfile, error: null });
      (getPlanByPriceId as jest.Mock).mockReturnValue('STARTER');

      const mockSelectChain = jest.fn().mockRejectedValue(dbError);
      const mockUpdateChain = {
        eq: jest.fn().mockReturnThis(),
        select: mockSelectChain,
      };
      mockUpdate.mockReturnValue(mockUpdateChain);

      await expect(
        syncSubscriptionWithStripe(mockSubscription, 'customer.subscription.updated')
      ).rejects.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Failed to sync subscription ${mockSubscription.id}:`,
        dbError
      );
    });

    it('handles deletion database errors', async () => {
      const mockProfile = createMockProfile();
      const mockSubscription = createMockStripeSubscription();
      const dbError = new Error('Delete failed');

      mockSingle.mockResolvedValueOnce({ data: mockProfile, error: null });

      const mockSelectChain = jest.fn().mockRejectedValue(dbError);
      const mockUpdateChain = {
        eq: jest.fn().mockReturnThis(),
        select: mockSelectChain,
      };
      mockUpdate.mockReturnValue(mockUpdateChain);

      await expect(
        syncSubscriptionWithStripe(mockSubscription, 'customer.subscription.deleted')
      ).rejects.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Failed to sync subscription ${mockSubscription.id}:`,
        dbError
      );
    });
  });

  describe('handleSubscriptionCreated', () => {
    it('creates a new subscription with all required fields', async () => {
      const mockProfile = createMockProfile();
      const mockSubscription = createMockStripeSubscription();

      // Mock profile lookup
      mockSingle
        .mockResolvedValueOnce({ data: mockProfile, error: null })
        .mockResolvedValueOnce({ data: null, error: null }); // No existing subscription

      // Mock plan lookup
      (getPlanByPriceId as jest.Mock).mockReturnValue('STARTER');

      // Mock successful insertion
      mockInsert.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: {}, error: null }),
      });

      await syncSubscriptionWithStripe(mockSubscription, 'customer.subscription.created');

      // Verify subscription data structure
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: mockProfile.user_id,
        profile_id: mockProfile.id,
        stripe_customer_id: mockSubscription.customer,
        stripe_subscription_id: mockSubscription.id,
        stripe_price_id: 'price_starter_123',
        status: 'active',
        plan_name: 'Starter',
        plan_description: 'Perfect for getting started',
        interval: 'month',
        interval_count: 1,
        unit_amount: 999,
        currency: 'usd',
        current_period_start: '2024-01-01T00:00:00.000Z',
        current_period_end: '2024-02-01T00:00:00.000Z',
        trial_start: null,
        trial_end: null,
        cancel_at_period_end: false,
        canceled_at: null,
        cancel_at: null,
        metadata: {},
      });
    });

    it('handles yearly subscription intervals', async () => {
      const mockProfile = createMockProfile();
      const mockSubscription = createMockStripeSubscription();

      // Modify the subscription to have yearly billing
      mockSubscription.items.data[0].price.recurring!.interval = 'year';

      mockSingle
        .mockResolvedValueOnce({ data: mockProfile, error: null })
        .mockResolvedValueOnce({ data: null, error: null });

      (getPlanByPriceId as jest.Mock).mockReturnValue('PRO');

      mockInsert.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: {}, error: null }),
      });

      await syncSubscriptionWithStripe(mockSubscription, 'customer.subscription.created');

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          interval: 'year',
          plan_name: 'Pro',
        })
      );
    });

    it('handles subscriptions with trial periods', async () => {
      const mockProfile = createMockProfile();
      const mockSubscription = createMockStripeSubscription({
        trial_start: 1704067200,
        trial_end: 1706745600,
      });

      mockSingle
        .mockResolvedValueOnce({ data: mockProfile, error: null })
        .mockResolvedValueOnce({ data: null, error: null });

      (getPlanByPriceId as jest.Mock).mockReturnValue('STARTER');

      mockInsert.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: {}, error: null }),
      });

      await syncSubscriptionWithStripe(mockSubscription, 'customer.subscription.created');

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          trial_start: '2024-01-01T00:00:00.000Z',
          trial_end: '2024-02-01T00:00:00.000Z',
        })
      );
    });

    it('handles subscriptions with cancellation data', async () => {
      const mockProfile = createMockProfile();
      const mockSubscription = createMockStripeSubscription({
        cancel_at_period_end: true,
        canceled_at: 1704067200,
        cancel_at: 1706745600,
      });

      mockSingle
        .mockResolvedValueOnce({ data: mockProfile, error: null })
        .mockResolvedValueOnce({ data: null, error: null });

      (getPlanByPriceId as jest.Mock).mockReturnValue('STARTER');

      mockInsert.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: {}, error: null }),
      });

      await syncSubscriptionWithStripe(mockSubscription, 'customer.subscription.created');

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          cancel_at_period_end: true,
          canceled_at: '2024-01-01T00:00:00.000Z',
          cancel_at: '2024-02-01T00:00:00.000Z',
        })
      );
    });

    it('skips creation if subscription already exists (idempotency)', async () => {
      const mockProfile = createMockProfile();
      const mockSubscription = createMockStripeSubscription();

      mockSingle
        .mockResolvedValueOnce({ data: mockProfile, error: null })
        .mockResolvedValueOnce({ data: { id: 'existing_sub' }, error: null }); // Existing subscription

      await syncSubscriptionWithStripe(mockSubscription, 'customer.subscription.created');

      expect(mockInsert).not.toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith(
        `Subscription ${mockSubscription.id} already exists, skipping creation`
      );
    });

    it('handles unknown price IDs gracefully', async () => {
      const mockProfile = createMockProfile();
      const mockSubscription = createMockStripeSubscription();

      // Mock unknown price ID
      mockSubscription.items.data[0].price.id = 'unknown_price_123';

      mockSingle
        .mockResolvedValueOnce({ data: mockProfile, error: null })
        .mockResolvedValueOnce({ data: null, error: null });

      (getPlanByPriceId as jest.Mock).mockReturnValue(null); // Unknown plan

      mockInsert.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: {}, error: null }),
      });

      await syncSubscriptionWithStripe(mockSubscription, 'customer.subscription.created');

      expect(consoleWarnSpy).toHaveBeenCalledWith('Unknown price ID: unknown_price_123');
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          plan_name: 'Unknown Plan',
          plan_description: null,
        })
      );
    });

    it('throws error when subscription has no valid items', async () => {
      const mockProfile = createMockProfile();
      const mockSubscription = createMockStripeSubscription({
        items: { object: 'list', data: [], has_more: false, total_count: 0, url: '' },
      });

      mockSingle
        .mockResolvedValueOnce({ data: mockProfile, error: null }) // Profile lookup
        .mockResolvedValueOnce({ data: null, error: null }); // Existing subscription check

      await expect(
        syncSubscriptionWithStripe(mockSubscription, 'customer.subscription.created')
      ).rejects.toThrow(`Subscription ${mockSubscription.id} has no valid items or pricing`);
    });

    it('throws error when subscription item has no price', async () => {
      const mockProfile = createMockProfile();
      const mockSubscription = createMockStripeSubscription();

      // Remove price from subscription item
      mockSubscription.items.data[0].price = null as any;

      mockSingle
        .mockResolvedValueOnce({ data: mockProfile, error: null }) // Profile lookup
        .mockResolvedValueOnce({ data: null, error: null }); // Existing subscription check

      await expect(
        syncSubscriptionWithStripe(mockSubscription, 'customer.subscription.created')
      ).rejects.toThrow(`Subscription ${mockSubscription.id} has no valid items or pricing`);
    });

    it('handles database insertion errors', async () => {
      const mockProfile = createMockProfile();
      const mockSubscription = createMockStripeSubscription();
      const dbError = new Error('Unique constraint violation');

      mockSingle
        .mockResolvedValueOnce({ data: mockProfile, error: null }) // Profile lookup
        .mockResolvedValueOnce({ data: null, error: null }); // Existing subscription check

      (getPlanByPriceId as jest.Mock).mockReturnValue('STARTER');

      // Override the insert mock to return error on select
      const mockSelectWithError = jest.fn().mockRejectedValue(dbError);
      mockInsert.mockReturnValue({
        select: mockSelectWithError,
      });

      await expect(
        syncSubscriptionWithStripe(mockSubscription, 'customer.subscription.created')
      ).rejects.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Failed to sync subscription ${mockSubscription.id}:`,
        dbError
      );
    });
  });

  describe('handleSubscriptionUpdated', () => {
    it('updates subscription with new data', async () => {
      const mockProfile = createMockProfile();
      const mockSubscription = createMockStripeSubscription({
        status: 'past_due',
        cancel_at_period_end: true,
      });

      mockSingle.mockResolvedValueOnce({ data: mockProfile, error: null });
      (getPlanByPriceId as jest.Mock).mockReturnValue('STARTER');

      const mockUpdateChain = {
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: {}, error: null }),
      };
      mockUpdate.mockReturnValue(mockUpdateChain);

      await syncSubscriptionWithStripe(mockSubscription, 'customer.subscription.updated');

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'past_due',
          cancel_at_period_end: true,
          updated_at: expect.any(String),
        })
      );
      expect(mockUpdateChain.eq).toHaveBeenCalledWith('stripe_subscription_id', mockSubscription.id);
    });

    it('handles update database errors', async () => {
      const mockProfile = createMockProfile();
      const mockSubscription = createMockStripeSubscription();
      const dbError = new Error('Update failed');

      mockSingle.mockResolvedValueOnce({ data: mockProfile, error: null });
      (getPlanByPriceId as jest.Mock).mockReturnValue('STARTER');

      const mockSelectChain = jest.fn().mockRejectedValue(dbError);
      const mockUpdateChain = {
        eq: jest.fn().mockReturnThis(),
        select: mockSelectChain,
      };
      mockUpdate.mockReturnValue(mockUpdateChain);

      await expect(
        syncSubscriptionWithStripe(mockSubscription, 'customer.subscription.updated')
      ).rejects.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Failed to sync subscription ${mockSubscription.id}:`,
        dbError
      );
    });

    it('throws error when subscription has no valid items for update', async () => {
      const mockProfile = createMockProfile();
      const mockSubscription = createMockStripeSubscription({
        items: { object: 'list', data: [], has_more: false, total_count: 0, url: '' },
      });

      mockSingle.mockResolvedValueOnce({ data: mockProfile, error: null });

      await expect(
        syncSubscriptionWithStripe(mockSubscription, 'customer.subscription.updated')
      ).rejects.toThrow(`Subscription ${mockSubscription.id} has no valid items or pricing`);
    });
  });

  describe('handleSubscriptionDeleted', () => {
    it('marks subscription as canceled', async () => {
      const mockProfile = createMockProfile();
      const mockSubscription = createMockStripeSubscription();

      mockSingle.mockResolvedValueOnce({ data: mockProfile, error: null });

      const mockUpdateChain = {
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: {}, error: null }),
      };
      mockUpdate.mockReturnValue(mockUpdateChain);

      await syncSubscriptionWithStripe(mockSubscription, 'customer.subscription.deleted');

      expect(mockUpdate).toHaveBeenCalledWith({
        status: 'canceled',
        canceled_at: expect.any(String),
        updated_at: expect.any(String),
      });
      expect(mockUpdateChain.eq).toHaveBeenCalledWith('stripe_subscription_id', mockSubscription.id);
    });

    it('handles deletion database errors', async () => {
      const mockProfile = createMockProfile();
      const mockSubscription = createMockStripeSubscription();
      const dbError = new Error('Delete failed');

      mockSingle.mockResolvedValueOnce({ data: mockProfile, error: null });

      const mockSelectChain = jest.fn().mockRejectedValue(dbError);
      const mockUpdateChain = {
        eq: jest.fn().mockReturnThis(),
        select: mockSelectChain,
      };
      mockUpdate.mockReturnValue(mockUpdateChain);

      await expect(
        syncSubscriptionWithStripe(mockSubscription, 'customer.subscription.deleted')
      ).rejects.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Failed to sync subscription ${mockSubscription.id}:`,
        dbError
      );
    });
  });

  describe('getProfileByStripeCustomerId', () => {
    it('successfully retrieves profile by customer ID', async () => {
      const mockProfile = createMockProfile();

      mockSingle.mockResolvedValue({ data: mockProfile, error: null });

      const result = await getProfileByStripeCustomerId('cus_test123');

      expect(result).toEqual(mockProfile);
      expect(mockFrom).toHaveBeenCalledWith('profiles');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('stripe_customer_id', 'cus_test123');
    });

    it('returns null when profile is not found', async () => {
      const dbError = { message: 'No rows returned', code: 'PGRST116' };

      mockSingle.mockResolvedValue({ data: null, error: dbError });

      const result = await getProfileByStripeCustomerId('cus_nonexistent');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to find profile for customer cus_nonexistent:',
        dbError
      );
    });

    it('returns null on database error', async () => {
      const dbError = { message: 'Connection failed', code: '50000' };

      mockSingle.mockResolvedValue({ data: null, error: dbError });

      const result = await getProfileByStripeCustomerId('cus_test123');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to find profile for customer cus_test123:',
        dbError
      );
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

      mockSingle.mockResolvedValue({ data: mockSubscription, error: null });

      const result = await getSubscriptionByStripeId('sub_test123');

      expect(result).toEqual(mockSubscription);
      expect(mockFrom).toHaveBeenCalledWith('subscriptions');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('stripe_subscription_id', 'sub_test123');
    });

    it('returns null when subscription is not found', async () => {
      const dbError = { message: 'No rows returned', code: 'PGRST116' };

      mockSingle.mockResolvedValue({ data: null, error: dbError });

      const result = await getSubscriptionByStripeId('sub_nonexistent');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to find subscription sub_nonexistent:',
        dbError
      );
    });

    it('returns null on database error', async () => {
      const dbError = { message: 'Connection failed', code: '50000' };

      mockSingle.mockResolvedValue({ data: null, error: dbError });

      const result = await getSubscriptionByStripeId('sub_test123');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to find subscription sub_test123:',
        dbError
      );
    });
  });

  describe('Date Conversion', () => {
    it('correctly converts Unix timestamps to ISO strings', async () => {
      const mockProfile = createMockProfile();
      const mockSubscription = createMockStripeSubscription({
        current_period_start: 1704067200, // 2024-01-01 00:00:00 UTC
        current_period_end: 1706745600,   // 2024-02-01 00:00:00 UTC
        trial_start: 1703980800,          // 2023-12-31 00:00:00 UTC
        trial_end: 1704067200,            // 2024-01-01 00:00:00 UTC
        canceled_at: 1704153600,          // 2024-01-02 00:00:00 UTC
        cancel_at: 1706745600,            // 2024-02-01 00:00:00 UTC
      });

      mockSingle
        .mockResolvedValueOnce({ data: mockProfile, error: null })
        .mockResolvedValueOnce({ data: null, error: null });

      (getPlanByPriceId as jest.Mock).mockReturnValue('STARTER');

      mockInsert.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: {}, error: null }),
      });

      await syncSubscriptionWithStripe(mockSubscription, 'customer.subscription.created');

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          current_period_start: '2024-01-01T00:00:00.000Z',
          current_period_end: '2024-02-01T00:00:00.000Z',
          trial_start: '2023-12-31T00:00:00.000Z',
          trial_end: '2024-01-01T00:00:00.000Z',
          canceled_at: '2024-01-02T00:00:00.000Z',
          cancel_at: '2024-02-01T00:00:00.000Z',
        })
      );
    });
  });

  describe('Metadata Handling', () => {
    it('handles subscription metadata correctly', async () => {
      const mockProfile = createMockProfile();
      const mockSubscription = createMockStripeSubscription({
        metadata: {
          source: 'website',
          campaign: 'summer2024',
          custom_field: 'value',
        },
      });

      mockSingle
        .mockResolvedValueOnce({ data: mockProfile, error: null })
        .mockResolvedValueOnce({ data: null, error: null });

      (getPlanByPriceId as jest.Mock).mockReturnValue('STARTER');

      mockInsert.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: {}, error: null }),
      });

      await syncSubscriptionWithStripe(mockSubscription, 'customer.subscription.created');

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: {
            source: 'website',
            campaign: 'summer2024',
            custom_field: 'value',
          },
        })
      );
    });

    it('handles empty metadata', async () => {
      const mockProfile = createMockProfile();
      const mockSubscription = createMockStripeSubscription({
        metadata: {},
      });

      mockSingle
        .mockResolvedValueOnce({ data: mockProfile, error: null })
        .mockResolvedValueOnce({ data: null, error: null });

      (getPlanByPriceId as jest.Mock).mockReturnValue('STARTER');

      mockInsert.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: {}, error: null }),
      });

      await syncSubscriptionWithStripe(mockSubscription, 'customer.subscription.created');

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: {},
        })
      );
    });
  });

  describe('Error Scenarios', () => {
    it('handles subscription with missing recurring information', async () => {
      const mockProfile = createMockProfile();
      const mockSubscription = createMockStripeSubscription();

      // Remove recurring information
      mockSubscription.items.data[0].price.recurring = null;

      mockSingle
        .mockResolvedValueOnce({ data: mockProfile, error: null })
        .mockResolvedValueOnce({ data: null, error: null });

      (getPlanByPriceId as jest.Mock).mockReturnValue('STARTER');

      mockInsert.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: {}, error: null }),
      });

      await syncSubscriptionWithStripe(mockSubscription, 'customer.subscription.created');

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          interval: 'month', // Default fallback
          interval_count: 1,  // Default fallback
        })
      );
    });

    it('handles subscription with missing unit amount', async () => {
      const mockProfile = createMockProfile();
      const mockSubscription = createMockStripeSubscription();

      // Remove unit amount
      mockSubscription.items.data[0].price.unit_amount = null;

      mockSingle
        .mockResolvedValueOnce({ data: mockProfile, error: null })
        .mockResolvedValueOnce({ data: null, error: null });

      (getPlanByPriceId as jest.Mock).mockReturnValue('STARTER');

      mockInsert.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: {}, error: null }),
      });

      await syncSubscriptionWithStripe(mockSubscription, 'customer.subscription.created');

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          unit_amount: 0, // Default fallback
        })
      );
    });
  });

  describe('Integration Tests', () => {
    it('handles complete subscription lifecycle', async () => {
      const mockProfile = createMockProfile();
      const mockSubscription = createMockStripeSubscription();

      // Test creation
      mockSingle
        .mockResolvedValueOnce({ data: mockProfile, error: null })
        .mockResolvedValueOnce({ data: null, error: null });

      (getPlanByPriceId as jest.Mock).mockReturnValue('STARTER');

      mockInsert.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: {}, error: null }),
      });

      await syncSubscriptionWithStripe(mockSubscription, 'customer.subscription.created');

      // Test update
      const updatedSubscription = createMockStripeSubscription({
        status: 'past_due',
      });

      mockSingle.mockResolvedValueOnce({ data: mockProfile, error: null });

      const mockUpdateChain = {
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: {}, error: null }),
      };
      mockUpdate.mockReturnValue(mockUpdateChain);

      await syncSubscriptionWithStripe(updatedSubscription, 'customer.subscription.updated');

      // Test deletion
      mockSingle.mockResolvedValueOnce({ data: mockProfile, error: null });
      mockUpdate.mockReturnValue(mockUpdateChain);

      await syncSubscriptionWithStripe(updatedSubscription, 'customer.subscription.deleted');

      expect(mockInsert).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledTimes(2);
    });
  });
}); 