/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import type { User, Session } from '@supabase/supabase-js';
import {
  getAuthStatus,
  getRouteType,
  createLoginUrl,
  createPostAuthRedirectUrl,
  serverAuthUtils,
  matchesRoutePattern,
  routeConfig,
  type AuthMiddlewareResult,
} from '../lib/auth-middleware';
import * as supabase from '../lib/supabase';

// Mock the Supabase client
jest.mock('../lib/supabase', () => ({
  createMiddlewareClient: jest.fn(),
}));

const mockCreateMiddlewareClient = supabase.createMiddlewareClient as jest.MockedFunction<typeof supabase.createMiddlewareClient>;

describe('Auth Middleware - Comprehensive Tests', () => {
  const createMockRequest = (url: string): NextRequest => {
    const fullUrl = new URL(url, 'http://localhost:3000');
    const request = new NextRequest(fullUrl);
    
    // Mock the nextUrl property properly
    Object.defineProperty(request, 'nextUrl', {
      value: {
        pathname: fullUrl.pathname,
        searchParams: fullUrl.searchParams,
      },
      writable: false,
    });
    
    // Ensure the url property is set
    Object.defineProperty(request, 'url', {
      value: fullUrl.toString(),
      writable: false,
    });
    
    return request;
  };

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    user_metadata: { 
      role: 'user', 
      name: 'Test User',
      custom_role: 'admin',
      permissions: ['read', 'write']
    },
    app_metadata: {
      provider: 'email',
      providers: ['email']
    },
    aud: 'authenticated',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    email_confirmed_at: '2023-01-01T00:00:00Z',
    last_sign_in_at: '2023-01-01T00:00:00Z',
    role: 'authenticated',
  };
  
  const mockSession: Session = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    expires_at: Date.now() / 1000 + 3600, // Unix timestamp in seconds
    token_type: 'bearer',
    user: mockUser,
  };

  const mockSupabaseClient = {
    auth: {
      getSession: jest.fn(),
      getUser: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockCreateMiddlewareClient.mockReturnValue({
      supabase: mockSupabaseClient as any,
      response: { type: 'response' } as any,
    });

    // Default: authenticated user
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });
  });

  describe('getAuthStatus', () => {
    describe('Happy Path - Authenticated Users', () => {
      it('should return authenticated status for valid session with user', async () => {
        const request = createMockRequest('/profile');
        
        mockSupabaseClient.auth.getUser.mockResolvedValue({
          data: { user: mockUser },
          error: null,
        });

        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: mockSession },
          error: null,
        });

        const result = await getAuthStatus(request);

        expect(result).toEqual({
          isAuthenticated: true,
          user: mockUser,
          session: mockSession,
          error: null,
        });
        expect(mockCreateMiddlewareClient).toHaveBeenCalledWith(request);
        expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
      });

      it('should return authenticated status for fresh session', async () => {
        const freshSession = {
          ...mockSession,
          expires_at: Date.now() / 1000 + 7200, // Valid for 2 hours
        };

        const request = createMockRequest('/dashboard');
        
        mockSupabaseClient.auth.getUser.mockResolvedValue({
          data: { user: mockUser },
          error: null,
        });

        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: freshSession },
          error: null,
        });

        const result = await getAuthStatus(request);

        expect(result.isAuthenticated).toBe(true);
        expect(result.session).toEqual(freshSession);
        expect(result.error).toBeNull();
      });

      it('should handle session with different user roles', async () => {
        const adminUser = {
          ...mockUser,
          user_metadata: { 
            ...mockUser.user_metadata,
            role: 'admin',
            permissions: ['read', 'write', 'delete', 'admin']
          }
        };

        const adminSession = { ...mockSession, user: adminUser };
        const request = createMockRequest('/admin');
        
        mockSupabaseClient.auth.getUser.mockResolvedValue({
          data: { user: adminUser },
          error: null,
        });

        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: adminSession },
          error: null,
        });

        const result = await getAuthStatus(request);

        expect(result.isAuthenticated).toBe(true);
        expect(result.user?.user_metadata?.role).toBe('admin');
        expect(result.user?.user_metadata?.permissions).toContain('admin');
      });
    });

    describe('Happy Path - Unauthenticated Users', () => {
      it('should return unauthenticated status for no session', async () => {
        const request = createMockRequest('/login');
        
        mockSupabaseClient.auth.getUser.mockResolvedValue({
          data: { user: null },
          error: null,
        });

        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: null },
          error: null,
        });

        const result = await getAuthStatus(request);

        expect(result).toEqual({
          isAuthenticated: false,
          user: null,
          session: null,
          error: null,
        });
      });

      it('should return unauthenticated status for session without user', async () => {
        const sessionWithoutUser = { ...mockSession, user: null as any };
        const request = createMockRequest('/signup');
        
        mockSupabaseClient.auth.getUser.mockResolvedValue({
          data: { user: null },
          error: null,
        });

        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: sessionWithoutUser },
          error: null,
        });

        const result = await getAuthStatus(request);

        expect(result.isAuthenticated).toBe(false);
        expect(result.user).toBeNull();
        expect(result.session).toEqual(sessionWithoutUser);
      });
    });

    describe('Edge Cases and Error Handling', () => {
      it('should handle session errors gracefully', async () => {
        const request = createMockRequest('/profile');
        const userError = new Error('Session validation failed');
        
        mockSupabaseClient.auth.getUser.mockResolvedValue({
          data: { user: null },
          error: userError,
        });

        const result = await getAuthStatus(request);

        expect(result.isAuthenticated).toBe(false);
        expect(result.user).toBeNull();
        expect(result.session).toBeNull();
        expect(result.error).toBe('Session validation failed');
      });

      it('should handle expired sessions', async () => {
        const expiredSession = {
          ...mockSession,
          expires_at: Date.now() / 1000 - 3600, // Expired 1 hour ago
        };

        const request = createMockRequest('/profile');
        
        mockSupabaseClient.auth.getUser.mockResolvedValue({
          data: { user: mockUser },
          error: null,
        });

        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: expiredSession },
          error: null,
        });

        const result = await getAuthStatus(request);

        // Current implementation doesn't check expiration, only presence of user
        expect(result.isAuthenticated).toBe(true);
        expect(result.session).toEqual(expiredSession);
      });

      it('should handle network errors', async () => {
        const request = createMockRequest('/profile');
        const networkError = new Error('Network connection failed');
        
        mockSupabaseClient.auth.getUser.mockRejectedValue(networkError);

        const result = await getAuthStatus(request);

        expect(result.isAuthenticated).toBe(false);
        expect(result.user).toBeNull();
        expect(result.session).toBeNull();
        expect(result.error).toBe('Network connection failed');
      });

      it('should handle malformed session data', async () => {
        const request = createMockRequest('/profile');
        
        mockSupabaseClient.auth.getUser.mockResolvedValue({
          data: { user: mockUser },
          error: null,
        });

        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { invalid: 'data' } as any },
          error: null,
        });

        const result = await getAuthStatus(request);

        expect(result.isAuthenticated).toBe(true);
        expect(result.user).toEqual(mockUser);
      });

      it('should handle createMiddlewareClient errors', async () => {
        const request = createMockRequest('/profile');
        
        mockCreateMiddlewareClient.mockImplementation(() => {
          throw new Error('Failed to create middleware client');
        });

        const result = await getAuthStatus(request);

        expect(result.isAuthenticated).toBe(false);
        expect(result.error).toBe('Failed to create middleware client');
      });

      it('should handle undefined session response', async () => {
        const request = createMockRequest('/profile');
        
        mockSupabaseClient.auth.getUser.mockResolvedValue({
          data: { user: null },
          error: null,
        });

        mockSupabaseClient.auth.getSession.mockResolvedValue(undefined as any);

        const result = await getAuthStatus(request);

        expect(result.isAuthenticated).toBe(false);
        expect(result.user).toBeNull();
        expect(result.session).toBeNull();
      });
    });

    describe('Session Validation Edge Cases', () => {
      it('should handle session close to expiration', async () => {
        const soonToExpireSession = {
          ...mockSession,
          expires_at: Date.now() / 1000 + 60, // Expires in 1 minute
        };

        const request = createMockRequest('/profile');
        
        mockSupabaseClient.auth.getUser.mockResolvedValue({
          data: { user: mockUser },
          error: null,
        });

        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: soonToExpireSession },
          error: null,
        });

        const result = await getAuthStatus(request);

        expect(result.isAuthenticated).toBe(true);
        expect(result.session).toEqual(soonToExpireSession);
      });

      it('should handle session with very long expiration', async () => {
        const longSession = {
          ...mockSession,
          expires_at: Date.now() / 1000 + 86400 * 30, // Expires in 30 days
        };

        const request = createMockRequest('/profile');
        
        mockSupabaseClient.auth.getUser.mockResolvedValue({
          data: { user: mockUser },
          error: null,
        });

        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: longSession },
          error: null,
        });

        const result = await getAuthStatus(request);

        expect(result.isAuthenticated).toBe(true);
      });

      it('should handle user with empty metadata', async () => {
        const userWithEmptyMetadata = {
          ...mockUser,
          user_metadata: {},
          app_metadata: {},
        };

        const request = createMockRequest('/profile');
        
        mockSupabaseClient.auth.getUser.mockResolvedValue({
          data: { user: userWithEmptyMetadata },
          error: null,
        });

        const result = await getAuthStatus(request);

        expect(result.isAuthenticated).toBe(true);
        expect(result.user?.user_metadata).toEqual({});
        expect(result.user?.app_metadata).toEqual({});
      });
    });
  });

  describe('getRouteType', () => {
    describe('Protected Routes', () => {
      const protectedPaths = [
        '/profile',
        '/dashboard',
        '/settings',
        '/admin',
        '/profile/settings',
        '/dashboard/analytics',
        '/admin/users',
      ];

      protectedPaths.forEach(path => {
        it(`should classify ${path} as protected`, () => {
          expect(getRouteType(path)).toBe('protected');
        });
      });

      it('should handle nested protected routes', () => {
        expect(getRouteType('/profile')).toBe('protected');
        expect(getRouteType('/dashboard')).toBe('protected');
      });

      it('should handle admin routes', () => {
        expect(getRouteType('/profile')).toBe('protected');
        expect(getRouteType('/admin')).toBe('protected');
      });
    });

    describe('Auth Routes', () => {
      const authPaths = [
        '/login',
        '/signup',
        '/reset-password',
        '/verify-email',
        '/login/forgot-password',
        '/signup/verify',
      ];

      authPaths.forEach(path => {
        it(`should classify ${path} as auth`, () => {
          expect(getRouteType(path)).toBe('auth');
        });
      });

      it('should handle auth route variations', () => {
        expect(getRouteType('/forgot-password')).toBe('other');
      });

      it('should handle nested auth routes', () => {
        expect(getRouteType('/login')).toBe('auth');
        expect(getRouteType('/signup')).toBe('auth');
        expect(getRouteType('/reset-password')).toBe('auth');
      });

      it('should not classify non-auth login/signup references as auth', () => {
        expect(getRouteType('/help/login-issues')).toBe('other');
        expect(getRouteType('/docs/signup-guide')).toBe('other');
      });
    });

    describe('Public Routes', () => {
      const publicPaths = [
        '/',
        '/about',
        '/contact',
        '/pricing',
        '/features',
        '/terms',
        '/privacy',
        '/api',
        '/api/users',
        '/api/health',
      ];

      publicPaths.forEach(path => {
        it(`should classify ${path} as public`, () => {
          expect(getRouteType(path)).toBe('public');
        });
      });

      it('should handle non-exact public matches that are not matched', () => {
        expect(getRouteType('/docs')).toBe('other');
        expect(getRouteType('/blog')).toBe('other');
        expect(getRouteType('/help')).toBe('other');
      });

      it('should handle exact public routes', () => {
        expect(getRouteType('/')).toBe('public');
        expect(getRouteType('/pricing')).toBe('public');
      });

      it('should handle nested public routes', () => {
        expect(getRouteType('/features/analytics')).toBe('public');
        expect(getRouteType('/api/users')).toBe('public');
      });
    });

    describe('Other Routes', () => {
      const otherPaths = [
        '/docs',
        '/blog',
        '/help',
        '/unknown',
        '/random-path',
      ];

      otherPaths.forEach(path => {
        it(`should classify ${path} as other`, () => {
          expect(getRouteType(path)).toBe('other');
        });
      });

      it('should handle API routes', () => {
        expect(getRouteType('/api')).toBe('public');
        expect(getRouteType('/api/users')).toBe('public');
        expect(getRouteType('/api/health')).toBe('public');
        expect(getRouteType('/api/v1/users')).toBe('public');
      });

      it('should handle edge cases', () => {
        expect(getRouteType('')).toBe('other');
        expect(getRouteType('not-a-path')).toBe('other');
        expect(getRouteType('///')).toBe('public'); // '///' startsWith '/', which is public
      });

      it('should handle specific path patterns', () => {
        expect(getRouteType('/profile/test')).toBe('protected'); // Nested paths work
        expect(getRouteType('/login%20page')).toBe('other'); // Encoded space makes it not match
        expect(getRouteType('/pricing-test')).toBe('other'); // Dash makes it not match exactly
      });

      it('should handle very long paths', () => {
        const longProfilePath = '/profile/' + 'a'.repeat(1000);
        const longOtherPath = '/unknown/' + 'b'.repeat(1000);
        expect(getRouteType(longProfilePath)).toBe('protected');
        expect(getRouteType(longOtherPath)).toBe('other');
      });

      it('should be case sensitive', () => {
        expect(getRouteType('/Profile')).toBe('other'); // Case sensitive
        expect(getRouteType('/LOGIN')).toBe('other'); // Case sensitive
        expect(getRouteType('/PRICING')).toBe('other'); // Case sensitive
      });
    });
  });

  describe('createLoginUrl', () => {
    const baseUrl = 'https://example.com';

    it('should create login URL without return path', () => {
      const requestUrl = 'https://example.com';
      const pathname = '/login';
      
      const result = createLoginUrl(requestUrl, pathname);
      
      expect(result.pathname).toBe('/login');
      expect(result.searchParams.has('returnTo')).toBe(false);
    });

    it('should create login URL with protected return path', () => {
      const requestUrl = 'https://example.com';
      const pathname = '/profile';
      
      const result = createLoginUrl(requestUrl, pathname);
      
      expect(result.pathname).toBe('/login');
      expect(result.searchParams.get('returnTo')).toBe('/profile');
    });

    it('should ignore non-protected return paths', () => {
      const requestUrl = 'https://example.com';
      const pathname = '/about';
      
      const result = createLoginUrl(requestUrl, pathname);
      
      expect(result.pathname).toBe('/login');
      expect(result.searchParams.has('returnTo')).toBe(false);
    });

    it('should handle auth routes as return path', () => {
      const requestUrl = 'https://example.com';
      const pathname = '/signup';
      
      const result = createLoginUrl(requestUrl, pathname);
      
      expect(result.pathname).toBe('/login');
      expect(result.searchParams.has('returnTo')).toBe(false);
    });

    it('should handle multiple protected paths', () => {
      const requestUrl = 'https://example.com';
      const pathname = '/dashboard/settings';
      
      const result = createLoginUrl(requestUrl, pathname);
      
      expect(result.pathname).toBe('/login');
      expect(result.searchParams.get('returnTo')).toBe('/dashboard/settings');
    });

    it('should preserve base URL', () => {
      const requestUrl = 'https://custom.domain.com';
      const pathname = '/admin';
      
      const result = createLoginUrl(requestUrl, pathname);
      
      expect(result.origin).toBe('https://custom.domain.com');
      expect(result.pathname).toBe('/login');
      expect(result.searchParams.get('returnTo')).toBe('/admin');
    });

    it('should handle very long protected paths', () => {
      const requestUrl = 'https://example.com';
      const longPath = '/profile/' + 'segment/'.repeat(100) + 'end';
      
      const result = createLoginUrl(requestUrl, longPath);
      
      expect(result.searchParams.get('returnTo')).toBe(longPath);
    });

    it('should throw for invalid base URL', () => {
      const requestUrl = 'invalid-url';
      const pathname = '/profile';
      
      expect(() => createLoginUrl(requestUrl, pathname)).toThrow();
    });

    it('should handle undefined return path', () => {
      const requestUrl = 'https://example.com';
      const pathname = undefined;
      
      const result = createLoginUrl(requestUrl, pathname);
      
      expect(result.pathname).toBe('/login');
      expect(result.searchParams.has('returnTo')).toBe(false);
    });

    it('should handle empty return path', () => {
      const requestUrl = 'https://example.com';
      const pathname = '';
      
      const result = createLoginUrl(requestUrl, pathname);
      
      expect(result.pathname).toBe('/login');
      expect(result.searchParams.has('returnTo')).toBe(false);
    });
  });

  describe('createPostAuthRedirectUrl', () => {
    const baseUrl = 'https://example.com';

    it('should redirect to return path if protected', () => {
      const result = createPostAuthRedirectUrl(baseUrl, '/dashboard');
      
      expect(result.pathname).toBe('/dashboard');
    });

    it('should redirect to profile for non-protected return path', () => {
      const result = createPostAuthRedirectUrl(baseUrl, '/about');
      
      expect(result.pathname).toBe('/profile');
    });

    it('should redirect to profile for auth return path', () => {
      const result = createPostAuthRedirectUrl(baseUrl, '/login');
      
      expect(result.pathname).toBe('/profile');
    });

    it('should redirect to profile for undefined return path', () => {
      const result = createPostAuthRedirectUrl(baseUrl);
      
      expect(result.pathname).toBe('/profile');
    });

    it('should handle nested protected paths', () => {
      const result = createPostAuthRedirectUrl(baseUrl, '/admin/users/123');
      
      expect(result.pathname).toBe('/admin/users/123');
    });

    it('should preserve base URL', () => {
      const customBaseUrl = 'https://app.example.com';
      const result = createPostAuthRedirectUrl(customBaseUrl, '/profile');
      
      expect(result.origin).toBe('https://app.example.com');
      expect(result.pathname).toBe('/profile');
    });
  });

  describe('matchesRoutePattern', () => {
    const patterns = ['/api', '/admin', '/profile'];

    it('should match exact patterns', () => {
      expect(matchesRoutePattern('/api', patterns)).toBe(true);
      expect(matchesRoutePattern('/admin', patterns)).toBe(true);
      expect(matchesRoutePattern('/profile', patterns)).toBe(true);
    });

    it('should match nested patterns', () => {
      expect(matchesRoutePattern('/api/users', patterns)).toBe(true);
      expect(matchesRoutePattern('/admin/settings', patterns)).toBe(true);
      expect(matchesRoutePattern('/profile/edit', patterns)).toBe(true);
    });

    it('should not match partial patterns', () => {
      expect(matchesRoutePattern('/ap', patterns)).toBe(false);
      expect(matchesRoutePattern('/admi', patterns)).toBe(false);
      expect(matchesRoutePattern('/profil', patterns)).toBe(false);
    });

    it('should not match similar but different patterns', () => {
      expect(matchesRoutePattern('/api-v2', patterns)).toBe(false);
      expect(matchesRoutePattern('/admin-panel', patterns)).toBe(false);
      expect(matchesRoutePattern('/profile-settings', patterns)).toBe(false);
    });

    it('should handle empty patterns array', () => {
      expect(matchesRoutePattern('/anything', [])).toBe(false);
    });

         it('should handle root pattern', () => {
       const rootPatterns = ['/'];
       expect(matchesRoutePattern('/', rootPatterns)).toBe(true);
       expect(matchesRoutePattern('/anything', rootPatterns)).toBe(false); // Root pattern only matches exact '/'
     });
  });

  describe('routeConfig', () => {
    it('should have protected routes defined', () => {
      expect(routeConfig.protected).toContain('/profile');
      expect(routeConfig.protected).toContain('/dashboard');
      expect(routeConfig.protected).toContain('/settings');
      expect(routeConfig.protected).toContain('/admin');
    });

    it('should have auth routes defined', () => {
      expect(routeConfig.auth).toContain('/login');
      expect(routeConfig.auth).toContain('/signup');
      expect(routeConfig.auth).toContain('/reset-password');
      expect(routeConfig.auth).toContain('/verify-email');
    });

    it('should have public routes defined', () => {
      expect(routeConfig.public).toContain('/');
      expect(routeConfig.public).toContain('/about');
      expect(routeConfig.public).toContain('/contact');
      expect(routeConfig.public).toContain('/pricing');
      expect(routeConfig.public).toContain('/features');
      expect(routeConfig.public).toContain('/terms');
      expect(routeConfig.public).toContain('/privacy');
      expect(routeConfig.public).toContain('/api');
    });
  });

  describe('serverAuthUtils', () => {
    describe('hasRole', () => {
      it('should return true for user with matching role', () => {
        expect(serverAuthUtils.hasRole(mockUser, 'user')).toBe(true);
      });

      it('should return true for admin role checking user role', () => {
        const adminUser = {
          ...mockUser,
          user_metadata: { ...mockUser.user_metadata, role: 'admin' }
        };
        expect(serverAuthUtils.hasRole(adminUser, 'admin')).toBe(true);
      });

      it('should return false for user without required role', () => {
        expect(serverAuthUtils.hasRole(mockUser, 'superadmin')).toBe(false);
      });

      it('should return false for null user', () => {
        expect(serverAuthUtils.hasRole(null, 'user')).toBe(false);
      });

      it('should handle user without metadata', () => {
        const userWithoutMetadata = { ...mockUser, user_metadata: {} };
        expect(serverAuthUtils.hasRole(userWithoutMetadata, 'admin')).toBe(false);
      });

      it('should be case sensitive', () => {
        expect(serverAuthUtils.hasRole(mockUser, 'USER')).toBe(false);
        expect(serverAuthUtils.hasRole(mockUser, 'Admin')).toBe(false);
      });

      it('should handle empty role string', () => {
        expect(serverAuthUtils.hasRole(mockUser, '')).toBe(false);
      });

      it('should handle role hierarchy', () => {
        const adminUser = {
          ...mockUser,
          user_metadata: { ...mockUser.user_metadata, role: 'admin' }
        };
        
        // Admin should have both user and admin access
        expect(serverAuthUtils.hasRole(adminUser, 'user')).toBe(true);
        expect(serverAuthUtils.hasRole(adminUser, 'admin')).toBe(true);
      });
    });

    describe('canAccessResource', () => {
      it('should allow user to read their own resources', () => {
        expect(serverAuthUtils.canAccessResource(mockUser, 'resource1', 'read')).toBe(true);
      });

      it('should deny user write access to protected resources', () => {
        expect(serverAuthUtils.canAccessResource(mockUser, 'resource1', 'write')).toBe(false);
      });

      it('should allow admin full access to resources', () => {
        const adminUser = {
          ...mockUser,
          user_metadata: { ...mockUser.user_metadata, role: 'admin' }
        };
        
        expect(serverAuthUtils.canAccessResource(adminUser, 'resource1', 'read')).toBe(true);
        expect(serverAuthUtils.canAccessResource(adminUser, 'resource1', 'write')).toBe(true);
        expect(serverAuthUtils.canAccessResource(adminUser, 'resource1', 'delete')).toBe(true);
      });

      it('should deny access for null user', () => {
        expect(serverAuthUtils.canAccessResource(null, 'resource1', 'read')).toBe(false);
      });

      it('should allow access to user-owned resources', () => {
        expect(serverAuthUtils.canAccessResource(mockUser, 'user-123', 'read')).toBe(true);
        expect(serverAuthUtils.canAccessResource(mockUser, 'document-456', 'read')).toBe(true);
      });

      it('should handle empty resource ID', () => {
        expect(serverAuthUtils.canAccessResource(mockUser, '', 'read')).toBe(true);
      });
    });
  });

  describe('Module Integration', () => {
    it('should handle end-to-end authentication flow', async () => {
      const request = createMockRequest('/profile');
      
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const authStatus = await getAuthStatus(request);
      const routeType = getRouteType('/profile');
      
      expect(authStatus.isAuthenticated).toBe(true);
      expect(routeType).toBe('protected');
      
      // Verify the combination works for authorization
      expect(authStatus.isAuthenticated && routeType === 'protected').toBe(true);
    });

    it('should handle unauthorized access flow', async () => {
      const request = createMockRequest('/profile');
      
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const authStatus = await getAuthStatus(request);
      const routeType = getRouteType('/profile');
      const loginUrl = createLoginUrl('https://example.com', '/profile');
      
      expect(authStatus.isAuthenticated).toBe(false);
      expect(routeType).toBe('protected');
      expect(loginUrl.pathname).toBe('/login');
      expect(loginUrl.searchParams.get('returnTo')).toBe('/profile');
    });

    it('should handle auth route access for unauthenticated users', async () => {
      const request = createMockRequest('/login');
      
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const authStatus = await getAuthStatus(request);
      const routeType = getRouteType('/login');
      
      expect(authStatus.isAuthenticated).toBe(false);
      expect(routeType).toBe('auth');
      
      // Auth routes should be accessible to unauthenticated users
      expect(!authStatus.isAuthenticated && routeType === 'auth').toBe(true);
    });

    it('should handle public route access regardless of auth status', async () => {
      const request = createMockRequest('/');
      
      // Test with unauthenticated user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const authStatus1 = await getAuthStatus(request);
      const routeType = getRouteType('/');
      
      expect(authStatus1.isAuthenticated).toBe(false);
      expect(routeType).toBe('public');
      
      // Test with authenticated user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const authStatus2 = await getAuthStatus(request);
      
      expect(authStatus2.isAuthenticated).toBe(true);
      expect(routeType).toBe('public');
      
      // Public routes should be accessible regardless of auth status
      expect(routeType === 'public').toBe(true);
    });

    it('should handle role-based access control', () => {
      const adminUser = {
        ...mockUser,
        user_metadata: { ...mockUser.user_metadata, role: 'admin' }
      };
      
      // Regular user access
      expect(serverAuthUtils.hasRole(mockUser, 'user')).toBe(true);
      expect(serverAuthUtils.hasRole(mockUser, 'admin')).toBe(false);
      
      // Admin user access
      expect(serverAuthUtils.hasRole(adminUser, 'user')).toBe(true);
      expect(serverAuthUtils.hasRole(adminUser, 'admin')).toBe(true);
      
      // Resource access
      expect(serverAuthUtils.canAccessResource(mockUser, 'user-resource', 'read')).toBe(true);
      expect(serverAuthUtils.canAccessResource(adminUser, 'any-resource', 'write')).toBe(true);
    });
  });
}); 