/**
 * Tests for OAuth Buttons Component
 * 
 * Test coverage for Google OAuth integration including:
 * - Component rendering with feature flags
 * - Google sign-in flow and error handling
 * - Loading states and disabled states
 * - Accessibility and user interaction
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import '@testing-library/jest-dom';

import { OAuthButtons, OAuthDivider } from '../oauth-buttons';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock('@/lib/supabase', () => ({
  createClientComponentClient: jest.fn(),
}));

jest.mock('@/lib/env', () => ({
  get env() {
    return {
      NEXT_PUBLIC_ENABLE_SOCIAL_AUTH: process.env.NEXT_PUBLIC_ENABLE_SOCIAL_AUTH,
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    };
  },
  get features() {
    return {
      socialAuth: process.env.NEXT_PUBLIC_ENABLE_SOCIAL_AUTH === 'true',
    };
  },
  get services() {
    return {
      hasGoogleAuth: process.env.NEXT_PUBLIC_ENABLE_SOCIAL_AUTH === 'true' && !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    };
  },
}));

// Mock implementations
const mockPush = jest.fn();
const mockSignInWithOAuth = jest.fn();
const mockSupabaseClient = {
  auth: {
    signInWithOAuth: mockSignInWithOAuth,
  },
};

const { createClientComponentClient } = require('@/lib/supabase');

// Setup mocks
beforeEach(() => {
  jest.clearAllMocks();
  
  (useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
  });
  
  createClientComponentClient.mockReturnValue(mockSupabaseClient);
  
  // Reset environment variable
  process.env.NEXT_PUBLIC_ENABLE_SOCIAL_AUTH = 'true';
});

describe('OAuthButtons', () => {
  describe('Feature Flag Behavior', () => {
    it('renders when social auth is enabled', () => {
      process.env.NEXT_PUBLIC_ENABLE_SOCIAL_AUTH = 'true';
      
      render(<OAuthButtons />);
      
      expect(screen.getByText('Continue with Google')).toBeInTheDocument();
    });

    it('does not render when social auth is disabled', () => {
      process.env.NEXT_PUBLIC_ENABLE_SOCIAL_AUTH = 'false';
      
      render(<OAuthButtons />);
      
      expect(screen.queryByText('Continue with Google')).not.toBeInTheDocument();
    });

    it('does not render when social auth environment variable is undefined', () => {
      delete process.env.NEXT_PUBLIC_ENABLE_SOCIAL_AUTH;
      
      render(<OAuthButtons />);
      
      expect(screen.queryByText('Continue with Google')).not.toBeInTheDocument();
    });
  });

  describe('Component Rendering', () => {
    it('renders Google sign-in button with default props', () => {
      render(<OAuthButtons />);

      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      expect(googleButton).toBeInTheDocument();
      expect(googleButton).not.toBeDisabled();
      
      // Check for Google icon (SVG should be present)
      expect(googleButton.querySelector('svg')).toBeInTheDocument();
    });

    it('renders with custom redirect URL', () => {
      render(<OAuthButtons redirectTo="/dashboard" />);

      expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<OAuthButtons className="custom-oauth-class" />);

      const container = screen.getByRole('button', { name: /continue with google/i }).parentElement;
      expect(container).toHaveClass('custom-oauth-class');
    });

    it('renders disabled when disabled prop is true', () => {
      render(<OAuthButtons disabled={true} />);

      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      expect(googleButton).toBeDisabled();
    });
  });

  describe('Google OAuth Flow', () => {
    it('initiates Google OAuth on button click', async () => {
      const user = userEvent.setup();
      mockSignInWithOAuth.mockResolvedValue({ error: null });

      render(<OAuthButtons redirectTo="/profile" />);

      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      await user.click(googleButton);

      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost/auth/callback?next=%2Fprofile',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
    });

    it('handles OAuth success correctly', async () => {
      const user = userEvent.setup();
      mockSignInWithOAuth.mockResolvedValue({ error: null });

      render(<OAuthButtons />);

      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      await user.click(googleButton);

      // Should not show any error toast
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('handles OAuth errors and shows error message', async () => {
      const user = userEvent.setup();
      const oauthError = { message: 'OAuth provider error' };
      mockSignInWithOAuth.mockResolvedValue({ error: oauthError });

      render(<OAuthButtons />);

      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      await user.click(googleButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to start Google authentication. Please try again.');
      });
    });

    it('handles unexpected errors during OAuth flow', async () => {
      const user = userEvent.setup();
      mockSignInWithOAuth.mockRejectedValue(new Error('Network error'));

      render(<OAuthButtons />);

      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      await user.click(googleButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('An unexpected error occurred. Please try again.');
      });
    });
  });

  describe('Loading States', () => {
    it('shows loading state during Google OAuth request', async () => {
      const user = userEvent.setup();
      
      // Create a promise that we can control
      let resolveOAuth: (value: { error: null }) => void;
      const oauthPromise = new Promise<{ error: null }>((resolve) => {
        resolveOAuth = resolve;
      });
      mockSignInWithOAuth.mockReturnValue(oauthPromise);

      render(<OAuthButtons />);

      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      await user.click(googleButton);

      // Should show loading state
      expect(screen.getByText('Connecting...')).toBeInTheDocument();
      expect(googleButton).toBeDisabled();
      expect(screen.getByRole('button', { name: /connecting/i })).toBeInTheDocument();

      // Resolve the promise
      resolveOAuth!({ error: null });
      
      await waitFor(() => {
        expect(screen.queryByText('Connecting...')).not.toBeInTheDocument();
      });
    });

    it('disables button when already disabled', () => {
      render(<OAuthButtons disabled={true} />);

      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      expect(googleButton).toBeDisabled();
    });

    it('disables button during loading state', async () => {
      const user = userEvent.setup();
      
      let resolveOAuth: (value: { error: null }) => void;
      const oauthPromise = new Promise<{ error: null }>((resolve) => {
        resolveOAuth = resolve;
      });
      mockSignInWithOAuth.mockReturnValue(oauthPromise);

      render(<OAuthButtons />);

      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      await user.click(googleButton);

      expect(googleButton).toBeDisabled();
      
      resolveOAuth!({ error: null });
    });
  });

  describe('Accessibility', () => {
    it('has proper button roles and labels', () => {
      render(<OAuthButtons />);

      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      expect(googleButton).toBeInTheDocument();
      expect(googleButton).toHaveAttribute('type', 'button');
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      mockSignInWithOAuth.mockResolvedValue({ error: null });

      render(<OAuthButtons />);

      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      
      // Focus and activate with keyboard
      googleButton.focus();
      expect(googleButton).toHaveFocus();
      
      await user.keyboard('{Enter}');
      expect(mockSignInWithOAuth).toHaveBeenCalled();
    });
  });

  describe('Redirect URL Encoding', () => {
    it('properly encodes redirect URLs with special characters', async () => {
      const user = userEvent.setup();
      mockSignInWithOAuth.mockResolvedValue({ error: null });

      render(<OAuthButtons redirectTo="/dashboard?tab=settings&view=profile" />);

      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      await user.click(googleButton);

      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost/auth/callback?next=%2Fdashboard%3Ftab%3Dsettings%26view%3Dprofile',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
    });
  });
});

describe('OAuthDivider', () => {
  it('renders divider with correct text', () => {
    render(<OAuthDivider />);

    expect(screen.getByText('Or continue with')).toBeInTheDocument();
  });

  it('has proper styling classes', () => {
    render(<OAuthDivider />);

    const dividerText = screen.getByText('Or continue with');
    expect(dividerText).toHaveClass('text-gray-500', 'dark:text-gray-400');
  });
}); 