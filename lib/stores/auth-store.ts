/**
 * Authentication Store with Zustand
 * 
 * Manages global authentication state including user data, loading states,
 * and error handling. Integrates with Supabase Auth for session management.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';

interface AuthState {
  // State
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setInitialized: (initialized: boolean) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      // Initial state
      user: null,
      session: null,
      isLoading: true,
      isInitialized: false,
      error: null,

      // Actions
      setUser: (user) => {
        set(
          { user, error: null },
          false,
          'auth/setUser'
        );
      },

      setSession: (session) => {
        set(
          { 
            session,
            user: session?.user ?? null,
            error: null
          },
          false,
          'auth/setSession'
        );
      },

      setLoading: (loading) => {
        set(
          { isLoading: loading },
          false,
          'auth/setLoading'
        );
      },

      setError: (error) => {
        set(
          { error, isLoading: false },
          false,
          'auth/setError'
        );
      },

      setInitialized: (initialized) => {
        set(
          { isInitialized: initialized },
          false,
          'auth/setInitialized'
        );
      },

      initialize: async () => {
        try {
          set({ isLoading: true, error: null }, false, 'auth/initialize/start');
          
          const supabase = createClient();
          
          // Get initial session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            throw sessionError;
          }

          set(
            {
              session,
              user: session?.user ?? null,
              isLoading: false,
              isInitialized: true,
              error: null
            },
            false,
            'auth/initialize/success'
          );

          // Set up auth state listener
          supabase.auth.onAuthStateChange(
            async (event, session) => {
              console.log('Auth state changed:', event, session?.user?.email);
              
              set(
                {
                  session,
                  user: session?.user ?? null,
                  isLoading: false,
                  error: null
                },
                false,
                `auth/stateChange/${event}`
              );
            }
          );

          // Note: In a real app, you might want to store the subscription for cleanup
          
        } catch (error) {
          console.error('Auth initialization error:', error);
          set(
            {
              error: error instanceof Error ? error.message : 'Failed to initialize auth',
              isLoading: false,
              isInitialized: true
            },
            false,
            'auth/initialize/error'
          );
        }
      },

      signOut: async () => {
        try {
          set({ isLoading: true, error: null }, false, 'auth/signOut/start');
          
          const supabase = createClient();
          const { error } = await supabase.auth.signOut();
          
          if (error) {
            throw error;
          }

          set(
            {
              user: null,
              session: null,
              isLoading: false,
              error: null
            },
            false,
            'auth/signOut/success'
          );
          
        } catch (error) {
          console.error('Sign out error:', error);
          set(
            {
              error: error instanceof Error ? error.message : 'Failed to sign out',
              isLoading: false
            },
            false,
            'auth/signOut/error'
          );
        }
      },

      clearAuth: () => {
        set(
          {
            user: null,
            session: null,
            isLoading: false,
            error: null
          },
          false,
          'auth/clearAuth'
        );
      },
    }),
    {
      name: 'auth-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// Derived state selectors for common use cases
export const useAuth = () => {
  const {
    user,
    session,
    isLoading,
    isInitialized,
    error,
    signOut,
    clearAuth,
  } = useAuthStore();

  return {
    user,
    session,
    isLoading,
    isInitialized,
    error,
    isAuthenticated: !!user,
    signOut,
    clearAuth,
  };
};

// Selector hooks for specific state slices to prevent unnecessary re-renders
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useAuthSession = () => useAuthStore((state) => state.session);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
export const useAuthInitialized = () => useAuthStore((state) => state.isInitialized);
export const useIsAuthenticated = () => useAuthStore((state) => !!state.user); 