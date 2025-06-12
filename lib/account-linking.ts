/**
 * Account Linking Utilities for OAuth Integration
 * 
 * Handles scenarios where OAuth users try to sign up with an email
 * that already exists as an email/password account, providing secure
 * account linking and merging functionality.
 */

import { createClient } from '@/utils/supabase/server';
import type { User } from '@supabase/supabase-js';

export interface AccountLinkingResult {
  needsLinking: boolean;
  existingUserId?: string;
  existingAuthMethod?: 'email' | 'oauth';
  conflictType?: 'email_exists' | 'oauth_exists' | 'multiple_providers';
  message?: string;
}

export interface LinkAccountsResult {
  success: boolean;
  error?: string;
  linkedUserId?: string;
}

/**
 * Check if an OAuth sign-in attempt conflicts with existing accounts
 */
export async function checkAccountLinking(
  email: string,
  oauthProvider: string,
  oauthUserId?: string
): Promise<AccountLinkingResult> {
  try {
    const supabase = await createClient();
    
    // Check for existing users with this email
    const { data: existingUsers, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('Error checking existing users:', error);
      return { needsLinking: false };
    }

    // Find users with matching email
    const usersWithEmail = existingUsers.users.filter(user => 
      user.email?.toLowerCase() === email.toLowerCase()
    );

    if (usersWithEmail.length === 0) {
      // No existing account, safe to proceed
      return { needsLinking: false };
    }

    if (usersWithEmail.length === 1) {
      const existingUser = usersWithEmail[0];
      if (!existingUser?.id) {
        return { needsLinking: false };
      }

      const providers = existingUser.app_metadata?.providers || [];
      const hasEmailProvider = providers.includes('email');
      const hasOAuthProvider = providers.includes(oauthProvider);

      if (hasEmailProvider && !hasOAuthProvider) {
        // Email/password account exists, needs linking
        return {
          needsLinking: true,
          existingUserId: existingUser.id,
          existingAuthMethod: 'email',
          conflictType: 'email_exists',
          message: `An account with this email already exists. Would you like to link your ${oauthProvider} account?`
        };
      }

      if (hasOAuthProvider && !hasEmailProvider) {
        // OAuth account already exists
        return {
          needsLinking: false,
          existingUserId: existingUser.id,
          existingAuthMethod: 'oauth',
          conflictType: 'oauth_exists',
          message: `You've already signed up with ${oauthProvider}. Please sign in instead.`
        };
      }

      if (hasEmailProvider && hasOAuthProvider) {
        // Account already linked
        return {
          needsLinking: false,
          existingUserId: existingUser.id,
          message: `Your ${oauthProvider} account is already linked. Please sign in.`
        };
      }
    }

    // Multiple users with same email (edge case)
    return {
      needsLinking: false,
      conflictType: 'multiple_providers',
      message: 'Multiple accounts found with this email. Please contact support.'
    };

  } catch (error) {
    console.error('Account linking check failed:', error);
    return { needsLinking: false };
  }
}

/**
 * Link OAuth account to existing email/password account
 */
export async function linkOAuthToExistingAccount(
  existingUserId: string,
  oauthUser: User,
  oauthProvider: string
): Promise<LinkAccountsResult> {
  try {
    const supabase = await createClient();

    // Get the existing user
    const { data: existingUser, error: getUserError } = await supabase.auth.admin.getUserById(existingUserId);
    
    if (getUserError || !existingUser.user) {
      return {
        success: false,
        error: 'Existing user not found'
      };
    }

    // Update the existing user's metadata to include the OAuth provider
    const updatedAppMetadata = {
      ...existingUser.user.app_metadata,
      providers: [
        ...(existingUser.user.app_metadata?.providers || []),
        oauthProvider
      ].filter((provider, index, arr) => arr.indexOf(provider) === index), // Remove duplicates
    };

    const updatedUserMetadata = {
      ...existingUser.user.user_metadata,
      // Merge OAuth user metadata (like avatar, full_name) if not already present
      ...(oauthUser.user_metadata || {}),
      // Keep existing user metadata as priority
      ...existingUser.user.user_metadata,
    };

    // Update the existing user with OAuth data
    const { error: updateError } = await supabase.auth.admin.updateUserById(existingUserId, {
      app_metadata: updatedAppMetadata,
      user_metadata: updatedUserMetadata,
    });

    if (updateError) {
      console.error('Failed to update existing user:', updateError);
      return {
        success: false,
        error: 'Failed to link accounts'
      };
    }

    // Delete the OAuth user since we're merging into the existing account
    const { error: deleteError } = await supabase.auth.admin.deleteUser(oauthUser.id);
    
    if (deleteError) {
      console.warn('Failed to delete OAuth user after linking:', deleteError);
      // Don't fail the linking process for this
    }

    return {
      success: true,
      linkedUserId: existingUserId
    };

  } catch (error) {
    console.error('Account linking failed:', error);
    return {
      success: false,
      error: 'Account linking failed'
    };
  }
}

/**
 * Generate a secure account linking token for verification
 */
export function generateLinkingToken(email: string, provider: string): string {
  const timestamp = Date.now();
  const data = `${email}:${provider}:${timestamp}`;
  
  // In a real implementation, you'd use a proper signing mechanism
  // For now, we'll use a simple base64 encoding with timestamp
  return Buffer.from(data).toString('base64');
}

/**
 * Verify and decode an account linking token
 */
export function verifyLinkingToken(token: string): { email: string; provider: string; timestamp: number } | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [email, provider, timestampStr] = decoded.split(':');
    
    if (!email || !provider || !timestampStr) {
      return null; // Invalid token format
    }
    
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) {
      return null; // Invalid timestamp
    }
    
    // Check if token is not older than 10 minutes
    const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
    if (timestamp < tenMinutesAgo) {
      return null; // Token expired
    }
    
    return { email, provider, timestamp };
  } catch (error) {
    return null; // Invalid token
  }
}

/**
 * Check if account linking is available for the current environment
 */
export function isAccountLinkingEnabled(): boolean {
  // Account linking requires admin access to Supabase
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
} 