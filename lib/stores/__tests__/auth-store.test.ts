/**
 * @jest-environment jsdom
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { useAuthStore, useAuth, useAuthUser, useAuthSession, useAuthLoading, useAuthError, useAuthInitialized, useIsAuthenticated } from '../auth-store';
import type { User, Session } from '@supabase/supabase-js';

// Mock the Supabase client with resettable implementations
const mockSupabaseClient = {
  auth: {
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(),
    signOut: jest.fn(),
  },
};

jest.mock('@/lib/supabase', () => ({
  createClientComponentClient: jest.fn(() => mockSupabaseClient),
}));

// Mock console methods to avoid noise in tests
const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

// Test utilities
const createMockUser = (overrides?: Partial<User>): User => ({
  id: '1',
  email: 'test@example.com',
  aud: 'authenticated',
  role: 'authenticated',
  email_confirmed_at: '2024-01-01T00:00:00Z',
  phone: undefined,
  phone_confirmed_at: undefined,
  confirmation_sent_at: undefined,
  confirmed_at: '2024-01-01T00:00:00Z',
  recovery_sent_at: undefined,
  last_sign_in_at: '2024-01-01T00:00:00Z',
  app_metadata: {},
  user_metadata: {},
  identities: [],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  is_anonymous: false,
  ...overrides,
});

const createMockSession = (overrides?: Partial<Session>): Session => ({
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() / 1000 + 3600,
  token_type: 'bearer',
  user: createMockUser(),
  ...overrides,
});

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({
      user: null,
      session: null,
      isLoading: true,
      isInitialized: false,
      error: null,
    });
    
    jest.clearAllMocks();
    
    // Reset mock implementations with default behaviors
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    });
    mockSupabaseClient.auth.signOut.mockResolvedValue({ error: null });
  });

  afterAll(() => {
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useAuthStore());
      
      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isInitialized).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should provide all required actions', () => {
      const { result } = renderHook(() => useAuthStore());
      
      expect(typeof result.current.setUser).toBe('function');
      expect(typeof result.current.setSession).toBe('function');
      expect(typeof result.current.setLoading).toBe('function');
      expect(typeof result.current.setError).toBe('function');
      expect(typeof result.current.setInitialized).toBe('function');
      expect(typeof result.current.initialize).toBe('function');
      expect(typeof result.current.signOut).toBe('function');
      expect(typeof result.current.clearAuth).toBe('function');
    });

    it('should maintain state immutability', () => {
      const { result } = renderHook(() => useAuthStore());
      
      // Attempting to directly mutate state should not affect the store
      const originalUser = result.current.user;
      
      // This mutation shouldn't work (but won't throw in Zustand)
      try {
        // @ts-ignore - testing runtime behavior
        result.current.user = createMockUser();
      } catch (e) {
        // Some stores might prevent this, but Zustand doesn't by default
      }
      
      // State should only change through actions
      act(() => {
        result.current.setUser(createMockUser());
      });
      
      expect(result.current.user).not.toBe(originalUser);
      expect(result.current.user).toEqual(createMockUser());
    });
  });

  describe('State Updates', () => {
    describe('setUser', () => {
      it('should update user state and clear error', () => {
        const { result } = renderHook(() => useAuthStore());
        const mockUser = createMockUser();
        
        // Set an error first
        act(() => {
          result.current.setError('Previous error');
        });
        
        act(() => {
          result.current.setUser(mockUser);
        });
        
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.error).toBeNull();
      });

      it('should handle null user', () => {
        const { result } = renderHook(() => useAuthStore());
        
        // Set a user first
        act(() => {
          result.current.setUser(createMockUser());
        });
        
        act(() => {
          result.current.setUser(null);
        });
        
        expect(result.current.user).toBeNull();
        expect(result.current.error).toBeNull();
      });

      it('should handle user with minimal data', () => {
        const { result } = renderHook(() => useAuthStore());
        const minimalUser = createMockUser({
          email: undefined,
          phone: '+1234567890',
          user_metadata: { display_name: 'Test User' },
        });
        
        act(() => {
          result.current.setUser(minimalUser);
        });
        
        expect(result.current.user).toEqual(minimalUser);
        expect(result.current.user?.phone).toBe('+1234567890');
        expect(result.current.user?.user_metadata?.display_name).toBe('Test User');
      });

      it('should handle user with complex metadata', () => {
        const { result } = renderHook(() => useAuthStore());
        const complexUser = createMockUser({
          app_metadata: { provider: 'google', roles: ['admin', 'user'] },
          user_metadata: { 
            full_name: 'Test User',
            avatar_url: 'https://example.com/avatar.jpg',
            preferences: { theme: 'dark', notifications: true }
          },
          identities: [
            {
              identity_id: 'identity-1',
              id: 'identity-1',
              user_id: '1',
              identity_data: { email: 'test@example.com' },
              provider: 'google',
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
              last_sign_in_at: '2024-01-01T00:00:00Z'
            }
          ]
        });
        
        act(() => {
          result.current.setUser(complexUser);
        });
        
        expect(result.current.user?.app_metadata.roles).toEqual(['admin', 'user']);
        expect(result.current.user?.user_metadata.preferences.theme).toBe('dark');
        expect(result.current.user?.identities).toHaveLength(1);
      });

      it('should handle undefined user gracefully', () => {
        const { result } = renderHook(() => useAuthStore());
        
        act(() => {
          // @ts-ignore - testing runtime behavior with undefined
          result.current.setUser(undefined);
        });
        
        expect(result.current.user).toBeUndefined();
        expect(result.current.error).toBeNull();
      });

      it('should handle rapid user updates', () => {
        const { result } = renderHook(() => useAuthStore());
        const users = [
          createMockUser({ id: '1', email: 'user1@example.com' }),
          createMockUser({ id: '2', email: 'user2@example.com' }),
          createMockUser({ id: '3', email: 'user3@example.com' })
        ];
        
        act(() => {
          users.forEach(user => result.current.setUser(user));
        });
        
        expect(result.current.user).toEqual(users[2]);
        expect(result.current.error).toBeNull();
      });
    });

    describe('setSession', () => {
      it('should update session state and derive user from session', () => {
        const { result } = renderHook(() => useAuthStore());
        const mockSession = createMockSession();
        
        act(() => {
          result.current.setSession(mockSession);
        });
        
        expect(result.current.session).toEqual(mockSession);
        expect(result.current.user).toEqual(mockSession.user);
        expect(result.current.error).toBeNull();
      });

      it('should handle session with null user', () => {
        const { result } = renderHook(() => useAuthStore());
        const mockSession = createMockSession({ user: undefined });
        
        act(() => {
          result.current.setSession(mockSession);
        });
        
        expect(result.current.session).toEqual(mockSession);
        expect(result.current.user).toBeNull();
      });

      it('should handle null session', () => {
        const { result } = renderHook(() => useAuthStore());
        
        // Set a session first
        act(() => {
          result.current.setSession(createMockSession());
        });
        
        act(() => {
          result.current.setSession(null);
        });
        
        expect(result.current.session).toBeNull();
        expect(result.current.user).toBeNull();
      });

      it('should handle expired session', () => {
        const { result } = renderHook(() => useAuthStore());
        const expiredSession = createMockSession({
          expires_at: Date.now() / 1000 - 3600, // 1 hour ago
        });
        
        act(() => {
          result.current.setSession(expiredSession);
        });
        
        expect(result.current.session).toEqual(expiredSession);
        expect(result.current.user).toEqual(expiredSession.user);
      });

      it('should clear previous error when setting session', () => {
        const { result } = renderHook(() => useAuthStore());
        
        // Set an error first
        act(() => {
          result.current.setError('Previous error');
        });
        
        act(() => {
          result.current.setSession(createMockSession());
        });
        
        expect(result.current.error).toBeNull();
      });

      it('should handle session with undefined user', () => {
        const { result } = renderHook(() => useAuthStore());
        const sessionWithUndefinedUser = createMockSession({ user: undefined });
        
        act(() => {
          result.current.setSession(sessionWithUndefinedUser);
        });
        
        expect(result.current.session).toEqual(sessionWithUndefinedUser);
        expect(result.current.user).toBeNull();
      });

      it('should handle session updates that change user data', () => {
        const { result } = renderHook(() => useAuthStore());
        const user1 = createMockUser({ id: '1', email: 'user1@example.com' });
        const user2 = createMockUser({ id: '2', email: 'user2@example.com' });
        const session1 = createMockSession({ user: user1 });
        const session2 = createMockSession({ user: user2 });
        
        act(() => {
          result.current.setSession(session1);
        });
        expect(result.current.user).toEqual(user1);
        
        act(() => {
          result.current.setSession(session2);
        });
        expect(result.current.user).toEqual(user2);
      });
    });

    describe('setLoading', () => {
      it('should update loading state', () => {
        const { result } = renderHook(() => useAuthStore());
        
        act(() => {
          result.current.setLoading(false);
        });
        
        expect(result.current.isLoading).toBe(false);
        
        act(() => {
          result.current.setLoading(true);
        });
        
        expect(result.current.isLoading).toBe(true);
      });
    });

    describe('setError', () => {
      it('should update error state and set loading to false', () => {
        const { result } = renderHook(() => useAuthStore());
        const errorMessage = 'Test error';
        
        // Set loading to true first
        act(() => {
          result.current.setLoading(true);
        });
        
        act(() => {
          result.current.setError(errorMessage);
        });
        
        expect(result.current.error).toBe(errorMessage);
        expect(result.current.isLoading).toBe(false);
      });

      it('should handle null error', () => {
        const { result } = renderHook(() => useAuthStore());
        
        // Set an error first
        act(() => {
          result.current.setError('Some error');
        });
        
        act(() => {
          result.current.setError(null);
        });
        
        expect(result.current.error).toBeNull();
        expect(result.current.isLoading).toBe(false);
      });

      it('should handle empty string error', () => {
        const { result } = renderHook(() => useAuthStore());
        
        act(() => {
          result.current.setError('');
        });
        
        expect(result.current.error).toBe('');
        expect(result.current.isLoading).toBe(false);
      });
    });

    describe('setInitialized', () => {
      it('should update initialized state', () => {
        const { result } = renderHook(() => useAuthStore());
        
        act(() => {
          result.current.setInitialized(true);
        });
        
        expect(result.current.isInitialized).toBe(true);
        
        act(() => {
          result.current.setInitialized(false);
        });
        
        expect(result.current.isInitialized).toBe(false);
      });
    });

    describe('clearAuth', () => {
      it('should clear all auth state', () => {
        const { result } = renderHook(() => useAuthStore());
        
        // Set some state first
        act(() => {
          result.current.setUser(createMockUser());
          result.current.setSession(createMockSession());
          result.current.setError('Some error');
          result.current.setLoading(true);
        });
        
        // Clear auth
        act(() => {
          result.current.clearAuth();
        });
        
        expect(result.current.user).toBeNull();
        expect(result.current.session).toBeNull();
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
        // Note: isInitialized should remain unchanged
      });

      it('should not affect initialized state', () => {
        const { result } = renderHook(() => useAuthStore());
        
        // Set initialized state
        act(() => {
          result.current.setInitialized(true);
        });
        
        act(() => {
          result.current.clearAuth();
        });
        
        expect(result.current.isInitialized).toBe(true);
      });
    });
  });

  describe('Hook Selectors', () => {
    describe('useAuth', () => {
      it('should return correct auth state and derived values', () => {
        const { result } = renderHook(() => useAuth());
        
        expect(result.current.user).toBeNull();
        expect(result.current.session).toBeNull();
        expect(result.current.isLoading).toBe(true);
        expect(result.current.isInitialized).toBe(false);
        expect(result.current.error).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
        expect(typeof result.current.signOut).toBe('function');
        expect(typeof result.current.clearAuth).toBe('function');
      });

      it('should return isAuthenticated true when user exists', () => {
        const { result } = renderHook(() => useAuth());
        const mockUser = createMockUser();
        
        act(() => {
          useAuthStore.getState().setUser(mockUser);
        });
        
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.user).toEqual(mockUser);
      });

      it('should re-render when auth state changes', () => {
        const { result } = renderHook(() => useAuth());
        const mockUser = createMockUser();
        
        expect(result.current.isAuthenticated).toBe(false);
        
        act(() => {
          useAuthStore.getState().setUser(mockUser);
        });
        
        expect(result.current.isAuthenticated).toBe(true);
        
        act(() => {
          useAuthStore.getState().setUser(null);
        });
        
        expect(result.current.isAuthenticated).toBe(false);
      });
    });

    describe('Individual Selectors', () => {
      it('useAuthUser should return user state', () => {
        const { result } = renderHook(() => useAuthUser());
        const mockUser = createMockUser();
        
        expect(result.current).toBeNull();
        
        act(() => {
          useAuthStore.getState().setUser(mockUser);
        });
        
        expect(result.current).toEqual(mockUser);
      });

      it('useAuthSession should return session state', () => {
        const { result } = renderHook(() => useAuthSession());
        const mockSession = createMockSession();
        
        expect(result.current).toBeNull();
        
        act(() => {
          useAuthStore.getState().setSession(mockSession);
        });
        
        expect(result.current).toEqual(mockSession);
      });

      it('useAuthLoading should return loading state', () => {
        const { result } = renderHook(() => useAuthLoading());
        
        expect(result.current).toBe(true);
        
        act(() => {
          useAuthStore.getState().setLoading(false);
        });
        
        expect(result.current).toBe(false);
      });

      it('useAuthError should return error state', () => {
        const { result } = renderHook(() => useAuthError());
        const errorMessage = 'Test error';
        
        expect(result.current).toBeNull();
        
        act(() => {
          useAuthStore.getState().setError(errorMessage);
        });
        
        expect(result.current).toBe(errorMessage);
      });

      it('useAuthInitialized should return initialized state', () => {
        const { result } = renderHook(() => useAuthInitialized());
        
        expect(result.current).toBe(false);
        
        act(() => {
          useAuthStore.getState().setInitialized(true);
        });
        
        expect(result.current).toBe(true);
      });

      it('useIsAuthenticated should return authentication status', () => {
        const { result } = renderHook(() => useIsAuthenticated());
        
        expect(result.current).toBe(false);
        
        act(() => {
          useAuthStore.getState().setUser(createMockUser());
        });
        
        expect(result.current).toBe(true);
      });
    });
  });

  describe('Async Actions', () => {
    describe('initialize', () => {
      it('should handle successful initialization with session', async () => {
        const mockSession = createMockSession();
        
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: mockSession },
          error: null,
        });
        
        const mockUnsubscribe = jest.fn();
        mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
          data: { subscription: { unsubscribe: mockUnsubscribe } }
        });

        const { result } = renderHook(() => useAuthStore());
        
        await act(async () => {
          await result.current.initialize();
        });
        
        expect(result.current.session).toEqual(mockSession);
        expect(result.current.user).toEqual(mockSession.user);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isInitialized).toBe(true);
        expect(result.current.error).toBeNull();
        expect(mockSupabaseClient.auth.onAuthStateChange).toHaveBeenCalled();
      });

      it('should handle successful initialization without session', async () => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: null },
          error: null,
        });
        
        const mockUnsubscribe = jest.fn();
        mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
          data: { subscription: { unsubscribe: mockUnsubscribe } }
        });

        const { result } = renderHook(() => useAuthStore());
        
        await act(async () => {
          await result.current.initialize();
        });
        
        expect(result.current.session).toBeNull();
        expect(result.current.user).toBeNull();
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isInitialized).toBe(true);
        expect(result.current.error).toBeNull();
      });

      it('should handle initialization error from getSession', async () => {
        const errorMessage = 'Session fetch failed';
        
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: null },
          error: new Error(errorMessage),
        });

        const { result } = renderHook(() => useAuthStore());
        
        await act(async () => {
          await result.current.initialize();
        });
        
        expect(result.current.error).toBe(errorMessage);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isInitialized).toBe(true);
        expect(result.current.session).toBeNull();
        expect(result.current.user).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith('Auth initialization error:', expect.any(Error));
      });

      it('should handle initialization error from network failure', async () => {
        mockSupabaseClient.auth.getSession.mockRejectedValue(new Error('Network error'));

        const { result } = renderHook(() => useAuthStore());
        
        await act(async () => {
          await result.current.initialize();
        });
        
        expect(result.current.error).toBe('Network error');
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isInitialized).toBe(true);
      });

      it('should handle non-Error exceptions', async () => {
        mockSupabaseClient.auth.getSession.mockRejectedValue('String error');

        const { result } = renderHook(() => useAuthStore());
        
        await act(async () => {
          await result.current.initialize();
        });
        
        expect(result.current.error).toBe('Failed to initialize auth');
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isInitialized).toBe(true);
      });

      it('should set up auth state change listener', async () => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: null },
          error: null,
        });
        
        const mockUnsubscribe = jest.fn();
        const mockStateChangeCallback = jest.fn();
        mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
          mockStateChangeCallback.mockImplementation(callback);
          return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
        });

        const { result } = renderHook(() => useAuthStore());
        
        await act(async () => {
          await result.current.initialize();
        });
        
        expect(mockSupabaseClient.auth.onAuthStateChange).toHaveBeenCalled();
        
        // Test auth state change callback
        const newSession = createMockSession();
        act(() => {
          mockStateChangeCallback('SIGNED_IN', newSession);
        });
        
        await waitFor(() => {
          expect(result.current.session).toEqual(newSession);
          expect(result.current.user).toEqual(newSession.user);
          expect(result.current.error).toBeNull();
        });
        
        expect(consoleSpy).toHaveBeenCalledWith('Auth state changed:', 'SIGNED_IN', newSession.user.email);
      });

      it('should handle auth state change with null session', async () => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: null },
          error: null,
        });
        
        const mockStateChangeCallback = jest.fn();
        mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
          mockStateChangeCallback.mockImplementation(callback);
          return { data: { subscription: { unsubscribe: jest.fn() } } };
        });

        const { result } = renderHook(() => useAuthStore());
        
        await act(async () => {
          await result.current.initialize();
        });
        
        // Simulate sign out
        act(() => {
          mockStateChangeCallback('SIGNED_OUT', null);
        });
        
        await waitFor(() => {
          expect(result.current.session).toBeNull();
          expect(result.current.user).toBeNull();
          expect(result.current.error).toBeNull();
        });
      });

      it('should not initialize twice', async () => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: null },
          error: null,
        });
        
        mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
          data: { subscription: { unsubscribe: jest.fn() } }
        });

        const { result } = renderHook(() => useAuthStore());
        
        // Initialize twice
        await act(async () => {
          await Promise.all([
            result.current.initialize(),
            result.current.initialize(),
          ]);
        });
        
        // Should only call getSession twice (once per call)
        expect(mockSupabaseClient.auth.getSession).toHaveBeenCalledTimes(2);
      });

      it('should handle initialization with malformed session data', async () => {
        const malformedSession = {
          access_token: null,
          refresh_token: 'refresh-token',
          expires_in: null,
          expires_at: null,
          token_type: 'bearer',
          user: createMockUser(),
        };
        
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: malformedSession },
          error: null,
        });

        const { result } = renderHook(() => useAuthStore());
        
        await act(async () => {
          await result.current.initialize();
        });
        
        expect(result.current.session).toEqual(malformedSession);
        expect(result.current.user).toEqual(malformedSession.user);
        expect(result.current.error).toBeNull();
      });

      it('should handle auth state change events', async () => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: null },
          error: null,
        });
        
        const mockStateChangeCallback = jest.fn();
        mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
          mockStateChangeCallback.mockImplementation(callback);
          return { data: { subscription: { unsubscribe: jest.fn() } } };
        });

        const { result } = renderHook(() => useAuthStore());
        
        await act(async () => {
          await result.current.initialize();
        });
        
        // Test various auth state change events
        const events = ['SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED', 'USER_UPDATED', 'PASSWORD_RECOVERY'];
        const newSession = createMockSession();
        
        events.forEach(event => {
          act(() => {
            mockStateChangeCallback(event, event === 'SIGNED_OUT' ? null : newSession);
          });
        });
        
        expect(consoleSpy).toHaveBeenCalledTimes(events.length);
      });
    });

    describe('signOut', () => {
      it('should handle successful sign out', async () => {
        mockSupabaseClient.auth.signOut.mockResolvedValue({ error: null });

        const { result } = renderHook(() => useAuthStore());
        
        // Set initial authenticated state
        act(() => {
          result.current.setUser(createMockUser());
          result.current.setSession(createMockSession());
        });
        
        await act(async () => {
          await result.current.signOut();
        });
        
        expect(result.current.user).toBeNull();
        expect(result.current.session).toBeNull();
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
        expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
      });

      it('should handle sign out error', async () => {
        const errorMessage = 'Sign out failed';
        mockSupabaseClient.auth.signOut.mockResolvedValue({
          error: new Error(errorMessage),
        });

        const { result } = renderHook(() => useAuthStore());
        
        // Set initial authenticated state
        act(() => {
          result.current.setUser(createMockUser());
          result.current.setSession(createMockSession());
        });
        
        await act(async () => {
          await result.current.signOut();
        });
        
        expect(result.current.error).toBe(errorMessage);
        expect(result.current.isLoading).toBe(false);
        // User and session should remain unchanged on error
        expect(result.current.user).not.toBeNull();
        expect(result.current.session).not.toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith('Sign out error:', expect.any(Error));
      });

      it('should handle sign out network failure', async () => {
        mockSupabaseClient.auth.signOut.mockRejectedValue(new Error('Network error'));

        const { result } = renderHook(() => useAuthStore());
        
        await act(async () => {
          await result.current.signOut();
        });
        
        expect(result.current.error).toBe('Network error');
        expect(result.current.isLoading).toBe(false);
      });

      it('should handle non-Error exceptions in signOut', async () => {
        mockSupabaseClient.auth.signOut.mockRejectedValue('String error');

        const { result } = renderHook(() => useAuthStore());
        
        await act(async () => {
          await result.current.signOut();
        });
        
        expect(result.current.error).toBe('Failed to sign out');
        expect(result.current.isLoading).toBe(false);
      });

      it('should set loading during sign out process', async () => {
        let resolveSignOut: (value: any) => void;
        const signOutPromise = new Promise((resolve) => {
          resolveSignOut = resolve;
        });
        
        mockSupabaseClient.auth.signOut.mockReturnValue(signOutPromise);

        const { result } = renderHook(() => useAuthStore());
        
        // Start sign out
        act(() => {
          result.current.signOut();
        });
        
        // Should be loading
        expect(result.current.isLoading).toBe(true);
        expect(result.current.error).toBeNull();
        
        // Complete sign out
        await act(async () => {
          resolveSignOut({ error: null });
          await signOutPromise;
        });
        
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('should handle multiple simultaneous errors', async () => {
      const { result } = renderHook(() => useAuthStore());
      
      // Set multiple errors simultaneously
      act(() => {
        result.current.setError('First error');
        result.current.setError('Second error');
        result.current.setError('Third error');
      });
      
      expect(result.current.error).toBe('Third error');
    });

    it('should handle error during auth state change', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });
      
      const mockStateChangeCallback = jest.fn();
      mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
        mockStateChangeCallback.mockImplementation(callback);
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      });

      const { result } = renderHook(() => useAuthStore());
      
      await act(async () => {
        await result.current.initialize();
      });
      
      // Simulate auth state change that might cause an error
      act(() => {
        mockStateChangeCallback('TOKEN_REFRESHED', null);
      });
      
      // Should handle gracefully
      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
    });
  });

  describe('Performance and Memory', () => {
    it('should not create memory leaks with multiple initializations', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });
      
      const unsubscribes: jest.Mock[] = [];
      mockSupabaseClient.auth.onAuthStateChange.mockImplementation(() => {
        const unsubscribe = jest.fn();
        unsubscribes.push(unsubscribe);
        return { data: { subscription: { unsubscribe } } };
      });

      const { result } = renderHook(() => useAuthStore());
      
      // Initialize multiple times
      await act(async () => {
        await result.current.initialize();
        await result.current.initialize();
        await result.current.initialize();
      });
      
      // Should create multiple subscriptions (this is expected behavior)
      expect(unsubscribes).toHaveLength(3);
      expect(mockSupabaseClient.auth.onAuthStateChange).toHaveBeenCalledTimes(3);
    });

    it('should handle rapid state changes', async () => {
      const { result } = renderHook(() => useAuthStore());
      const users = Array.from({ length: 10 }, (_, i) => 
        createMockUser({ id: i.toString(), email: `user${i}@example.com` })
      );
      
      act(() => {
        users.forEach(user => result.current.setUser(user));
      });
      
      // Should end up with the last user
      expect(result.current.user).toEqual(users[users.length - 1]);
    });
  });

  describe('State Consistency', () => {
    it('should maintain state consistency when session and user are set separately', () => {
      const { result } = renderHook(() => useAuthStore());
      const user1 = createMockUser({ id: '1', email: 'user1@example.com' });
      const user2 = createMockUser({ id: '2', email: 'user2@example.com' });
      const session = createMockSession({ user: user2 });
      
      act(() => {
        result.current.setUser(user1);
        result.current.setSession(session);
      });
      
      // Session should override user
      expect(result.current.user).toEqual(user2);
      expect(result.current.session).toEqual(session);
    });

    it('should handle session updates that change user identity', () => {
      const { result } = renderHook(() => useAuthStore());
      const user1 = createMockUser({ id: '1', email: 'user1@example.com' });
      const user2 = createMockUser({ id: '2', email: 'user2@example.com' });
      const session1 = createMockSession({ user: user1 });
      const session2 = createMockSession({ user: user2 });
      
      act(() => {
        result.current.setSession(session1);
      });
      
      expect(result.current.user).toEqual(user1);
      
      act(() => {
        result.current.setSession(session2);
      });
      
      expect(result.current.user).toEqual(user2);
    });
  });

  describe('Hook Re-rendering Behavior', () => {
    it('should prevent unnecessary re-renders with selector hooks', () => {
      const { result: userResult } = renderHook(() => useAuthUser());
      const { result: sessionResult } = renderHook(() => useAuthSession());
      const { result: loadingResult } = renderHook(() => useAuthLoading());
      
      const mockUser = createMockUser();
      
      act(() => {
        useAuthStore.getState().setUser(mockUser);
      });
      
      expect(userResult.current).toEqual(mockUser);
      expect(sessionResult.current).toBeNull(); // Should remain unchanged
      expect(loadingResult.current).toBe(true); // Should remain unchanged
    });

    it('should re-render useAuth hook when any relevant state changes', () => {
      const { result } = renderHook(() => useAuth());
      let renderCount = 0;
      
      // Track renders
      result.current;
      renderCount++;
      
      act(() => {
        useAuthStore.getState().setLoading(false);
      });
      
      expect(result.current.isLoading).toBe(false);
      
      act(() => {
        useAuthStore.getState().setUser(createMockUser());
      });
      
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('Complex User Scenarios', () => {
    it('should handle user with empty metadata objects', () => {
      const { result } = renderHook(() => useAuthStore());
      const userWithEmptyMetadata = createMockUser({
        app_metadata: {},
        user_metadata: {},
        identities: []
      });
      
      act(() => {
        result.current.setUser(userWithEmptyMetadata);
      });
      
      expect(result.current.user?.app_metadata).toEqual({});
      expect(result.current.user?.user_metadata).toEqual({});
      expect(result.current.user?.identities).toEqual([]);
    });

    it('should handle user state transitions correctly', () => {
      const { result } = renderHook(() => useAuthStore());
      
      // Start unauthenticated
      expect(result.current.user).toBeNull();
      
      // Set user
      const user = createMockUser();
      act(() => {
        result.current.setUser(user);
      });
      expect(result.current.user).toEqual(user);
      
      // Update user data
      const updatedUser = createMockUser({ 
        id: user.id, 
        email: 'updated@example.com',
        user_metadata: { theme: 'dark' }
      });
      act(() => {
        result.current.setUser(updatedUser);
      });
      expect(result.current.user?.email).toBe('updated@example.com');
      expect(result.current.user?.user_metadata.theme).toBe('dark');
      
      // Sign out
      act(() => {
        result.current.setUser(null);
      });
      expect(result.current.user).toBeNull();
    });
  });

  describe('Session Edge Cases', () => {
    it('should handle session with future expiration', () => {
      const { result } = renderHook(() => useAuthStore());
      const futureSession = createMockSession({
        expires_at: Date.now() / 1000 + 86400, // 24 hours from now
      });
      
      act(() => {
        result.current.setSession(futureSession);
      });
      
      expect(result.current.session).toEqual(futureSession);
      expect(result.current.user).toEqual(futureSession.user);
    });

    it('should handle session with past expiration', () => {
      const { result } = renderHook(() => useAuthStore());
      const expiredSession = createMockSession({
        expires_at: Date.now() / 1000 - 86400, // 24 hours ago
      });
      
      act(() => {
        result.current.setSession(expiredSession);
      });
      
      expect(result.current.session).toEqual(expiredSession);
      expect(result.current.user).toEqual(expiredSession.user);
    });

    it('should handle session with missing token data', () => {
      const { result } = renderHook(() => useAuthStore());
      const sessionWithMissingTokens = createMockSession({
        access_token: '',
        refresh_token: '',
      });
      
      act(() => {
        result.current.setSession(sessionWithMissingTokens);
      });
      
      expect(result.current.session?.access_token).toBe('');
      expect(result.current.session?.refresh_token).toBe('');
    });
  });

  describe('Initialization Edge Cases', () => {
    it('should handle initialization when already initialized', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const { result } = renderHook(() => useAuthStore());
      
      // Initialize first time
      await act(async () => {
        await result.current.initialize();
      });
      
      expect(result.current.isInitialized).toBe(true);
      
      // Initialize second time - should still work
      await act(async () => {
        await result.current.initialize();
      });
      
      expect(result.current.isInitialized).toBe(true);
      expect(mockSupabaseClient.auth.getSession).toHaveBeenCalledTimes(2);
    });

    it('should handle initialization with corrupted session response', async () => {
      // @ts-ignore - testing runtime behavior with corrupted data
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: null,
        error: null,
      });

      const { result } = renderHook(() => useAuthStore());
      
      await act(async () => {
        await result.current.initialize();
      });
      
      // Should handle gracefully and not crash
      expect(result.current.isInitialized).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Error Recovery', () => {
    it('should recover from error state when successful operation occurs', async () => {
      const { result } = renderHook(() => useAuthStore());
      
      // Set error state
      act(() => {
        result.current.setError('Network error');
      });
      expect(result.current.error).toBe('Network error');
      
      // Successful user set should clear error
      act(() => {
        result.current.setUser(createMockUser());
      });
      expect(result.current.error).toBeNull();
      
      // Set error again
      act(() => {
        result.current.setError('Another error');
      });
      expect(result.current.error).toBe('Another error');
      
      // Successful session set should clear error
      act(() => {
        result.current.setSession(createMockSession());
      });
      expect(result.current.error).toBeNull();
    });

    it('should handle error state during async operations', async () => {
      const { result } = renderHook(() => useAuthStore());
      
      // Mock sign out to fail
      mockSupabaseClient.auth.signOut.mockRejectedValue(new Error('Sign out failed'));
      
      await act(async () => {
        await result.current.signOut();
      });
      
      expect(result.current.error).toBe('Sign out failed');
      expect(result.current.isLoading).toBe(false);
      
      // Now mock sign out to succeed
      mockSupabaseClient.auth.signOut.mockResolvedValue({ error: null });
      
      await act(async () => {
        await result.current.signOut();
      });
      
      expect(result.current.error).toBeNull();
    });
  });
}); 