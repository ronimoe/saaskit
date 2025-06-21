import { NextRequest } from 'next/server';
import { POST } from '../route';
import { stripe } from '@/lib/stripe-server';
import { getCustomerByUserId } from '@/lib/customer-service';

// Mock the dependencies
jest.mock('@/lib/stripe-server', () => ({
  stripe: {
    billingPortal: {
      sessions: {
        create: jest.fn(),
      },
    },
  },
}));

jest.mock('@/lib/customer-service', () => ({
  getCustomerByUserId: jest.fn(),
}));

// Mock environment variables
const originalEnv = process.env;
beforeAll(() => {
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_APP_URL: 'https://test.example.com',
  };
});

afterAll(() => {
  process.env = originalEnv;
});

// Mock console methods to track logging
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('Stripe Portal API Route', () => {
  const mockStripePortalCreate = stripe.billingPortal.sessions.create as jest.MockedFunction<
    typeof stripe.billingPortal.sessions.create
  >;
  const mockGetCustomerByUserId = getCustomerByUserId as jest.MockedFunction<typeof getCustomerByUserId>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  const createMockRequest = (body: unknown) => {
    const request = {
      json: jest.fn().mockResolvedValue(body),
      text: jest.fn().mockResolvedValue(JSON.stringify(body)),
    } as unknown as NextRequest;
    return request;
  };

  describe('POST /api/stripe/portal', () => {
    it('successfully creates portal session for valid user', async () => {
      const mockUserId = 'user-123';
      const mockCustomerId = 'cus_test123';
      const mockPortalSession = {
        id: 'bps_test123',
        url: 'https://billing.stripe.com/session/test123',
      };

      mockGetCustomerByUserId.mockResolvedValue({
        success: true,
        stripeCustomerId: mockCustomerId,
      });

      mockStripePortalCreate.mockResolvedValue(mockPortalSession as any);

      const request = createMockRequest({ userId: mockUserId });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        url: mockPortalSession.url,
        sessionId: mockPortalSession.id,
      });

      expect(mockGetCustomerByUserId).toHaveBeenCalledWith(mockUserId);
      expect(mockStripePortalCreate).toHaveBeenCalledWith({
        customer: mockCustomerId,
        return_url: 'https://test.example.com/billing',
      });

      expect(mockConsoleLog).toHaveBeenCalledWith(`[PORTAL] Creating portal session for user: ${mockUserId}`);
      expect(mockConsoleLog).toHaveBeenCalledWith(`[PORTAL] Found customer: ${mockCustomerId} for user: ${mockUserId}`);
      expect(mockConsoleLog).toHaveBeenCalledWith(`[PORTAL] Portal session created: ${mockPortalSession.id}`);
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
      expect(mockStripePortalCreate).not.toHaveBeenCalled();
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
        error: 'No billing account found. Please create a subscription first.',
      });
      expect(mockGetCustomerByUserId).toHaveBeenCalledWith(mockUserId);
      expect(mockStripePortalCreate).not.toHaveBeenCalled();
      expect(mockConsoleError).toHaveBeenCalledWith('[PORTAL] No Stripe customer found for user:', mockUserId);
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
        error: 'No billing account found. Please create a subscription first.',
      });
      expect(mockGetCustomerByUserId).toHaveBeenCalledWith(mockUserId);
      expect(mockStripePortalCreate).not.toHaveBeenCalled();
      expect(mockConsoleError).toHaveBeenCalledWith('[PORTAL] No Stripe customer found for user:', mockUserId);
    });

    it('handles Stripe configuration error specifically', async () => {
      const mockUserId = 'user-config-error';
      const mockCustomerId = 'cus_config123';
      const configError = new Error('Customer portal is not configured');
      (configError as any).code = 'customer_portal_not_configured';

      mockGetCustomerByUserId.mockResolvedValue({
        success: true,
        stripeCustomerId: mockCustomerId,
      });

      mockStripePortalCreate.mockRejectedValue(configError);

      const request = createMockRequest({ userId: mockUserId });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Failed to create billing portal session',
      });

      expect(mockGetCustomerByUserId).toHaveBeenCalledWith(mockUserId);
      expect(mockStripePortalCreate).toHaveBeenCalledWith({
        customer: mockCustomerId,
        return_url: 'https://test.example.com/billing',
      });
      expect(mockConsoleError).toHaveBeenCalledWith('[PORTAL] Error creating portal session:', configError);
    });

    it('handles Stripe default configuration error', async () => {
      const mockUserId = 'user-default-config';
      const mockCustomerId = 'cus_default123';
      const defaultConfigError = new Error('Default configuration error');
      (defaultConfigError as any).code = 'default_configuration_error';

      mockGetCustomerByUserId.mockResolvedValue({
        success: true,
        stripeCustomerId: mockCustomerId,
      });

      mockStripePortalCreate.mockRejectedValue(defaultConfigError);

      const request = createMockRequest({ userId: mockUserId });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Failed to create billing portal session',
      });

      expect(mockConsoleError).toHaveBeenCalledWith('[PORTAL] Error creating portal session:', defaultConfigError);
    });

    it('handles general Stripe API errors', async () => {
      const mockUserId = 'user-api-error';
      const mockCustomerId = 'cus_api123';
      const generalError = new Error('API request failed');

      mockGetCustomerByUserId.mockResolvedValue({
        success: true,
        stripeCustomerId: mockCustomerId,
      });

      mockStripePortalCreate.mockRejectedValue(generalError);

      const request = createMockRequest({ userId: mockUserId });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Failed to create billing portal session',
      });
      expect(mockConsoleError).toHaveBeenCalledWith('[PORTAL] Error creating portal session:', generalError);
    });

    it('handles non-Error thrown objects', async () => {
      const mockUserId = 'user-non-error';
      const mockCustomerId = 'cus_non123';
      const nonError = 'String error';

      mockGetCustomerByUserId.mockResolvedValue({
        success: true,
        stripeCustomerId: mockCustomerId,
      });

      mockStripePortalCreate.mockRejectedValue(nonError);

      const request = createMockRequest({ userId: mockUserId });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Failed to create billing portal session',
      });
      expect(mockConsoleError).toHaveBeenCalledWith('[PORTAL] Error creating portal session:', nonError);
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
        error: 'Failed to create billing portal session',
      });
      expect(mockGetCustomerByUserId).toHaveBeenCalledWith(mockUserId);
      expect(mockStripePortalCreate).not.toHaveBeenCalled();
      expect(mockConsoleError).toHaveBeenCalledWith('[PORTAL] Error creating portal session:', serviceError);
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
        error: 'Failed to create billing portal session',
      });
      expect(mockGetCustomerByUserId).not.toHaveBeenCalled();
      expect(mockStripePortalCreate).not.toHaveBeenCalled();
    });

    it('handles request with additional fields', async () => {
      const mockUserId = 'user-extra';
      const mockCustomerId = 'cus_extra123';
      const mockPortalSession = {
        id: 'bps_extra123',
        url: 'https://billing.stripe.com/session/extra123',
      };

      mockGetCustomerByUserId.mockResolvedValue({
        success: true,
        stripeCustomerId: mockCustomerId,
      });

      mockStripePortalCreate.mockResolvedValue(mockPortalSession as any);

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
        url: mockPortalSession.url,
        sessionId: mockPortalSession.id,
      });
      expect(mockGetCustomerByUserId).toHaveBeenCalledWith(mockUserId);
    });
  });
}); 