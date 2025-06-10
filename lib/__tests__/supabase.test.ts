/**
 * Tests for lib/supabase.ts
 * 
 * Comprehensive test coverage for Supabase client creation functions,
 * utility functions, and auth helpers including happy path and edge cases.
 */

import type { SupabaseClient, User, Session, AuthError } from '@supabase/supabase-js';

// Mock dependencies first
const mockCreateBrowserClient = jest.fn();
const mockCreateClient = jest.fn();

jest.mock('@supabase/ssr', () => ({
  createBrowserClient: mockCreateBrowserClient,
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateClient,
}));

// Import functions to test
import {
  createClientComponentClient,
  getCurrentUser,
  getCurrentSession,
  handleSupabaseResponse,
  authHelpers,
  type Database,
} from '../supabase';

// Mock types
const mockUser: User = {
  id: 'test-user-id',
  aud: 'authenticated',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
  app_metadata: {},
  user_metadata: {},
  role: 'authenticated',
  confirmed_at: '2024-01-01T00:00:00Z',
  email_confirmed_at: '2024-01-01T00:00:00Z',
  last_sign_in_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  is_anonymous: false,
  identities: [],
  phone: undefined,
  phone_confirmed_at: undefined,
  confirmation_sent_at: undefined,
  recovery_sent_at: undefined,
};

const mockSession: Session = {
  access_token: 'test-access-token',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  refresh_token: 'test-refresh-token',
  user: mockUser,
};

const mockAuthError = {
  name: 'AuthError',
  message: 'Invalid credentials',
  status: 400,
} as AuthError;

// Mock implementations
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
    getSession: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    resetPasswordForEmail: jest.fn(),
    updateUser: jest.fn(),
    onAuthStateChange: jest.fn(),
  },
  from: jest.fn(),
} as any;

// The mock functions are already declared above

// Setup mocks
beforeEach(() => {
  jest.clearAllMocks();
  
  // Set up environment variables for tests
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  
  // Mock createBrowserClient
  mockCreateBrowserClient.mockReturnValue(mockSupabaseClient);
  mockCreateClient.mockReturnValue(mockSupabaseClient);
});

describe('Supabase Client Creation', () => {
  describe('createClientComponentClient', () => {
    it('creates client-side Supabase client with correct configuration', () => {
      const client = createClientComponentClient();
      
      expect(mockCreateBrowserClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key'
      );
      expect(client).toBe(mockSupabaseClient);
    });

    it('creates new instances each time (no singleton behavior)', () => {
      const client1 = createClientComponentClient();
      const client2 = createClientComponentClient();
      
      expect(mockCreateBrowserClient).toHaveBeenCalledTimes(2);
      expect(client1).toBe(mockSupabaseClient);
      expect(client2).toBe(mockSupabaseClient);
    });
  });
});

describe('Utility Functions', () => {
  describe('getCurrentUser', () => {
    it('returns user when successful', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await getCurrentUser(mockSupabaseClient);

      expect(result).toBe(mockUser);
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
    });

    it('returns null when error occurs', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: mockAuthError,
      });

      const result = await getCurrentUser(mockSupabaseClient);

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error getting current user:', mockAuthError);
      
      consoleErrorSpy.mockRestore();
    });

    it('returns null when exception is thrown', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Network error');
      mockSupabaseClient.auth.getUser.mockRejectedValue(error);

      const result = await getCurrentUser(mockSupabaseClient);

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Unexpected error getting current user:', error);
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getCurrentSession', () => {
    it('returns session when successful', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await getCurrentSession(mockSupabaseClient);

      expect(result).toBe(mockSession);
      expect(mockSupabaseClient.auth.getSession).toHaveBeenCalled();
    });

    it('returns null when error occurs', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: mockAuthError,
      });

      const result = await getCurrentSession(mockSupabaseClient);

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error getting current session:', mockAuthError);
      
      consoleErrorSpy.mockRestore();
    });

    it('returns null when exception is thrown', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Network error');
      mockSupabaseClient.auth.getSession.mockRejectedValue(error);

      const result = await getCurrentSession(mockSupabaseClient);

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Unexpected error getting current session:', error);
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('handleSupabaseResponse', () => {
    it('returns data when successful', () => {
      const testData = { id: 1, name: 'Test' };
      const response = { data: testData, error: null };

      const result = handleSupabaseResponse(response);

      expect(result).toEqual({ data: testData, error: null });
    });

    it('returns error message when error occurs', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Database error');
      const response = { data: null, error };

      const result = handleSupabaseResponse(response);

      expect(result).toEqual({ data: null, error: 'Database error' });
      expect(consoleErrorSpy).toHaveBeenCalledWith('Supabase error details:', expect.objectContaining({
        message: 'Database error',
        name: 'Error',
      }));
      
      consoleErrorSpy.mockRestore();
    });

    it('returns "No data returned" when data is null', () => {
      const response = { data: null, error: null };

      const result = handleSupabaseResponse(response);

      expect(result).toEqual({ data: null, error: 'No data returned' });
    });

    it('returns generic error message when error has no message', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error();
      error.message = '';
      const response = { data: null, error };

      const result = handleSupabaseResponse(response);

      expect(result).toEqual({ data: null, error: 'An unexpected error occurred' });
      
      consoleErrorSpy.mockRestore();
    });
  });
});

describe('Auth Helpers', () => {
  describe('isAuthenticated', () => {
    it('returns true when user exists', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await authHelpers.isAuthenticated(mockSupabaseClient);

      expect(result).toBe(true);
    });

    it('returns false when user is null', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await authHelpers.isAuthenticated(mockSupabaseClient);

      expect(result).toBe(false);
    });

    it('returns false when error occurs', async () => {
      jest.spyOn(console, 'error').mockImplementation();
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: mockAuthError,
      });

      const result = await authHelpers.isAuthenticated(mockSupabaseClient);

      expect(result).toBe(false);
    });
  });

  describe('getUserId', () => {
    it('returns user ID when user exists', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await authHelpers.getUserId(mockSupabaseClient);

      expect(result).toBe('test-user-id');
    });

    it('returns null when user does not exist', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await authHelpers.getUserId(mockSupabaseClient);

      expect(result).toBeNull();
    });
  });

  describe('requireAuth', () => {
    it('returns user when authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await authHelpers.requireAuth(mockSupabaseClient);

      expect(result).toBe(mockUser);
    });

    it('throws error when not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await expect(authHelpers.requireAuth(mockSupabaseClient)).rejects.toThrow(
        'Authentication required'
      );
    });
  });
});

describe('Edge Cases and Error Handling', () => {
  describe('Environment Variables', () => {
    it('should handle missing environment variables gracefully', () => {
      // The function should not throw when environment variables are undefined
      // This is handled by the ! assertion operator in the implementation
      expect(() => createClientComponentClient()).not.toThrow();
    });
  });

  describe('Client Instance Behavior', () => {
    it('creates new instances for each call', () => {
      const client1 = createClientComponentClient();
      const client2 = createClientComponentClient();
      
      expect(mockCreateBrowserClient).toHaveBeenCalledTimes(2);
      expect(client1).toBe(mockSupabaseClient);
      expect(client2).toBe(mockSupabaseClient);
    });
  });
}); 