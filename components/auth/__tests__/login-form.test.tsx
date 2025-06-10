import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import '@testing-library/jest-dom';

import { LoginForm, LoginFormMinimal } from '../login-form';
import { useAuth } from '../../../lib/stores/auth-store';
import * as authActions from '../../../app/actions/auth';

// Mock dependencies
jest.mock('sonner');
jest.mock('next/navigation');
jest.mock('@/lib/stores/auth-store');
jest.mock('@/app/actions/auth');

const mockToast = toast as jest.MockedFunction<typeof toast>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockSignInAction = authActions.signInAction as jest.MockedFunction<typeof authActions.signInAction>;

describe('LoginForm', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseRouter.mockReturnValue({
      push: mockPush,
    } as any);

    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      error: null,
    } as any);

    mockToast.success = jest.fn();
    mockToast.error = jest.fn();
  });

  describe('Component Rendering', () => {
    it('renders login form with default props', () => {
      render(<LoginForm />);

      expect(screen.getByText('Welcome back')).toBeInTheDocument();
      expect(screen.getByText('Sign in to your account to continue')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    });

    it('renders with custom props', () => {
      render(
        <LoginForm
          title="Custom Title"
          description="Custom description"
          showSignupLink={false}
        />
      );

      expect(screen.getByText('Custom Title')).toBeInTheDocument();
      expect(screen.getByText('Custom description')).toBeInTheDocument();
      expect(screen.queryByText(/don't have an account/i)).not.toBeInTheDocument();
    });

    it('redirects authenticated users', () => {
      mockUseAuth.mockReturnValue({
        user: { id: '123', email: 'test@example.com' },
        isLoading: false,
        error: null,
      } as any);

      render(<LoginForm redirectTo="/dashboard" />);

      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('Form Validation', () => {
    it('validates required fields on blur', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');

      // Trigger validation by focusing and blurring
      await user.click(emailInput);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });

      await user.click(passwordInput);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
    });

    it('validates email format', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const emailInput = screen.getByLabelText('Email');
      
      await user.type(emailInput, 'invalid-email');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });
    });

    it('validates password length', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const passwordInput = screen.getByLabelText('Password');
      
      await user.type(passwordInput, '123');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
      });
    });
  });

  describe('Password Visibility', () => {
    it('toggles password visibility', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const passwordInput = screen.getByLabelText('Password');
      const toggleButton = screen.getByLabelText('Show password');

      expect(passwordInput).toHaveAttribute('type', 'password');

      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText('Hide password')).toBeInTheDocument();

      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(screen.getByLabelText('Show password')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('submits valid form data successfully', async () => {
      const user = userEvent.setup();
      mockSignInAction.mockResolvedValue({
        success: true,
        message: 'Welcome back!',
      });

      render(<LoginForm redirectTo="/profile" />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignInAction).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('Welcome back!');
        expect(mockPush).toHaveBeenCalledWith('/profile');
      });
    });

    it('handles authentication errors', async () => {
      const user = userEvent.setup();
      mockSignInAction.mockResolvedValue({
        success: false,
        message: 'Invalid email or password',
      });

      render(<LoginForm />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Invalid email or password');
      });
    });

    it('handles field-specific validation errors', async () => {
      const user = userEvent.setup();
      mockSignInAction.mockResolvedValue({
        success: false,
        message: 'Validation failed',
        errors: {
          email: ['Invalid email format'],
          password: ['Password too weak'],
        },
      });

      render(<LoginForm />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
        expect(screen.getByText('Password too weak')).toBeInTheDocument();
      });
    });

    it('shows loading state during submission', async () => {
      const user = userEvent.setup();
      let resolvePromise: (value: { success: boolean; message: string }) => void;
      const promise = new Promise<{ success: boolean; message: string }>(resolve => {
        resolvePromise = resolve;
      });
      mockSignInAction.mockReturnValue(promise);

      render(<LoginForm />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      expect(screen.getByText('Signing in...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      resolvePromise!({ success: true, message: 'Success' });
    });
  });

  describe('Navigation Links', () => {
    it('navigates to signup page', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const signupLink = screen.getByRole('button', { name: /sign up/i });
      await user.click(signupLink);

      expect(mockPush).toHaveBeenCalledWith('/signup');
    });

    it('navigates to password reset page', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const resetLink = screen.getByRole('button', { name: /forgot your password/i });
      await user.click(resetLink);

      expect(mockPush).toHaveBeenCalledWith('/reset-password');
    });
  });
});

describe('LoginFormMinimal', () => {
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockToast.success = jest.fn();
    mockToast.error = jest.fn();
  });

  it('renders minimal form', () => {
    render(<LoginFormMinimal onSuccess={mockOnSuccess} />);

    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('calls onSuccess callback after successful login', async () => {
    const user = userEvent.setup();
    mockSignInAction.mockResolvedValue({
      success: true,
      message: 'Welcome back!',
    });

    render(<LoginFormMinimal onSuccess={mockOnSuccess} />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('applies custom className', () => {
    render(<LoginFormMinimal className="custom-class" />);

    const form = screen.getByRole('button', { name: /sign in/i }).closest('form');
    expect(form).toHaveClass('custom-class');
  });
}); 