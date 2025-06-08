import type { User, Session } from '@supabase/supabase-js'

import type { TypedSupabaseClient } from './types'

/**
 * Authentication helper functions for Supabase
 */

/**
 * Get the current user from the Supabase client
 */
export async function getCurrentUser(supabase: TypedSupabaseClient): Promise<User | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      return null
    }
    
    return user
  } catch (error) {
    return null
  }
}

/**
 * Get the current session from the Supabase client
 */
export async function getCurrentSession(supabase: TypedSupabaseClient): Promise<Session | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      return null
    }
    
    return session
  } catch (error) {
    return null
  }
}

/**
 * Sign in with email and password
 */
export async function signInWithPassword(
  supabase: TypedSupabaseClient,
  email: string,
  password: string
) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return { data, error }
}

/**
 * Sign up with email and password
 */
export async function signUpWithPassword(
  supabase: TypedSupabaseClient,
  email: string,
  password: string,
  options?: {
    emailRedirectTo?: string
    data?: Record<string, any>
  }
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options,
  })

  return { data, error }
}

/**
 * Sign in with OAuth provider
 */
export async function signInWithOAuth(
  supabase: TypedSupabaseClient,
  provider: 'google' | 'github' | 'apple' | 'azure' | 'bitbucket' | 'discord' | 'facebook' | 'figma' | 'gitlab' | 'linkedin' | 'notion' | 'slack' | 'spotify' | 'twitch' | 'twitter' | 'workos',
  options?: {
    redirectTo?: string
    scopes?: string
    queryParams?: Record<string, string>
  }
) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options,
  })

  return { data, error }
}

/**
 * Sign out the current user
 */
export async function signOut(supabase: TypedSupabaseClient) {
  const { error } = await supabase.auth.signOut()
  return { error }
}

/**
 * Reset password via email
 */
export async function resetPassword(
  supabase: TypedSupabaseClient,
  email: string,
  redirectTo?: string
) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  })

  return { data, error }
}

/**
 * Update user password
 */
export async function updatePassword(
  supabase: TypedSupabaseClient,
  password: string
) {
  const { data, error } = await supabase.auth.updateUser({
    password,
  })

  return { data, error }
}

/**
 * Update user metadata
 */
export async function updateUserMetadata(
  supabase: TypedSupabaseClient,
  data: Record<string, any>
) {
  const { data: userData, error } = await supabase.auth.updateUser({
    data,
  })

  return { data: userData, error }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(supabase: TypedSupabaseClient): Promise<boolean> {
  const user = await getCurrentUser(supabase)
  return user !== null
}

/**
 * Get user ID if authenticated
 */
export async function getUserId(supabase: TypedSupabaseClient): Promise<string | null> {
  const user = await getCurrentUser(supabase)
  return user?.id || null
} 