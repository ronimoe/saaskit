import { NextRequest } from 'next/server';
import { POST } from '../route';
import { stripe } from '@/lib/stripe-server';
import { getCustomerByUserId } from '@/lib/customer-service';

// Mock the dependencies
jest.mock('@/lib/stripe-server', () => ({
  stripe: {
    paymentIntents: {
      list: jest.fn(),
    },
    invoices: {
      retrieve: jest.fn(),
    },
  },
}));

jest.mock('@/lib/customer-service', () => ({
  getCustomerByUserId: jest.fn(),
}));

// Mock console methods to track logging
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('Stripe Payment History API Route', () => {
  const mockStripePaymentIntentsList = stripe.paymentIntents.list as jest.MockedFunction<
    typeof stripe.paymentIntents.list
  >;
  const mockStripeInvoicesRetrieve = stripe.invoices.retrieve as jest.MockedFunction<
    typeof stripe.invoices.retrieve
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

  describe('POST /api/stripe/payment-history', () => {
    it('successfully retrieves payment history for valid user', async () => {
      const mockUserId = 'user-123';
      const mockCustomerId = 'cus_test123';
      const mockPaymentIntents = {
        data: [
          {
            id: 'pi_test1',
            amount: 2000,
            currency: 'usd',
            status: 'succeeded',
            created: 1234567890,
            metadata: { invoice_id: 'in_test1' },
            description: 'Monthly subscription',
          },
          {
            id: 'pi_test2',
            amount: 1500,
            currency: 'usd',
            status: 'succeeded',
            created: 1234567891,
            metadata: {},
            description: 'One-time payment',
          },
        ],
      };

      const mockInvoice = {
        hosted_invoice_url: 'https://invoice.stripe.com/i/acct_123/test_1',
        invoice_pdf: 'https://invoice.stripe.com/i/acct_123/test_1.pdf',
      };

      mockGetCustomerByUserId.mockResolvedValue({
        success: true,
        stripeCustomerId: mockCustomerId,
      });

      mockStripePaymentIntentsList.mockResolvedValue(mockPaymentIntents as any);
      mockStripeInvoicesRetrieve.mockResolvedValue(mockInvoice as any);

      const request = createMockRequest({ userId: mockUserId });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.payments).toHaveLength(2);
      
      // Check first payment with invoice
      expect(data.payments[0]).toEqual({
        id: 'pi_test1',
        amount: 2000,
        currency: 'usd',
        status: 'succeeded',
        created: 1234567890,
        invoice_id: 'in_test1',
        description: 'Monthly subscription',
        invoice_url: mockInvoice.hosted_invoice_url,
      });

      // Check second payment without invoice
      expect(data.payments[1]).toEqual({
        id: 'pi_test2',
        amount: 1500,
        currency: 'usd',
        status: 'succeeded',
        created: 1234567891,
        invoice_id: null,
        description: 'One-time payment',
      });

      expect(mockGetCustomerByUserId).toHaveBeenCalledWith(mockUserId);
      expect(mockStripePaymentIntentsList).toHaveBeenCalledWith({
        customer: mockCustomerId,
        limit: 50,
      });
      expect(mockStripeInvoicesRetrieve).toHaveBeenCalledWith('in_test1');

      expect(mockConsoleLog).toHaveBeenCalledWith(`[PAYMENT_HISTORY] Fetching payment history for user: ${mockUserId}`);
      expect(mockConsoleLog).toHaveBeenCalledWith(`[PAYMENT_HISTORY] Found customer: ${mockCustomerId} for user: ${mockUserId}`);
      expect(mockConsoleLog).toHaveBeenCalledWith(`[PAYMENT_HISTORY] Found 2 payments for customer: ${mockCustomerId}`);
    });

    it('returns empty payments array when no customer found', async () => {
      const mockUserId = 'user-nocustomer';

      mockGetCustomerByUserId.mockResolvedValue({
        success: false,
        stripeCustomerId: undefined,
      });

      const request = createMockRequest({ userId: mockUserId });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        payments: [],
      });

      expect(mockGetCustomerByUserId).toHaveBeenCalledWith(mockUserId);
      expect(mockStripePaymentIntentsList).not.toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith('[PAYMENT_HISTORY] No Stripe customer found for user:', mockUserId);
    });

    it('returns empty payments array when customer ID is null', async () => {
      const mockUserId = 'user-nullcustomer';

      mockGetCustomerByUserId.mockResolvedValue({
        success: true,
        stripeCustomerId: undefined,
      });

      const request = createMockRequest({ userId: mockUserId });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        payments: [],
      });

      expect(mockGetCustomerByUserId).toHaveBeenCalledWith(mockUserId);
      expect(mockStripePaymentIntentsList).not.toHaveBeenCalled();
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
      expect(mockStripePaymentIntentsList).not.toHaveBeenCalled();
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

    it('handles payments with invoice_pdf when hosted_invoice_url is not available', async () => {
      const mockUserId = 'user-pdfonly';
      const mockCustomerId = 'cus_pdfonly';
      const mockPaymentIntents = {
        data: [
          {
            id: 'pi_pdf1',
            amount: 3000,
            currency: 'eur',
            status: 'succeeded',
            created: 1234567892,
            metadata: { invoice_id: 'in_pdf1' },
            description: 'PDF invoice payment',
          },
        ],
      };

      const mockInvoice = {
        hosted_invoice_url: null,
        invoice_pdf: 'https://invoice.stripe.com/i/acct_123/test_pdf.pdf',
      };

      mockGetCustomerByUserId.mockResolvedValue({
        success: true,
        stripeCustomerId: mockCustomerId,
      });

      mockStripePaymentIntentsList.mockResolvedValue(mockPaymentIntents as any);
      mockStripeInvoicesRetrieve.mockResolvedValue(mockInvoice as any);

      const request = createMockRequest({ userId: mockUserId });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.payments[0].invoice_url).toBe(mockInvoice.invoice_pdf);
    });

    it('handles invoice retrieval errors gracefully', async () => {
      const mockUserId = 'user-invoiceerror';
      const mockCustomerId = 'cus_invoiceerror';
      const mockPaymentIntents = {
        data: [
          {
            id: 'pi_error1',
            amount: 2500,
            currency: 'usd',
            status: 'succeeded',
            created: 1234567893,
            metadata: { invoice_id: 'in_error1' },
            description: 'Error invoice payment',
          },
        ],
      };

      mockGetCustomerByUserId.mockResolvedValue({
        success: true,
        stripeCustomerId: mockCustomerId,
      });

      mockStripePaymentIntentsList.mockResolvedValue(mockPaymentIntents as any);
      mockStripeInvoicesRetrieve.mockRejectedValue(new Error('Invoice not found'));

      const request = createMockRequest({ userId: mockUserId });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.payments[0]).toEqual({
        id: 'pi_error1',
        amount: 2500,
        currency: 'usd',
        status: 'succeeded',
        created: 1234567893,
        invoice_id: 'in_error1',
        description: 'Error invoice payment',
      });

      expect(mockConsoleError).toHaveBeenCalledWith(
        '[PAYMENT_HISTORY] Error fetching invoice in_error1:',
        expect.any(Error)
      );
    });

    it('handles payments without metadata gracefully', async () => {
      const mockUserId = 'user-nometadata';
      const mockCustomerId = 'cus_nometadata';
      const mockPaymentIntents = {
        data: [
          {
            id: 'pi_nometa1',
            amount: 1000,
            currency: 'usd',
            status: 'succeeded',
            created: 1234567894,
            // No metadata property
            description: 'No metadata payment',
          },
        ],
      };

      mockGetCustomerByUserId.mockResolvedValue({
        success: true,
        stripeCustomerId: mockCustomerId,
      });

      mockStripePaymentIntentsList.mockResolvedValue(mockPaymentIntents as any);

      const request = createMockRequest({ userId: mockUserId });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.payments[0]).toEqual({
        id: 'pi_nometa1',
        amount: 1000,
        currency: 'usd',
        status: 'succeeded',
        created: 1234567894,
        invoice_id: null,
        description: 'No metadata payment',
      });
    });

    it('handles Stripe payment intents list errors', async () => {
      const mockUserId = 'user-stripeerror';
      const mockCustomerId = 'cus_stripeerror';
      const stripeError = new Error('Stripe API error');

      mockGetCustomerByUserId.mockResolvedValue({
        success: true,
        stripeCustomerId: mockCustomerId,
      });

      mockStripePaymentIntentsList.mockRejectedValue(stripeError);

      const request = createMockRequest({ userId: mockUserId });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Failed to fetch payment history',
      });

      expect(mockConsoleError).toHaveBeenCalledWith('[PAYMENT_HISTORY] Error fetching payment history:', stripeError);
    });

    it('handles customer service errors', async () => {
      const mockUserId = 'user-serviceerror';
      const serviceError = new Error('Database connection failed');

      mockGetCustomerByUserId.mockRejectedValue(serviceError);

      const request = createMockRequest({ userId: mockUserId });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Failed to fetch payment history',
      });

      expect(mockConsoleError).toHaveBeenCalledWith('[PAYMENT_HISTORY] Error fetching payment history:', serviceError);
    });

    it('handles JSON parsing errors', async () => {
      const request = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      } as unknown as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Failed to fetch payment history',
      });

      expect(mockConsoleError).toHaveBeenCalledWith('[PAYMENT_HISTORY] Error fetching payment history:', expect.any(Error));
    });

    it('handles empty payment intents list', async () => {
      const mockUserId = 'user-nopayments';
      const mockCustomerId = 'cus_nopayments';
      const mockPaymentIntents = {
        data: [],
      };

      mockGetCustomerByUserId.mockResolvedValue({
        success: true,
        stripeCustomerId: mockCustomerId,
      });

      mockStripePaymentIntentsList.mockResolvedValue(mockPaymentIntents as any);

      const request = createMockRequest({ userId: mockUserId });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        payments: [],
      });

      expect(mockConsoleLog).toHaveBeenCalledWith(`[PAYMENT_HISTORY] Found 0 payments for customer: ${mockCustomerId}`);
    });

    it('respects the 50 payment limit', async () => {
      const mockUserId = 'user-limit';
      const mockCustomerId = 'cus_limit';

      mockGetCustomerByUserId.mockResolvedValue({
        success: true,
        stripeCustomerId: mockCustomerId,
      });

      mockStripePaymentIntentsList.mockResolvedValue({ data: [] } as any);

      const request = createMockRequest({ userId: mockUserId });

      await POST(request);

      expect(mockStripePaymentIntentsList).toHaveBeenCalledWith({
        customer: mockCustomerId,
        limit: 50,
      });
    });
  });
}); 