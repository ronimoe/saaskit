import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { POST } from '../route';
import { verifyWebhookSignature } from '@/lib/stripe-server';
import { syncStripeCustomerData } from '@/lib/stripe-sync';
import { 
  createGuestSession, 
  isGuestCustomer, 
  cleanupExpiredSessions
} from '@/lib/guest-session-manager';

// Mock all dependencies
jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));

jest.mock('@/lib/stripe-server', () => ({
  verifyWebhookSignature: jest.fn(),
  stripe: {
    customers: {
      retrieve: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('@/lib/stripe-sync', () => ({
  syncStripeCustomerData: jest.fn(),
}));

jest.mock('@/lib/guest-session-manager', () => ({
  createGuestSession: jest.fn(),
  isGuestCustomer: jest.fn(),
  cleanupExpiredSessions: jest.fn(),
}));

// Mock Math.random for cleanup testing
const originalMathRandom = Math.random;

// Mock console methods to track logging
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('Stripe Webhook API Route', () => {
  const mockVerifyWebhookSignature = verifyWebhookSignature as jest.MockedFunction<typeof verifyWebhookSignature>;
  const mockSyncStripeCustomerData = syncStripeCustomerData as jest.MockedFunction<typeof syncStripeCustomerData>;
  const mockCreateGuestSession = createGuestSession as jest.MockedFunction<typeof createGuestSession>;
  const mockIsGuestCustomer = isGuestCustomer as jest.MockedFunction<typeof isGuestCustomer>;
  const mockCleanupExpiredSessions = cleanupExpiredSessions as jest.MockedFunction<typeof cleanupExpiredSessions>;
  const mockHeaders = headers as jest.MockedFunction<typeof headers>;

  beforeEach(() => {
    jest.clearAllMocks();
    Math.random = originalMathRandom;
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
    Math.random = originalMathRandom;
  });

  const createMockRequest = (body: string) => {
    const request = {
      text: jest.fn().mockResolvedValue(body),
      json: jest.fn().mockResolvedValue(JSON.parse(body)),
    } as unknown as NextRequest;
    return request;
  };

  const mockEvent = (type: string, data: unknown) => ({
    id: 'evt_test123',
    type,
    data: { object: data },
    created: Date.now(),
  });

  describe('POST /api/stripe/webhook', () => {
    describe('Signature Verification', () => {
      it('returns 400 when stripe-signature header is missing', async () => {
        mockHeaders.mockResolvedValue({
          get: jest.fn().mockReturnValue(null),
        } as any);

        const request = createMockRequest('{}');
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data).toEqual({
          error: 'Missing stripe-signature header',
        });
      });

      it('returns 500 when webhook secret is not configured', async () => {
        const originalEnv = process.env.STRIPE_WEBHOOK_SECRET;
        delete process.env.STRIPE_WEBHOOK_SECRET;

        mockHeaders.mockResolvedValue({
          get: jest.fn().mockReturnValue('test-signature'),
        } as any);

        const request = createMockRequest('{}');
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data).toEqual({
          error: 'Webhook secret not configured',
        });

        // Restore env
        if (originalEnv) {
          process.env.STRIPE_WEBHOOK_SECRET = originalEnv;
        }
      });

      it('returns 400 when signature verification fails', async () => {
        process.env.STRIPE_WEBHOOK_SECRET = 'test-secret';
        
        mockHeaders.mockResolvedValue({
          get: jest.fn().mockReturnValue('invalid-signature'),
        } as any);

        mockVerifyWebhookSignature.mockImplementation(() => {
          throw new Error('Invalid signature');
        });

        const request = createMockRequest('{}');
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data).toEqual({
          error: 'Invalid signature',
        });
      });
    });

    describe('Event Processing', () => {
      beforeEach(() => {
        process.env.STRIPE_WEBHOOK_SECRET = 'test-secret';
        mockHeaders.mockResolvedValue({
          get: jest.fn().mockReturnValue('valid-signature'),
        } as any);
      });

      it('ignores irrelevant event types', async () => {
        const irrelevantEvent = mockEvent('payment_intent.created', {
          id: 'pi_test123',
        });

        mockVerifyWebhookSignature.mockReturnValue(irrelevantEvent as any);

        const request = createMockRequest(JSON.stringify(irrelevantEvent));
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual({
          received: true,
        });
      });

      describe('Subscription Events', () => {
        it('handles customer.subscription.created event', async () => {
          const subscription = {
            id: 'sub_test123',
            customer: 'cus_test123',
            status: 'active',
          };

          const event = mockEvent('customer.subscription.created', subscription);
          mockVerifyWebhookSignature.mockReturnValue(event as any);
          mockIsGuestCustomer.mockResolvedValue({ isGuest: false, error: undefined });

          const request = createMockRequest(JSON.stringify(event));
          const response = await POST(request);
          const data = await response.json();

          expect(response.status).toBe(200);
          expect(data).toEqual({
            received: true,
            
          });
          expect(mockSyncStripeCustomerData).toHaveBeenCalledWith('cus_test123');
        });

        it('handles customer.subscription.updated event', async () => {
          const subscription = {
            id: 'sub_test123',
            customer: 'cus_test123',
            status: 'active',
          };

          const event = mockEvent('customer.subscription.updated', subscription);
          mockVerifyWebhookSignature.mockReturnValue(event as any);
          mockIsGuestCustomer.mockResolvedValue({ isGuest: false, error: undefined });

          const request = createMockRequest(JSON.stringify(event));
          const response = await POST(request);
          const data = await response.json();

          expect(response.status).toBe(200);
          expect(data).toEqual({
            received: true,
            
          });
          expect(mockSyncStripeCustomerData).toHaveBeenCalledWith('cus_test123');
        });

        it('handles customer.subscription.deleted event', async () => {
          const subscription = {
            id: 'sub_test123',
            customer: 'cus_test123',
            status: 'canceled',
          };

          const event = mockEvent('customer.subscription.deleted', subscription);
          mockVerifyWebhookSignature.mockReturnValue(event as any);
          mockIsGuestCustomer.mockResolvedValue({ isGuest: false, error: undefined });

          const request = createMockRequest(JSON.stringify(event));
          const response = await POST(request);
          const data = await response.json();

          expect(response.status).toBe(200);
          expect(data).toEqual({
            received: true,
            
          });
          expect(mockSyncStripeCustomerData).toHaveBeenCalledWith('cus_test123');
        });
      });

      describe('Checkout Session Events', () => {
        it('handles authenticated checkout.session.completed', async () => {
          const session = {
            id: 'cs_test123',
            customer: 'cus_test123',
            mode: 'subscription',
            client_reference_id: 'user_123',
          };

          const event = mockEvent('checkout.session.completed', session);
          mockVerifyWebhookSignature.mockReturnValue(event as any);
          mockIsGuestCustomer.mockResolvedValue({ isGuest: false, error: undefined });

          const request = createMockRequest(JSON.stringify(event));
          const response = await POST(request);
          const data = await response.json();

          expect(response.status).toBe(200);
          expect(data).toEqual({
            received: true,
            
          });
          expect(mockSyncStripeCustomerData).toHaveBeenCalledWith('cus_test123');
        });

        it('skips non-subscription checkout sessions', async () => {
          const session = {
            id: 'cs_test123',
            customer: 'cus_test123',
            mode: 'payment',
          };

          const event = mockEvent('checkout.session.completed', session);
          mockVerifyWebhookSignature.mockReturnValue(event as any);

          const request = createMockRequest(JSON.stringify(event));
          const response = await POST(request);
          const data = await response.json();

          expect(response.status).toBe(200);
          expect(data).toEqual({
            received: true,
            
          });
          expect(mockSyncStripeCustomerData).not.toHaveBeenCalled();
        });

        it('skips checkout sessions without customer', async () => {
          const session = {
            id: 'cs_test123',
            mode: 'subscription',
          };

          const event = mockEvent('checkout.session.completed', session);
          mockVerifyWebhookSignature.mockReturnValue(event as any);

          const request = createMockRequest(JSON.stringify(event));
          const response = await POST(request);
          const data = await response.json();

          expect(response.status).toBe(200);
          expect(data).toEqual({
            received: true,
            
          });
          expect(mockSyncStripeCustomerData).not.toHaveBeenCalled();
        });
      });

      describe('Guest Customer Handling', () => {
        it('handles guest checkout completion', async () => {
          const session = {
            id: 'cs_guest123',
            customer: 'cus_guest123',
            mode: 'subscription',
            client_reference_id: null,
            payment_status: 'paid',
            amount_total: 2000,
            currency: 'usd',
            metadata: { planName: 'Pro Plan', priceId: 'price_123' },
          };

          const event = mockEvent('checkout.session.completed', session);
          mockVerifyWebhookSignature.mockReturnValue(event as any);
          mockIsGuestCustomer.mockResolvedValue({ isGuest: true, error: undefined });
          mockCreateGuestSession.mockResolvedValue({ success: true });

          // Mock the Stripe customer retrieval
          const { stripe } = require('@/lib/stripe-server');
          stripe.customers.retrieve.mockResolvedValue({
            id: 'cus_guest123',
            email: 'guest@example.com',
            metadata: {},
            deleted: false,
          });

          const request = createMockRequest(JSON.stringify(event));
          const response = await POST(request);
          const data = await response.json();

          expect(response.status).toBe(200);
          expect(data).toEqual({
            received: true,
          });
          expect(mockCreateGuestSession).toHaveBeenCalledWith({
            sessionId: 'cs_guest123',
            stripeCustomerId: 'cus_guest123',
            subscriptionId: undefined,
            customerEmail: 'guest@example.com',
            planName: 'Pro Plan',
            priceId: 'price_123',
            paymentStatus: 'paid',
            amount: 2000,
            currency: 'usd',
            metadata: { planName: 'Pro Plan', priceId: 'price_123' },
          });
          expect(mockSyncStripeCustomerData).not.toHaveBeenCalled();
        });

        it('skips sync for guest customers on subscription events', async () => {
          const subscription = {
            id: 'sub_guest123',
            customer: 'cus_guest123',
            status: 'active',
          };

          const event = mockEvent('customer.subscription.created', subscription);
          mockVerifyWebhookSignature.mockReturnValue(event as any);
          mockIsGuestCustomer.mockResolvedValue({ isGuest: true, error: undefined });

          const request = createMockRequest(JSON.stringify(event));
          const response = await POST(request);
          const data = await response.json();

          expect(response.status).toBe(200);
          expect(data).toEqual({
            received: true,
            
          });
          expect(mockSyncStripeCustomerData).not.toHaveBeenCalled();
        });
      });

      describe('Cleanup and Maintenance', () => {
        it('triggers cleanup when random condition is met', async () => {
          Math.random = jest.fn().mockReturnValue(0.001); // Less than 0.01

          const event = mockEvent('customer.subscription.updated', {
            id: 'sub_test123',
            customer: 'cus_test123',
          });
          
          mockVerifyWebhookSignature.mockReturnValue(event as any);
          mockIsGuestCustomer.mockResolvedValue({ isGuest: false, error: undefined });

          const request = createMockRequest(JSON.stringify(event));
          const response = await POST(request);

          expect(response.status).toBe(200);
          expect(mockCleanupExpiredSessions).toHaveBeenCalled();
        });

        it('does not trigger cleanup when random condition is not met', async () => {
          Math.random = jest.fn().mockReturnValue(0.5); // Greater than 0.01

          const event = mockEvent('customer.subscription.updated', {
            id: 'sub_test123',
            customer: 'cus_test123',
          });
          
          mockVerifyWebhookSignature.mockReturnValue(event as any);
          mockIsGuestCustomer.mockResolvedValue({ isGuest: false, error: undefined });

          const request = createMockRequest(JSON.stringify(event));
          const response = await POST(request);

          expect(response.status).toBe(200);
          expect(mockCleanupExpiredSessions).not.toHaveBeenCalled();
        });
      });

      describe('Error Handling', () => {
        it('handles errors during event processing', async () => {
          const event = mockEvent('customer.subscription.created', {
            id: 'sub_error123',
            customer: 'cus_error123',
          });
          
          mockVerifyWebhookSignature.mockReturnValue(event as any);
          mockIsGuestCustomer.mockRejectedValue(new Error('Database error'));

          const request = createMockRequest(JSON.stringify(event));
          const response = await POST(request);
          const data = await response.json();

          expect(response.status).toBe(500);
          expect(data).toEqual({
            error: 'Webhook processing failed',
          });
          expect(mockConsoleError).toHaveBeenCalled();
        });

        it('handles unhandled event types gracefully', async () => {
          const event = mockEvent('unknown.event.type', {
            id: 'unknown_123',
          });
          
          mockVerifyWebhookSignature.mockReturnValue(event as any);

          const request = createMockRequest(JSON.stringify(event));
          const response = await POST(request);
          const data = await response.json();

          expect(response.status).toBe(200);
          expect(data).toEqual({
            received: true,
            
          });
        });
      });
    });
  });
}); 