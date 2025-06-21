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

// Mock environment variables
const originalEnv = process.env;
beforeAll(() => {
  process.env = {
    ...originalEnv,
    STRIPE_WEBHOOK_SECRET: 'whsec_test_secret',
  };
});

afterAll(() => {
  process.env = originalEnv;
});

// Mock console methods
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

// Mock Math.random for cleanup testing
const mockMathRandom = jest.spyOn(Math, 'random');

describe('Stripe Webhook API Route', () => {
  const mockHeaders = headers as jest.MockedFunction<typeof headers>;
  const mockVerifyWebhookSignature = verifyWebhookSignature as jest.MockedFunction<typeof verifyWebhookSignature>;
  const mockSyncStripeCustomerData = syncStripeCustomerData as jest.MockedFunction<typeof syncStripeCustomerData>;
  const mockCreateGuestSession = createGuestSession as jest.MockedFunction<typeof createGuestSession>;
  const mockIsGuestCustomer = isGuestCustomer as jest.MockedFunction<typeof isGuestCustomer>;
  const mockCleanupExpiredSessions = cleanupExpiredSessions as jest.MockedFunction<typeof cleanupExpiredSessions>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockMathRandom.mockReturnValue(0.5); // Default to not trigger cleanup
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
    mockMathRandom.mockRestore();
  });

  const createMockRequest = (body: string, signature?: string) => {
    const mockHeadersMap = new Map();
    if (signature) {
      mockHeadersMap.set('stripe-signature', signature);
    }
    
    mockHeaders.mockResolvedValue({
      get: (key: string) => mockHeadersMap.get(key) || null,
    } as any);

    return new NextRequest('http://localhost:3000/api/stripe/webhook', {
      method: 'POST',
      body,
      headers: signature ? { 'stripe-signature': signature } : {},
    });
  };

  describe('POST /api/stripe/webhook', () => {
    describe('Signature Verification', () => {
      it('returns 400 when stripe-signature header is missing', async () => {
        const request = createMockRequest('{}');

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'Missing stripe-signature header' });
        expect(mockConsoleError).toHaveBeenCalledWith('Missing stripe-signature header');
      });

      it('returns 500 when webhook secret is not configured', async () => {
        process.env.STRIPE_WEBHOOK_SECRET = '';
        
        const request = createMockRequest('{}', 'test-signature');

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Webhook secret not configured' });
        expect(mockConsoleError).toHaveBeenCalledWith('Missing STRIPE_WEBHOOK_SECRET environment variable');
        
        // Restore
        process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret';
      });

      it('returns 400 when signature verification fails', async () => {
        const mockError = new Error('Invalid signature');
        mockVerifyWebhookSignature.mockImplementation(() => {
          throw mockError;
        });

        const request = createMockRequest('{}', 'invalid-signature');

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'Invalid signature' });
        expect(mockConsoleError).toHaveBeenCalledWith('Webhook signature verification failed:', mockError);
      });
    });

    describe('Event Processing', () => {
      const mockEvent = (type: string, data: unknown) => ({
        type,
        data: { object: data },
      });

      beforeEach(() => {
        mockVerifyWebhookSignature.mockReturnValue(mockEvent('test.event', {}) as any);
                 mockIsGuestCustomer.mockResolvedValue({ isGuest: false, error: undefined });
        mockSyncStripeCustomerData.mockResolvedValue({
          subscriptionId: 'sub_test',
          status: 'active' as const,
          priceId: 'price_test',
          planName: 'Test Plan',
          currentPeriodStart: 1672531200,
          currentPeriodEnd: 1704067200,
          cancelAtPeriodEnd: false,
          trialEnd: null,
          currency: 'usd',
          unitAmount: 1000,
          interval: 'month',
          paymentMethod: null,
        });
      });

      it('ignores irrelevant event types', async () => {
        mockVerifyWebhookSignature.mockReturnValue(mockEvent('irrelevant.event', {}) as any);

        const request = createMockRequest('{}', 'valid-signature');
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual({ received: true });
        expect(mockConsoleLog).toHaveBeenCalledWith('[WEBHOOK] Processing event: irrelevant.event');
        expect(mockConsoleLog).toHaveBeenCalledWith('[WEBHOOK] Ignoring event type: irrelevant.event');
      });

      describe('Subscription Events', () => {
        it('handles customer.subscription.created event', async () => {
          const subscription = { customer: 'cus_test123' };
          mockVerifyWebhookSignature.mockReturnValue(mockEvent('customer.subscription.created', subscription) as any);

          const request = createMockRequest('{}', 'valid-signature');
          const response = await POST(request);
          const data = await response.json();

          expect(response.status).toBe(200);
          expect(data).toEqual({ received: true });
          expect(mockSyncStripeCustomerData).toHaveBeenCalledWith('cus_test123');
        });

        it('handles customer.subscription.updated event', async () => {
          const subscription = { customer: 'cus_test456' };
          mockVerifyWebhookSignature.mockReturnValue(mockEvent('customer.subscription.updated', subscription) as any);

          const request = createMockRequest('{}', 'valid-signature');
          const response = await POST(request);

          expect(response.status).toBe(200);
          expect(mockSyncStripeCustomerData).toHaveBeenCalledWith('cus_test456');
        });

        it('handles customer.subscription.deleted event', async () => {
          const subscription = { customer: 'cus_test789' };
          mockVerifyWebhookSignature.mockReturnValue(mockEvent('customer.subscription.deleted', subscription) as any);

          const request = createMockRequest('{}', 'valid-signature');
          const response = await POST(request);

          expect(response.status).toBe(200);
          expect(mockSyncStripeCustomerData).toHaveBeenCalledWith('cus_test789');
        });

        it('handles subscription with customer object instead of string', async () => {
          const subscription = { customer: { id: 'cus_object123' } };
          mockVerifyWebhookSignature.mockReturnValue(mockEvent('customer.subscription.created', subscription) as any);

          const request = createMockRequest('{}', 'valid-signature');
          const response = await POST(request);

          expect(response.status).toBe(200);
          expect(mockSyncStripeCustomerData).toHaveBeenCalledWith('cus_object123');
        });
      });

      describe('Invoice Events', () => {
        it('handles invoice.payment_succeeded event', async () => {
          const invoice = { customer: 'cus_invoice123' };
          mockVerifyWebhookSignature.mockReturnValue(mockEvent('invoice.payment_succeeded', invoice) as any);

          const request = createMockRequest('{}', 'valid-signature');
          const response = await POST(request);

          expect(response.status).toBe(200);
          expect(mockSyncStripeCustomerData).toHaveBeenCalledWith('cus_invoice123');
        });

        it('handles invoice.payment_failed event', async () => {
          const invoice = { customer: 'cus_failed123' };
          mockVerifyWebhookSignature.mockReturnValue(mockEvent('invoice.payment_failed', invoice) as any);

          const request = createMockRequest('{}', 'valid-signature');
          const response = await POST(request);

          expect(response.status).toBe(200);
          expect(mockSyncStripeCustomerData).toHaveBeenCalledWith('cus_failed123');
        });

        it('handles invoice with customer object', async () => {
          const invoice = { customer: { id: 'cus_invoice_obj123' } };
          mockVerifyWebhookSignature.mockReturnValue(mockEvent('invoice.payment_succeeded', invoice) as any);

          const request = createMockRequest('{}', 'valid-signature');
          const response = await POST(request);

          expect(response.status).toBe(200);
          expect(mockSyncStripeCustomerData).toHaveBeenCalledWith('cus_invoice_obj123');
        });

        it('skips invoice events without customer', async () => {
          const invoice = { customer: null };
          mockVerifyWebhookSignature.mockReturnValue(mockEvent('invoice.payment_succeeded', invoice) as any);

          const request = createMockRequest('{}', 'valid-signature');
          const response = await POST(request);

          expect(response.status).toBe(200);
          expect(mockSyncStripeCustomerData).not.toHaveBeenCalled();
        });
      });

      describe('Checkout Session Events', () => {
        it('handles authenticated checkout.session.completed', async () => {
          const session = {
            id: 'cs_test123',
            customer: 'cus_checkout123',
            mode: 'subscription',
          };
          mockVerifyWebhookSignature.mockReturnValue(mockEvent('checkout.session.completed', session) as any);

          const request = createMockRequest('{}', 'valid-signature');
          const response = await POST(request);

          expect(response.status).toBe(200);
          expect(mockIsGuestCustomer).toHaveBeenCalledWith('cus_checkout123');
          expect(mockSyncStripeCustomerData).toHaveBeenCalledWith('cus_checkout123');
        });

        it('skips non-subscription checkout sessions', async () => {
          const session = {
            id: 'cs_payment123',
            customer: 'cus_payment123',
            mode: 'payment',
          };
          mockVerifyWebhookSignature.mockReturnValue(mockEvent('checkout.session.completed', session) as any);

          const request = createMockRequest('{}', 'valid-signature');
          const response = await POST(request);

          expect(response.status).toBe(200);
          expect(mockConsoleLog).toHaveBeenCalledWith('[WEBHOOK] Skipping non-subscription checkout: cs_payment123');
          expect(mockIsGuestCustomer).not.toHaveBeenCalled();
        });

        it('skips checkout sessions without customer', async () => {
          const session = {
            id: 'cs_no_customer123',
            customer: null,
            mode: 'subscription',
          };
          mockVerifyWebhookSignature.mockReturnValue(mockEvent('checkout.session.completed', session) as any);

          const request = createMockRequest('{}', 'valid-signature');
          const response = await POST(request);

          expect(response.status).toBe(200);
          expect(mockConsoleLog).toHaveBeenCalledWith('[WEBHOOK] Skipping non-subscription checkout: cs_no_customer123');
        });
      });

      describe('Guest Customer Handling', () => {
        it('handles guest checkout completion', async () => {
          const session = {
            id: 'cs_guest123',
            customer: 'cus_guest123',
            mode: 'subscription',
            subscription: 'sub_guest123',
            payment_status: 'paid',
            amount_total: 2000,
            currency: 'usd',
            metadata: { planName: 'Pro Plan', priceId: 'price_123' },
          };

                     mockVerifyWebhookSignature.mockReturnValue(mockEvent('checkout.session.completed', session) as any);
           mockIsGuestCustomer.mockResolvedValue({ isGuest: true, error: undefined });
           mockCreateGuestSession.mockResolvedValue({ success: true });

          const { stripe } = await import('@/lib/stripe-server');
          const mockStripeCustomerRetrieve = stripe.customers.retrieve as jest.MockedFunction<any>;
          const mockStripeCustomerUpdate = stripe.customers.update as jest.MockedFunction<any>;

          mockStripeCustomerRetrieve.mockResolvedValue({
            id: 'cus_guest123',
            email: 'guest@example.com',
            metadata: {},
            deleted: false,
          });

          const request = createMockRequest('{}', 'valid-signature');
          const response = await POST(request);

          expect(response.status).toBe(200);
          expect(mockCreateGuestSession).toHaveBeenCalledWith({
            sessionId: 'cs_guest123',
            stripeCustomerId: 'cus_guest123',
            subscriptionId: 'sub_guest123',
            customerEmail: 'guest@example.com',
            planName: 'Pro Plan',
            priceId: 'price_123',
            paymentStatus: 'paid',
            amount: 2000,
            currency: 'usd',
            metadata: { planName: 'Pro Plan', priceId: 'price_123' },
          });
          expect(mockStripeCustomerUpdate).toHaveBeenCalled();
        });

        it('skips sync for guest customers on subscription events', async () => {
          const subscription = { customer: 'cus_guest456' };
                     mockVerifyWebhookSignature.mockReturnValue(mockEvent('customer.subscription.created', subscription) as any);
           mockIsGuestCustomer.mockResolvedValue({ isGuest: true, error: undefined });

          const request = createMockRequest('{}', 'valid-signature');
          const response = await POST(request);

          expect(response.status).toBe(200);
          expect(mockSyncStripeCustomerData).not.toHaveBeenCalled();
          expect(mockConsoleLog).toHaveBeenCalledWith('[WEBHOOK] Skipping sync for guest customer: cus_guest456 (will sync after reconciliation)');
        });

        it('handles guest check error by falling back to normal processing', async () => {
          const session = {
            id: 'cs_error123',
            customer: 'cus_error123',
            mode: 'subscription',
          };

          mockVerifyWebhookSignature.mockReturnValue(mockEvent('checkout.session.completed', session) as any);
          mockIsGuestCustomer.mockResolvedValue({ isGuest: false, error: 'Database error' });

          const request = createMockRequest('{}', 'valid-signature');
          const response = await POST(request);

          expect(response.status).toBe(200);
          expect(mockConsoleError).toHaveBeenCalledWith('[WEBHOOK] Error checking guest status for cus_error123:', 'Database error');
          expect(mockSyncStripeCustomerData).toHaveBeenCalledWith('cus_error123');
        });
      });

      describe('Cleanup and Maintenance', () => {
        it('triggers cleanup when random condition is met', async () => {
          mockMathRandom.mockReturnValue(0.05); // 5% - should trigger cleanup
          mockVerifyWebhookSignature.mockReturnValue(mockEvent('customer.subscription.created', { customer: 'cus_123' }) as any);

          const request = createMockRequest('{}', 'valid-signature');
          const response = await POST(request);

          expect(response.status).toBe(200);
          expect(mockCleanupExpiredSessions).toHaveBeenCalled();
        });

        it('does not trigger cleanup when random condition is not met', async () => {
          mockMathRandom.mockReturnValue(0.15); // 15% - should not trigger cleanup
          mockVerifyWebhookSignature.mockReturnValue(mockEvent('customer.subscription.created', { customer: 'cus_123' }) as any);

          const request = createMockRequest('{}', 'valid-signature');
          const response = await POST(request);

          expect(response.status).toBe(200);
          expect(mockCleanupExpiredSessions).not.toHaveBeenCalled();
        });
      });

      describe('Error Handling', () => {
        it('handles errors during event processing', async () => {
          const subscription = { customer: 'cus_error123' };
          mockVerifyWebhookSignature.mockReturnValue(mockEvent('customer.subscription.created', subscription) as any);
          mockSyncStripeCustomerData.mockRejectedValue(new Error('Sync failed'));

          const request = createMockRequest('{}', 'valid-signature');
          const response = await POST(request);
          const data = await response.json();

          expect(response.status).toBe(500);
          expect(data).toEqual({ error: 'Webhook processing failed' });
          expect(mockConsoleError).toHaveBeenCalledWith('[WEBHOOK] Error processing webhook customer.subscription.created:', expect.any(Error));
        });

        it('handles unhandled event types gracefully', async () => {
          mockVerifyWebhookSignature.mockReturnValue(mockEvent('unknown.event.type', {}) as any);

          const request = createMockRequest('{}', 'valid-signature');
          const response = await POST(request);

          expect(response.status).toBe(200);
          expect(mockConsoleLog).toHaveBeenCalledWith('[WEBHOOK] Unhandled event type: unknown.event.type');
        });
      });
    });
  });
}); 