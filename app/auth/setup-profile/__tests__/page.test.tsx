import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { createClient } from '@/utils/supabase/server';
import ProfileSetupPage, { ProfileSetupContent } from '../page';
import { AuthProvider } from '@/components/providers/auth-provider';

// Mock dependencies
jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(),
}));

// Mock Next.js redirect
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

// Mock the form component to isolate the page logic
jest.mock('@/components/auth/profile-completion-form', () => ({
  ProfileCompletionForm: ({ oauthData }: { oauthData: any }) => (
    <div data-testid="profile-completion-form">
      <p>{oauthData.email}</p>
    </div>
  ),
}));

// Mock the auth provider context
jest.mock('@/components/providers/auth-provider', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuthContext: () => ({
    isAuthenticated: true,
    isLoading: false,
    isInitialized: true,
    user: null,
    session: null,
    error: null,
    signOut: jest.fn(),
    clearAuth: jest.fn(),
  }),
}));

// Mock UnifiedHeader to avoid rendering issues
jest.mock('@/components/layout/unified-header', () => ({
  UnifiedHeader: () => <div data-testid="mock-header">Header</div>,
}));

// Mock React's Suspense component to immediately render children
jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  return {
    ...originalReact,
    Suspense: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe('ProfileSetupPage', () => {
  const mockCreateClient = createClient as jest.Mock;
  const mockRedirect = jest.requireMock('next/navigation').redirect;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render content if user is not authenticated', async () => {
    mockCreateClient.mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
      },
    });

    render(
      <AuthProvider>
        {await ProfileSetupPage()}
      </AuthProvider>
    );
    
    // Verify redirect was called with '/login'
    await waitFor(() => {
      expect(mockRedirect).toHaveBeenCalledWith('/login');
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

    render(
      <AuthProvider>
        {await ProfileSetupPage()}
      </AuthProvider>
    );
    
    // Verify redirect was called with '/profile'
    await waitFor(() => {
      expect(mockRedirect).toHaveBeenCalledWith('/profile');
    });
  });

  it('should render the ProfileCompletionForm when user is new', async () => {
    mockCreateClient.mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ 
          data: { 
            user: { 
              id: 'user-1', 
              email: 'new@user.com', 
              user_metadata: {},
              app_metadata: { provider: 'email' }
            } 
          } 
        }),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null }),
    });

    // Render the content component directly instead of the page with Suspense
    render(
      <AuthProvider>
        {await ProfileSetupContent()}
      </AuthProvider>
    );
    
    expect(screen.getByTestId('profile-completion-form')).toBeInTheDocument();
    expect(screen.getByText('new@user.com')).toBeInTheDocument();
  });
}); 