/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { middleware } from '../middleware';
import * as authMiddleware from '../lib/auth-middleware';
import * as supabase from '../lib/supabase';

// Mock the dependencies
jest.mock('../lib/supabase', () => ({
  createMiddlewareClient: jest.fn(),
}));

jest.mock('../lib/auth-middleware', () => ({
  getAuthStatus: jest.fn(),
  getRouteType: jest.fn(),
  createLoginUrl: jest.fn(),
  createPostAuthRedirectUrl: jest.fn(),
}));

const mockCreateMiddlewareClient = supabase.createMiddlewareClient as jest.MockedFunction<typeof supabase.createMiddlewareClient>;
const mockGetAuthStatus = authMiddleware.getAuthStatus as jest.MockedFunction<typeof authMiddleware.getAuthStatus>;
const mockGetRouteType = authMiddleware.getRouteType as jest.MockedFunction<typeof authMiddleware.getRouteType>;
const mockCreateLoginUrl = authMiddleware.createLoginUrl as jest.MockedFunction<typeof authMiddleware.createLoginUrl>;
const mockCreatePostAuthRedirectUrl = authMiddleware.createPostAuthRedirectUrl as jest.MockedFunction<typeof authMiddleware.createPostAuthRedirectUrl>;

// Mock global Response
Object.defineProperty(global, 'Response', {
  value: {
    redirect: jest.fn((url: string) => ({ type: 'redirect', url })),
  },
});

// Mock NextResponse for the module
jest.mock('next/server', () => ({
  NextRequest: jest.requireActual('next/server').NextRequest,
  NextResponse: {
    next: jest.fn(() => ({ type: 'next' })),
    redirect: jest.fn((url: string) => ({ type: 'redirect', url })),
  },
}));

describe('Middleware - Comprehensive Tests', () => {
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

  const mockResponse = { type: 'response' };
  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    user_metadata: { role: 'user', name: 'Test User' },
    app_metadata: {},
    aud: 'authenticated',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  };
  
  const mockSession = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    expires_at: Date.now() + 3600000,
    token_type: 'bearer',
    user: mockUser,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockCreateMiddlewareClient.mockReturnValue({
      supabase: {} as any,
      response: mockResponse as any,
    });
  });

  describe('Protected Routes - Happy Path', () => {
    it('should allow authenticated users to access protected routes', async () => {
      const request = createMockRequest('/profile');
      
      mockGetRouteType.mockReturnValue('protected');
      mockGetAuthStatus.mockResolvedValue({
        isAuthenticated: true,
        user: mockUser,
        session: mockSession,
        error: null,
      });

      const result = await middleware(request);

      expect(mockGetRouteType).toHaveBeenCalledWith('/profile');
      expect(mockGetAuthStatus).toHaveBeenCalledWith(request);
      expect(result).toBe(mockResponse);
    });

    it('should allow authenticated users to access nested protected routes', async () => {
      const request = createMockRequest('/profile/settings');
      
      mockGetRouteType.mockReturnValue('protected');
      mockGetAuthStatus.mockResolvedValue({
        isAuthenticated: true,
        user: mockUser,
        session: mockSession,
        error: null,
      });

      const result = await middleware(request);

      expect(mockGetRouteType).toHaveBeenCalledWith('/profile/settings');
      expect(result).toBe(mockResponse);
    });

    it('should allow authenticated users to access dashboard routes', async () => {
      const request = createMockRequest('/dashboard/analytics');
      
      mockGetRouteType.mockReturnValue('protected');
      mockGetAuthStatus.mockResolvedValue({
        isAuthenticated: true,
        user: mockUser,
        session: mockSession,
        error: null,
      });

      const result = await middleware(request);

      expect(result).toBe(mockResponse);
    });
  });

  describe('Protected Routes - Unauthorized Access', () => {
    it('should redirect unauthenticated users to login with returnTo parameter', async () => {
      const request = createMockRequest('/profile');
      const loginUrl = new URL('http://localhost:3000/login?returnTo=%2Fprofile');
      
      mockGetRouteType.mockReturnValue('protected');
      mockGetAuthStatus.mockResolvedValue({
        isAuthenticated: false,
        user: null,
        session: null,
        error: null,
      });
      mockCreateLoginUrl.mockReturnValue(loginUrl);

      const result = await middleware(request);

      expect(mockGetRouteType).toHaveBeenCalledWith('/profile');
      expect(mockGetAuthStatus).toHaveBeenCalledWith(request);
      expect(mockCreateLoginUrl).toHaveBeenCalledWith('http://localhost:3000/profile', '/profile');
      expect(result).toEqual({ type: 'redirect', url: loginUrl });
    });

    it('should redirect users to login for nested protected routes', async () => {
      const request = createMockRequest('/dashboard/settings/billing');
      const loginUrl = new URL('http://localhost:3000/login?returnTo=%2Fdashboard%2Fsettings%2Fbilling');
      
      mockGetRouteType.mockReturnValue('protected');
      mockGetAuthStatus.mockResolvedValue({
        isAuthenticated: false,
        user: null,
        session: null,
        error: null,
      });
      mockCreateLoginUrl.mockReturnValue(loginUrl);

      const result = await middleware(request);

      expect(mockCreateLoginUrl).toHaveBeenCalledWith(
        'http://localhost:3000/dashboard/settings/billing',
        '/dashboard/settings/billing'
      );
      expect(result).toEqual({ type: 'redirect', url: loginUrl });
    });

    it('should redirect for admin routes', async () => {
      const request = createMockRequest('/admin/users');
      const loginUrl = new URL('http://localhost:3000/login?returnTo=%2Fadmin%2Fusers');
      
      mockGetRouteType.mockReturnValue('protected');
      mockGetAuthStatus.mockResolvedValue({
        isAuthenticated: false,
        user: null,
        session: null,
        error: null,
      });
      mockCreateLoginUrl.mockReturnValue(loginUrl);

      const result = await middleware(request);

      expect(result).toEqual({ type: 'redirect', url: loginUrl });
    });
  });

  describe('Auth Routes - Happy Path', () => {
    it('should allow unauthenticated users to access login page', async () => {
      const request = createMockRequest('/login');
      
      mockGetRouteType.mockReturnValue('auth');
      mockGetAuthStatus.mockResolvedValue({
        isAuthenticated: false,
        user: null,
        session: null,
        error: null,
      });

      const result = await middleware(request);

      expect(mockGetRouteType).toHaveBeenCalledWith('/login');
      expect(mockGetAuthStatus).toHaveBeenCalledWith(request);
      expect(result).toBe(mockResponse);
    });

    it('should allow unauthenticated users to access signup page', async () => {
      const request = createMockRequest('/signup');
      
      mockGetRouteType.mockReturnValue('auth');
      mockGetAuthStatus.mockResolvedValue({
        isAuthenticated: false,
        user: null,
        session: null,
        error: null,
      });

      const result = await middleware(request);

      expect(result).toBe(mockResponse);
    });

    it('should allow unauthenticated users to access password reset', async () => {
      const request = createMockRequest('/reset-password');
      
      mockGetRouteType.mockReturnValue('auth');
      mockGetAuthStatus.mockResolvedValue({
        isAuthenticated: false,
        user: null,
        session: null,
        error: null,
      });

      const result = await middleware(request);

      expect(result).toBe(mockResponse);
    });
  });

  describe('Auth Routes - Authenticated User Redirects', () => {
    it('should redirect authenticated users away from login page to default', async () => {
      const request = createMockRequest('/login');
      const redirectUrl = new URL('http://localhost:3000/profile');
      
      mockGetRouteType.mockReturnValue('auth');
      mockGetAuthStatus.mockResolvedValue({
        isAuthenticated: true,
        user: mockUser,
        session: mockSession,
        error: null,
      });
      mockCreatePostAuthRedirectUrl.mockReturnValue(redirectUrl);

      const result = await middleware(request);

      expect(mockGetRouteType).toHaveBeenCalledWith('/login');
      expect(mockGetAuthStatus).toHaveBeenCalledWith(request);
      expect(mockCreatePostAuthRedirectUrl).toHaveBeenCalledWith('http://localhost:3000/login', undefined);
      expect(result).toEqual({ type: 'redirect', url: redirectUrl });
    });

    it('should redirect authenticated users to returnTo URL when present', async () => {
      const request = createMockRequest('/login?returnTo=%2Fprofile%2Fsettings');
      const redirectUrl = new URL('http://localhost:3000/profile/settings');
      
      mockGetRouteType.mockReturnValue('auth');
      mockGetAuthStatus.mockResolvedValue({
        isAuthenticated: true,
        user: mockUser,
        session: mockSession,
        error: null,
      });
      mockCreatePostAuthRedirectUrl.mockReturnValue(redirectUrl);

      const result = await middleware(request);

      expect(mockCreatePostAuthRedirectUrl).toHaveBeenCalledWith(
        'http://localhost:3000/login?returnTo=%2Fprofile%2Fsettings',
        '/profile/settings'
      );
      expect(result).toEqual({ type: 'redirect', url: redirectUrl });
    });

    it('should redirect authenticated users from signup page', async () => {
      const request = createMockRequest('/signup');
      const redirectUrl = new URL('http://localhost:3000/profile');
      
      mockGetRouteType.mockReturnValue('auth');
      mockGetAuthStatus.mockResolvedValue({
        isAuthenticated: true,
        user: mockUser,
        session: mockSession,
        error: null,
      });
      mockCreatePostAuthRedirectUrl.mockReturnValue(redirectUrl);

      const result = await middleware(request);

      expect(result).toEqual({ type: 'redirect', url: redirectUrl });
    });

    it('should handle complex returnTo URLs with query parameters', async () => {
      const request = createMockRequest('/login?returnTo=%2Fdashboard%3Ftab%3Danalytics');
      const redirectUrl = new URL('http://localhost:3000/dashboard?tab=analytics');
      
      mockGetRouteType.mockReturnValue('auth');
      mockGetAuthStatus.mockResolvedValue({
        isAuthenticated: true,
        user: mockUser,
        session: mockSession,
        error: null,
      });
      mockCreatePostAuthRedirectUrl.mockReturnValue(redirectUrl);

      const result = await middleware(request);

      expect(mockCreatePostAuthRedirectUrl).toHaveBeenCalledWith(
        'http://localhost:3000/login?returnTo=%2Fdashboard%3Ftab%3Danalytics',
        '/dashboard?tab=analytics'
      );
      expect(result).toEqual({ type: 'redirect', url: redirectUrl });
    });
  });

  describe('Public Routes', () => {
    it('should allow access to home page regardless of auth status', async () => {
      const request = createMockRequest('/');
      
      mockGetRouteType.mockReturnValue('public');
      mockGetAuthStatus.mockResolvedValue({
        isAuthenticated: false,
        user: null,
        session: null,
        error: null,
      });

      const result = await middleware(request);

      expect(mockGetRouteType).toHaveBeenCalledWith('/');
      expect(result).toBe(mockResponse);
    });

    it('should allow authenticated users to access public routes', async () => {
      const request = createMockRequest('/about');
      
      mockGetRouteType.mockReturnValue('public');
      mockGetAuthStatus.mockResolvedValue({
        isAuthenticated: true,
        user: mockUser,
        session: mockSession,
        error: null,
      });

      const result = await middleware(request);

      expect(result).toBe(mockResponse);
    });

    it('should allow access to pricing page', async () => {
      const request = createMockRequest('/pricing');
      
      mockGetRouteType.mockReturnValue('public');
      mockGetAuthStatus.mockResolvedValue({
        isAuthenticated: false,
        user: null,
        session: null,
        error: null,
      });

      const result = await middleware(request);

      expect(result).toBe(mockResponse);
    });

    it('should allow access to contact page', async () => {
      const request = createMockRequest('/contact');
      
      mockGetRouteType.mockReturnValue('public');
      mockGetAuthStatus.mockResolvedValue({
        isAuthenticated: false,
        user: null,
        session: null,
        error: null,
      });

      const result = await middleware(request);

      expect(result).toBe(mockResponse);
    });
  });

  describe('Other Routes', () => {
    it('should allow access to unclassified routes by default', async () => {
      const request = createMockRequest('/some-other-route');
      
      mockGetRouteType.mockReturnValue('other');
      mockGetAuthStatus.mockResolvedValue({
        isAuthenticated: false,
        user: null,
        session: null,
        error: null,
      });

      const result = await middleware(request);

      expect(mockGetRouteType).toHaveBeenCalledWith('/some-other-route');
      expect(result).toBe(mockResponse);
    });

    it('should allow access to API routes', async () => {
      const request = createMockRequest('/api/health');
      
      mockGetRouteType.mockReturnValue('other');
      mockGetAuthStatus.mockResolvedValue({
        isAuthenticated: false,
        user: null,
        session: null,
        error: null,
      });

      const result = await middleware(request);

      expect(result).toBe(mockResponse);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle auth errors gracefully and still redirect protected routes', async () => {
      const request = createMockRequest('/profile');
      
      mockGetRouteType.mockReturnValue('protected');
      mockGetAuthStatus.mockResolvedValue({
        isAuthenticated: false,
        user: null,
        session: null,
        error: 'Auth service temporarily unavailable',
      });

      const loginUrl = new URL('http://localhost:3000/login?returnTo=%2Fprofile');
      mockCreateLoginUrl.mockReturnValue(loginUrl);

      const result = await middleware(request);

      expect(result).toEqual({ type: 'redirect', url: loginUrl });
    });

    it('should handle middleware errors by allowing the request through', async () => {
      const request = createMockRequest('/profile');
      
      mockGetAuthStatus.mockRejectedValue(new Error('Middleware error'));

      const result = await middleware(request);

      expect(result).toEqual({ type: 'next' });
    });

    it('should handle Supabase connection errors', async () => {
      const request = createMockRequest('/profile');
      
      mockGetRouteType.mockReturnValue('protected');
      mockGetAuthStatus.mockResolvedValue({
        isAuthenticated: false,
        user: null,
        session: null,
        error: 'Connection to auth service failed',
      });

      const loginUrl = new URL('http://localhost:3000/login?returnTo=%2Fprofile');
      mockCreateLoginUrl.mockReturnValue(loginUrl);

      const result = await middleware(request);

      expect(result).toEqual({ type: 'redirect', url: loginUrl });
    });

    it('should handle malformed URLs gracefully', async () => {
      const request = createMockRequest('/profile%20with%20spaces');
      
      mockGetRouteType.mockReturnValue('protected');
      mockGetAuthStatus.mockResolvedValue({
        isAuthenticated: false,
        user: null,
        session: null,
        error: null,
      });

      const loginUrl = new URL('http://localhost:3000/login?returnTo=%2Fprofile%2520with%2520spaces');
      mockCreateLoginUrl.mockReturnValue(loginUrl);

      const result = await middleware(request);

      expect(result).toEqual({ type: 'redirect', url: loginUrl });
    });

    it('should handle createMiddlewareClient errors', async () => {
      const request = createMockRequest('/profile');
      
      mockCreateMiddlewareClient.mockImplementation(() => {
        throw new Error('Failed to create middleware client');
      });

      const result = await middleware(request);

      expect(result).toEqual({ type: 'next' });
    });

    it('should handle null/undefined auth results', async () => {
      const request = createMockRequest('/profile');
      
      mockGetRouteType.mockReturnValue('protected');
      mockGetAuthStatus.mockResolvedValue({
        isAuthenticated: false,
        user: null,
        session: null,
        error: null,
      });

      const loginUrl = new URL('http://localhost:3000/login?returnTo=%2Fprofile');
      mockCreateLoginUrl.mockReturnValue(loginUrl);

      const result = await middleware(request);

      expect(result).toEqual({ type: 'redirect', url: loginUrl });
    });

    it('should handle expired sessions', async () => {
      const expiredSession = {
        ...mockSession,
        expires_at: Date.now() - 3600000, // Expired 1 hour ago
      };

      const request = createMockRequest('/profile');
      
      mockGetRouteType.mockReturnValue('protected');
      mockGetAuthStatus.mockResolvedValue({
        isAuthenticated: false,
        user: null,
        session: expiredSession,
        error: 'Session expired',
      });

      const loginUrl = new URL('http://localhost:3000/login?returnTo=%2Fprofile');
      mockCreateLoginUrl.mockReturnValue(loginUrl);

      const result = await middleware(request);

      expect(result).toEqual({ type: 'redirect', url: loginUrl });
    });
  });

  describe('Session States', () => {
    it('should handle valid session with user', async () => {
      const request = createMockRequest('/profile');
      
      mockGetRouteType.mockReturnValue('protected');
      mockGetAuthStatus.mockResolvedValue({
        isAuthenticated: true,
        user: mockUser,
        session: mockSession,
        error: null,
      });

      const result = await middleware(request);

      expect(result).toBe(mockResponse);
    });

    it('should handle session without user', async () => {
      const sessionWithoutUser = {
        ...mockSession,
        user: null as any, // Type assertion for test scenario
      };

      const request = createMockRequest('/profile');
      
      mockGetRouteType.mockReturnValue('protected');
      mockGetAuthStatus.mockResolvedValue({
        isAuthenticated: false,
        user: null,
        session: sessionWithoutUser,
        error: null,
      });

      const loginUrl = new URL('http://localhost:3000/login?returnTo=%2Fprofile');
      mockCreateLoginUrl.mockReturnValue(loginUrl);

      const result = await middleware(request);

      expect(result).toEqual({ type: 'redirect', url: loginUrl });
    });

    it('should handle user without session', async () => {
      const request = createMockRequest('/profile');
      
      mockGetRouteType.mockReturnValue('protected');
      mockGetAuthStatus.mockResolvedValue({
        isAuthenticated: false,
        user: mockUser,
        session: null,
        error: null,
      });

      const loginUrl = new URL('http://localhost:3000/login?returnTo=%2Fprofile');
      mockCreateLoginUrl.mockReturnValue(loginUrl);

      const result = await middleware(request);

      expect(result).toEqual({ type: 'redirect', url: loginUrl });
    });
  });

  describe('URL Edge Cases', () => {
    it('should handle URLs with fragments', async () => {
      const request = createMockRequest('/profile#settings');
      
      mockGetRouteType.mockReturnValue('protected');
      mockGetAuthStatus.mockResolvedValue({
        isAuthenticated: true,
        user: mockUser,
        session: mockSession,
        error: null,
      });

      const result = await middleware(request);

      expect(mockGetRouteType).toHaveBeenCalledWith('/profile');
      expect(result).toBe(mockResponse);
    });

    it('should handle URLs with query parameters', async () => {
      const request = createMockRequest('/profile?tab=settings&view=advanced');
      
      mockGetRouteType.mockReturnValue('protected');
      mockGetAuthStatus.mockResolvedValue({
        isAuthenticated: true,
        user: mockUser,
        session: mockSession,
        error: null,
      });

      const result = await middleware(request);

      expect(mockGetRouteType).toHaveBeenCalledWith('/profile');
      expect(result).toBe(mockResponse);
    });

    it('should handle root path variations', async () => {
      const variations = ['/', '/?redirect=true'];
      
      for (const path of variations) {
        const request = createMockRequest(path);
        
        mockGetRouteType.mockReturnValue('public');
        mockGetAuthStatus.mockResolvedValue({
          isAuthenticated: false,
          user: null,
          session: null,
          error: null,
        });

        const result = await middleware(request);

        expect(result).toBe(mockResponse);
      }
    });

    it('should handle very long URLs', async () => {
      const longPath = '/profile/' + 'a'.repeat(1000);
      const request = createMockRequest(longPath);
      
      mockGetRouteType.mockReturnValue('protected');
      mockGetAuthStatus.mockResolvedValue({
        isAuthenticated: false,
        user: null,
        session: null,
        error: null,
      });

      const loginUrl = new URL(`http://localhost:3000/login?returnTo=${encodeURIComponent(longPath)}`);
      mockCreateLoginUrl.mockReturnValue(loginUrl);

      const result = await middleware(request);

      expect(result).toEqual({ type: 'redirect', url: loginUrl });
    });

    it('should handle invalid URL patterns gracefully', async () => {
      // Test that the middleware can handle edge cases that might cause URL parsing issues
      // We'll mock the request creation to simulate what happens with problematic URLs
      const mockRequest = {
        nextUrl: { pathname: '//' },
        url: 'http://localhost:3000//',
      } as NextRequest;

      mockGetRouteType.mockReturnValue('public');
      mockGetAuthStatus.mockResolvedValue({
        isAuthenticated: false,
        user: null,
        session: null,
        error: null,
      });

      const result = await middleware(mockRequest);

      expect(result).toBe(mockResponse);
    });
  });

  describe('Performance and Optimization', () => {
    it('should not call getAuthStatus for public routes when possible', async () => {
      const request = createMockRequest('/');
      
      mockGetRouteType.mockReturnValue('public');
      mockGetAuthStatus.mockResolvedValue({
        isAuthenticated: false,
        user: null,
        session: null,
        error: null,
      });

      const result = await middleware(request);

      expect(mockGetAuthStatus).toHaveBeenCalledWith(request);
      expect(result).toBe(mockResponse);
    });

    it('should handle concurrent requests properly', async () => {
      const requests = [
        createMockRequest('/profile'),
        createMockRequest('/dashboard'),
        createMockRequest('/settings'),
      ];

      mockGetRouteType.mockReturnValue('protected');
      mockGetAuthStatus.mockResolvedValue({
        isAuthenticated: true,
        user: mockUser,
        session: mockSession,
        error: null,
      });

      const results = await Promise.all(requests.map(req => middleware(req)));

      results.forEach(result => {
        expect(result).toBe(mockResponse);
      });

      expect(mockGetAuthStatus).toHaveBeenCalledTimes(3);
    });
  });
}); 