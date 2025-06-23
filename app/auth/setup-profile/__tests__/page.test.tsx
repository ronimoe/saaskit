import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { createClient } from '@/utils/supabase/server';
import ProfileSetupPage from '../page';

// Mock dependencies
jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(),
}));

// Mock the form component to isolate the page logic
jest.mock('@/components/auth/profile-completion-form', () => ({
  ProfileCompletionForm: ({ oauthData }: { oauthData: any }) => (
    <div data-testid="profile-completion-form">
      <p>{oauthData.email}</p>
    </div>
  ),
}));

describe('ProfileSetupPage', () => {
  const mockCreateClient = createClient as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render content if user is not authenticated', async () => {
    mockCreateClient.mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
      },
    });

    const { container } = render(await ProfileSetupPage());
    await waitFor(() => {
        expect(container.childElementCount).toBe(0);
    });
  });

  it('should not render content if profile already exists', async () => {
    mockCreateClient.mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: 'profile-1' } }),
    });

    const { container } = render(await ProfileSetupPage());
    await waitFor(() => {
        expect(container.childElementCount).toBe(0);
    });
  });

  it('should render the ProfileCompletionForm when user is new', async () => {
    mockCreateClient.mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1', email: 'new@user.com', user_metadata: {} } } }),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null }),
    });

    render(await ProfileSetupPage());
    
    await waitFor(() => {
        expect(screen.getByTestId('profile-completion-form')).toBeInTheDocument();
        expect(screen.getByText('new@user.com')).toBeInTheDocument();
    });
  });
}); 