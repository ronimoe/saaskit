import { type NextRequest } from 'next/server';
import type { User, Session } from '@supabase/supabase-js';
import { createMiddlewareClient } from '@/lib/supabase';

/**
 * Authentication Middleware Helpers
 * 
 * Reusable utilities for route protection and authentication checks.
 */

export interface AuthMiddlewareResult {
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  error: string | null;
}

/**
 * Get authentication status from middleware request
 */
export async function getAuthStatus(request: NextRequest): Promise<AuthMiddlewareResult> {
  try {
    const { supabase } = createMiddlewareClient(request);
    
    // Use getUser() instead of getSession() for security
    // This authenticates the data by contacting the Supabase Auth server
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      return {
        isAuthenticated: false,
        user: null,
        session: null,
        error: userError.message,
      };
    }

    // Get session separately if needed (but don't rely on it for auth)
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return {
      isAuthenticated: !!user,
      user: user || null,
      session,
      error: null,
    };
  } catch (error) {
    return {
      isAuthenticated: false,
      user: null,
      session: null,
      error: error instanceof Error ? error.message : 'Unknown authentication error',
    };
  }
}

/**
 * Route configuration for authentication
 */
export const routeConfig = {
  protected: [
    '/profile',
    '/dashboard',
    '/settings',
    '/admin',
  ],
  auth: [
    '/login',
    '/signup',
    '/reset-password',
    '/verify-email',
  ],
  public: [
    '/',
    '/about',
    '/contact',
    '/pricing',
    '/features',
    '/terms',
    '/privacy',
    '/api', // API routes handle their own auth
  ],
} as const;

/**
 * Check if a path matches any of the route patterns
 */
export function matchesRoutePattern(path: string, patterns: readonly string[]): boolean {
  return patterns.some(pattern => {
    // Exact match
    if (pattern === path) {
      return true;
    }
    
    // Pattern with wildcard (e.g., '/profile' matches '/profile/settings')
    if (path.startsWith(pattern + '/')) {
      return true;
    }
    
    return false;
  });
}

/**
 * Determine the route type
 */
export function getRouteType(path: string): 'protected' | 'auth' | 'public' | 'other' {
  if (matchesRoutePattern(path, routeConfig.protected)) {
    return 'protected';
  }
  
  if (matchesRoutePattern(path, routeConfig.auth)) {
    return 'auth';
  }
  
  if (matchesRoutePattern(path, routeConfig.public)) {
    return 'public';
  }
  
  return 'other';
}

/**
 * Create a login URL with return path
 */
export function createLoginUrl(baseUrl: string, returnPath?: string): URL {
  const loginUrl = new URL('/login', baseUrl);
  
  if (returnPath && getRouteType(returnPath) === 'protected') {
    loginUrl.searchParams.set('returnTo', returnPath);
  }
  
  return loginUrl;
}

/**
 * Create a redirect URL after successful authentication
 */
export function createPostAuthRedirectUrl(baseUrl: string, returnPath?: string): URL {
  // If there's a valid return path, use it
  if (returnPath && getRouteType(returnPath) === 'protected') {
    return new URL(returnPath, baseUrl);
  }
  
  // Default redirect to profile
  return new URL('/profile', baseUrl);
}

/**
 * Enhanced route protection hook for components
 */
export interface RouteGuardOptions {
  redirectTo?: string;
  allowUnauthenticated?: boolean;
  requiredRole?: string;
  onUnauthorized?: () => void;
}

/**
 * Server-side auth utilities for route handlers and server components
 */
export const serverAuthUtils = {
  /**
   * Check if user has required role (implement based on your role system)
   */
  hasRole: (user: User | null, requiredRole: string): boolean => {
    // Implement role checking logic based on your user structure
    // This is a placeholder - adapt to your role system
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
    
    return false;
  },

  /**
   * Check if user can access a specific resource
   */
  canAccessResource: (user: User | null, resourceId: string, action: 'read' | 'write' | 'delete'): boolean => {
    // Implement resource-level permissions
    // This is a placeholder - adapt to your permission system
    if (!user) {
      return false;
    }
    
    // Admin can access everything
    if (serverAuthUtils.hasRole(user, 'admin')) {
      return true;
    }
    
    // For now, authenticated users can read their own resources
    // You would implement more sophisticated logic here
    return action === 'read';
  },
}; 