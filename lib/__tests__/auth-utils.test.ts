/**
 * Authentication Utilities Tests
 * 
 * Comprehensive test suite for all auth utility functions including:
 * - OAuth provider authentication
 * - Session management and refresh
 * - Admin user management operations
 * - Profile management utilities
 * - Authentication status checks
 */

import type { User, Session, Provider } from '@supabase/supabase-js';
import {
  authUtils,
  oauthUtils,
  sessionUtils,
  adminUtils,
  profileUtils,
  authStatusUtils,
  type AuthResult,
  type OAuthOptions,
  type UserManagementOptions,
  type ProfileUpdateData,
} from '../auth-utils';

// Mock environment
jest.mock('../env', () => ({
  env: {
    NEXT_PUBLIC_APP_URL: 'https://test.com',
    GOOGLE_CLIENT_ID: 'test-google-id',
    GOOGLE_CLIENT_SECRET: 'test-google-secret',
    GITHUB_CLIENT_ID: 'test-github-id',
    GITHUB_CLIENT_SECRET: 'test-github-secret',
  },
}));

// Mock Supabase
jest.mock('../supabase', () => ({
  createClientComponentClient: jest.fn(),
  createServerComponentClient: jest.fn(),
  createAdminClient: jest.fn(),
  getCurrentUser: jest.fn(),
  getCurrentSession: jest.fn(),
  authHelpers: {
    signInWithPassword: jest.fn(),
    signUpWithPassword: jest.fn(),
    signOut: jest.fn(),
    resetPassword: jest.fn(),
    updatePassword: jest.fn(),
  },
}));

// Mock data
const mockUser: User = {
  id: 'test-user-id',
  aud: 'authenticated',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
  app_metadata: {},
  user_metadata: { role: 'user' },
  role: 'authenticated',
};

const mockAdminUser: User = {
  ...mockUser,
  id: 'admin-user-id',
  email: 'admin@example.com',
  user_metadata: { role: 'admin' },
};

const mockSession: Session = {
  access_token: 'test-access-token',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  refresh_token: 'test-refresh-token',
  user: mockUser,
};

const mockExpiredSession: Session = {
  ...mockSession,
  expires_at: Math.floor(Date.now() / 1000) - 300, // 5 minutes ago
};

// Mock clients
const mockSupabaseClient = {
  auth: {
    signInWithOAuth: jest.fn(),
    refreshSession: jest.fn(),
    updateUser: jest.fn(),
    admin: {
      createUser: jest.fn(),
      deleteUser: jest.fn(),
      getUserById: jest.fn(),
      listUsers: jest.fn(),
      updateUserById: jest.fn(),
    },
    resetPasswordForEmail: jest.fn(),
  },
} as any;

const mockAdminClient = {
  auth: {
    admin: {
      createUser: jest.fn(),
      deleteUser: jest.fn(),
      getUserById: jest.fn(),
      listUsers: jest.fn(),
      updateUserById: jest.fn(),
    },
    resetPasswordForEmail: jest.fn(),
  },
} as any;

// Import mocked functions
const { 
  createClientComponentClient,
  createServerComponentClient,
  createAdminClient,
  getCurrentUser,
  getCurrentSession,
} = jest.requireMock('../supabase');

describe('Auth Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createAdminClient.mockReturnValue(mockAdminClient);
  });

  describe('OAuth Utils', () => {
    describe('getAvailableProviders', () => {
      it('should return all configured providers', () => {
        const providers = oauthUtils.getAvailableProviders();
        expect(providers).toEqual(['google', 'github']);
      });
    });

    describe('signInWithProvider', () => {
      it('should successfully sign in with OAuth provider', async () => {
        const mockOAuthResponse = {
          data: { url: 'https://oauth-url.com' },
          error: null,
        };

        mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue(mockOAuthResponse);

        const result = await oauthUtils.signInWithProvider(
          mockSupabaseClient,
          'google',
          { redirectTo: 'https://custom-redirect.com' }
        );

        expect(result.success).toBe(true);
        expect(result.data).toEqual({ url: 'https://oauth-url.com' });
        expect(result.error).toBeNull();
        expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
          provider: 'google',
          options: {
            redirectTo: 'https://custom-redirect.com',
            scopes: undefined,
            queryParams: undefined,
          },
        });
      });

      it('should handle OAuth sign in errors', async () => {
        const mockError = { message: 'OAuth failed' };
        mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
          data: null,
          error: mockError,
        });

        const result = await oauthUtils.signInWithProvider(mockSupabaseClient, 'github');

        expect(result.success).toBe(false);
        expect(result.data).toBeNull();
        expect(result.error).toBe('OAuth failed');
      });

      it('should use default redirect URL when none provided', async () => {
        const mockOAuthResponse = {
          data: { url: 'https://oauth-url.com' },
          error: null,
        };

        mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue(mockOAuthResponse);

        await oauthUtils.signInWithProvider(mockSupabaseClient, 'google');

        expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
          provider: 'google',
          options: {
            redirectTo: 'https://test.com/auth/callback',
            scopes: undefined,
            queryParams: undefined,
          },
        });
      });
    });

    describe('signInWithGoogle', () => {
      it('should call signInWithProvider with google', async () => {
        const spy = jest.spyOn(oauthUtils, 'signInWithProvider');
        spy.mockResolvedValue({ data: { url: 'test' }, error: null, success: true });

        await oauthUtils.signInWithGoogle(mockSupabaseClient);

        expect(spy).toHaveBeenCalledWith(mockSupabaseClient, 'google', {});
      });
    });

    describe('signInWithGitHub', () => {
      it('should call signInWithProvider with github', async () => {
        const spy = jest.spyOn(oauthUtils, 'signInWithProvider');
        spy.mockResolvedValue({ data: { url: 'test' }, error: null, success: true });

        await oauthUtils.signInWithGitHub(mockSupabaseClient);

        expect(spy).toHaveBeenCalledWith(mockSupabaseClient, 'github', {});
      });
    });

    describe('isProviderAvailable', () => {
      it('should return true for configured providers', () => {
        expect(oauthUtils.isProviderAvailable('google')).toBe(true);
        expect(oauthUtils.isProviderAvailable('github')).toBe(true);
      });

      it('should return false for unconfigured providers', () => {
        expect(oauthUtils.isProviderAvailable('facebook' as Provider)).toBe(false);
      });
    });
  });

  describe('Session Utils', () => {
    describe('refreshSession', () => {
      it('should successfully refresh session', async () => {
        mockSupabaseClient.auth.refreshSession.mockResolvedValue({
          data: { session: mockSession },
          error: null,
        });

        const result = await sessionUtils.refreshSession(mockSupabaseClient);

        expect(result.success).toBe(true);
        expect(result.data).toBe(mockSession);
        expect(result.error).toBeNull();
      });

      it('should handle refresh session errors', async () => {
        const mockError = { message: 'Refresh failed' };
        mockSupabaseClient.auth.refreshSession.mockResolvedValue({
          data: { session: null },
          error: mockError,
        });

        const result = await sessionUtils.refreshSession(mockSupabaseClient);

        expect(result.success).toBe(false);
        expect(result.data).toBeNull();
        expect(result.error).toBe('Refresh failed');
      });
    });

    describe('isSessionExpired', () => {
      it('should return false for valid session', () => {
        const isExpired = sessionUtils.isSessionExpired(mockSession);
        expect(isExpired).toBe(false);
      });

      it('should return true for expired session', () => {
        const isExpired = sessionUtils.isSessionExpired(mockExpiredSession);
        expect(isExpired).toBe(true);
      });

      it('should return true for null session', () => {
        const isExpired = sessionUtils.isSessionExpired(null);
        expect(isExpired).toBe(true);
      });

      it('should respect buffer time', () => {
        const soonToExpireSession = {
          ...mockSession,
          expires_at: Math.floor(Date.now() / 1000) + 240, // 4 minutes from now
        };

        const isExpired = sessionUtils.isSessionExpired(soonToExpireSession, 5);
        expect(isExpired).toBe(true);
      });
    });

    describe('getSessionInfo', () => {
      it('should return session info for valid session', () => {
        const info = sessionUtils.getSessionInfo(mockSession);
        
        expect(info.isValid).toBe(true);
        expect(info.expiresAt).toBeInstanceOf(Date);
        expect(info.expiresIn).toBe(3600);
        expect(info.timeUntilExpiry).toBeGreaterThan(0);
      });

      it('should return invalid info for null session', () => {
        const info = sessionUtils.getSessionInfo(null);
        
        expect(info.isValid).toBe(false);
        expect(info.expiresAt).toBeNull();
        expect(info.expiresIn).toBeNull();
        expect(info.timeUntilExpiry).toBeNull();
      });

      it('should return invalid info for expired session', () => {
        const info = sessionUtils.getSessionInfo(mockExpiredSession);
        
        expect(info.isValid).toBe(false);
        expect(info.timeUntilExpiry).toBe(0);
      });
    });

    describe('ensureValidSession', () => {
      it('should return current session if valid', async () => {
        getCurrentSession.mockResolvedValue(mockSession);

        const result = await sessionUtils.ensureValidSession(mockSupabaseClient);

        expect(result.success).toBe(true);
        expect(result.data).toBe(mockSession);
      });

      it('should refresh session if expired', async () => {
        getCurrentSession.mockResolvedValue(mockExpiredSession);
        mockSupabaseClient.auth.refreshSession.mockResolvedValue({
          data: { session: mockSession },
          error: null,
        });

        const result = await sessionUtils.ensureValidSession(mockSupabaseClient);

        expect(result.success).toBe(true);
        expect(result.data).toBe(mockSession);
        expect(mockSupabaseClient.auth.refreshSession).toHaveBeenCalled();
      });

      it('should handle no active session', async () => {
        getCurrentSession.mockResolvedValue(null);

        const result = await sessionUtils.ensureValidSession(mockSupabaseClient);

        expect(result.success).toBe(false);
        expect(result.error).toBe('No active session');
      });
    });
  });

  describe('Admin Utils', () => {
    describe('createUser', () => {
      it('should successfully create user', async () => {
        const mockUserData = { user: mockUser };
        mockAdminClient.auth.admin.createUser.mockResolvedValue({
          data: mockUserData,
          error: null,
        });

        const options: UserManagementOptions = {
          email: 'new@example.com',
          password: 'password123',
          userData: { name: 'New User' },
        };

        const result = await adminUtils.createUser(options);

        expect(result.success).toBe(true);
        expect(result.data).toBe(mockUser);
        expect(mockAdminClient.auth.admin.createUser).toHaveBeenCalledWith({
          email: 'new@example.com',
          password: 'password123',
          user_metadata: { name: 'New User' },
          email_confirm: false,
        });
      });

      it('should handle create user errors', async () => {
        const mockError = { message: 'Creation failed' };
        mockAdminClient.auth.admin.createUser.mockResolvedValue({
          data: null,
          error: mockError,
        });

        const options: UserManagementOptions = {
          email: 'new@example.com',
        };

        const result = await adminUtils.createUser(options);

        expect(result.success).toBe(false);
        expect(result.error).toBe('Creation failed');
      });
    });

    describe('deleteUser', () => {
      it('should successfully delete user', async () => {
        mockAdminClient.auth.admin.deleteUser.mockResolvedValue({ error: null });

        const result = await adminUtils.deleteUser('user-id');

        expect(result.success).toBe(true);
        expect(mockAdminClient.auth.admin.deleteUser).toHaveBeenCalledWith('user-id');
      });

      it('should handle delete user errors', async () => {
        const mockError = { message: 'Deletion failed' };
        mockAdminClient.auth.admin.deleteUser.mockResolvedValue({ error: mockError });

        const result = await adminUtils.deleteUser('user-id');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Deletion failed');
      });
    });

    describe('getUserById', () => {
      it('should successfully get user by ID', async () => {
        mockAdminClient.auth.admin.getUserById.mockResolvedValue({
          data: { user: mockUser },
          error: null,
        });

        const result = await adminUtils.getUserById('user-id');

        expect(result.success).toBe(true);
        expect(result.data).toBe(mockUser);
      });
    });

    describe('listUsers', () => {
      it('should successfully list users', async () => {
        const mockUsers = [mockUser, mockAdminUser];
        mockAdminClient.auth.admin.listUsers.mockResolvedValue({
          data: { users: mockUsers, total: 2 },
          error: null,
        });

        const result = await adminUtils.listUsers(1, 50);

        expect(result.success).toBe(true);
        expect(result.data?.users).toEqual(mockUsers);
        expect(result.data?.total).toBe(2);
        expect(result.data?.page).toBe(1);
        expect(result.data?.perPage).toBe(50);
      });
    });

    describe('updateUserMetadata', () => {
      it('should successfully update user metadata', async () => {
        mockAdminClient.auth.admin.updateUserById.mockResolvedValue({
          data: { user: mockUser },
          error: null,
        });

        const metadata = { name: 'Updated Name' };
        const result = await adminUtils.updateUserMetadata('user-id', metadata);

        expect(result.success).toBe(true);
        expect(result.data).toBe(mockUser);
        expect(mockAdminClient.auth.admin.updateUserById).toHaveBeenCalledWith('user-id', {
          user_metadata: metadata,
        });
      });
    });

    describe('updateUserRole', () => {
      it('should successfully update user role', async () => {
        mockAdminClient.auth.admin.updateUserById.mockResolvedValue({
          data: { user: mockAdminUser },
          error: null,
        });

        const result = await adminUtils.updateUserRole('user-id', 'admin');

        expect(result.success).toBe(true);
        expect(result.data).toBe(mockAdminUser);
        expect(mockAdminClient.auth.admin.updateUserById).toHaveBeenCalledWith('user-id', {
          user_metadata: { role: 'admin' },
        });
      });
    });

    describe('sendPasswordResetEmail', () => {
      it('should successfully send password reset email', async () => {
        mockAdminClient.auth.resetPasswordForEmail.mockResolvedValue({ error: null });

        const result = await adminUtils.sendPasswordResetEmail('user@example.com');

        expect(result.success).toBe(true);
        expect(mockAdminClient.auth.resetPasswordForEmail).toHaveBeenCalledWith(
          'user@example.com',
          { redirectTo: 'https://test.com/reset-password/confirm' }
        );
      });
    });
  });

  describe('Profile Utils', () => {
    describe('updateProfile', () => {
      it('should successfully update profile', async () => {
        mockSupabaseClient.auth.updateUser.mockResolvedValue({
          data: { user: mockUser },
          error: null,
        });

        const updates: ProfileUpdateData = {
          email: 'updated@example.com',
          userData: { name: 'Updated Name' },
        };

        const result = await profileUtils.updateProfile(mockSupabaseClient, updates);

        expect(result.success).toBe(true);
        expect(result.data).toBe(mockUser);
        expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
          email: 'updated@example.com',
          data: { name: 'Updated Name' },
        });
      });

      it('should handle profile update errors', async () => {
        const mockError = { message: 'Update failed' };
        mockSupabaseClient.auth.updateUser.mockResolvedValue({
          data: null,
          error: mockError,
        });

        const updates: ProfileUpdateData = { email: 'updated@example.com' };
        const result = await profileUtils.updateProfile(mockSupabaseClient, updates);

        expect(result.success).toBe(false);
        expect(result.error).toBe('Update failed');
      });
    });

    describe('getCurrentProfile', () => {
      it('should successfully get current profile', async () => {
        getCurrentUser.mockResolvedValue(mockUser);

        const result = await profileUtils.getCurrentProfile(mockSupabaseClient);

        expect(result.success).toBe(true);
        expect(result.data).toBe(mockUser);
      });

      it('should handle no authenticated user', async () => {
        getCurrentUser.mockResolvedValue(null);

        const result = await profileUtils.getCurrentProfile(mockSupabaseClient);

        expect(result.success).toBe(false);
        expect(result.error).toBe('No authenticated user');
      });
    });

    describe('updateAvatar', () => {
      it('should successfully update avatar', async () => {
        mockSupabaseClient.auth.updateUser.mockResolvedValue({
          data: { user: mockUser },
          error: null,
        });

        const result = await profileUtils.updateAvatar(mockSupabaseClient, 'https://avatar.url');

        expect(result.success).toBe(true);
        expect(result.data).toBe(mockUser);
        expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
          data: { avatar_url: 'https://avatar.url' },
        });
      });
    });
  });

  describe('Auth Status Utils', () => {
    describe('getAuthStatus', () => {
      it('should return comprehensive auth status', async () => {
        getCurrentSession.mockResolvedValue(mockSession);

        const status = await authStatusUtils.getAuthStatus(mockSupabaseClient);

        expect(status.isAuthenticated).toBe(true);
        expect(status.user).toBe(mockUser);
        expect(status.session).toBe(mockSession);
        expect(status.sessionInfo.isValid).toBe(true);
        expect(status.error).toBeNull();
      });

      it('should handle no session', async () => {
        getCurrentSession.mockResolvedValue(null);

        const status = await authStatusUtils.getAuthStatus(mockSupabaseClient);

        expect(status.isAuthenticated).toBe(false);
        expect(status.user).toBeNull();
        expect(status.session).toBeNull();
        expect(status.sessionInfo.isValid).toBe(false);
      });
    });

    describe('hasRole', () => {
      it('should return true for matching role', () => {
        expect(authStatusUtils.hasRole(mockUser, 'user')).toBe(true);
        expect(authStatusUtils.hasRole(mockAdminUser, 'admin')).toBe(true);
      });

      it('should return true for admin accessing user role', () => {
        expect(authStatusUtils.hasRole(mockAdminUser, 'user')).toBe(true);
      });

      it('should return false for insufficient role', () => {
        expect(authStatusUtils.hasRole(mockUser, 'admin')).toBe(false);
      });

      it('should return false for null user', () => {
        expect(authStatusUtils.hasRole(null, 'user')).toBe(false);
      });
    });

    describe('canAccessResource', () => {
      it('should allow read access for authenticated users', () => {
        expect(authStatusUtils.canAccessResource(mockUser, 'resource', 'read')).toBe(true);
      });

      it('should deny write access for non-admin users', () => {
        expect(authStatusUtils.canAccessResource(mockUser, 'resource', 'write')).toBe(false);
      });

      it('should allow all access for admin users', () => {
        expect(authStatusUtils.canAccessResource(mockAdminUser, 'resource', 'read')).toBe(true);
        expect(authStatusUtils.canAccessResource(mockAdminUser, 'resource', 'write')).toBe(true);
        expect(authStatusUtils.canAccessResource(mockAdminUser, 'resource', 'delete')).toBe(true);
      });

      it('should deny access for null user', () => {
        expect(authStatusUtils.canAccessResource(null, 'resource', 'read')).toBe(false);
      });
    });
  });

  describe('Unified Auth Utils Export', () => {
    it('should export all utilities', () => {
      expect(authUtils.oauth).toBe(oauthUtils);
      expect(authUtils.session).toBe(sessionUtils);
      expect(authUtils.admin).toBe(adminUtils);
      expect(authUtils.profile).toBe(profileUtils);
      expect(authUtils.status).toBe(authStatusUtils);
      expect(typeof authUtils.signInWithPassword).toBe('function');
      expect(typeof authUtils.getCurrentUser).toBe('function');
      expect(typeof authUtils.createClientForComponent).toBe('function');
    });
  });
}); 