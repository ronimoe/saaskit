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