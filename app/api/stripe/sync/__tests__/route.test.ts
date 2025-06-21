import { NextRequest } from 'next/server';
import { POST } from '../route';
import { syncStripeCustomerData } from '@/lib/stripe-sync';
import { getCustomerByUserId } from '@/lib/customer-service';

// Mock the dependencies
jest.mock('@/lib/stripe-sync', () => ({
  syncStripeCustomerData: jest.fn(),
}));

jest.mock('@/lib/customer-service', () => ({
  getCustomerByUserId: jest.fn(),
}));

// Mock console methods to track logging
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('Stripe Sync API Route', () => {
  const mockSyncStripeCustomerData = syncStripeCustomerData as jest.MockedFunction<typeof syncStripeCustomerData>;
  const mockGetCustomerByUserId = getCustomerByUserId as jest.MockedFunction<typeof getCustomerByUserId>;

  const createMockRequest = (body: unknown) => {
    const request = {
      json: jest.fn().mockResolvedValue(body),
      text: jest.fn().mockResolvedValue(JSON.stringify(body)),
    } as unknown as NextRequest;
    return request;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('POST /api/stripe/sync', () => {
    it('successfully syncs customer data for valid user', async () => {
      const mockUserId = 'user-123';
      const mockCustomerId = 'cus_test123';
      const mockSubscriptionData = {
        subscriptionId: 'sub_test123',
        status: 'active' as const,
        priceId: 'price_test123',
        planName: 'Pro Plan',
        currentPeriodStart: 1672531200,
        currentPeriodEnd: 1704067200,
        cancelAtPeriodEnd: false,
        trialEnd: null,
        currency: 'usd',
        unitAmount: 2000,
        interval: 'month',
        paymentMethod: {
          brand: 'visa',
          last4: '4242',
        },
      };

      mockGetCustomerByUserId.mockResolvedValue({
        success: true,
        stripeCustomerId: mockCustomerId,
      });

      mockSyncStripeCustomerData.mockResolvedValue(mockSubscriptionData);

      const request = createMockRequest({ userId: mockUserId });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        message: 'Synchronization completed',
        subscriptionData: mockSubscriptionData,
      });

      expect(mockGetCustomerByUserId).toHaveBeenCalledWith(mockUserId);
      expect(mockSyncStripeCustomerData).toHaveBeenCalledWith(mockCustomerId);
      expect(mockConsoleLog).toHaveBeenCalledWith(`[SYNC] Forcing Stripe data sync for user: ${mockUserId}`);
      expect(mockConsoleLog).toHaveBeenCalledWith(`[SYNC] Found customer: ${mockCustomerId} for user: ${mockUserId}`);
    });

    it('returns 400 error when userId is missing', async () => {
      const request = createMockRequest({});

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: 'Missing required field: userId',
      });
      expect(mockGetCustomerByUserId).not.toHaveBeenCalled();
      expect(mockSyncStripeCustomerData).not.toHaveBeenCalled();
    });

    it('returns 400 error when userId is null', async () => {
      const request = createMockRequest({ userId: null });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: 'Missing required field: userId',
      });
      expect(mockGetCustomerByUserId).not.toHaveBeenCalled();
    });

    it('returns 400 error when userId is empty string', async () => {
      const request = createMockRequest({ userId: '' });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: 'Missing required field: userId',
      });
      expect(mockGetCustomerByUserId).not.toHaveBeenCalled();
    });

    it('returns 404 error when customer service returns unsuccessful result', async () => {
      const mockUserId = 'user-456';

      mockGetCustomerByUserId.mockResolvedValue({
        success: false,
        stripeCustomerId: undefined,
      });

      const request = createMockRequest({ userId: mockUserId });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        error: 'No billing account found',
      });
      expect(mockGetCustomerByUserId).toHaveBeenCalledWith(mockUserId);
      expect(mockSyncStripeCustomerData).not.toHaveBeenCalled();
      expect(mockConsoleError).toHaveBeenCalledWith('[SYNC] No Stripe customer found for user:', mockUserId);
    });

    it('returns 404 error when customer service returns null customer ID', async () => {
      const mockUserId = 'user-789';

      mockGetCustomerByUserId.mockResolvedValue({
        success: true,
        stripeCustomerId: undefined,
      });

      const request = createMockRequest({ userId: mockUserId });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        error: 'No billing account found',
      });
      expect(mockGetCustomerByUserId).toHaveBeenCalledWith(mockUserId);
      expect(mockSyncStripeCustomerData).not.toHaveBeenCalled();
      expect(mockConsoleError).toHaveBeenCalledWith('[SYNC] No Stripe customer found for user:', mockUserId);
    });

    it('handles sync function throwing an error', async () => {
      const mockUserId = 'user-sync-error';
      const mockCustomerId = 'cus_sync123';
      const syncError = new Error('Stripe API failed');

      mockGetCustomerByUserId.mockResolvedValue({
        success: true,
        stripeCustomerId: mockCustomerId,
      });

      mockSyncStripeCustomerData.mockRejectedValue(syncError);

      const request = createMockRequest({ userId: mockUserId });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Failed to synchronize with Stripe',
      });
      expect(mockGetCustomerByUserId).toHaveBeenCalledWith(mockUserId);
      expect(mockSyncStripeCustomerData).toHaveBeenCalledWith(mockCustomerId);
      expect(mockConsoleError).toHaveBeenCalledWith('[SYNC] Error synchronizing with Stripe:', syncError);
    });

    it('handles customer service throwing an error', async () => {
      const mockUserId = 'user-service-error';
      const serviceError = new Error('Database connection failed');

      mockGetCustomerByUserId.mockRejectedValue(serviceError);

      const request = createMockRequest({ userId: mockUserId });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Failed to synchronize with Stripe',
      });
      expect(mockGetCustomerByUserId).toHaveBeenCalledWith(mockUserId);
      expect(mockSyncStripeCustomerData).not.toHaveBeenCalled();
      expect(mockConsoleError).toHaveBeenCalledWith('[SYNC] Error synchronizing with Stripe:', serviceError);
    });

    it('handles JSON parsing errors', async () => {
      const request = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
        text: jest.fn().mockResolvedValue('invalid json'),
      } as unknown as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Failed to synchronize with Stripe',
      });
      expect(mockGetCustomerByUserId).not.toHaveBeenCalled();
      expect(mockSyncStripeCustomerData).not.toHaveBeenCalled();
    });

    it('handles request with additional fields', async () => {
      const mockUserId = 'user-extra';
      const mockCustomerId = 'cus_extra123';
      const mockSubscriptionData = {
        subscriptionId: 'sub_extra123',
        status: 'active' as const,
        priceId: 'price_extra123',
        planName: 'Basic Plan',
        currentPeriodStart: 1672531200,
        currentPeriodEnd: 1704067200,
        cancelAtPeriodEnd: false,
        trialEnd: null,
        currency: 'usd',
        unitAmount: 1000,
        interval: 'month',
        paymentMethod: null,
      };

      mockGetCustomerByUserId.mockResolvedValue({
        success: true,
        stripeCustomerId: mockCustomerId,
      });

      mockSyncStripeCustomerData.mockResolvedValue(mockSubscriptionData);

      const request = createMockRequest({
        userId: mockUserId,
        extraField: 'should be ignored',
        anotherField: 123,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        message: 'Synchronization completed',
        subscriptionData: mockSubscriptionData,
      });
      expect(mockGetCustomerByUserId).toHaveBeenCalledWith(mockUserId);
    });

    it('handles sync returning null subscription data', async () => {
      const mockUserId = 'user-null-sync';
      const mockCustomerId = 'cus_null123';

      mockGetCustomerByUserId.mockResolvedValue({
        success: true,
        stripeCustomerId: mockCustomerId,
      });

      mockSyncStripeCustomerData.mockResolvedValue({
        subscriptionId: null,
        status: 'none' as const,
        priceId: null,
        planName: null,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        trialEnd: null,
        currency: null,
        unitAmount: null,
        interval: null,
        paymentMethod: null,
      });

      const request = createMockRequest({ userId: mockUserId });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        message: 'Synchronization completed',
        subscriptionData: {
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
          paymentMethod: null,
        },
      });
      expect(mockGetCustomerByUserId).toHaveBeenCalledWith(mockUserId);
      expect(mockSyncStripeCustomerData).toHaveBeenCalledWith(mockCustomerId);
    });

    it('handles sync returning empty object', async () => {
      const mockUserId = 'user-empty-sync';
      const mockCustomerId = 'cus_empty123';

      mockGetCustomerByUserId.mockResolvedValue({
        success: true,
        stripeCustomerId: mockCustomerId,
      });

      mockSyncStripeCustomerData.mockResolvedValue({
        subscriptionId: null,
        status: 'none' as const,
        priceId: null,
        planName: null,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        trialEnd: null,
        currency: null,
        unitAmount: null,
        interval: null,
        paymentMethod: null,
      });

      const request = createMockRequest({ userId: mockUserId });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        message: 'Synchronization completed',
        subscriptionData: {
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
          paymentMethod: null,
        },
      });
      expect(mockGetCustomerByUserId).toHaveBeenCalledWith(mockUserId);
      expect(mockSyncStripeCustomerData).toHaveBeenCalledWith(mockCustomerId);
    });

    it('handles customer service returning empty string as customer ID', async () => {
      const mockUserId = 'user-empty-customer';

      mockGetCustomerByUserId.mockResolvedValue({
        success: true,
        stripeCustomerId: '',
      });

      const request = createMockRequest({ userId: mockUserId });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        error: 'No billing account found',
      });
      expect(mockGetCustomerByUserId).toHaveBeenCalledWith(mockUserId);
      expect(mockSyncStripeCustomerData).not.toHaveBeenCalled();
      expect(mockConsoleError).toHaveBeenCalledWith('[SYNC] No Stripe customer found for user:', mockUserId);
    });
  });
}); 