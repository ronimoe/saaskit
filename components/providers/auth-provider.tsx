'use client';

/**
 * Authentication Provider Component
 * 
 * Provides authentication context to the entire application.
 * Initializes the auth store and manages auth state synchronization with Supabase.
 */

import React, { useEffect, createContext, useContext } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const {
    user,
    session,
    isLoading,
    isInitialized,
    error,
    initialize,
    signOut,
    clearAuth,
  } = useAuthStore();

  const isAuthenticated = !!user;

  // Initialize auth state on mount
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  // Context value
  const value: AuthContextValue = {
    user,
    session,
    isLoading,
    isInitialized,
    error,
    isAuthenticated,
    signOut,
    clearAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use the auth context
 * Provides type-safe access to authentication state and methods
 */
export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
}

/**
 * Higher-order component for requiring authentication
 * Wraps components that need authentication
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  const AuthenticatedComponent = (props: P) => {
    const { isAuthenticated, isLoading, isInitialized } = useAuthContext();

    // Show loading while initializing
    if (!isInitialized || isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      // In a real app, you might want to redirect to a login page
      // For now, we'll just show a message
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="text-gray-600">Please sign in to access this page.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };

  // Set display name for debugging
  AuthenticatedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;

  return AuthenticatedComponent;
}

/**
 * Hook for conditional rendering based on auth state
 * Useful for showing different content to authenticated vs non-authenticated users
 */
export function useAuthGuard() {
  const { isAuthenticated, isLoading, isInitialized, user } = useAuthContext();

  return {
    isAuthenticated,
    isLoading,
    isInitialized,
    user,
    // Helper flags
    isReady: isInitialized && !isLoading,
    canShowAuthenticatedContent: isInitialized && !isLoading && isAuthenticated,
    canShowUnauthenticatedContent: isInitialized && !isLoading && !isAuthenticated,
    shouldShowLoading: !isInitialized || isLoading,
  };
}

/**
 * Hook for protecting routes at the component level
 * Provides redirect functionality and role-based access
 */
export function useRouteProtection(options: {
  requireAuth?: boolean;
  redirectTo?: string;
  requiredRole?: string;
  onUnauthorized?: () => void;
} = {}) {
  const { 
    isAuthenticated, 
    isLoading, 
    isInitialized, 
    user 
  } = useAuthContext();

  const {
    requireAuth = true,
    redirectTo = '/login',
    requiredRole,
    onUnauthorized,
  } = options;

  const checkAccess = React.useCallback(() => {
    // Still loading, don't make decisions yet
    if (!isInitialized || isLoading) {
      return { canAccess: null, reason: 'loading' };
    }

    // Check authentication requirement
    if (requireAuth && !isAuthenticated) {
      return { canAccess: false, reason: 'not_authenticated' };
    }

    // Check role requirement
    if (requiredRole && (!user || !hasUserRole(user, requiredRole))) {
      return { canAccess: false, reason: 'insufficient_role' };
    }

    return { canAccess: true, reason: 'authorized' };
  }, [isAuthenticated, isLoading, isInitialized, user, requireAuth, requiredRole]);

  const accessResult = checkAccess();

  // Handle unauthorized access
  React.useEffect(() => {
    if (accessResult.canAccess === false) {
      if (onUnauthorized) {
        onUnauthorized();
      } else if (typeof window !== 'undefined') {
        // Only redirect on client side
        const currentPath = window.location.pathname;
        const redirectUrl = redirectTo.includes('?') 
          ? `${redirectTo}&returnTo=${encodeURIComponent(currentPath)}`
          : `${redirectTo}?returnTo=${encodeURIComponent(currentPath)}`;
        
        window.location.href = redirectUrl;
      }
    }
  }, [accessResult.canAccess, accessResult.reason, onUnauthorized, redirectTo]);

  return {
    canAccess: accessResult.canAccess,
    reason: accessResult.reason,
    isLoading: !isInitialized || isLoading,
    isAuthenticated,
    user,
  };
}

/**
 * Helper function to check user roles
 * Implement this based on your user metadata structure
 */
function hasUserRole(user: User | null, requiredRole: string): boolean {
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
}

/**
 * Component wrapper for route protection
 * Alternative to withAuth HOC with more flexible options
 */
export function ProtectedRoute({
  children,
  fallback,
  requireAuth = true,
  requiredRole,
  redirectTo = '/login',
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: string;
  redirectTo?: string;
}) {
  const { canAccess, isLoading } = useRouteProtection({
    requireAuth,
    requiredRole,
    redirectTo,
  });

  // Show loading state
  if (isLoading || canAccess === null) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )
    );
  }

  // Show unauthorized state
  if (canAccess === false) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
} 