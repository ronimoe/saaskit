import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import '@testing-library/jest-dom';
import { AccountLinkingForm } from '../account-linking-form';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('AccountLinkingForm', () => {
  const mockPush = jest.fn();
  const defaultProps = {
    token: 'test-token',
    provider: 'google',
    email: 'test@example.com',
    userId: 'user-123',
    message: 'Test linking message',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    (global.fetch as jest.Mock).mockClear();
  });

  describe('Component Rendering', () => {
    it('renders account linking form with all elements', () => {
      render(<AccountLinkingForm {...defaultProps} />);

      expect(screen.getByText('Test linking message')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('google')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /link accounts/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('renders with default message when no custom message provided', () => {
      const propsWithoutMessage = { ...defaultProps, message: undefined };

      render(<AccountLinkingForm {...propsWithoutMessage} />);

      expect(screen.getByText(/an account with test@example.com already exists/i)).toBeInTheDocument();
    });

    it('displays account details correctly', () => {
      render(<AccountLinkingForm {...defaultProps} />);

      expect(screen.getByText('Account Details')).toBeInTheDocument();
      expect(screen.getByText('Email:')).toBeInTheDocument();
      expect(screen.getByText('Provider:')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('google')).toBeInTheDocument();
    });
  });

  describe('Account Linking Flow', () => {
    it('successfully links accounts and redirects', async () => {
      const user = userEvent.setup();
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          linkedUserId: 'linked-user-123',
          message: 'Accounts linked successfully',
        }),
      });

      render(<AccountLinkingForm {...defaultProps} />);

      const linkButton = screen.getByRole('button', { name: /link accounts/i });
      await user.click(linkButton);

      // Check API call
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/link-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'link',
          token: 'test-token',
          oauthUserId: 'user-123',
          provider: 'google',
        }),
      });

      // Wait for success state
      await waitFor(() => {
        expect(screen.getByText('Accounts Linked Successfully!')).toBeInTheDocument();
      });

      // Check redirect after delay
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/profile?message=Accounts linked successfully! You can now sign in using either method.');
      }, { timeout: 3000 });
    });

    it('handles API errors correctly', async () => {
      const user = userEvent.setup();
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'Invalid linking token',
        }),
      });

      render(<AccountLinkingForm {...defaultProps} />);

      const linkButton = screen.getByRole('button', { name: /link accounts/i });
      await user.click(linkButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid linking token')).toBeInTheDocument();
      });

      // Should not redirect on error
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('handles network errors correctly', async () => {
      const user = userEvent.setup();
      
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(<AccountLinkingForm {...defaultProps} />);

      const linkButton = screen.getByRole('button', { name: /link accounts/i });
      await user.click(linkButton);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('handles generic fetch errors', async () => {
      const user = userEvent.setup();
      
      (global.fetch as jest.Mock).mockRejectedValueOnce('Unknown error');

      render(<AccountLinkingForm {...defaultProps} />);

      const linkButton = screen.getByRole('button', { name: /link accounts/i });
      await user.click(linkButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to link accounts')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('shows loading state during account linking', async () => {
      const user = userEvent.setup();
      
      // Create a promise that we can control
      let resolveFetch: (value: unknown) => void;
      const fetchPromise = new Promise((resolve) => {
        resolveFetch = resolve;
      });
      (global.fetch as jest.Mock).mockReturnValue(fetchPromise);

      render(<AccountLinkingForm {...defaultProps} />);

      const linkButton = screen.getByRole('button', { name: /link accounts/i });
      await user.click(linkButton);

      // Should show loading state
      expect(screen.getByText('Linking Accounts...')).toBeInTheDocument();
      expect(linkButton).toBeDisabled();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();

      // Resolve the promise
      resolveFetch!({
        ok: true,
        json: async () => ({ success: true }),
      });
    });

    it('disables buttons during loading', async () => {
      const user = userEvent.setup();
      
      let resolveFetch: (value: unknown) => void;
      const fetchPromise = new Promise((resolve) => {
        resolveFetch = resolve;
      });
      (global.fetch as jest.Mock).mockReturnValue(fetchPromise);

      render(<AccountLinkingForm {...defaultProps} />);

      const linkButton = screen.getByRole('button', { name: /link accounts/i });
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      
      await user.click(linkButton);

      expect(linkButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();

      resolveFetch!({
        ok: true,
        json: async () => ({ success: true }),
      });
    });
  });

  describe('Cancel Flow', () => {
    it('redirects to login when cancel is clicked', async () => {
      const user = userEvent.setup();

      render(<AccountLinkingForm {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockPush).toHaveBeenCalledWith('/login?message=Account linking cancelled');
    });

    it('does not allow cancel during loading', async () => {
      const user = userEvent.setup();
      
      let resolveFetch: (value: unknown) => void;
      const fetchPromise = new Promise((resolve) => {
        resolveFetch = resolve;
      });
      (global.fetch as jest.Mock).mockReturnValue(fetchPromise);

      render(<AccountLinkingForm {...defaultProps} />);

      const linkButton = screen.getByRole('button', { name: /link accounts/i });
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      
      await user.click(linkButton);
      
      // Cancel should be disabled during loading
      expect(cancelButton).toBeDisabled();

      resolveFetch!({
        ok: true,
        json: async () => ({ success: true }),
      });
    });
  });

  describe('Success State', () => {
    it('shows success message and redirects after successful linking', async () => {
      const user = userEvent.setup();
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          linkedUserId: 'linked-user-123',
        }),
      });

      render(<AccountLinkingForm {...defaultProps} />);

      const linkButton = screen.getByRole('button', { name: /link accounts/i });
      await user.click(linkButton);

      await waitFor(() => {
        expect(screen.getByText('Accounts Linked Successfully!')).toBeInTheDocument();
        expect(screen.getByText(/you can now sign in using either/i)).toBeInTheDocument();
        expect(screen.getByText(/redirecting to your profile/i)).toBeInTheDocument();
      });

      // Should not show the form anymore
      expect(screen.queryByRole('button', { name: /link accounts/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
    });
  });

  describe('Error Display', () => {
    it('clears previous errors when retrying', async () => {
      const user = userEvent.setup();
      
      // First call fails
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'First error' }),
      });

      render(<AccountLinkingForm {...defaultProps} />);

      const linkButton = screen.getByRole('button', { name: /link accounts/i });
      await user.click(linkButton);

      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument();
      });

      // Second call succeeds
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await user.click(linkButton);

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText('First error')).not.toBeInTheDocument();
      });
    });
  });
}); 