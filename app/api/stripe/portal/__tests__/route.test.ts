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

      const request = new NextRequest('http://localhost:3000/api/stripe/portal', {
        method: 'POST',
        body: JSON.stringify({ userId: mockUserId }),
        headers: {
          'Content-Type': 'application/json',
        },
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
      expect(mockStripePortalCreate).toHaveBeenCalledWith({
        customer: mockCustomerId,
        return_url: 'https://test.example.com/billing',
      });

      expect(mockConsoleLog).toHaveBeenCalledWith(`[PORTAL] Creating portal session for user: ${mockUserId}`);
      expect(mockConsoleLog).toHaveBeenCalledWith(`[PORTAL] Found customer: ${mockCustomerId} for user: ${mockUserId}`);
      expect(mockConsoleLog).toHaveBeenCalledWith(`[PORTAL] Portal session created: ${mockPortalSession.id}`);
    });

    it('returns 400 error when userId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/stripe/portal', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'Content-Type': 'application/json',
        },
      });

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
      const request = new NextRequest('http://localhost:3000/api/stripe/portal', {
        method: 'POST',
        body: JSON.stringify({ userId: null }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: 'Missing required field: userId',
      });
      expect(mockGetCustomerByUserId).not.toHaveBeenCalled();
    });

    it('returns 400 error when userId is empty string', async () => {
      const request = new NextRequest('http://localhost:3000/api/stripe/portal', {
        method: 'POST',
        body: JSON.stringify({ userId: '' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

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

      const request = new NextRequest('http://localhost:3000/api/stripe/portal', {
        method: 'POST',
        body: JSON.stringify({ userId: mockUserId }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

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

      const request = new NextRequest('http://localhost:3000/api/stripe/portal', {
        method: 'POST',
        body: JSON.stringify({ userId: mockUserId }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        error: 'No billing account found. Please create a subscription first.',
      });
      expect(mockGetCustomerByUserId).toHaveBeenCalledWith(mockUserId);
      expect(mockStripePortalCreate).not.toHaveBeenCalled();
    });

    it('handles Stripe configuration error specifically', async () => {
      const mockUserId = 'user-config';
      const mockCustomerId = 'cus_config123';
      const configError = new Error('No configuration provided');

      mockGetCustomerByUserId.mockResolvedValue({
        success: true,
        stripeCustomerId: mockCustomerId,
      });

      mockStripePortalCreate.mockRejectedValue(configError);

      const request = new NextRequest('http://localhost:3000/api/stripe/portal', {
        method: 'POST',
        body: JSON.stringify({ userId: mockUserId }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Stripe Customer Portal is not configured',
        details: 'Please configure the Customer Portal in the Stripe Dashboard at https://dashboard.stripe.com/test/settings/billing/portal',
        type: 'configuration_error',
      });
      expect(mockConsoleError).toHaveBeenCalledWith('[PORTAL] Error creating portal session:', configError);
    });

    it('handles Stripe default configuration error', async () => {
      const mockUserId = 'user-default';
      const mockCustomerId = 'cus_default123';
      const configError = new Error('default configuration has not been created');

      mockGetCustomerByUserId.mockResolvedValue({
        success: true,
        stripeCustomerId: mockCustomerId,
      });

      mockStripePortalCreate.mockRejectedValue(configError);

      const request = new NextRequest('http://localhost:3000/api/stripe/portal', {
        method: 'POST',
        body: JSON.stringify({ userId: mockUserId }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Stripe Customer Portal is not configured',
        details: 'Please configure the Customer Portal in the Stripe Dashboard at https://dashboard.stripe.com/test/settings/billing/portal',
        type: 'configuration_error',
      });
    });

    it('handles general Stripe API errors', async () => {
      const mockUserId = 'user-general';
      const mockCustomerId = 'cus_general123';
      const generalError = new Error('API request failed');

      mockGetCustomerByUserId.mockResolvedValue({
        success: true,
        stripeCustomerId: mockCustomerId,
      });

      mockStripePortalCreate.mockRejectedValue(generalError);

      const request = new NextRequest('http://localhost:3000/api/stripe/portal', {
        method: 'POST',
        body: JSON.stringify({ userId: mockUserId }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

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
      const mockCustomerId = 'cus_non_error123';
      const nonError = 'String error';

      mockGetCustomerByUserId.mockResolvedValue({
        success: true,
        stripeCustomerId: mockCustomerId,
      });

      mockStripePortalCreate.mockRejectedValue(nonError);

      const request = new NextRequest('http://localhost:3000/api/stripe/portal', {
        method: 'POST',
        body: JSON.stringify({ userId: mockUserId }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

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

      const request = new NextRequest('http://localhost:3000/api/stripe/portal', {
        method: 'POST',
        body: JSON.stringify({ userId: mockUserId }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

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

    it('handles invalid JSON in request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/stripe/portal', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Failed to create billing portal session',
      });
      expect(mockGetCustomerByUserId).not.toHaveBeenCalled();
      expect(mockStripePortalCreate).not.toHaveBeenCalled();
      expect(mockConsoleError).toHaveBeenCalled();
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

      const request = new NextRequest('http://localhost:3000/api/stripe/portal', {
        method: 'POST',
        body: JSON.stringify({ 
          userId: mockUserId,
          extraField: 'should be ignored',
          anotherField: 123,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
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
      expect(mockStripePortalCreate).toHaveBeenCalledWith({
        customer: mockCustomerId,
        return_url: 'https://test.example.com/billing',
      });
    });
  });
}); 