/**
 * Supabase Client Configuration - Client Side Only
 * 
 * This module provides Supabase client instances for client-side operations.
 * For server-side operations, use the utilities in @/utils/supabase/ directory.
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
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
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
      ...(response.error as any), // Include any additional properties
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
} 