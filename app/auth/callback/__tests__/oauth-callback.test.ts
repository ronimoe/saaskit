/**
 * Tests for Enhanced OAuth Callback Route
 * 
 * Test coverage for OAuth-specific callback handling including:
 * - OAuth error mapping and user-friendly messages
 * - OAuth provider detection and signup flows
 * - Enhanced error logging and debugging
 * - Success message handling for different auth types
 */

import { NextRequest } from 'next/server';
import { GET } from '../route';

// Mock NextResponse
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    redirect: jest.fn((url: URL | string) => ({
      status: 302,
      headers: {
        get: jest.fn((name: string) => {
          if (name === 'location') return url.toString();
          return null;
        }),
      },
    })),
  },
}));

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  createServerComponentClient: jest.fn(),
}));

jest.mock('@/lib/customer-service', () => ({
  ensureCustomerExists: jest.fn(),
}));

jest.mock('@/lib/account-linking', () => ({
  checkAccountLinking: jest.fn(),
  generateLinkingToken: jest.fn(),
}));

jest.mock('@/lib/stripe-sync', () => ({
  ensureStripeCustomer: jest.fn(),
}));

// Helper function to create properly mocked NextRequest
function createMockRequest(url: string): NextRequest {
  return {
    url: url,
    nextUrl: new URL(url),
    method: 'GET',
    headers: new Headers(),
    body: null,
    json: async () => ({}),
    text: async () => '',
    arrayBuffer: async () => new ArrayBuffer(0),
    formData: async () => new FormData(),
    clone: () => createMockRequest(url),
  } as unknown as NextRequest;
}

const mockSupabase = {
  auth: {
    exchangeCodeForSession: jest.fn(),
    getUser: jest.fn(),
  },
};

const mockEnsureCustomerExists = require('@/lib/customer-service').ensureCustomerExists;
const mockCreateServerComponentClient = require('@/lib/supabase').createServerComponentClient;

describe('OAuth Callback Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateServerComponentClient.mockResolvedValue(mockSupabase);
    
    // Mock console methods to avoid noise in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('OAuth Error Handling', () => {
    it('should handle access_denied error with user-friendly message', async () => {
      const request = createMockRequest('http://localhost:3000/auth/callback?error=access_denied&error_description=User%20cancelled');
      
      const response = await GET(request);
      
      expect(response.status).toBe(302);
      const location = response.headers.get('location');
      expect(location).toContain('/login');
      expect(location).toContain('error=You+cancelled+the+sign-in+process');
    });

    it('should handle invalid_grant error with specific message', async () => {
      const request = createMockRequest('http://localhost:3000/auth/callback?error=invalid_grant');
      
      const response = await GET(request);
      
      expect(response.status).toBe(302);
      const location = response.headers.get('location');
      expect(location).toContain('error=The+authorization+code+is+invalid+or+expired');
    });

    it('should handle server_error with Google-specific message', async () => {
      const request = createMockRequest('http://localhost:3000/auth/callback?error=server_error');
      
      const response = await GET(request);
      
      expect(response.status).toBe(302);
      const location = response.headers.get('location');
      expect(location).toContain('error=Google+encountered+an+error+during+sign-in');
    });

    it('should handle unknown errors with error description', async () => {
      const request = createMockRequest('http://localhost:3000/auth/callback?error=unknown_error&error_description=Custom%20error%20message');
      
      const response = await GET(request);
      
      expect(response.status).toBe(302);
      const location = response.headers.get('location');
      expect(location).toContain('error=Custom+error+message');
    });

    it('should handle unknown errors without description', async () => {
      const request = createMockRequest('http://localhost:3000/auth/callback?error=unknown_error');
      
      const response = await GET(request);
      
      expect(response.status).toBe(302);
      const location = response.headers.get('location');
      expect(location).toContain('error=An+error+occurred+during+sign-in');
    });
  });

  describe('OAuth Success Flow', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      created_at: new Date().toISOString(),
      app_metadata: {
        providers: ['google'],
        provider: 'google'
      },
      user_metadata: {
        full_name: 'Test User'
      }
    };

    beforeEach(() => {
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({ error: null });
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockEnsureCustomerExists.mockResolvedValue({
        success: true,
        profile: { id: 'profile-123' },
        stripeCustomerId: 'cus_123',
        isNewCustomer: true,
        isNewProfile: true
      });
    });

    it('should detect OAuth signup for new Google user', async () => {
      const request = createMockRequest('http://localhost:3000/auth/callback?code=auth_code_123');
      
      const response = await GET(request);
      
      expect(response.status).toBe(302);
      // OAuth users are redirected to setup-profile, not immediate customer creation
      expect(mockEnsureCustomerExists).not.toHaveBeenCalled();
      
      const location = response.headers.get('location');
      expect(location).toContain('/auth/setup-profile');
      expect(location).toContain('message=Successfully+signed+up+with+Google');
    });

    it('should detect OAuth signin for existing Google user', async () => {
      // Mock existing user (created more than 1 minute ago)
      const existingUser = {
        ...mockUser,
        created_at: new Date(Date.now() - 120000).toISOString() // 2 minutes ago
      };
      
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: existingUser } });
      
      const request = createMockRequest('http://localhost:3000/auth/callback?code=auth_code_123');
      
      const response = await GET(request);
      
      expect(response.status).toBe(302);
      expect(mockEnsureCustomerExists).not.toHaveBeenCalled();
      
      const location = response.headers.get('location');
      expect(location).toContain('message=Successfully+signed+in+with+Google');
    });

    it('should handle email signup confirmation', async () => {
      const emailUser = {
        ...mockUser,
        app_metadata: {
          providers: ['email'],
          provider: 'email'
        }
      };
      
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: emailUser } });
      
      const request = createMockRequest('http://localhost:3000/auth/callback?code=auth_code_123&type=signup');
      
      const response = await GET(request);
      
      expect(response.status).toBe(302);
      expect(mockEnsureCustomerExists).toHaveBeenCalled();
      
      const location = response.headers.get('location');
      expect(location).toContain('message=Email+confirmed+successfully');
    });
  });

  describe('Code Exchange Error Handling', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
    });

    it('should handle invalid_grant exchange error', async () => {
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
        error: { message: 'invalid_grant: Authorization code expired' }
      });
      
      const request = createMockRequest('http://localhost:3000/auth/callback?code=expired_code');
      
      const response = await GET(request);
      
      expect(response.status).toBe(302);
      const location = response.headers.get('location');
      expect(location).toContain('error=The+authorization+code+is+invalid+or+expired');
    });

    it('should handle network exchange error', async () => {
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
        error: { message: 'network error: Connection timeout' }
      });
      
      const request = createMockRequest('http://localhost:3000/auth/callback?code=valid_code');
      
      const response = await GET(request);
      
      expect(response.status).toBe(302);
      const location = response.headers.get('location');
      expect(location).toContain('error=Network+error+during+authentication');
    });

    it('should handle generic exchange error', async () => {
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
        error: { message: 'Unknown error occurred' }
      });
      
      const request = createMockRequest('http://localhost:3000/auth/callback?code=valid_code');
      
      const response = await GET(request);
      
      expect(response.status).toBe(302);
      const location = response.headers.get('location');
      expect(location).toContain('error=Authentication+failed');
    });
  });

  describe('Customer Creation Error Handling', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      created_at: new Date().toISOString(),
      app_metadata: {
        providers: ['google'],
        provider: 'google'
      },
      user_metadata: {
        full_name: 'Test User'
      }
    };

    beforeEach(() => {
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({ error: null });
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
    });

    it('should continue auth flow even if customer creation fails', async () => {
      mockEnsureCustomerExists.mockResolvedValue({
        success: false,
        error: 'Stripe API error'
      });
      
      const request = createMockRequest('http://localhost:3000/auth/callback?code=auth_code_123');
      
      const response = await GET(request);
      
      expect(response.status).toBe(302);
      // OAuth users are redirected to setup-profile, not immediate customer creation
      expect(mockEnsureCustomerExists).not.toHaveBeenCalled();
      
      // Should redirect to setup-profile for OAuth users
      const location = response.headers.get('location');
      expect(location).toContain('/auth/setup-profile');
    });

    it('should continue auth flow if customer creation throws exception', async () => {
      mockEnsureCustomerExists.mockRejectedValue(new Error('Database connection failed'));
      
      const request = createMockRequest('http://localhost:3000/auth/callback?code=auth_code_123');
      
      const response = await GET(request);
      
      expect(response.status).toBe(302);
      
      // Should still redirect to setup-profile for OAuth users
      const location = response.headers.get('location');
      expect(location).toContain('/auth/setup-profile');
    });
  });

  describe('Invalid Requests', () => {
    it('should handle missing code parameter', async () => {
      const request = createMockRequest('http://localhost:3000/auth/callback');
      
      const response = await GET(request);
      
      expect(response.status).toBe(302);
      const location = response.headers.get('location');
      expect(location).toContain('/login');
      expect(location).toContain('error=Invalid+authentication+request');
    });

    it('should handle unexpected exceptions', async () => {
      mockCreateServerComponentClient.mockRejectedValue(new Error('Supabase connection failed'));
      
      const request = createMockRequest('http://localhost:3000/auth/callback?code=auth_code_123');
      
      const response = await GET(request);
      
      expect(response.status).toBe(302);
      const location = response.headers.get('location');
      expect(location).toContain('error=An+unexpected+error+occurred');
    });
  });

  describe('Password Reset Flow', () => {
    beforeEach(() => {
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({ error: null });
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { 
          user: {
            id: 'user-123',
            email: 'test@example.com',
            created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            app_metadata: {
              providers: ['email'],
              provider: 'email'
            }
          }
        } 
      });
    });

    it('should redirect to password reset confirmation for recovery type', async () => {
      const request = createMockRequest('http://localhost:3000/auth/callback?code=recovery_code&type=recovery');
      
      const response = await GET(request);
      
      expect(response.status).toBe(302);
      const location = response.headers.get('location');
      expect(location).toContain('/reset-password/confirm');
    });
  });
}); 