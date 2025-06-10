/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, renderHook } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, useAuthContext, withAuth, useAuthGuard } from '../auth-provider';
import { useAuthStore } from '../../../lib/stores/auth-store';

// Mock the auth store
jest.mock('../../../lib/stores/auth-store', () => ({
  useAuthStore: jest.fn(() => ({
    user: null,
    session: null,
    isLoading: true,
    isInitialized: false,
    error: null,
    initialize: jest.fn(),
    signOut: jest.fn(),
    clearAuth: jest.fn(),
  })),
}));

const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should provide auth context to children', () => {
    const TestComponent = () => {
      const auth = useAuthContext();
      return <div data-testid="test">{auth.isAuthenticated ? 'authenticated' : 'not authenticated'}</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('test')).toHaveTextContent('not authenticated');
  });

  it('should throw error when useAuthContext is used outside AuthProvider', () => {
    const TestComponent = () => {
      useAuthContext();
      return <div>test</div>;
    };

    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => render(<TestComponent />)).toThrow('useAuthContext must be used within an AuthProvider');
    
    consoleSpy.mockRestore();
  });

  it('should call initialize on mount when not initialized', () => {
    const mockInitialize = jest.fn();
    
    mockUseAuthStore.mockReturnValue({
      user: null,
      session: null,
      isLoading: true,
      isInitialized: false,
      error: null,
      initialize: mockInitialize,
      signOut: jest.fn(),
      clearAuth: jest.fn(),
    });

    render(
      <AuthProvider>
        <div>test</div>
      </AuthProvider>
    );

    expect(mockInitialize).toHaveBeenCalledTimes(1);
  });

  it('should not call initialize when already initialized', () => {
    const mockInitialize = jest.fn();
    
    mockUseAuthStore.mockReturnValue({
      user: null,
      session: null,
      isLoading: false,
      isInitialized: true,
      error: null,
      initialize: mockInitialize,
      signOut: jest.fn(),
      clearAuth: jest.fn(),
    });

    render(
      <AuthProvider>
        <div>test</div>
      </AuthProvider>
    );

    expect(mockInitialize).not.toHaveBeenCalled();
  });

  it('should provide authentication status correctly', () => {
    const mockUser = { id: '1', email: 'test@example.com' } as any;
    
    mockUseAuthStore.mockReturnValue({
      user: mockUser,
      session: { user: mockUser } as any,
      isLoading: false,
      isInitialized: true,
      error: null,
      initialize: jest.fn(),
      signOut: jest.fn(),
      clearAuth: jest.fn(),
    });

    const TestComponent = () => {
      const auth = useAuthContext();
      return <div data-testid="test">{auth.isAuthenticated ? 'authenticated' : 'not authenticated'}</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('test')).toHaveTextContent('authenticated');
  });
});

describe('withAuth HOC', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading when not initialized', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      session: null,
      isLoading: true,
      isInitialized: false,
      error: null,
      initialize: jest.fn(),
      signOut: jest.fn(),
      clearAuth: jest.fn(),
    });

    const TestComponent = () => <div data-testid="protected">Protected Content</div>;
    const ProtectedComponent = withAuth(TestComponent);

    render(
      <AuthProvider>
        <ProtectedComponent />
      </AuthProvider>
    );

    expect(document.querySelector('.animate-spin')).toBeInTheDocument(); // Spinner
    expect(screen.queryByTestId('protected')).not.toBeInTheDocument();
  });

  it('should show auth required message when not authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      session: null,
      isLoading: false,
      isInitialized: true,
      error: null,
      initialize: jest.fn(),
      signOut: jest.fn(),
      clearAuth: jest.fn(),
    });

    const TestComponent = () => <div data-testid="protected">Protected Content</div>;
    const ProtectedComponent = withAuth(TestComponent);

    render(
      <AuthProvider>
        <ProtectedComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Authentication Required')).toBeInTheDocument();
    expect(screen.queryByTestId('protected')).not.toBeInTheDocument();
  });

  it('should render component when authenticated', () => {
    const mockUser = { id: '1', email: 'test@example.com' } as any;
    
    mockUseAuthStore.mockReturnValue({
      user: mockUser,
      session: { user: mockUser } as any,
      isLoading: false,
      isInitialized: true,
      error: null,
      initialize: jest.fn(),
      signOut: jest.fn(),
      clearAuth: jest.fn(),
    });

    const TestComponent = () => <div data-testid="protected">Protected Content</div>;
    const ProtectedComponent = withAuth(TestComponent);

    render(
      <AuthProvider>
        <ProtectedComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('protected')).toBeInTheDocument();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});

describe('useAuthGuard hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return correct guard states when loading', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      session: null,
      isLoading: true,
      isInitialized: false,
      error: null,
      initialize: jest.fn(),
      signOut: jest.fn(),
      clearAuth: jest.fn(),
    });

    const { result } = renderHook(() => useAuthGuard(), {
      wrapper: AuthProvider,
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isInitialized).toBe(false);
    expect(result.current.isReady).toBe(false);
    expect(result.current.canShowAuthenticatedContent).toBe(false);
    expect(result.current.canShowUnauthenticatedContent).toBe(false);
    expect(result.current.shouldShowLoading).toBe(true);
  });

  it('should return correct guard states when authenticated', () => {
    const mockUser = { id: '1', email: 'test@example.com' } as any;
    
    mockUseAuthStore.mockReturnValue({
      user: mockUser,
      session: { user: mockUser } as any,
      isLoading: false,
      isInitialized: true,
      error: null,
      initialize: jest.fn(),
      signOut: jest.fn(),
      clearAuth: jest.fn(),
    });

    const { result } = renderHook(() => useAuthGuard(), {
      wrapper: AuthProvider,
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isInitialized).toBe(true);
    expect(result.current.isReady).toBe(true);
    expect(result.current.canShowAuthenticatedContent).toBe(true);
    expect(result.current.canShowUnauthenticatedContent).toBe(false);
    expect(result.current.shouldShowLoading).toBe(false);
    expect(result.current.user).toEqual(mockUser);
  });

  it('should return correct guard states when not authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      session: null,
      isLoading: false,
      isInitialized: true,
      error: null,
      initialize: jest.fn(),
      signOut: jest.fn(),
      clearAuth: jest.fn(),
    });

    const { result } = renderHook(() => useAuthGuard(), {
      wrapper: AuthProvider,
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isInitialized).toBe(true);
    expect(result.current.isReady).toBe(true);
    expect(result.current.canShowAuthenticatedContent).toBe(false);
    expect(result.current.canShowUnauthenticatedContent).toBe(true);
    expect(result.current.shouldShowLoading).toBe(false);
    expect(result.current.user).toBeNull();
  });
}); 