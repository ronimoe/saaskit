/**
 * @jest-environment node
 * 
 * Stripe Checkout API Route Tests
 * 
 * Tests for the checkout session creation API endpoint
 */

import { NextRequest } from 'next/server';

// Mock customer service
const mockGetCustomerByUserId = jest.fn();
const mockEnsureCustomerExists = jest.fn();

jest.mock('@/lib/customer-service', () => ({
  getCustomerByUserId: mockGetCustomerByUserId,
  ensureCustomerExists: mockEnsureCustomerExists,
}));

// Mock Stripe with jest.doMock to avoid hoisting issues
const mockCheckoutCreate = jest.fn();
jest.doMock('@/lib/stripe-server', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: mockCheckoutCreate,
      },
    },
  },
}));

// Set environment variables for tests
process.env.NEXT_PUBLIC_APP_URL = 'https://test.com';
process.env.STRIPE_SECRET_KEY = 'sk_test_123';

function createMockRequest(body: any): NextRequest {
  const req = new NextRequest('http://localhost:3000/api/stripe/checkout', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

  // Manually override the json method for tests
  req.json = async () => (typeof body === 'string' ? JSON.parse(body) : body);

  return req;
}

describe('POST /api/stripe/checkout', () => {
  let POST: (request: NextRequest) => Promise<Response>;

  beforeEach(async () => {
    // Dynamically import the route handler after mocks are set up
    const route = await import('../route');
    POST = route.POST;
    jest.clearAllMocks();
  });

  const validRequestBody = {
    priceId: 'price_test_pro_monthly',
    userId: 'user_123',
    userEmail: 'test@example.com',
    fullName: 'Test User',
  };

  const mockProfile = {
    id: 'profile_123',
    email: 'test@example.com',
    full_name: 'Test User',
    user_id: 'user_123',
    stripe_customer_id: 'cus_existing_customer_123',
  };

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.STRIPE_SECRET_KEY;
  });

  it('should create checkout session with existing customer', async () => {
    // Arrange
    const mockSession = {
      id: 'cs_test_session_123',
      url: 'https://checkout.stripe.com/pay/cs_test_session_123',
    };

    mockGetCustomerByUserId.mockResolvedValue({
      success: true,
      profile: mockProfile,
      stripeCustomerId: 'cus_existing_customer_123',
    });

    mockCheckoutCreate.mockResolvedValue(mockSession);

    const request = createMockRequest(validRequestBody);

    // Act
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.sessionId).toBe('cs_test_session_123');
    expect(data.url).toBe('https://checkout.stripe.com/pay/cs_test_session_123');
    expect(data.customerId).toBe('cus_existing_customer_123');

    expect(mockGetCustomerByUserId).toHaveBeenCalledWith('user_123');
    expect(mockEnsureCustomerExists).not.toHaveBeenCalled();

    expect(mockCheckoutCreate).toHaveBeenCalledWith({
      customer: 'cus_existing_customer_123',
      line_items: [
        {
          price: 'price_test_pro_monthly',
          quantity: 1,
        },
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
      success_url: 'https://test.com/checkout/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://test.com/checkout/cancel',
      metadata: {
        userId: 'user_123',
        priceId: 'price_test_pro_monthly',
        profileId: 'profile_123',
        checkoutType: 'authenticated',
      },
      subscription_data: {
        metadata: {
          userId: 'user_123',
          priceId: 'price_test_pro_monthly',
          profileId: 'profile_123',
          checkoutType: 'authenticated',
        },
      },
    });
  });

  it('should create new customer when none exists', async () => {
    // Arrange
    const mockSession = {
      id: 'cs_test_session_123',
      url: 'https://checkout.stripe.com/pay/cs_test_session_123',
    };

    mockGetCustomerByUserId.mockResolvedValue({
      success: false,
      error: 'Profile not found',
    });

    mockEnsureCustomerExists.mockResolvedValue({
      success: true,
      profile: mockProfile,
      stripeCustomerId: 'cus_new_customer_123',
      isNewCustomer: true,
      isNewProfile: true,
    });

    mockCheckoutCreate.mockResolvedValue(mockSession);

    const request = createMockRequest(validRequestBody);

    // Act
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.sessionId).toBe('cs_test_session_123');
    expect(data.customerId).toBe('cus_new_customer_123');

    expect(mockGetCustomerByUserId).toHaveBeenCalledWith('user_123');
    expect(mockEnsureCustomerExists).toHaveBeenCalledWith('user_123', 'test@example.com', 'Test User');

    expect(mockCheckoutCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: 'cus_new_customer_123',
        line_items: [
          {
            price: 'price_test_pro_monthly',
            quantity: 1,
          },
        ],
      })
    );
  });

  it('should return 400 for missing priceId', async () => {
    // Arrange
    const request = createMockRequest({ userId: 'user_123' });

    // Act
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing required field: priceId');
  });

  it('should return 400 for missing userId', async () => {
    // Arrange
    const request = createMockRequest({ priceId: 'price_test_pro_monthly' });

    // Act
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(data.error).toBe('User email is required for new customer creation');
  });

  it('should return 400 when userEmail is missing for new customer', async () => {
    // Arrange
    mockGetCustomerByUserId.mockResolvedValue({
      success: false,
      error: 'Profile not found',
    });

    const request = createMockRequest({
      priceId: 'price_test_pro_monthly',
      userId: 'user_123',
      // userEmail missing
    });

    // Act
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(data.error).toBe('User email is required for new customer creation');
  });

  it('should return 500 when customer creation fails', async () => {
    // Arrange
    mockGetCustomerByUserId.mockResolvedValue({
      success: false,
      error: 'Profile not found',
    });

    mockEnsureCustomerExists.mockResolvedValue({
      success: false,
      error: 'Failed to create Stripe customer',
      profile: null,
      stripeCustomerId: null,
    });

    const request = createMockRequest(validRequestBody);

    // Act
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to create customer. Please try again.');
  });

  it('should return 500 for Stripe checkout session creation errors', async () => {
    // Arrange
    mockGetCustomerByUserId.mockResolvedValue({
      success: true,
      profile: mockProfile,
      stripeCustomerId: 'cus_existing_customer_123',
    });

    mockCheckoutCreate.mockRejectedValue(new Error('Invalid price ID'));

    const request = createMockRequest(validRequestBody);

    // Act
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to create authenticated checkout session');
  });

  it('should handle malformed JSON request body', async () => {
    // Arrange
    const request = createMockRequest('invalid json');

    // Act
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to create checkout session');
  });
}); 