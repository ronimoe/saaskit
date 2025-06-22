import { NextRequest } from 'next/server';
import { POST } from '../route';
import { stripe } from '@/lib/stripe-server';

// Mock the dependencies
jest.mock('@/lib/stripe-server', () => ({
  stripe: {
    invoices: {
      retrieve: jest.fn(),
    },
  },
}));

// Mock console methods to track logging
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('Stripe Invoice API Route', () => {
  const mockStripeInvoiceRetrieve = stripe.invoices.retrieve as jest.MockedFunction<
    typeof stripe.invoices.retrieve
  >;

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

  describe('POST /api/stripe/invoice', () => {
    it('successfully retrieves invoice with hosted URL', async () => {
      const mockInvoiceId = 'in_test123';
      const mockInvoice = {
        id: mockInvoiceId,
        status: 'paid',
        hosted_invoice_url: 'https://invoice.stripe.com/i/acct_123/test_123',
        invoice_pdf: 'https://invoice.stripe.com/i/acct_123/test_123.pdf',
      };

      mockStripeInvoiceRetrieve.mockResolvedValue(mockInvoice as any);

      const request = createMockRequest({ invoiceId: mockInvoiceId });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        invoiceUrl: mockInvoice.hosted_invoice_url,
        invoiceId: mockInvoice.id,
        status: mockInvoice.status,
      });

      expect(mockStripeInvoiceRetrieve).toHaveBeenCalledWith(mockInvoiceId);
      expect(mockConsoleLog).toHaveBeenCalledWith(`[INVOICE] Fetching invoice: ${mockInvoiceId}`);
      expect(mockConsoleLog).toHaveBeenCalledWith(`[INVOICE] Retrieved invoice URL for: ${mockInvoiceId}`);
    });

    it('successfully retrieves invoice with PDF URL when hosted URL is not available', async () => {
      const mockInvoiceId = 'in_test456';
      const mockInvoice = {
        id: mockInvoiceId,
        status: 'paid',
        hosted_invoice_url: null,
        invoice_pdf: 'https://invoice.stripe.com/i/acct_123/test_456.pdf',
      };

      mockStripeInvoiceRetrieve.mockResolvedValue(mockInvoice as any);

      const request = createMockRequest({ invoiceId: mockInvoiceId });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        invoiceUrl: mockInvoice.invoice_pdf,
        invoiceId: mockInvoice.id,
        status: mockInvoice.status,
      });

      expect(mockStripeInvoiceRetrieve).toHaveBeenCalledWith(mockInvoiceId);
    });

    it('returns 400 error when invoiceId is missing', async () => {
      const request = createMockRequest({});

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: 'Missing required field: invoiceId',
      });
      expect(mockStripeInvoiceRetrieve).not.toHaveBeenCalled();
    });

    it('returns 400 error when invoiceId is null', async () => {
      const request = createMockRequest({ invoiceId: null });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: 'Missing required field: invoiceId',
      });
      expect(mockStripeInvoiceRetrieve).not.toHaveBeenCalled();
    });

    it('returns 400 error when invoiceId is empty string', async () => {
      const request = createMockRequest({ invoiceId: '' });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: 'Missing required field: invoiceId',
      });
      expect(mockStripeInvoiceRetrieve).not.toHaveBeenCalled();
    });

    it('returns 404 error when invoice is not found (null)', async () => {
      const mockInvoiceId = 'in_notfound';

      mockStripeInvoiceRetrieve.mockResolvedValue(null as any);

      const request = createMockRequest({ invoiceId: mockInvoiceId });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        error: 'Invoice not found',
      });
      expect(mockStripeInvoiceRetrieve).toHaveBeenCalledWith(mockInvoiceId);
    });

    it('returns 404 error when invoice URL is not available', async () => {
      const mockInvoiceId = 'in_nourl';
      const mockInvoice = {
        id: mockInvoiceId,
        status: 'draft',
        hosted_invoice_url: null,
        invoice_pdf: null,
      };

      mockStripeInvoiceRetrieve.mockResolvedValue(mockInvoice as any);

      const request = createMockRequest({ invoiceId: mockInvoiceId });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        error: 'Invoice URL not available',
      });
      expect(mockStripeInvoiceRetrieve).toHaveBeenCalledWith(mockInvoiceId);
    });

    it('handles Stripe errors gracefully', async () => {
      const mockInvoiceId = 'in_error';
      const stripeError = new Error('Invalid invoice ID');
      (stripeError as any).code = 'resource_missing';

      mockStripeInvoiceRetrieve.mockRejectedValue(stripeError);

      const request = createMockRequest({ invoiceId: mockInvoiceId });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Failed to fetch invoice',
      });
      expect(mockStripeInvoiceRetrieve).toHaveBeenCalledWith(mockInvoiceId);
      expect(mockConsoleError).toHaveBeenCalledWith('[INVOICE] Error fetching invoice:', stripeError);
    });

    it('handles JSON parsing errors', async () => {
      const request = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      } as unknown as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Failed to fetch invoice',
      });
      expect(mockConsoleError).toHaveBeenCalledWith('[INVOICE] Error fetching invoice:', expect.any(Error));
    });

    it('handles invoice with different status types', async () => {
      const mockInvoiceId = 'in_open';
      const mockInvoice = {
        id: mockInvoiceId,
        status: 'open',
        hosted_invoice_url: 'https://invoice.stripe.com/i/acct_123/test_open',
        invoice_pdf: 'https://invoice.stripe.com/i/acct_123/test_open.pdf',
      };

      mockStripeInvoiceRetrieve.mockResolvedValue(mockInvoice as any);

      const request = createMockRequest({ invoiceId: mockInvoiceId });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('open');
      expect(data.invoiceUrl).toBe(mockInvoice.hosted_invoice_url);
    });

    it('prefers hosted_invoice_url over invoice_pdf when both are available', async () => {
      const mockInvoiceId = 'in_both_urls';
      const mockInvoice = {
        id: mockInvoiceId,
        status: 'paid',
        hosted_invoice_url: 'https://hosted-url.example.com',
        invoice_pdf: 'https://pdf-url.example.com',
      };

      mockStripeInvoiceRetrieve.mockResolvedValue(mockInvoice as any);

      const request = createMockRequest({ invoiceId: mockInvoiceId });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.invoiceUrl).toBe(mockInvoice.hosted_invoice_url);
      expect(data.invoiceUrl).not.toBe(mockInvoice.invoice_pdf);
    });
  });
}); 