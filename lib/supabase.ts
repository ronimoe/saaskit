/**
 * Supabase Client Configuration
 * 
 * This module provides Supabase client instances for both client-side and server-side operations.
 */

import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import type { Database } from '../types/database'

// Export the database type for use throughout the app
export type { Database } from '../types/database'

/**
 * Client-side Supabase client
 * Use this in client components, browser-side operations
 */
export const createClientComponentClient = (): SupabaseClient<Database> => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/**
 * Server-side Supabase client for server components and actions
 * Use this in server components, server actions, and API routes
 */
export const createServerComponentClient = async (): Promise<SupabaseClient<Database>> => {
  const cookieStore = await import('next/headers').then((mod) => mod.cookies())
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          const cookie = cookieStore.get(name)
          return cookie?.value
        },
        set(name, value, options) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Cookie cannot be set - this happens on Static Site Generation
            // or when the page doesn't re-render immediately
            console.warn(`Error setting cookie "${name}":`, error)
          }
        },
        remove(name, options) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Cookie cannot be deleted - this happens on Static Site Generation
            // or when the page doesn't re-render immediately
            console.warn(`Error removing cookie "${name}":`, error)
          }
        },
      },
    }
  )
}

/**
 * Admin Supabase client for admin operations
 * Use this for admin-level operations that require service role key
 */
export const createAdminClient = (): SupabaseClient<Database> => {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations')
  }

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Middleware Supabase client
 * Use this in middleware for server-side authentication checks
 */
export const createMiddlewareClient = (request: NextRequest) => {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          request.cookies.set({
            name,
            value,
            ...(options as Record<string, unknown>),
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...(options as Record<string, unknown>),
          })
        },
        remove(name: string, options: Record<string, unknown>) {
          request.cookies.set({
            name,
            value: '',
            ...(options as Record<string, unknown>),
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...(options as Record<string, unknown>),
          })
        },
      },
    }
  )

  return { supabase, response }
}

/**
 * Utility function to get the current user from any Supabase client
 */
export const getCurrentUser = async (supabase: SupabaseClient<Database>) => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error('Error getting current user:', error)
      return null
    }

    return user
  } catch (error) {
    console.error('Unexpected error getting current user:', error)
    return null
  }
}

/**
 * Utility function to get the current session from any Supabase client
 */
export const getCurrentSession = async (supabase: SupabaseClient<Database>) => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error('Error getting current session:', error)
      return null
    }

    return session
  } catch (error) {
    console.error('Unexpected error getting current session:', error)
    return null
  }
}

/**
 * Type-safe helper for handling Supabase responses
 */
export const handleSupabaseResponse = <T>(
  response: { data: T | null; error: Error | null }
): { data: T; error: null } | { data: null; error: string } => {
  if (response.error) {
    // Extract useful error information for logging
    const errorInfo = {
      message: response.error.message || 'Unknown error',
      name: response.error.name || 'Error',
      stack: response.error.stack,
      ...(response.error as unknown as Record<string, unknown>), // Include additional properties
    }
    
    console.error('Supabase error details:', errorInfo)
    console.error('Full Supabase error object:', JSON.stringify(response.error, null, 2))
    
    return {
      data: null,
      error: response.error.message || 'An unexpected error occurred',
    }
  }

  if (!response.data) {
    return {
      data: null,
      error: 'No data returned',
    }
  }

  return {
    data: response.data,
    error: null,
  }
}

/**
 * Authentication helpers
 */
export const authHelpers = {
  /**
   * Check if user is authenticated
   */
  isAuthenticated: async (supabase: SupabaseClient<Database>): Promise<boolean> => {
    const user = await getCurrentUser(supabase)
    return !!user
  },

  /**
   * Get user ID safely
   */
  getUserId: async (supabase: SupabaseClient<Database>): Promise<string | null> => {
    const user = await getCurrentUser(supabase)
    return user?.id || null
  },

  /**
   * Require authenticated user (throws if not authenticated)
   */
  requireAuth: async (supabase: SupabaseClient<Database>) => {
    const user = await getCurrentUser(supabase)
    if (!user) {
      throw new Error('Authentication required')
    }
    return user
  },

  /**
   * Sign in with email and password
   */
  signInWithPassword: async (
    supabase: SupabaseClient<Database>,
    email: string,
    password: string
  ): Promise<{ data?: unknown; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error: error.message }
      }

      return { data }
    } catch (error) {
      console.error('signInWithPassword error:', error)
      return { error: error instanceof Error ? error.message : 'Sign in failed' }
    }
  },

  /**
   * Sign up with email and password
   */
  signUpWithPassword: async (
    supabase: SupabaseClient<Database>,
    email: string,
    password: string,
    options?: { emailRedirectTo?: string }
  ): Promise<{ data?: unknown; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: options?.emailRedirectTo,
        },
      })

      if (error) {
        return { error: error.message }
      }

      return { data }
    } catch (error) {
      console.error('signUpWithPassword error:', error)
      return { error: error instanceof Error ? error.message : 'Sign up failed' }
    }
  },

  /**
   * Reset password
   */
  resetPassword: async (
    supabase: SupabaseClient<Database>,
    email: string,
    redirectTo?: string
  ): Promise<{ data?: unknown; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      })

      if (error) {
        return { error: error.message }
      }

      return { data }
    } catch (error) {
      console.error('resetPassword error:', error)
      return { error: error instanceof Error ? error.message : 'Password reset failed' }
    }
  },

  /**
   * Sign out
   */
  signOut: async (supabase: SupabaseClient<Database>): Promise<{ error?: string }> => {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error) {
      console.error('signOut error:', error)
      return { error: error instanceof Error ? error.message : 'Sign out failed' }
    }
  },

  /**
   * Update password for authenticated user
   */
  updatePassword: async (
    supabase: SupabaseClient<Database>,
    newPassword: string
  ): Promise<{ error?: string }> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error) {
      console.error('updatePassword error:', error)
      return { error: error instanceof Error ? error.message : 'Password update failed' }
    }
  },
} 