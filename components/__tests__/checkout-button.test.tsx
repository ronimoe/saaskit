/**
 * CheckoutButton Component Tests
 * 
 * Tests for the checkout button component including authentication,
 * API integration, and error handling scenarios.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import CheckoutButton from '../checkout-button';

// Mock Next.js router
const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
};

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => mockRouter),
}));

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
  },
};

jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

// Mock Stripe client
const mockStripeClient = {
  redirectToCheckout: jest.fn(),
};

jest.mock('@/lib/stripe-client', () => ({
  getStripe: jest.fn(() => Promise.resolve(mockStripeClient)),
}));

// Mock fetch globally
global.fetch = jest.fn();

// Note: window.location.href assignment will work in JSDOM but won't actually navigate

describe('CheckoutButton', () => {
  const defaultProps = {
    priceId: 'price_test_pro_monthly',
    planName: 'Pro Plan',
  };

  const mockUser = {
    id: 'user_123',
    email: 'test@example.com',
    user_metadata: {},
    app_metadata: {},
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00Z',
    role: 'authenticated',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('should render checkout button with default text', () => {
    render(<CheckoutButton {...defaultProps} />);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Start Free Trial')).toBeInTheDocument();
  });

  it('should render checkout button with custom children', () => {
    render(
      <CheckoutButton {...defaultProps}>
        Custom Button Text
      </CheckoutButton>
    );
    
    expect(screen.getByText('Custom Button Text')).toBeInTheDocument();
  });

  it('should apply popular styling when isPopular is true', () => {
    render(<CheckoutButton {...defaultProps} isPopular={true} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-purple-600', 'hover:bg-purple-700');
  });

  it('should apply default styling when isPopular is false', () => {
    render(<CheckoutButton {...defaultProps} isPopular={false} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-gray-900', 'hover:bg-gray-800');
  });

  it('should apply custom className', () => {
    render(<CheckoutButton {...defaultProps} className="custom-class" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('should redirect to login when user is not authenticated', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    render(<CheckoutButton {...defaultProps} enableGuestCheckout={false} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login?redirect=/pricing');
    });
  });

  it('should handle successful checkout flow', async () => {
    // Mock authenticated user
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    // Mock successful checkout session creation
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        sessionId: 'cs_test_session_123',
        url: 'https://checkout.stripe.com/pay/cs_test_session_123',
      }),
    });

    render(<CheckoutButton {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Verify the checkout API was called correctly
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: 'price_test_pro_monthly',
          userId: 'user_123',
          userEmail: 'test@example.com',
          fullName: undefined, // user_metadata is empty in mock
          isGuest: false,
        }),
      });
    });

    // Verify the response was processed (button should not be loading anymore)
    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled();
    });
  });

  it('should include fullName when user has metadata', async () => {
    // Mock authenticated user with metadata
    const userWithMetadata = {
      ...mockUser,
      user_metadata: { full_name: 'John Doe' }
    };

    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: userWithMetadata },
      error: null,
    });

    // Mock successful checkout session creation
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        sessionId: 'cs_test_session_123',
        url: 'https://checkout.stripe.com/pay/cs_test_session_123',
      }),
    });

    render(<CheckoutButton {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Verify the checkout API was called with fullName
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: 'price_test_pro_monthly',
          userId: 'user_123',
          userEmail: 'test@example.com',
          fullName: 'John Doe',
          isGuest: false,
        }),
      });
    });
  });

  it('should show loading state during checkout process', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    // Mock delayed response
    (global.fetch as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({
          sessionId: 'cs_test_session_123',
          url: 'https://checkout.stripe.com/pay/cs_test_session_123',
        }),
      }), 100))
    );

    render(<CheckoutButton {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Should show loading state
    await waitFor(() => {
      expect(button).toBeDisabled();
      expect(screen.getByText('Starting checkout...')).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    // Mock API error
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({
        error: 'Invalid price ID',
      }),
    });

    render(<CheckoutButton {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Invalid price ID')).toBeInTheDocument();
    });

    // Button should be re-enabled
    expect(button).not.toBeDisabled();
  });

  it('should handle network errors', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    // Mock network error
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<CheckoutButton {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('should handle Stripe redirect errors', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    // Mock response with sessionId but no URL to trigger Stripe.js fallback
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        sessionId: 'cs_test_session_123',
        url: null,
      }),
    });

    // Mock Stripe redirect error
    mockStripeClient.redirectToCheckout.mockResolvedValue({
      error: { message: 'Stripe redirect failed' },
    });

    render(<CheckoutButton {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Stripe redirect failed')).toBeInTheDocument();
    });
  });

  it('should handle authentication errors', async () => {
    mockSupabaseClient.auth.getUser.mockRejectedValue(new Error('Authentication failed'));

    render(<CheckoutButton {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Authentication failed')).toBeInTheDocument();
    });
  });

  it('should clear error when retrying', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    // First call fails
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'API Error' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          sessionId: 'cs_test_session_123',
          url: 'https://checkout.stripe.com/pay/cs_test_session_123',
        }),
      });

    mockStripeClient.redirectToCheckout.mockResolvedValue({ error: null });

    render(<CheckoutButton {...defaultProps} />);
    
    const button = screen.getByRole('button');
    
    // First click - should show error
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });

    // Second click - should clear error and succeed
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.queryByText('API Error')).not.toBeInTheDocument();
    });
  });
}); 