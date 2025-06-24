/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSearchParams, useRouter } from 'next/navigation';
import CheckoutSuccess from '../checkout-success';

// Mock Next.js navigation
const mockPush = jest.fn();
const mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

// Mock Supabase client
const mockGetUser = jest.fn();
const mockSignUp = jest.fn();
const mockSignInWithPassword = jest.fn();
const mockSupabaseClient = {
  auth: {
    getUser: mockGetUser,
    signUp: mockSignUp,
    signInWithPassword: mockSignInWithPassword,
  },
};

jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Test data
const mockSubscriptionData = {
  planName: 'Pro Plan',
  status: 'active',
  priceId: 'price_123',
  currentPeriodEnd: '2024-12-31T23:59:59.000Z',
};

const mockVerificationData = {
  subscription: mockSubscriptionData,
  customer: {
    id: 'cus_123',
    email: 'test@example.com',
  },
  isGuest: false,
};

const mockGuestVerificationData = {
  subscription: mockSubscriptionData,
  customer: {
    id: 'cus_123',
    email: 'test@example.com',
  },
  isGuest: true,
  accountStatus: {
    hasExistingAccount: false,
    email: 'test@example.com',
    userId: null,
  },
};

const mockExistingAccountData = {
  ...mockGuestVerificationData,
  accountStatus: {
    hasExistingAccount: true,
    email: 'test@example.com',
    userId: 'user_123',
  },
};

describe('CheckoutSuccess', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn((key: string) => {
        if (key === 'session_id') return 'cs_test_123';
        if (key === 'guest') return null;
        return null;
      }),
    });

    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockVerificationData),
    });

    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user_123', email: 'test@example.com' } },
    });
  });

  describe('Loading State', () => {
    it('shows loading state initially', () => {
      render(<CheckoutSuccess />);
      
      expect(screen.getByText('Processing your subscription...')).toBeInTheDocument();
      expect(screen.getByText('Please wait while we confirm your subscription.')).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('shows error when no session ID is provided', async () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn(() => null),
      });

      render(<CheckoutSuccess />);

      await waitFor(() => {
        expect(screen.getByText('Subscription Verification Failed')).toBeInTheDocument();
        expect(screen.getByText('No session ID provided')).toBeInTheDocument();
      });
    });

    it('shows error when verification fails', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({ error: 'Verification failed' }),
      });

      render(<CheckoutSuccess />);

      await waitFor(() => {
        expect(screen.getByText('Subscription Verification Failed')).toBeInTheDocument();
        expect(screen.getByText(/Failed to verify your subscription/)).toBeInTheDocument();
      });
    });

    it('shows session ID in error state', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({ error: 'Verification failed' }),
      });

      render(<CheckoutSuccess />);

      await waitFor(() => {
        expect(screen.getByText('cs_test_123')).toBeInTheDocument();
      });
    });
  });

  describe('Authenticated User Flow', () => {
    it('renders success message for authenticated users', async () => {
      render(<CheckoutSuccess />);

      await waitFor(() => {
        expect(screen.getByText(`Welcome to ${mockSubscriptionData.planName}!`)).toBeInTheDocument();
        expect(screen.getByText('Your subscription has been successfully activated.')).toBeInTheDocument();
      });
    });

    it('displays subscription details correctly', async () => {
      render(<CheckoutSuccess />);

      await waitFor(() => {
        expect(screen.getByText('Subscription Details')).toBeInTheDocument();
        expect(screen.getByText(mockSubscriptionData.planName)).toBeInTheDocument();
        expect(screen.getByText('active')).toBeInTheDocument();
        expect(screen.getByText('1/1/2025')).toBeInTheDocument();
      });
    });

    it('shows navigation buttons', async () => {
      render(<CheckoutSuccess />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /go to dashboard/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /manage subscription/i })).toBeInTheDocument();
      });
    });

    it('redirects to profile when dashboard button is clicked', async () => {
      const user = userEvent.setup();
      render(<CheckoutSuccess />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /go to dashboard/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /go to dashboard/i }));
      expect(mockPush).toHaveBeenCalledWith('/profile');
    });
  });

  describe('Guest Checkout - New User Flow', () => {
    beforeEach(() => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key: string) => {
          if (key === 'session_id') return 'cs_test_123';
          if (key === 'guest') return 'true';
          return null;
        }),
      });

      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockGuestVerificationData),
      });
    });

    it('shows guest success page for new users', async () => {
      render(<CheckoutSuccess />);

      await waitFor(() => {
        expect(screen.getByText('Payment Successful!')).toBeInTheDocument();
        expect(screen.getByText('Complete Your Account')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
      });
    });

    it('shows create account form when button is clicked', async () => {
      const user = userEvent.setup();
      render(<CheckoutSuccess />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /create account/i }));

      expect(screen.getByLabelText(/create password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });

    it('validates password requirements', async () => {
      const user = userEvent.setup();
      render(<CheckoutSuccess />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /create account/i }));

      const passwordInput = screen.getByLabelText(/create password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      const createButton = screen.getByRole('button', { name: /create account/i });

      await user.type(passwordInput, '123');
      await user.type(confirmInput, '123');
      await user.click(createButton);

      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });

    it('validates password match', async () => {
      const user = userEvent.setup();
      render(<CheckoutSuccess />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /create account/i }));

      const passwordInput = screen.getByLabelText(/create password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      const createButton = screen.getByRole('button', { name: /create account/i });

      await user.type(passwordInput, 'password123');
      await user.type(confirmInput, 'different');
      await user.click(createButton);

      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });

    it('creates account successfully', async () => {
      const user = userEvent.setup();
      mockSignUp.mockResolvedValue({
        data: { user: { id: 'user_123' } },
        error: null,
      });

      // Mock reconciliation API call
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockGuestVerificationData),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ success: true }),
        });

      render(<CheckoutSuccess />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /create account/i }));

      const passwordInput = screen.getByLabelText(/create password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      const createButton = screen.getByRole('button', { name: /create account/i });

      await user.type(passwordInput, 'password123');
      await user.type(confirmInput, 'password123');
      await user.click(createButton);

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
        expect(mockPush).toHaveBeenCalledWith('/profile?welcome=true');
      });
    });

    it('handles account creation errors', async () => {
      const user = userEvent.setup();
      mockSignUp.mockResolvedValue({
        data: null,
        error: { message: 'Email already exists' },
      });

      render(<CheckoutSuccess />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /create account/i }));

      const passwordInput = screen.getByLabelText(/create password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      const createButton = screen.getByRole('button', { name: /create account/i });

      await user.type(passwordInput, 'password123');
      await user.type(confirmInput, 'password123');
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to create account. Please try again.')).toBeInTheDocument();
      });
    });
  });

  describe('Guest Checkout - Existing User Flow', () => {
    beforeEach(() => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key: string) => {
          if (key === 'session_id') return 'cs_test_123';
          if (key === 'guest') return 'true';
          return null;
        }),
      });

      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockExistingAccountData),
      });
    });

    it('shows existing user flow', async () => {
      render(<CheckoutSuccess />);

      await waitFor(() => {
        expect(screen.getByText('Welcome Back!')).toBeInTheDocument();
        expect(screen.getByText(/We found an existing account/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in to your account/i })).toBeInTheDocument();
      });
    });

    it('shows sign in form when button is clicked', async () => {
      const user = userEvent.setup();
      render(<CheckoutSuccess />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sign in to your account/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /sign in to your account/i }));

      expect(screen.getByLabelText(/enter your password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('signs in successfully', async () => {
      const user = userEvent.setup();
      mockSignInWithPassword.mockResolvedValue({
        data: { user: { id: 'user_123' } },
        error: null,
      });

      // Mock reconciliation API call
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockExistingAccountData),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ success: true }),
        });

      render(<CheckoutSuccess />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sign in to your account/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /sign in to your account/i }));

      const passwordInput = screen.getByLabelText(/enter your password/i);
      const signInButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(passwordInput, 'password123');
      await user.click(signInButton);

      await waitFor(() => {
        expect(mockSignInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
        expect(mockPush).toHaveBeenCalledWith('/profile');
      });
    });

    it('handles sign in errors', async () => {
      const user = userEvent.setup();
      mockSignInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' },
      });

      render(<CheckoutSuccess />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sign in to your account/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /sign in to your account/i }));

      const passwordInput = screen.getByLabelText(/enter your password/i);
      const signInButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(passwordInput, 'wrongpassword');
      await user.click(signInButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to sign in. Please check your password.')).toBeInTheDocument();
      });
    });

    it('can cancel password form', async () => {
      const user = userEvent.setup();
      render(<CheckoutSuccess />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sign in to your account/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /sign in to your account/i }));
      expect(screen.getByLabelText(/enter your password/i)).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /cancel/i }));
      expect(screen.queryByLabelText(/enter your password/i)).not.toBeInTheDocument();
    });
  });

  describe('API Integration', () => {
    it('calls verification API with correct parameters for authenticated users', async () => {
      render(<CheckoutSuccess />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/stripe/checkout/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: 'cs_test_123',
            userId: 'user_123',
            isGuest: false,
          }),
        });
      });
    });

    it('calls verification API with correct parameters for guest users', async () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key: string) => {
          if (key === 'session_id') return 'cs_test_123';
          if (key === 'guest') return 'true';
          return null;
        }),
      });

      render(<CheckoutSuccess />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/stripe/checkout/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: 'cs_test_123',
            isGuest: true,
          }),
        });
      });
    });

    it('calls reconciliation API after account creation', async () => {
      const user = userEvent.setup();
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key: string) => {
          if (key === 'session_id') return 'cs_test_123';
          if (key === 'guest') return 'true';
          return null;
        }),
      });

      mockSignUp.mockResolvedValue({
        data: { user: { id: 'user_123' } },
        error: null,
      });

      // Setup fetch mock for both verification and reconciliation
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockGuestVerificationData),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ success: true }),
        });

      render(<CheckoutSuccess />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /create account/i }));

      const passwordInput = screen.getByLabelText(/create password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      const createButton = screen.getByRole('button', { name: /create account/i });

      await user.type(passwordInput, 'password123');
      await user.type(confirmInput, 'password123');
      await user.click(createButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/reconcile-account', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: 'cs_test_123',
            userEmail: 'test@example.com',
            stripeCustomerId: 'cus_123',
          }),
        });
      });
    });
  });

  describe('Edge Cases', () => {
    it('redirects to login if no user is found for authenticated flow', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
      });

      render(<CheckoutSuccess />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });

    it('handles missing verification data gracefully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(null),
      });

      render(<CheckoutSuccess />);

      await waitFor(() => {
        expect(screen.getByText('Subscription Verification Failed')).toBeInTheDocument();
      });
    });

    it('handles reconciliation API errors gracefully', async () => {
      const user = userEvent.setup();
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key: string) => {
          if (key === 'session_id') return 'cs_test_123';
          if (key === 'guest') return 'true';
          return null;
        }),
      });

      mockSignUp.mockResolvedValue({
        data: { user: { id: 'user_123' } },
        error: null,
      });

      // Mock verification success, reconciliation failure
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockGuestVerificationData),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: jest.fn().mockResolvedValue({ error: 'Reconciliation failed' }),
        });

      // Spy on console.error to verify error is logged
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<CheckoutSuccess />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /create account/i }));

      const passwordInput = screen.getByLabelText(/create password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      const createButton = screen.getByRole('button', { name: /create account/i });

      await user.type(passwordInput, 'password123');
      await user.type(confirmInput, 'password123');
      await user.click(createButton);

      // Should still navigate even if reconciliation fails
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/profile?welcome=true');
        expect(consoleSpy).toHaveBeenCalledWith('Reconciliation failed:', expect.any(Object));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels', async () => {
      const user = userEvent.setup();
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key: string) => {
          if (key === 'session_id') return 'cs_test_123';
          if (key === 'guest') return 'true';
          return null;
        }),
      });

      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockGuestVerificationData),
      });

      render(<CheckoutSuccess />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /create account/i }));

      expect(screen.getByLabelText(/create password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });

    it('shows loading state with proper aria labels', () => {
      render(<CheckoutSuccess />);
      
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('animate-spin');
    });
  });
}); 