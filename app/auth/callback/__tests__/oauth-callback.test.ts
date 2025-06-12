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

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  createServerComponentClient: jest.fn(),
}));

jest.mock('@/lib/customer-service', () => ({
  ensureCustomerExists: jest.fn(),
}));

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
      const request = new NextRequest('http://localhost:3000/auth/callback?error=access_denied&error_description=User%20cancelled');
      
      const response = await GET(request);
      
      expect(response.status).toBe(302);
      const location = response.headers.get('location');
      expect(location).toContain('/login');
      expect(location).toContain('error=You%20cancelled%20the%20sign-in%20process');
    });

    it('should handle invalid_grant error with specific message', async () => {
      const request = new NextRequest('http://localhost:3000/auth/callback?error=invalid_grant');
      
      const response = await GET(request);
      
      expect(response.status).toBe(302);
      const location = response.headers.get('location');
      expect(location).toContain('error=The%20authorization%20code%20is%20invalid%20or%20expired');
    });

    it('should handle server_error with Google-specific message', async () => {
      const request = new NextRequest('http://localhost:3000/auth/callback?error=server_error');
      
      const response = await GET(request);
      
      expect(response.status).toBe(302);
      const location = response.headers.get('location');
      expect(location).toContain('error=Google%20encountered%20an%20error%20during%20sign-in');
    });

    it('should handle unknown errors with error description', async () => {
      const request = new NextRequest('http://localhost:3000/auth/callback?error=unknown_error&error_description=Custom%20error%20message');
      
      const response = await GET(request);
      
      expect(response.status).toBe(302);
      const location = response.headers.get('location');
      expect(location).toContain('error=Custom%20error%20message');
    });

    it('should handle unknown errors without description', async () => {
      const request = new NextRequest('http://localhost:3000/auth/callback?error=unknown_error');
      
      const response = await GET(request);
      
      expect(response.status).toBe(302);
      const location = response.headers.get('location');
      expect(location).toContain('error=An%20error%20occurred%20during%20sign-in');
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
      const request = new NextRequest('http://localhost:3000/auth/callback?code=auth_code_123');
      
      const response = await GET(request);
      
      expect(response.status).toBe(302);
      expect(mockEnsureCustomerExists).toHaveBeenCalledWith(
        'user-123',
        'test@example.com',
        'Test User'
      );
      
      const location = response.headers.get('location');
      expect(location).toContain('message=Successfully%20signed%20up%20with%20Google');
    });

    it('should detect OAuth signin for existing Google user', async () => {
      // Mock existing user (created more than 1 minute ago)
      const existingUser = {
        ...mockUser,
        created_at: new Date(Date.now() - 120000).toISOString() // 2 minutes ago
      };
      
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: existingUser } });
      
      const request = new NextRequest('http://localhost:3000/auth/callback?code=auth_code_123');
      
      const response = await GET(request);
      
      expect(response.status).toBe(302);
      expect(mockEnsureCustomerExists).not.toHaveBeenCalled();
      
      const location = response.headers.get('location');
      expect(location).toContain('message=Successfully%20signed%20in%20with%20Google');
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
      
      const request = new NextRequest('http://localhost:3000/auth/callback?code=auth_code_123&type=signup');
      
      const response = await GET(request);
      
      expect(response.status).toBe(302);
      expect(mockEnsureCustomerExists).toHaveBeenCalled();
      
      const location = response.headers.get('location');
      expect(location).toContain('message=Email%20confirmed%20successfully');
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
      
      const request = new NextRequest('http://localhost:3000/auth/callback?code=expired_code');
      
      const response = await GET(request);
      
      expect(response.status).toBe(302);
      const location = response.headers.get('location');
      expect(location).toContain('error=The%20authorization%20code%20is%20invalid%20or%20expired');
    });

    it('should handle network exchange error', async () => {
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
        error: { message: 'network error: Connection timeout' }
      });
      
      const request = new NextRequest('http://localhost:3000/auth/callback?code=valid_code');
      
      const response = await GET(request);
      
      expect(response.status).toBe(302);
      const location = response.headers.get('location');
      expect(location).toContain('error=Network%20error%20during%20authentication');
    });

    it('should handle generic exchange error', async () => {
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
        error: { message: 'Unknown error occurred' }
      });
      
      const request = new NextRequest('http://localhost:3000/auth/callback?code=valid_code');
      
      const response = await GET(request);
      
      expect(response.status).toBe(302);
      const location = response.headers.get('location');
      expect(location).toContain('error=Authentication%20failed');
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
      
      const request = new NextRequest('http://localhost:3000/auth/callback?code=auth_code_123');
      
      const response = await GET(request);
      
      expect(response.status).toBe(302);
      expect(mockEnsureCustomerExists).toHaveBeenCalled();
      
      // Should still redirect to profile even if customer creation failed
      const location = response.headers.get('location');
      expect(location).toContain('/profile');
    });

    it('should continue auth flow if customer creation throws exception', async () => {
      mockEnsureCustomerExists.mockRejectedValue(new Error('Database connection failed'));
      
      const request = new NextRequest('http://localhost:3000/auth/callback?code=auth_code_123');
      
      const response = await GET(request);
      
      expect(response.status).toBe(302);
      
      // Should still redirect to profile even if customer creation threw error
      const location = response.headers.get('location');
      expect(location).toContain('/profile');
    });
  });

  describe('Invalid Requests', () => {
    it('should handle missing code parameter', async () => {
      const request = new NextRequest('http://localhost:3000/auth/callback');
      
      const response = await GET(request);
      
      expect(response.status).toBe(302);
      const location = response.headers.get('location');
      expect(location).toContain('/login');
      expect(location).toContain('error=Invalid%20authentication%20request');
    });

    it('should handle unexpected exceptions', async () => {
      mockCreateServerComponentClient.mockRejectedValue(new Error('Supabase connection failed'));
      
      const request = new NextRequest('http://localhost:3000/auth/callback?code=auth_code_123');
      
      const response = await GET(request);
      
      expect(response.status).toBe(302);
      const location = response.headers.get('location');
      expect(location).toContain('error=An%20unexpected%20error%20occurred');
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
      const request = new NextRequest('http://localhost:3000/auth/callback?code=recovery_code&type=recovery');
      
      const response = await GET(request);
      
      expect(response.status).toBe(302);
      const location = response.headers.get('location');
      expect(location).toContain('/reset-password/confirm');
    });
  });
}); 