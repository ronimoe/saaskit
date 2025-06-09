/**
 * Supabase Client Configuration
 * 
 * This module provides Supabase client instances for different contexts:
 * - Client-side operations (browser)
 * - Server-side operations (API routes, server components)
 * - Server actions and middleware
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { type Database } from '../types/database';
import { env } from './env';
import { NextRequest, NextResponse } from 'next/server';

// Export the database type for use throughout the app
export type { Database } from '../types/database';

/**
 * Client-side Supabase client
 * Use this in client components, browser-side operations
 */
export const createClientComponentClient = (): SupabaseClient<Database> => {
  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  );
};

/**
 * Server Component client
 * Use this in server components where you need to access user data
 */
export const createServerComponentClient = async (): Promise<SupabaseClient<Database>> => {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  
  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // Handle cases where cookies cannot be set (e.g., in middleware)
            console.warn('Failed to set cookies:', error);
          }
        },
      },
    }
  );
};

/**
 * Route Handler client
 * Use this in API routes (app/api/*)
 */
export const createRouteHandlerClient = async (): Promise<SupabaseClient<Database>> => {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  
  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
};

/**
 * Middleware client
 * Use this in middleware.ts for authentication checks
 */
export const createMiddlewareClient = (
  request: NextRequest
): { supabase: SupabaseClient<Database>; response: NextResponse } => {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  return { supabase, response };
};

/**
 * Admin client (server-side only)
 * Use this for administrative operations that bypass RLS
 * NEVER expose this to the client side
 */
export const createAdminClient = (): SupabaseClient<Database> => {
  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};

/**
 * Utility function to get the current user from any Supabase client
 */
export const getCurrentUser = async (supabase: SupabaseClient<Database>) => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Unexpected error getting current user:', error);
    return null;
  }
};

/**
 * Utility function to get the current session from any Supabase client
 */
export const getCurrentSession = async (supabase: SupabaseClient<Database>) => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error('Error getting current session:', error);
      return null;
    }

    return session;
  } catch (error) {
    console.error('Unexpected error getting current session:', error);
    return null;
  }
};

/**
 * Type-safe helper for handling Supabase responses
 */
export const handleSupabaseResponse = <T>(
  response: { data: T | null; error: Error | null }
): { data: T; error: null } | { data: null; error: string } => {
  if (response.error) {
    console.error('Supabase error:', response.error);
    return {
      data: null,
      error: response.error.message || 'An unexpected error occurred',
    };
  }

  if (!response.data) {
    return {
      data: null,
      error: 'No data returned',
    };
  }

  return {
    data: response.data,
    error: null,
  };
};

/**
 * Auth state management helpers
 */
export const authHelpers = {
  /**
   * Sign in with email and password
   */
  signInWithPassword: async (
    supabase: SupabaseClient<Database>,
    email: string,
    password: string
  ) => {
    const response = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (response.error) {
      return {
        data: null,
        error: response.error.message || 'Sign in failed',
      };
    }

    return {
      data: response.data,
      error: null,
    };
  },

  /**
   * Sign up with email and password
   */
  signUpWithPassword: async (
    supabase: SupabaseClient<Database>,
    email: string,
    password: string,
    options?: {
      emailRedirectTo?: string;
      data?: Record<string, unknown>;
    }
  ) => {
    const response = await supabase.auth.signUp({
      email,
      password,
      options,
    });
    
    if (response.error) {
      return {
        data: null,
        error: response.error.message || 'Sign up failed',
      };
    }

    return {
      data: response.data,
      error: null,
    };
  },

  /**
   * Sign out the current user
   */
  signOut: async (supabase: SupabaseClient<Database>) => {
    const { error } = await supabase.auth.signOut();
    return { error: error?.message || null };
  },

  /**
   * Reset password
   */
  resetPassword: async (
    supabase: SupabaseClient<Database>,
    email: string,
    redirectTo?: string
  ) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    return { error: error?.message || null };
  },

  /**
   * Update user password
   */
  updatePassword: async (
    supabase: SupabaseClient<Database>,
    newPassword: string
  ) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error: error?.message || null };
  },
};

// Default client for immediate use (client-side only)
export const supabase = createClientComponentClient(); 