/**
 * Tests for Profile Completion Form Component
 * 
 * Test coverage for OAuth profile completion including:
 * - Form rendering with OAuth data pre-population
 * - Form validation and error handling
 * - Profile creation and skip functionality
 * - User experience and accessibility
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import '@testing-library/jest-dom';

import { ProfileCompletionForm } from '../profile-completion-form';

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

jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(),
}));

jest.mock('@/lib/database-utils', () => ({
  createProfileData: jest.fn((userId, email, formData) => ({
    user_id: userId,
    email,
    ...formData,
  })),
  validateProfileData: jest.fn(() => ({ isValid: true, errors: [] })),
}));

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
};

const mockSupabase = {
  from: jest.fn(() => ({
    insert: jest.fn(() => Promise.resolve({ error: null })),
  })),
};

const mockUser = {
  id: 'user-123',
  aud: 'authenticated',
  email: 'test@example.com',
  email_confirmed_at: new Date().toISOString(),
  phone: null,
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  role: 'authenticated',
  updated_at: new Date().toISOString(),
  user_metadata: {
    full_name: 'John Doe',
    avatar_url: 'https://example.com/avatar.jpg',
  },
  app_metadata: {
    provider: 'google',
    providers: ['google'],
  },
  identities: [],
  created_at: new Date().toISOString(),
} as const;

const mockOAuthData = {
  email: 'test@example.com',
  full_name: 'John Doe',
  avatar_url: 'https://example.com/avatar.jpg',
  provider: 'google',
};

describe('ProfileCompletionForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  describe('Form Rendering', () => {
    it('renders the profile completion form with OAuth data pre-populated', () => {
      render(<ProfileCompletionForm user={mockUser} oauthData={mockOAuthData} />);

      // Check form sections are present
      expect(screen.getByText('Personal Information')).toBeInTheDocument();
      expect(screen.getByText('Professional Information')).toBeInTheDocument();
      expect(screen.getByText('Preferences')).toBeInTheDocument();

      // Check pre-populated data
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByText(/Signed up with google/i)).toBeInTheDocument();
    });

    it('renders all form fields with proper labels', () => {
      render(<ProfileCompletionForm user={mockUser} oauthData={mockOAuthData} />);

      // Personal Information fields
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();

      // Professional Information fields
      expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/website url/i)).toBeInTheDocument();

      // Preferences
      expect(screen.getByLabelText(/timezone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email notifications/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/marketing emails/i)).toBeInTheDocument();
    });

    it('shows action buttons', () => {
      render(<ProfileCompletionForm user={mockUser} oauthData={mockOAuthData} />);

      expect(screen.getByRole('button', { name: /complete profile/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /skip for now/i })).toBeInTheDocument();
    });

    it('displays provider information for OAuth users', () => {
      render(<ProfileCompletionForm user={mockUser} oauthData={mockOAuthData} />);

      expect(screen.getByText(/signed up with google/i)).toBeInTheDocument();
      expect(screen.getByText(mockOAuthData.email)).toBeInTheDocument();
    });

    it('does not show provider info for email users', () => {
      const emailOAuthData = { ...mockOAuthData, provider: 'email' };
      render(<ProfileCompletionForm user={mockUser} oauthData={emailOAuthData} />);

      expect(screen.queryByText(/signed up with/i)).not.toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    it('allows users to update form fields', async () => {
      const user = userEvent.setup();
      render(<ProfileCompletionForm user={mockUser} oauthData={mockOAuthData} />);

      const phoneInput = screen.getByLabelText(/phone number/i);
      await user.clear(phoneInput);
      await user.type(phoneInput, '+1234567890');

      expect(phoneInput).toHaveValue('+1234567890');
    });

    it('toggles notification preferences', async () => {
      const user = userEvent.setup();
      render(<ProfileCompletionForm user={mockUser} oauthData={mockOAuthData} />);

      const emailNotificationsSwitch = screen.getByLabelText(/email notifications/i);
      const marketingEmailsSwitch = screen.getByLabelText(/marketing emails/i);

      // Email notifications should be on by default
      expect(emailNotificationsSwitch).toBeChecked();
      expect(marketingEmailsSwitch).not.toBeChecked();

      // Toggle marketing emails
      await user.click(marketingEmailsSwitch);
      expect(marketingEmailsSwitch).toBeChecked();
    });

    it('allows timezone selection', async () => {
      const user = userEvent.setup();
      render(<ProfileCompletionForm user={mockUser} oauthData={mockOAuthData} />);

      const timezoneSelect = screen.getByRole('combobox');
      await user.click(timezoneSelect);

      // Check that timezone options are available
      await waitFor(() => {
        expect(screen.getByText('Eastern Time')).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('successfully submits the form and creates profile', async () => {
      const user = userEvent.setup();
      const { validateProfileData } = require('@/lib/database-utils');
      validateProfileData.mockReturnValue({ isValid: true, errors: [] });

      render(<ProfileCompletionForm user={mockUser} oauthData={mockOAuthData} />);

      const submitButton = screen.getByRole('button', { name: /complete profile/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
        expect(toast.success).toHaveBeenCalledWith('Profile created successfully! Welcome to SaaS Kit!');
        expect(mockRouter.push).toHaveBeenCalledWith('/profile');
      });
    });

    it('handles form validation errors', async () => {
      const user = userEvent.setup();
      const { validateProfileData } = require('@/lib/database-utils');
      validateProfileData.mockReturnValue({
        isValid: false,
        errors: ['Website URL must be a valid HTTP/HTTPS URL'],
      });

      render(<ProfileCompletionForm user={mockUser} oauthData={mockOAuthData} />);

      const submitButton = screen.getByRole('button', { name: /complete profile/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please fix the following errors:', {
          description: 'Website URL must be a valid HTTP/HTTPS URL',
        });
      });
    });

    it('handles database errors during profile creation', async () => {
      const user = userEvent.setup();
      mockSupabase.from.mockReturnValue({
        insert: jest.fn(() => Promise.resolve({ error: { message: 'Database error' } })),
      });

      render(<ProfileCompletionForm user={mockUser} oauthData={mockOAuthData} />);

      const submitButton = screen.getByRole('button', { name: /complete profile/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to create profile. Please try again.');
      });
    });

    it('shows loading state during submission', async () => {
      const user = userEvent.setup();
      // Mock a delayed response
      mockSupabase.from.mockReturnValue({
        insert: jest.fn(() => new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))),
      });

      render(<ProfileCompletionForm user={mockUser} oauthData={mockOAuthData} />);

      const submitButton = screen.getByRole('button', { name: /complete profile/i });
      await user.click(submitButton);

      // Check loading state
      expect(screen.getByText(/creating profile/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Skip Functionality', () => {
    it('allows users to skip profile completion', async () => {
      const user = userEvent.setup();
      render(<ProfileCompletionForm user={mockUser} oauthData={mockOAuthData} />);

      const skipButton = screen.getByRole('button', { name: /skip for now/i });
      await user.click(skipButton);

      await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
        expect(toast.success).toHaveBeenCalledWith('Profile created! You can complete it later in settings.');
        expect(mockRouter.push).toHaveBeenCalledWith('/profile');
      });
    });

    it('creates minimal profile when skipping', async () => {
      const user = userEvent.setup();
      const { createProfileData } = require('@/lib/database-utils');

      render(<ProfileCompletionForm user={mockUser} oauthData={mockOAuthData} />);

      const skipButton = screen.getByRole('button', { name: /skip for now/i });
      await user.click(skipButton);

      await waitFor(() => {
        expect(createProfileData).toHaveBeenCalledWith(
          mockUser.id,
          mockUser.email,
          expect.objectContaining({
            full_name: 'John Doe',
            timezone: 'UTC',
            email_notifications: true,
            marketing_emails: false,
          })
        );
      });
    });

    it('handles errors during skip profile creation', async () => {
      const user = userEvent.setup();
      mockSupabase.from.mockReturnValue({
        insert: jest.fn(() => Promise.resolve({ error: { message: 'Database error' } })),
      });

      render(<ProfileCompletionForm user={mockUser} oauthData={mockOAuthData} />);

      const skipButton = screen.getByRole('button', { name: /skip for now/i });
      await user.click(skipButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to create profile. Please try again.');
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels and structure', () => {
      render(<ProfileCompletionForm user={mockUser} oauthData={mockOAuthData} />);

      // Check that all inputs have proper labels
      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        expect(input).toHaveAccessibleName();
      });

      // Check switches have labels
      const switches = screen.getAllByRole('switch');
      switches.forEach(switchElement => {
        expect(switchElement).toHaveAccessibleName();
      });
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<ProfileCompletionForm user={mockUser} oauthData={mockOAuthData} />);

      const fullNameInput = screen.getByLabelText(/full name/i);
      
      // Tab to the input and type
      await user.tab();
      expect(fullNameInput).toHaveFocus();
      
      await user.type(fullNameInput, 'Updated Name');
      expect(fullNameInput).toHaveValue('Updated Name');
    });
  });
}); 