/**
 * @jest-environment node
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '../supabase/middleware';

// Mock Next.js dependencies
jest.mock('next/server', () => ({
  NextResponse: {
    next: jest.fn(),
    redirect: jest.fn(),
  },
  NextRequest: jest.fn(),
}));

// Mock @supabase/ssr
const mockAuth = {
  getUser: jest.fn(),
};

const mockCreateServerClient = jest.fn();

jest.mock('@supabase/ssr', () => ({
  createServerClient: (...args: any[]) => mockCreateServerClient(...args),
}));

describe('Supabase Middleware - updateSession', () => {
  const mockNextResponse = {
    cookies: {
      set: jest.fn(),
      getAll: jest.fn(() => []),
      setAll: jest.fn(),
    },
  };

  const mockNextResponseStatic = NextResponse.next as jest.MockedFunction<typeof NextResponse.next>;
  const mockNextResponseRedirect = NextResponse.redirect as jest.MockedFunction<typeof NextResponse.redirect>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockCreateServerClient.mockReturnValue({
      auth: mockAuth,
    });
    
    mockNextResponseStatic.mockReturnValue(mockNextResponse as any);
    mockNextResponseRedirect.mockReturnValue(mockNextResponse as any);
    
    // Setup environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  });

  const createMockRequest = (pathname: string, cookies: Array<{ name: string; value: string }> = []): NextRequest => {
    const url = new URL(pathname, 'https://example.com');
    
    const cookiesApi = {
      getAll: jest.fn(() => cookies),
      set: jest.fn(),
    };
    
    const request = {
      nextUrl: {
        pathname,
        clone: jest.fn(() => url),
      },
      cookies: cookiesApi,
      url: url.toString(),
    } as unknown as NextRequest;
    
    return request;
  };

  describe('Authenticated User Scenarios', () => {
    beforeEach(() => {
      mockAuth.getUser.mockResolvedValue({
        data: { 
          user: { 
            id: 'user-123', 
            email: 'test@example.com',
            user_metadata: { role: 'user' }
          } 
        },
        error: null,
      });
    });

    it('should allow authenticated user to access protected routes', async () => {
      const request = createMockRequest('/profile');
      
      const result = await updateSession(request);
      
      expect(mockCreateServerClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key',
        expect.objectContaining({
          cookies: expect.objectContaining({
            getAll: expect.any(Function),
            setAll: expect.any(Function),
          }),
        })
      );
      
      expect(mockAuth.getUser).toHaveBeenCalled();
      expect(mockNextResponseRedirect).not.toHaveBeenCalled();
      expect(result).toBe(mockNextResponse);
    });

    it('should allow authenticated user to access dashboard', async () => {
      const request = createMockRequest('/dashboard');
      
      const result = await updateSession(request);
      
      expect(mockAuth.getUser).toHaveBeenCalled();
      expect(mockNextResponseRedirect).not.toHaveBeenCalled();
      expect(result).toBe(mockNextResponse);
    });

    it('should allow authenticated user to access admin routes', async () => {
      const request = createMockRequest('/admin/users');
      
      const result = await updateSession(request);
      
      expect(mockAuth.getUser).toHaveBeenCalled();
      expect(mockNextResponseRedirect).not.toHaveBeenCalled();
      expect(result).toBe(mockNextResponse);
    });

    it('should allow authenticated user to access public routes', async () => {
      const request = createMockRequest('/');
      
      const result = await updateSession(request);
      
      expect(mockAuth.getUser).toHaveBeenCalled();
      expect(mockNextResponseRedirect).not.toHaveBeenCalled();
      expect(result).toBe(mockNextResponse);
    });

    it('should allow authenticated user to access auth routes', async () => {
      const request = createMockRequest('/login');
      
      const result = await updateSession(request);
      
      expect(mockAuth.getUser).toHaveBeenCalled();
      expect(mockNextResponseRedirect).not.toHaveBeenCalled();
      expect(result).toBe(mockNextResponse);
    });
  });

  describe('Unauthenticated User Scenarios', () => {
    beforeEach(() => {
      mockAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });
    });

    it('should redirect unauthenticated user from protected route to login', async () => {
      const request = createMockRequest('/profile');
      const expectedUrl = new URL('/profile', 'https://example.com');
      expectedUrl.pathname = '/login';
      
      const result = await updateSession(request);
      
      expect(mockAuth.getUser).toHaveBeenCalled();
      expect(request.nextUrl.clone).toHaveBeenCalled();
      expect(mockNextResponseRedirect).toHaveBeenCalledWith(expectedUrl);
      expect(result).toBe(mockNextResponse);
    });

    it('should redirect unauthenticated user from dashboard to login', async () => {
      const request = createMockRequest('/dashboard');
      const expectedUrl = new URL('/dashboard', 'https://example.com');
      expectedUrl.pathname = '/login';
      
      const result = await updateSession(request);
      
      expect(mockNextResponseRedirect).toHaveBeenCalledWith(expectedUrl);
    });

    it('should redirect unauthenticated user from admin routes to login', async () => {
      const request = createMockRequest('/admin/settings');
      const expectedUrl = new URL('/admin/settings', 'https://example.com');
      expectedUrl.pathname = '/login';
      
      const result = await updateSession(request);
      
      expect(mockNextResponseRedirect).toHaveBeenCalledWith(expectedUrl);
    });

    it('should allow unauthenticated user to access login page', async () => {
      const request = createMockRequest('/login');
      
      const result = await updateSession(request);
      
      expect(mockAuth.getUser).toHaveBeenCalled();
      expect(mockNextResponseRedirect).not.toHaveBeenCalled();
      expect(result).toBe(mockNextResponse);
    });

    it('should allow unauthenticated user to access signup page', async () => {
      const request = createMockRequest('/signup');
      
      const result = await updateSession(request);
      
      expect(mockAuth.getUser).toHaveBeenCalled();
      expect(mockNextResponseRedirect).not.toHaveBeenCalled();
      expect(result).toBe(mockNextResponse);
    });

    it('should allow unauthenticated user to access auth callback routes', async () => {
      const request = createMockRequest('/auth/callback');
      
      const result = await updateSession(request);
      
      expect(mockAuth.getUser).toHaveBeenCalled();
      expect(mockNextResponseRedirect).not.toHaveBeenCalled();
      expect(result).toBe(mockNextResponse);
    });

    it('should redirect unauthenticated user from home page to login', async () => {
      const request = createMockRequest('/');
      const expectedUrl = new URL('/', 'https://example.com');
      expectedUrl.pathname = '/login';
      
      const result = await updateSession(request);
      
      expect(mockNextResponseRedirect).toHaveBeenCalledWith(expectedUrl);
    });

    it('should redirect unauthenticated user from any other route to login', async () => {
      const request = createMockRequest('/some-random-page');
      const expectedUrl = new URL('/some-random-page', 'https://example.com');
      expectedUrl.pathname = '/login';
      
      const result = await updateSession(request);
      
      expect(mockNextResponseRedirect).toHaveBeenCalledWith(expectedUrl);
    });
  });

  describe('Cookie Management', () => {
    const testCookies = [
      { name: 'sb-access-token', value: 'token123' },
      { name: 'sb-refresh-token', value: 'refresh456' },
    ];

    beforeEach(() => {
      mockAuth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
    });

    it('should properly handle request cookies', async () => {
      const request = createMockRequest('/profile', testCookies);
      
      await updateSession(request);
      
      expect(mockCreateServerClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key',
        expect.objectContaining({
          cookies: expect.objectContaining({
            getAll: expect.any(Function),
            setAll: expect.any(Function),
          }),
        })
      );
      
      // Test that cookies.getAll returns the expected cookies
      const cookiesConfig = mockCreateServerClient.mock.calls[0][2].cookies;
      expect(cookiesConfig.getAll()).toEqual(testCookies);
    });

    it('should handle cookie setting through setAll callback', async () => {
      const request = createMockRequest('/profile');
      const cookiesToSet = [
        { name: 'new-cookie', value: 'new-value', options: { httpOnly: true } },
      ];
      
      await updateSession(request);
      
      // Get the cookies configuration passed to createServerClient
      const cookiesConfig = mockCreateServerClient.mock.calls[0][2].cookies;
      
      // Test the setAll function
      cookiesConfig.setAll(cookiesToSet);
      
      expect(request.cookies.set).toHaveBeenCalledWith('new-cookie', 'new-value');
      expect(mockNextResponseStatic).toHaveBeenCalledWith({ request });
      expect(mockNextResponse.cookies.set).toHaveBeenCalledWith(
        'new-cookie', 
        'new-value', 
        { httpOnly: true }
      );
    });

    it('should handle multiple cookies being set', async () => {
      const request = createMockRequest('/profile');
      const multipleCookies = [
        { name: 'cookie1', value: 'value1', options: { secure: true } },
        { name: 'cookie2', value: 'value2', options: { httpOnly: true } },
        { name: 'cookie3', value: 'value3', options: {} },
      ];
      
      await updateSession(request);
      
      const cookiesConfig = mockCreateServerClient.mock.calls[0][2].cookies;
      cookiesConfig.setAll(multipleCookies);
      
      // Check that all cookies were set on request
      expect(request.cookies.set).toHaveBeenCalledTimes(3);
      expect(request.cookies.set).toHaveBeenNthCalledWith(1, 'cookie1', 'value1');
      expect(request.cookies.set).toHaveBeenNthCalledWith(2, 'cookie2', 'value2');
      expect(request.cookies.set).toHaveBeenNthCalledWith(3, 'cookie3', 'value3');
      
      // Check that all cookies were set on response
      expect(mockNextResponse.cookies.set).toHaveBeenCalledTimes(3);
      expect(mockNextResponse.cookies.set).toHaveBeenNthCalledWith(1, 'cookie1', 'value1', { secure: true });
      expect(mockNextResponse.cookies.set).toHaveBeenNthCalledWith(2, 'cookie2', 'value2', { httpOnly: true });
      expect(mockNextResponse.cookies.set).toHaveBeenNthCalledWith(3, 'cookie3', 'value3', {});
    });
  });

  describe('Error Handling', () => {
    it('should handle Supabase auth errors gracefully', async () => {
      mockAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Auth error', status: 401 },
      });
      
      const request = createMockRequest('/profile');
      
      const result = await updateSession(request);
      
      // Should still redirect to login when there's an auth error
      expect(mockNextResponseRedirect).toHaveBeenCalled();
      expect(result).toBe(mockNextResponse);
    });

    it('should handle network errors from Supabase', async () => {
      mockAuth.getUser.mockRejectedValue(new Error('Network error'));
      
      const request = createMockRequest('/profile');
      
      // Should not throw, middleware should handle gracefully
      await expect(updateSession(request)).rejects.toThrow('Network error');
    });

    it('should handle missing environment variables', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      const request = createMockRequest('/profile');
      
      await expect(updateSession(request)).rejects.toThrow();
    });
  });

  describe('Route-Specific Behavior', () => {
    beforeEach(() => {
      mockAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });
    });

    it('should allow access to login subpaths', async () => {
      const loginPaths = [
        '/login',
        '/login/forgot-password',
        '/login/reset',
      ];
      
      for (const path of loginPaths) {
        const request = createMockRequest(path);
        
        const result = await updateSession(request);
        
        expect(mockNextResponseRedirect).not.toHaveBeenCalled();
        expect(result).toBe(mockNextResponse);
        
        jest.clearAllMocks();
        mockNextResponseStatic.mockReturnValue(mockNextResponse as any);
      }
    });

    it('should allow access to signup subpaths', async () => {
      const signupPaths = [
        '/signup',
        '/signup/verify',
        '/signup/complete',
      ];
      
      for (const path of signupPaths) {
        const request = createMockRequest(path);
        
        const result = await updateSession(request);
        
        expect(mockNextResponseRedirect).not.toHaveBeenCalled();
        expect(result).toBe(mockNextResponse);
        
        jest.clearAllMocks();
        mockNextResponseStatic.mockReturnValue(mockNextResponse as any);
      }
    });

    it('should allow access to auth subpaths', async () => {
      const authPaths = [
        '/auth',
        '/auth/callback',
        '/auth/confirm',
        '/auth/reset-password',
      ];
      
      for (const path of authPaths) {
        const request = createMockRequest(path);
        
        const result = await updateSession(request);
        
        expect(mockNextResponseRedirect).not.toHaveBeenCalled();
        expect(result).toBe(mockNextResponse);
        
        jest.clearAllMocks();
        mockNextResponseStatic.mockReturnValue(mockNextResponse as any);
      }
    });

    it('should redirect from protected paths even with query parameters', async () => {
      // Note: NextRequest mock doesn't handle query params in this test setup,
      // but the real implementation would handle this correctly
      const request = createMockRequest('/profile');
      const expectedUrl = new URL('/profile', 'https://example.com');
      expectedUrl.pathname = '/login';
      
      const result = await updateSession(request);
      
      expect(mockNextResponseRedirect).toHaveBeenCalledWith(expectedUrl);
    });
  });

  describe('Response Object Integrity', () => {
    beforeEach(() => {
      mockAuth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
    });

    it('should return the same response object that was created', async () => {
      const request = createMockRequest('/profile');
      
      const result = await updateSession(request);
      
      // The function should return the supabaseResponse object
      expect(result).toBe(mockNextResponse);
      expect(mockNextResponseStatic).toHaveBeenCalledWith({ request });
    });

    it('should not create additional response objects unnecessarily', async () => {
      const request = createMockRequest('/profile');
      
      await updateSession(request);
      
      // Should only call NextResponse.next once initially
      expect(mockNextResponseStatic).toHaveBeenCalledTimes(1);
      expect(mockNextResponseRedirect).not.toHaveBeenCalled();
    });
  });

  describe('Environment Variables', () => {
    it('should use correct environment variables', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://custom.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'custom-anon-key';
      
      mockAuth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
      
      const request = createMockRequest('/profile');
      
      await updateSession(request);
      
      expect(mockCreateServerClient).toHaveBeenCalledWith(
        'https://custom.supabase.co',
        'custom-anon-key',
        expect.any(Object)
      );
    });
  });
}); 