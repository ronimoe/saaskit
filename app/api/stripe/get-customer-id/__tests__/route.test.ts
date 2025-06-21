import { NextRequest } from 'next/server';
import { POST } from '../route';

// Mock the customer service completely
jest.mock('@/lib/customer-service', () => ({
  getCustomerByUserId: jest.fn(),
}));

// Import the mock after mocking
const { getCustomerByUserId } = require('@/lib/customer-service');

// Mock console.error to track error logging
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('GET Customer ID API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  const createMockRequest = (body: unknown) => {
    const request = {
      json: jest.fn().mockResolvedValue(body),
      text: jest.fn().mockResolvedValue(JSON.stringify(body)),
    } as unknown as NextRequest;
    return request;
  };

  describe('POST /api/stripe/get-customer-id', () => {
    it('successfully returns customer ID for valid user', async () => {
      const mockUserId = 'user-123';
      const mockCustomerId = 'cus_test123';

      getCustomerByUserId.mockResolvedValue({
        success: true,
        stripeCustomerId: mockCustomerId,
      });

      const request = createMockRequest({ userId: mockUserId });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        stripeCustomerId: mockCustomerId,
      });
      expect(getCustomerByUserId).toHaveBeenCalledWith(mockUserId);
    });

    it('returns 400 error when userId is missing', async () => {
      const request = createMockRequest({});
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: 'Missing required field: userId',
      });
      expect(getCustomerByUserId).not.toHaveBeenCalled();
    });

    it('returns 400 error when userId is null', async () => {
      const request = createMockRequest({ userId: null });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: 'Missing required field: userId',
      });
      expect(getCustomerByUserId).not.toHaveBeenCalled();
    });

    it('returns 400 error when userId is empty string', async () => {
      const request = createMockRequest({ userId: '' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: 'Missing required field: userId',
      });
      expect(getCustomerByUserId).not.toHaveBeenCalled();
    });

    it('returns 404 error when customer service returns unsuccessful result', async () => {
      const mockUserId = 'user-not-found';

      getCustomerByUserId.mockResolvedValue({
        success: false,
        error: 'Profile not found',
      });

      const request = createMockRequest({ userId: mockUserId });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        error: 'No customer found',
      });
      expect(getCustomerByUserId).toHaveBeenCalledWith(mockUserId);
    });

    it('returns 404 error when customer service returns no customer ID', async () => {
      const mockUserId = 'user-no-customer';

      getCustomerByUserId.mockResolvedValue({
        success: true,
        stripeCustomerId: undefined,
      });

      const request = createMockRequest({ userId: mockUserId });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        error: 'No customer found',
      });
      expect(getCustomerByUserId).toHaveBeenCalledWith(mockUserId);
    });

    it('handles customer service throwing an error', async () => {
      const mockUserId = 'user-error';
      const mockError = new Error('Database connection failed');

      getCustomerByUserId.mockRejectedValue(mockError);

      const request = createMockRequest({ userId: mockUserId });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Failed to retrieve customer ID',
      });
      expect(getCustomerByUserId).toHaveBeenCalledWith(mockUserId);
      expect(mockConsoleError).toHaveBeenCalledWith('[GET CUSTOMER ID] Error getting customer ID:', mockError);
    });

    it('handles invalid JSON in request body', async () => {
      const request = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
        text: jest.fn().mockResolvedValue('invalid json'),
      } as unknown as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Failed to retrieve customer ID',
      });
      expect(getCustomerByUserId).not.toHaveBeenCalled();
    });

    it('handles request with additional fields', async () => {
      const mockUserId = 'user-extra';
      const mockCustomerId = 'cus_extra123';

      getCustomerByUserId.mockResolvedValue({
        success: true,
        stripeCustomerId: mockCustomerId,
      });

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
        stripeCustomerId: mockCustomerId,
      });
      expect(getCustomerByUserId).toHaveBeenCalledWith(mockUserId);
    });

    it('handles customer service returning empty string as customer ID', async () => {
      const mockUserId = 'user-empty-customer';

      getCustomerByUserId.mockResolvedValue({
        success: true,
        stripeCustomerId: '',
      });

      const request = createMockRequest({ userId: mockUserId });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        error: 'No customer found',
      });
      expect(getCustomerByUserId).toHaveBeenCalledWith(mockUserId);
    });
  });
}); 