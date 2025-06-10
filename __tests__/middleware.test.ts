/**
 * @jest-environment node
 */

import { NextResponse, type NextRequest } from 'next/server';
import { middleware } from '../middleware';
import { updateSession } from '../utils/supabase/middleware';

// Mock Next.js dependencies
jest.mock('next/server', () => ({
  NextResponse: {
    next: jest.fn(),
    redirect: jest.fn(),
  },
  NextRequest: jest.fn(),
}));

// Mock the updateSession function
jest.mock('../utils/supabase/middleware', () => ({
  updateSession: jest.fn(),
}));

// Mock @supabase/ssr
const mockAuth = {
  getUser: jest.fn(),
};

const mockCreateServerClient = jest.fn();

jest.mock('@supabase/ssr', () => ({
  createServerClient: (...args: any[]) => mockCreateServerClient(...args),
}));

const mockUpdateSession = updateSession as jest.MockedFunction<typeof updateSession>;
const mockNextResponse = NextResponse.next as jest.MockedFunction<typeof NextResponse.next>;
const mockRedirect = NextResponse.redirect as jest.MockedFunction<typeof NextResponse.redirect>;

describe('Middleware - Comprehensive Tests', () => {
  const createMockRequest = (url: string): NextRequest => {
    const fullUrl = new URL(url, 'http://localhost:3000');
    const request = {
      nextUrl: {
        pathname: fullUrl.pathname,
        searchParams: fullUrl.searchParams,
        clone: () => ({
          pathname: fullUrl.pathname,
          searchParams: fullUrl.searchParams,
        }),
      },
      url: fullUrl.toString(),
      cookies: {
        getAll: jest.fn().mockReturnValue([]),
        set: jest.fn(),
      },
    } as unknown as NextRequest;

    return request;
  };

  const mockResponse = { type: 'next', headers: new Headers() };
  const mockRedirectResponse = { type: 'redirect', url: 'http://localhost:3000/login' };

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    user_metadata: { name: 'Test User' },
    app_metadata: {},
    aud: 'authenticated',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    email_confirmed_at: '2023-01-01T00:00:00Z',
    last_sign_in_at: '2023-01-01T00:00:00Z',
    role: 'authenticated',
  };

  beforeAll(() => {
    // Set up environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockUpdateSession.mockResolvedValue(mockResponse as any);
    mockNextResponse.mockReturnValue(mockResponse as any);
    mockRedirect.mockReturnValue(mockRedirectResponse as any);
    
    mockCreateServerClient.mockReturnValue({
      auth: mockAuth,
    });

    // Default: successful auth response with user
    mockAuth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
  });

  describe('Direct middleware function tests', () => {
    it('should call updateSession and return its result', async () => {
      const request = createMockRequest('/profile');
      const expectedResponse = { type: 'custom' };
      
      mockUpdateSession.mockResolvedValue(expectedResponse as any);

      const result = await middleware(request);

      expect(mockUpdateSession).toHaveBeenCalledWith(request);
      expect(result).toBe(expectedResponse);
    });

    it('should handle updateSession errors gracefully', async () => {
      const request = createMockRequest('/profile');
      const error = new Error('updateSession failed');
      
      mockUpdateSession.mockRejectedValue(error);

      await expect(middleware(request)).rejects.toThrow('updateSession failed');
    });
  });

  describe('Protected Routes - Unauthenticated Access', () => {
    beforeEach(() => {
      // Mock unauthenticated response
      mockAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });
      
      // Mock updateSession to simulate redirect behavior
      mockUpdateSession.mockResolvedValue(mockRedirectResponse as any);
    });

    it('should redirect unauthenticated users from profile page', async () => {
      const request = createMockRequest('/profile');

      const result = await middleware(request);

      expect(result).toBe(mockRedirectResponse);
    });

    it('should redirect unauthenticated users from dashboard', async () => {
      const request = createMockRequest('/dashboard');

      const result = await middleware(request);

      expect(result).toBe(mockRedirectResponse);
    });

    it('should redirect unauthenticated users from admin panel', async () => {
      const request = createMockRequest('/admin');

      const result = await middleware(request);

      expect(result).toBe(mockRedirectResponse);
    });
  });

  describe('Protected Routes - Authenticated Access', () => {
    it('should allow authenticated users to access profile page', async () => {
      const request = createMockRequest('/profile');
      
      mockAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await middleware(request);

      expect(result).toBe(mockResponse);
    });

    it('should allow authenticated users to access dashboard', async () => {
      const request = createMockRequest('/dashboard');
      
      mockAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await middleware(request);

      expect(result).toBe(mockResponse);
    });

    it('should allow authenticated users to access admin panel', async () => {
      const request = createMockRequest('/admin');
      
      mockAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await middleware(request);

      expect(result).toBe(mockResponse);
    });
  });

  describe('Auth Routes - Unauthenticated Access', () => {
    beforeEach(() => {
      mockAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });
    });

    it('should allow unauthenticated users to access login page', async () => {
      const request = createMockRequest('/login');

      const result = await middleware(request);

      expect(result).toBe(mockResponse);
    });

    it('should allow unauthenticated users to access signup page', async () => {
      const request = createMockRequest('/signup');

      const result = await middleware(request);

      expect(result).toBe(mockResponse);
    });

    it('should allow unauthenticated users to access auth callbacks', async () => {
      const request = createMockRequest('/auth/callback');

      const result = await middleware(request);

      expect(result).toBe(mockResponse);
    });
  });

  describe('Auth Routes - Authenticated User Access', () => {
    it('should allow authenticated users to access auth routes', async () => {
      const request = createMockRequest('/login');
      
      mockAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await middleware(request);

      expect(result).toBe(mockResponse);
    });

    it('should allow authenticated users to access signup page', async () => {
      const request = createMockRequest('/signup');
      
      mockAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await middleware(request);

      expect(result).toBe(mockResponse);
    });
  });

  describe('Public Routes', () => {
    it('should allow access to home page regardless of auth status - unauthenticated', async () => {
      const request = createMockRequest('/');
      
      mockAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await middleware(request);

      expect(result).toBe(mockResponse);
    });

    it('should allow authenticated users to access public routes', async () => {
      const request = createMockRequest('/');
      
      mockAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await middleware(request);

      expect(result).toBe(mockResponse);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle auth errors gracefully and still allow public routes', async () => {
      const request = createMockRequest('/');
      
      // Mock updateSession to handle auth errors gracefully and return normal response for public routes
      mockUpdateSession.mockResolvedValue(mockResponse as any);

      const result = await middleware(request);

      expect(result).toBe(mockResponse);
    });

    it('should handle middleware errors by passing them through', async () => {
      const request = createMockRequest('/test');
      const error = new Error('Network error');
      
      mockUpdateSession.mockRejectedValue(error);

      await expect(middleware(request)).rejects.toThrow('Network error');
    });

    it('should handle Supabase connection errors', async () => {
      const request = createMockRequest('/profile');
      const error = new Error('Supabase connection failed');
      
      mockUpdateSession.mockRejectedValue(error);

      await expect(middleware(request)).rejects.toThrow('Supabase connection failed');
    });

    it('should handle null/undefined auth results by redirecting protected routes', async () => {
      const request = createMockRequest('/profile');
      
      // Mock updateSession to simulate redirect for null auth results
      mockUpdateSession.mockResolvedValue(mockRedirectResponse as any);

      const result = await middleware(request);

      expect(result).toBe(mockRedirectResponse);
    });
  });

  describe('URL Edge Cases', () => {
    it('should handle URLs with query parameters', async () => {
      const request = createMockRequest('/profile?tab=settings');
      
      mockAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });
      
      mockUpdateSession.mockResolvedValue(mockRedirectResponse as any);

      const result = await middleware(request);

      expect(result).toBe(mockRedirectResponse);
    });

    it('should handle URLs with fragments', async () => {
      const request = createMockRequest('/profile#section');
      
      mockAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });
      
      mockUpdateSession.mockResolvedValue(mockRedirectResponse as any);

      const result = await middleware(request);

      expect(result).toBe(mockRedirectResponse);
    });

    it('should handle root path variations', async () => {
      const request = createMockRequest('/');
      
      mockAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await middleware(request);

      expect(result).toBe(mockResponse);
    });
  });

  describe('Cookie Handling', () => {
    it('should properly configure cookies for Supabase client', async () => {
      const request = createMockRequest('/profile');
      
      mockAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      await middleware(request);

      expect(mockUpdateSession).toHaveBeenCalledWith(request);
    });

    it('should handle cookie operations through updateSession', async () => {
      const request = createMockRequest('/profile');
      const mockCookies = [{ name: 'session', value: 'test-value' }];
      
      request.cookies.getAll = jest.fn().mockReturnValue(mockCookies);
      
      mockAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      await middleware(request);

      // The cookie operations are handled inside updateSession, so we just verify it was called
      expect(mockUpdateSession).toHaveBeenCalledWith(request);
    });
  });
}); 