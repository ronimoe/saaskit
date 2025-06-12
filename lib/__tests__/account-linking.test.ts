import {
  checkAccountLinking,
  linkOAuthToExistingAccount,
  generateLinkingToken,
  verifyLinkingToken,
  isAccountLinkingEnabled,
} from '../account-linking';
import { createClient } from '@/utils/supabase/server';
import type { User } from '@supabase/supabase-js';

// Mock Supabase client
jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('Account Linking Utilities', () => {
  const mockSupabaseClient = {
    auth: {
      admin: {
        listUsers: jest.fn(),
        getUserById: jest.fn(),
        updateUserById: jest.fn(),
        deleteUser: jest.fn(),
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockResolvedValue(mockSupabaseClient);
  });

  describe('checkAccountLinking', () => {
    it('returns no linking needed when no existing users found', async () => {
      mockSupabaseClient.auth.admin.listUsers.mockResolvedValue({
        data: { users: [] },
        error: null,
      });

      const result = await checkAccountLinking('test@example.com', 'google');

      expect(result).toEqual({ needsLinking: false });
    });

    it('detects email account that needs OAuth linking', async () => {
      const existingUser = {
        id: 'user-123',
        email: 'test@example.com',
        app_metadata: { providers: ['email'] },
      };

      mockSupabaseClient.auth.admin.listUsers.mockResolvedValue({
        data: { users: [existingUser] },
        error: null,
      });

      const result = await checkAccountLinking('test@example.com', 'google');

      expect(result).toEqual({
        needsLinking: true,
        existingUserId: 'user-123',
        existingAuthMethod: 'email',
        conflictType: 'email_exists',
        message: 'An account with this email already exists. Would you like to link your google account?',
      });
    });

    it('handles API errors gracefully', async () => {
      mockSupabaseClient.auth.admin.listUsers.mockResolvedValue({
        data: null,
        error: { message: 'API Error' },
      });

      const result = await checkAccountLinking('test@example.com', 'google');

      expect(result).toEqual({ needsLinking: false });
    });
  });

  describe('generateLinkingToken and verifyLinkingToken', () => {
    it('generates and verifies valid tokens', () => {
      const email = 'test@example.com';
      const provider = 'google';

      const token = generateLinkingToken(email, provider);
      expect(token).toBeTruthy();

      const verified = verifyLinkingToken(token);
      expect(verified).toEqual({
        email,
        provider,
        timestamp: expect.any(Number),
      });
    });

    it('rejects invalid tokens', () => {
      expect(verifyLinkingToken('invalid-token')).toBeNull();
      expect(verifyLinkingToken('')).toBeNull();
    });
  });

  describe('isAccountLinkingEnabled', () => {
    const originalEnv = process.env.SUPABASE_SERVICE_ROLE_KEY;

    afterEach(() => {
      process.env.SUPABASE_SERVICE_ROLE_KEY = originalEnv;
    });

    it('returns true when service role key is available', () => {
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
      expect(isAccountLinkingEnabled()).toBe(true);
    });

    it('returns false when service role key is missing', () => {
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      expect(isAccountLinkingEnabled()).toBe(false);
    });
  });
}); 