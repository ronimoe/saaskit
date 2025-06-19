/**
 * User Preferences Service
 * 
 * Provides comprehensive utilities for managing user preferences stored in the database.
 * Integrates with Supabase for data persistence and includes type-safe operations.
 * 
 * Last updated: 2025-12-19
 */

import { createClient } from '@/utils/supabase/server'
import { createClient as createClientClient } from '@/utils/supabase/client'
import type { UserPreferences, UserPreferencesInsert } from '@/types/database'

// ==================================================
// TYPES
// ==================================================

export type UserPreferencesFormData = {
  theme_mode?: 'system' | 'light' | 'dark'
  compact_mode?: boolean
  reduce_motion?: boolean
  high_contrast?: boolean
  large_text?: boolean
  screen_reader_optimized?: boolean
  browser_notifications?: boolean
  sound_effects?: boolean
  debug_mode?: boolean
  show_layout_guides?: boolean
  console_logging?: boolean
  enable_animations?: boolean
  enable_glassmorphism?: boolean
}

export type UserPreferencesDefaults = {
  theme_mode: 'system'
  compact_mode: false
  reduce_motion: false
  high_contrast: false
  large_text: false
  screen_reader_optimized: false
  browser_notifications: false
  sound_effects: false
  debug_mode: false
  show_layout_guides: false
  console_logging: true
  enable_animations: true
  enable_glassmorphism: true
}

// ==================================================
// SERVER-SIDE FUNCTIONS
// ==================================================

/**
 * Get user preferences from the database (server-side)
 * Creates preferences with defaults if they don't exist
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences> {
  const supabase = await createClient()
  
  // First try to get existing preferences
  const { data: existingPrefs, error: fetchError } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (existingPrefs && !fetchError) {
    return existingPrefs
  }
  
  // If no preferences exist, create with defaults
  const { data: newPrefs, error: createError } = await supabase
    .from('user_preferences')
    .insert({ user_id: userId })
    .select()
    .single()
  
  if (createError) {
    console.error('Error creating user preferences:', createError)
    throw new Error('Failed to get or create user preferences')
  }
  
  return newPrefs
}

/**
 * Update user preferences in the database (server-side)
 */
export async function updateUserPreferences(
  userId: string, 
  updates: UserPreferencesFormData
): Promise<UserPreferences> {
  const supabase = await createClient()
  
  // Ensure preferences exist first
  await getUserPreferences(userId)
  
  // Update the preferences
  const { data, error } = await supabase
    .from('user_preferences')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating user preferences:', error)
    throw new Error('Failed to update user preferences')
  }
  
  return data
}

/**
 * Create initial user preferences with defaults (server-side)
 */
export async function createUserPreferences(userId: string): Promise<UserPreferences> {
  const supabase = await createClient()
  
  const preferencesData: UserPreferencesInsert = {
    user_id: userId,
    // All other fields will use database defaults
  }
  
  const { data, error } = await supabase
    .from('user_preferences')
    .insert(preferencesData)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating user preferences:', error)
    throw new Error('Failed to create user preferences')
  }
  
  return data
}

// ==================================================
// CLIENT-SIDE FUNCTIONS
// ==================================================

/**
 * Get user preferences from the database (client-side)
 */
export async function getUserPreferencesClient(userId: string): Promise<UserPreferences | null> {
  const supabase = createClientClient()
  
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error) {
    console.error('Error fetching user preferences:', error)
    return null
  }
  
  return data
}

/**
 * Update user preferences from client-side
 */
export async function updateUserPreferencesClient(
  userId: string,
  updates: UserPreferencesFormData
): Promise<UserPreferences | null> {
  const supabase = createClientClient()
  
  const { data, error } = await supabase
    .from('user_preferences')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating user preferences:', error)
    return null
  }
  
  return data
}

/**
 * Create user preferences from client-side
 */
export async function createUserPreferencesClient(userId: string): Promise<UserPreferences | null> {
  const supabase = createClientClient()
  
  const preferencesData: UserPreferencesInsert = {
    user_id: userId,
  }
  
  const { data, error } = await supabase
    .from('user_preferences')
    .insert(preferencesData)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating user preferences:', error)
    return null
  }
  
  return data
}

// ==================================================
// UTILITY FUNCTIONS
// ==================================================

/**
 * Get default user preferences
 */
export function getDefaultUserPreferences(): UserPreferencesDefaults {
  return {
    theme_mode: 'system',
    compact_mode: false,
    reduce_motion: false,
    high_contrast: false,
    large_text: false,
    screen_reader_optimized: false,
    browser_notifications: false,
    sound_effects: false,
    debug_mode: false,
    show_layout_guides: false,
    console_logging: true,
    enable_animations: true,
    enable_glassmorphism: true,
  }
}

/**
 * Merge user preferences with defaults
 */
export function mergeWithDefaults(preferences: Partial<UserPreferences>) {
  const defaults = getDefaultUserPreferences()
  return { ...defaults, ...preferences }
}



/**
 * Validate theme mode value
 */
export function isValidThemeMode(value: unknown): value is 'system' | 'light' | 'dark' {
  return typeof value === 'string' && ['system', 'light', 'dark'].includes(value)
}

/**
 * Get CSS classes based on user preferences
 */
export function getPreferenceCSSClasses(preferences: UserPreferences): string[] {
  const classes: string[] = []
  
  if (preferences.compact_mode) {
    classes.push('compact-mode')
  }
  
  if (preferences.reduce_motion) {
    classes.push('reduce-motion')
  }
  
  if (preferences.high_contrast) {
    classes.push('high-contrast')
  }
  
  if (preferences.large_text) {
    classes.push('large-text')
  }
  
  if (!preferences.enable_animations) {
    classes.push('no-animations')
  }
  
  if (!preferences.enable_glassmorphism) {
    classes.push('no-glassmorphism')
  }
  
  return classes
}

/**
 * Apply preferences to document (client-side only)
 */
export function applyPreferencesToDocument(preferences: UserPreferences) {
  if (typeof document === 'undefined') return
  
  const classes = getPreferenceCSSClasses(preferences)
  const body = document.body
  
  // Remove existing preference classes
  const prefClasses = [
    'compact-mode', 'reduce-motion', 'high-contrast', 
    'large-text', 'no-animations', 'no-glassmorphism'
  ]
  body.classList.remove(...prefClasses)
  
  // Add new preference classes
  body.classList.add(...classes)
  
  // Set theme mode as CSS variable
  document.documentElement.setAttribute('data-theme', preferences.theme_mode)
} 