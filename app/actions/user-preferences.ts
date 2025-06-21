'use server'

/**
 * Server Actions for User Preferences
 * 
 * Provides server actions for managing user preferences from client components.
 * Integrates with the user preferences service and includes proper error handling.
 */

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { 
  updateUserPreferences,
  type UserPreferencesFormData 
} from '@/lib/user-preferences'

// ==================================================
// SERVER ACTIONS
// ==================================================

/**
 * Update user preferences server action
 */
export async function updateUserPreferencesAction(
  formData: FormData
): Promise<{ success: boolean; error?: string; data?: unknown }> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }
    
    // Extract preferences from form data
    const preferences: UserPreferencesFormData = {}
    
    // Theme mode
    const themeMode = formData.get('theme_mode') as string
    if (themeMode && ['system', 'light', 'dark'].includes(themeMode)) {
      preferences.theme_mode = themeMode as 'system' | 'light' | 'dark'
    }
    
    // Boolean preferences
    const booleanFields = [
      'compact_mode',
      'reduce_motion',
      'high_contrast',
      'large_text',
      'screen_reader_optimized',
      'browser_notifications',
      'sound_effects',
      'debug_mode',
      'show_layout_guides',
      'console_logging',
      'enable_animations',
      'enable_glassmorphism'
    ] as const
    
    booleanFields.forEach(field => {
      const value = formData.get(field)
      preferences[field] = value === 'true' || value === 'on'
    })
    
    // Update preferences in database
    const updatedPreferences = await updateUserPreferences(user.id, preferences)
    
    // Revalidate the settings page
    revalidatePath('/settings')
    
    return { 
      success: true, 
      data: updatedPreferences 
    }
  } catch (error) {
    console.error('Error updating user preferences:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update preferences' 
    }
  }
}

/**
 * Update a single preference server action
 */
export async function updateSinglePreferenceAction(
  key: keyof UserPreferencesFormData,
  value: string | boolean
): Promise<{ success: boolean; error?: string; data?: unknown }> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }
    
    // Create update object
    const updates: UserPreferencesFormData = {
      [key]: value
    }
    
    // Update preferences in database
    const updatedPreferences = await updateUserPreferences(user.id, updates)
    
    // Revalidate the settings page
    revalidatePath('/settings')
    
    return { 
      success: true, 
      data: updatedPreferences 
    }
  } catch (error) {
    console.error('Error updating single preference:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update preference' 
    }
  }
}

/**
 * Reset user preferences to defaults server action
 */
export async function resetUserPreferencesAction(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }
    
    // Reset to defaults
    const defaultPreferences: UserPreferencesFormData = {
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
    
    // Update preferences in database
    await updateUserPreferences(user.id, defaultPreferences)
    
    // Revalidate the settings page
    revalidatePath('/settings')
    
    return { success: true }
  } catch (error) {
    console.error('Error resetting user preferences:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to reset preferences' 
    }
  }
} 