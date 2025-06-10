/**
 * Comprehensive Authentication Utilities
 * 
 * Centralized utilities for all authentication operations including:
 * - OAuth provider authentication
 * - Session refresh and token management  
 * - Admin user management operations
 * - Profile and metadata utilities
 * - Unified type-safe exports with error handling
 */

import type { 
  SupabaseClient,
  User, 
  Session, 
  Provider,
} from '@supabase/supabase-js';
import { 
  createClientComponentClient,
  createServerComponentClient,
  createAdminClient,
  getCurrentUser,
  getCurrentSession,
  authHelpers,
} from '@/lib/supabase';
import type { Database } from '@/types/database';
import { env } from '@/lib/env';
import { ensureStripeCustomer } from '@/lib/stripe-sync';
import { createProfileData } from '@/lib/database-utils';

/**
 * Common auth operation result type
 */
export interface AuthResult<T = unknown> {
  data: T | null;
  error: string | null;
  success: boolean;
}

/**
 * OAuth provider configuration
 */
export interface OAuthOptions {
  redirectTo?: string;
  scopes?: string;
  queryParams?: Record<string, string>;
}

/**
 * User management options for admin operations
 */
export interface UserManagementOptions {
  email: string;
  password?: string;
  userData?: Record<string, unknown>;
  emailConfirm?: boolean;
  role?: string;
}

/**
 * Profile update data structure
 */
export interface ProfileUpdateData {
  email?: string;
  password?: string;
  userData?: Record<string, unknown>;
  appMetadata?: Record<string, unknown>;
}

/**
 * OAuth Provider Authentication Utilities
 */
export const oauthUtils = {
  /**
   * Get available OAuth providers based on environment configuration
   */
  getAvailableProviders(): Provider[] {
    const providers: Provider[] = [];
    
    if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
      providers.push('google');
    }
    
    if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
      providers.push('github');
    }
    
    return providers;
  },

  /**
   * Sign in with OAuth provider
   */
  signInWithProvider: async (
    supabase: SupabaseClient<Database>,
    provider: Provider,
    options: OAuthOptions = {}
  ): Promise<AuthResult<{ url: string }>> => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: options.redirectTo || `${env.NEXT_PUBLIC_APP_URL}/auth/callback`,
          scopes: options.scopes,
          queryParams: options.queryParams,
        },
      });

      if (error) {
        return {
          data: null,
          error: error.message || `Failed to authenticate with ${provider}`,
          success: false,
        };
      }

      return {
        data: { url: data.url },
        error: null,
        success: true,
      };
    } catch (error) {
      console.error(`OAuth ${provider} error:`, error);
      return {
        data: null,
        error: error instanceof Error ? error.message : `Unexpected ${provider} authentication error`,
        success: false,
      };
    }
  },

  /**
   * Sign in with Google (convenience method)
   */
  signInWithGoogle: async (
    supabase: SupabaseClient<Database>,
    options: OAuthOptions = {}
  ) => {
    return oauthUtils.signInWithProvider(supabase, 'google', options);
  },

  /**
   * Sign in with GitHub (convenience method)
   */
  signInWithGitHub: async (
    supabase: SupabaseClient<Database>,
    options: OAuthOptions = {}
  ) => {
    return oauthUtils.signInWithProvider(supabase, 'github', options);
  },

  /**
   * Check if OAuth provider is configured
   */
  isProviderAvailable: (provider: Provider): boolean => {
    return oauthUtils.getAvailableProviders().includes(provider);
  },
};

/**
 * Session Management Utilities
 */
export const sessionUtils = {
  /**
   * Manually refresh the current session
   */
  refreshSession: async (
    supabase: SupabaseClient<Database>
  ): Promise<AuthResult<Session>> => {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        return {
          data: null,
          error: error.message || 'Failed to refresh session',
          success: false,
        };
      }

      return {
        data: data.session,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Session refresh error:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unexpected session refresh error',
        success: false,
      };
    }
  },

  /**
   * Check if session is expired or about to expire
   */
  isSessionExpired: (session: Session | null, bufferMinutes: number = 5): boolean => {
    if (!session || !session.expires_at) {
      return true;
    }

    const expiresAt = session.expires_at * 1000; // Convert to milliseconds
    const now = Date.now();
    const bufferMs = bufferMinutes * 60 * 1000;

    return expiresAt - now < bufferMs;
  },

  /**
   * Get session expiry information
   */
  getSessionInfo: (session: Session | null) => {
    if (!session || !session.expires_at) {
      return {
        isValid: false,
        expiresAt: null,
        expiresIn: null,
        timeUntilExpiry: null,
      };
    }

    const expiresAt = new Date(session.expires_at * 1000);
    const now = new Date();
    const timeUntilExpiry = expiresAt.getTime() - now.getTime();

    return {
      isValid: timeUntilExpiry > 0,
      expiresAt,
      expiresIn: session.expires_in,
      timeUntilExpiry: Math.max(0, timeUntilExpiry),
    };
  },

  /**
   * Auto-refresh session if needed
   */
  ensureValidSession: async (
    supabase: SupabaseClient<Database>,
    bufferMinutes: number = 5
  ): Promise<AuthResult<Session>> => {
    try {
      const currentSession = await getCurrentSession(supabase);
      
      if (!currentSession) {
        return {
          data: null,
          error: 'No active session',
          success: false,
        };
      }

      if (sessionUtils.isSessionExpired(currentSession, bufferMinutes)) {
        return sessionUtils.refreshSession(supabase);
      }

      return {
        data: currentSession,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Session validation error:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Session validation failed',
        success: false,
      };
    }
  },
};

/**
 * Admin User Management Utilities (Server-side only)
 */
export const adminUtils = {
  /**
   * Create a new user (admin operation)
   */
  createUser: async (
    options: UserManagementOptions
  ): Promise<AuthResult<User>> => {
    try {
      const adminClient = createAdminClient();
      
      const { data, error } = await adminClient.auth.admin.createUser({
        email: options.email,
        password: options.password,
        user_metadata: options.userData || {},
        email_confirm: options.emailConfirm ?? false,
      });

      if (error) {
        return {
          data: null,
          error: error.message || 'Failed to create user',
          success: false,
        };
      }

      // Set role if provided
      if (options.role && data.user) {
        await adminUtils.updateUserRole(data.user.id, options.role);
      }

      return {
        data: data.user,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Admin create user error:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unexpected user creation error',
        success: false,
      };
    }
  },

  /**
   * Delete a user (admin operation)
   */
  deleteUser: async (userId: string): Promise<AuthResult<void>> => {
    try {
      const adminClient = createAdminClient();
      
      const { error } = await adminClient.auth.admin.deleteUser(userId);

      if (error) {
        return {
          data: null,
          error: error.message || 'Failed to delete user',
          success: false,
        };
      }

      return {
        data: null,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Admin delete user error:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unexpected user deletion error',
        success: false,
      };
    }
  },

  /**
   * Get user by ID (admin operation)
   */
  getUserById: async (userId: string): Promise<AuthResult<User>> => {
    try {
      const adminClient = createAdminClient();
      
      const { data, error } = await adminClient.auth.admin.getUserById(userId);

      if (error) {
        return {
          data: null,
          error: error.message || 'Failed to get user',
          success: false,
        };
      }

      return {
        data: data.user,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Admin get user error:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unexpected get user error',
        success: false,
      };
    }
  },

  /**
   * List users with pagination (admin operation)
   */
  listUsers: async (
    page: number = 1,
    perPage: number = 50
  ): Promise<AuthResult<{ users: User[]; total: number; page: number; perPage: number }>> => {
    try {
      const adminClient = createAdminClient();
      
      const { data, error } = await adminClient.auth.admin.listUsers({
        page,
        perPage,
      });

      if (error) {
        return {
          data: null,
          error: error.message || 'Failed to list users',
          success: false,
        };
      }

      return {
        data: {
          users: data.users,
          total: data.total ?? data.users.length,
          page,
          perPage,
        },
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Admin list users error:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unexpected list users error',
        success: false,
      };
    }
  },

  /**
   * Update user metadata (admin operation)
   */
  updateUserMetadata: async (
    userId: string,
    metadata: Record<string, unknown>
  ): Promise<AuthResult<User>> => {
    try {
      const adminClient = createAdminClient();
      
      const { data, error } = await adminClient.auth.admin.updateUserById(userId, {
        user_metadata: metadata,
      });

      if (error) {
        return {
          data: null,
          error: error.message || 'Failed to update user metadata',
          success: false,
        };
      }

      return {
        data: data.user,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Admin update user metadata error:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unexpected update metadata error',
        success: false,
      };
    }
  },

  /**
   * Update user role (admin operation)
   */
  updateUserRole: async (
    userId: string,
    role: string
  ): Promise<AuthResult<User>> => {
    try {
      const adminClient = createAdminClient();
      
      const { data, error } = await adminClient.auth.admin.updateUserById(userId, {
        user_metadata: { role },
      });

      if (error) {
        return {
          data: null,
          error: error.message || 'Failed to update user role',
          success: false,
        };
      }

      return {
        data: data.user,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Admin update user role error:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unexpected update role error',
        success: false,
      };
    }
  },

  /**
   * Send password reset email to user (admin operation)
   */
  sendPasswordResetEmail: async (
    email: string,
    redirectTo?: string
  ): Promise<AuthResult<void>> => {
    try {
      const adminClient = createAdminClient();
      
      const { error } = await adminClient.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo || `${env.NEXT_PUBLIC_APP_URL}/reset-password/confirm`,
      });

      if (error) {
        return {
          data: null,
          error: error.message || 'Failed to send password reset email',
          success: false,
        };
      }

      return {
        data: null,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Admin password reset error:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unexpected password reset error',
        success: false,
      };
    }
  },
};

/**
 * Profile Management Utilities
 */
export const profileUtils = {
  /**
   * Update user profile
   */
  updateProfile: async (
    supabase: SupabaseClient<Database>,
    updates: ProfileUpdateData
  ): Promise<AuthResult<User>> => {
    try {
      const updateData: Record<string, unknown> = {};

      if (updates.email) {
        updateData.email = updates.email;
      }

      if (updates.password) {
        updateData.password = updates.password;
      }

      if (updates.userData) {
        updateData.data = updates.userData;
      }

      const { data, error } = await supabase.auth.updateUser(updateData);

      if (error) {
        return {
          data: null,
          error: error.message || 'Failed to update profile',
          success: false,
        };
      }

      return {
        data: data.user,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unexpected profile update error',
        success: false,
      };
    }
  },

  /**
   * Get current user profile
   */
  getCurrentProfile: async (
    supabase: SupabaseClient<Database>
  ): Promise<AuthResult<User>> => {
    try {
      const user = await getCurrentUser(supabase);

      if (!user) {
        return {
          data: null,
          error: 'No authenticated user',
          success: false,
        };
      }

      return {
        data: user,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Get profile error:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unexpected get profile error',
        success: false,
      };
    }
  },

  /**
   * Update user avatar/photo
   */
  updateAvatar: async (
    supabase: SupabaseClient<Database>,
    avatarUrl: string
  ): Promise<AuthResult<User>> => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl },
      });

      if (error) {
        return {
          data: null,
          error: error.message || 'Failed to update avatar',
          success: false,
        };
      }

      return {
        data: data.user,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Avatar update error:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unexpected avatar update error',
        success: false,
      };
    }
  },
};

/**
 * Enhanced Authentication Status Utilities
 */
export const authStatusUtils = {
  /**
   * Get comprehensive auth status
   */
  getAuthStatus: async (
    supabase: SupabaseClient<Database>
  ): Promise<{
    isAuthenticated: boolean;
    user: User | null;
    session: Session | null;
    sessionInfo: ReturnType<typeof sessionUtils.getSessionInfo>;
    error: string | null;
  }> => {
    try {
      const session = await getCurrentSession(supabase);
      const user = session?.user || null;
      const sessionInfo = sessionUtils.getSessionInfo(session);

      return {
        isAuthenticated: !!user && sessionInfo.isValid,
        user,
        session,
        sessionInfo,
        error: null,
      };
    } catch (error) {
      console.error('Auth status error:', error);
      return {
        isAuthenticated: false,
        user: null,
        session: null,
        sessionInfo: sessionUtils.getSessionInfo(null),
        error: error instanceof Error ? error.message : 'Unknown auth status error',
      };
    }
  },

  /**
   * Check if user has specific role
   */
  hasRole: (user: User | null, requiredRole: string): boolean => {
    if (!user || !user.user_metadata) {
      return false;
    }

    const userRole = user.user_metadata.role || 'user';

    // Simple role hierarchy: admin > user
    if (requiredRole === 'user') {
      return ['user', 'admin'].includes(userRole);
    }

    if (requiredRole === 'admin') {
      return userRole === 'admin';
    }

    return userRole === requiredRole;
  },

  /**
   * Check if user can access resource
   */
  canAccessResource: (
    user: User | null,
    resourceId: string,
    action: 'read' | 'write' | 'delete'
  ): boolean => {
    if (!user) {
      return false;
    }

    // Admin can access everything
    if (authStatusUtils.hasRole(user, 'admin')) {
      return true;
    }

    // For now, authenticated users can read
    return action === 'read';
  },
};

/**
 * Customer Creation Utilities
 */
export const customerUtils = {
  /**
   * Ensure a user has both a Stripe customer and profile
   * Used as a fallback when callback creation fails
   */
  ensureCustomerAndProfile: async (
    userId: string,
    email: string
  ): Promise<AuthResult<{ stripeCustomerId: string; profileId?: string }>> => {
    try {
      const supabase = await createServerComponentClient();

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      // Ensure Stripe customer exists
      const stripeCustomerId = await ensureStripeCustomer(userId, email);

      // Create profile if it doesn't exist
      let profileId = existingProfile?.id;
      
      if (!existingProfile) {
        const profileData = createProfileData(userId, email);
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .insert(profileData)
          .select()
          .single();

        if (profileError) {
          console.error('[CUSTOMER UTILS] Profile creation failed:', profileError);
          return {
            data: { stripeCustomerId },
            error: 'Failed to create profile',
            success: false,
          };
        }

        profileId = profile.id;
      }

      return {
        data: { stripeCustomerId, profileId },
        error: null,
        success: true,
      };

    } catch (error) {
      console.error('[CUSTOMER UTILS] Error ensuring customer and profile:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unexpected error',
        success: false,
      };
    }
  },
};

/**
 * Unified Authentication Utilities Export
 * 
 * Re-exports existing utilities and provides new enhanced utilities
 */
export const authUtils = {
  // Re-export existing utilities
  ...authHelpers,
  getCurrentUser,
  getCurrentSession,

  // Enhanced utilities
  oauth: oauthUtils,
  session: sessionUtils,
  admin: adminUtils,
  profile: profileUtils,
  status: authStatusUtils,
  customer: customerUtils,

  // Convenience methods
  createClientForComponent: createClientComponentClient,
  createClientForServer: createServerComponentClient,
  createAdminClient,
};

// Default export for easy import
export default authUtils;

/**
 * Type exports for external use
 */
export type { Database }; 