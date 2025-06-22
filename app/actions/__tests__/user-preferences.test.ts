/**
 * @jest-environment node
 */

import { jest } from '@jest/globals'
import { 
  updateUserPreferencesAction,
  updateSinglePreferenceAction,
  resetUserPreferencesAction 
} from '../user-preferences'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { updateUserPreferences } from '@/lib/user-preferences'

// Mock dependencies
jest.mock('next/cache')
jest.mock('@/utils/supabase/server')
jest.mock('@/lib/user-preferences')

const mockRevalidatePath = revalidatePath as jest.MockedFunction<typeof revalidatePath>
const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockUpdateUserPreferences = updateUserPreferences as jest.MockedFunction<typeof updateUserPreferences>

describe('User Preferences Server Actions', () => {
  let mockSupabase: any

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockSupabase = {
      auth: {
        getUser: jest.fn()
      }
    }
    
    mockCreateClient.mockResolvedValue(mockSupabase)
  })

  describe('updateUserPreferencesAction', () => {
    it('should successfully update user preferences with valid form data', async () => {
      // Arrange
      const mockUser = { id: 'user-123' }
      const mockUpdatedPreferences = { 
        id: 'pref-123', 
        user_id: 'user-123',
        theme_mode: 'dark' as const,
        compact_mode: true,
        reduce_motion: false,
        high_contrast: false,
        large_text: false,
        screen_reader_optimized: false,
        browser_notifications: true,
        sound_effects: false,
        debug_mode: false,
        show_layout_guides: false,
        console_logging: false,
        enable_animations: false,
        enable_glassmorphism: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      
      mockUpdateUserPreferences.mockResolvedValue(mockUpdatedPreferences)

      const formData = new FormData()
      formData.append('theme_mode', 'dark')
      formData.append('compact_mode', 'true')
      formData.append('reduce_motion', 'false')
      formData.append('browser_notifications', 'on')

      // Act
      const result = await updateUserPreferencesAction(formData)

      // Assert
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockUpdatedPreferences)
      expect(mockUpdateUserPreferences).toHaveBeenCalledWith('user-123', {
        theme_mode: 'dark',
        compact_mode: true,
        reduce_motion: false,
        high_contrast: false,
        large_text: false,
        screen_reader_optimized: false,
        browser_notifications: true,
        sound_effects: false,
        debug_mode: false,
        show_layout_guides: false,
        console_logging: false,
        enable_animations: false,
        enable_glassmorphism: false
      })
      expect(mockRevalidatePath).toHaveBeenCalledWith('/settings')
    })

    it('should handle invalid theme mode gracefully', async () => {
      // Arrange
      const mockUser = { id: 'user-123' }
      const mockUpdatedPreferences = { 
        id: 'pref-123', 
        user_id: 'user-123',
        theme_mode: 'system' as const,
        compact_mode: true,
        reduce_motion: false,
        high_contrast: false,
        large_text: false,
        screen_reader_optimized: false,
        browser_notifications: false,
        sound_effects: false,
        debug_mode: false,
        show_layout_guides: false,
        console_logging: false,
        enable_animations: false,
        enable_glassmorphism: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      
      mockUpdateUserPreferences.mockResolvedValue(mockUpdatedPreferences)

      const formData = new FormData()
      formData.append('theme_mode', 'invalid-theme')
      formData.append('compact_mode', 'true')

      // Act
      const result = await updateUserPreferencesAction(formData)

      // Assert
      expect(result.success).toBe(true)
      expect(mockUpdateUserPreferences).toHaveBeenCalledWith('user-123', {
        compact_mode: true,
        reduce_motion: false,
        high_contrast: false,
        large_text: false,
        screen_reader_optimized: false,
        browser_notifications: false,
        sound_effects: false,
        debug_mode: false,
        show_layout_guides: false,
        console_logging: false,
        enable_animations: false,
        enable_glassmorphism: false
      })
    })

    it('should return error when user is not authenticated', async () => {
      // Arrange
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      })

      const formData = new FormData()
      formData.append('theme_mode', 'dark')

      // Act
      const result = await updateUserPreferencesAction(formData)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Not authenticated')
      expect(mockUpdateUserPreferences).not.toHaveBeenCalled()
      expect(mockRevalidatePath).not.toHaveBeenCalled()
    })

    it('should return error when auth fails', async () => {
      // Arrange
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Auth error')
      })

      const formData = new FormData()
      formData.append('theme_mode', 'dark')

      // Act
      const result = await updateUserPreferencesAction(formData)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Not authenticated')
      expect(mockUpdateUserPreferences).not.toHaveBeenCalled()
    })

    it('should handle database update errors', async () => {
      // Arrange
      const mockUser = { id: 'user-123' }
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      
      mockUpdateUserPreferences.mockRejectedValue(new Error('Database error'))

      const formData = new FormData()
      formData.append('theme_mode', 'dark')

      // Act
      const result = await updateUserPreferencesAction(formData)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Database error')
      expect(mockRevalidatePath).not.toHaveBeenCalled()
    })

    it('should handle non-Error exceptions', async () => {
      // Arrange
      const mockUser = { id: 'user-123' }
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      
      mockUpdateUserPreferences.mockRejectedValue('String error')

      const formData = new FormData()
      formData.append('theme_mode', 'dark')

      // Act
      const result = await updateUserPreferencesAction(formData)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to update preferences')
    })
  })

  describe('updateSinglePreferenceAction', () => {
    it('should successfully update a single preference', async () => {
      // Arrange
      const mockUser = { id: 'user-123' }
      const mockUpdatedPreferences = { 
        id: 'pref-123', 
        user_id: 'user-123',
        theme_mode: 'dark' as const,
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
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      
      mockUpdateUserPreferences.mockResolvedValue(mockUpdatedPreferences)

      // Act
      const result = await updateSinglePreferenceAction('theme_mode', 'dark')

      // Assert
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockUpdatedPreferences)
      expect(mockUpdateUserPreferences).toHaveBeenCalledWith('user-123', {
        theme_mode: 'dark'
      })
      expect(mockRevalidatePath).toHaveBeenCalledWith('/settings')
    })

    it('should handle boolean values', async () => {
      // Arrange
      const mockUser = { id: 'user-123' }
      const mockUpdatedPreferences = { 
        id: 'pref-123', 
        user_id: 'user-123',
        theme_mode: 'system' as const,
        compact_mode: true,
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
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      
      mockUpdateUserPreferences.mockResolvedValue(mockUpdatedPreferences)

      // Act
      const result = await updateSinglePreferenceAction('compact_mode', true)

      // Assert
      expect(result.success).toBe(true)
      expect(mockUpdateUserPreferences).toHaveBeenCalledWith('user-123', {
        compact_mode: true
      })
    })

    it('should return error when user is not authenticated', async () => {
      // Arrange
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      })

      // Act
      const result = await updateSinglePreferenceAction('theme_mode', 'dark')

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Not authenticated')
      expect(mockUpdateUserPreferences).not.toHaveBeenCalled()
    })

    it('should handle update errors', async () => {
      // Arrange
      const mockUser = { id: 'user-123' }
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      
      mockUpdateUserPreferences.mockRejectedValue(new Error('Update failed'))

      // Act
      const result = await updateSinglePreferenceAction('theme_mode', 'dark')

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Update failed')
    })
  })

  describe('resetUserPreferencesAction', () => {
    it('should successfully reset user preferences to defaults', async () => {
      // Arrange
      const mockUser = { id: 'user-123' }
      const mockUpdatedPreferences = { 
        id: 'pref-123', 
        user_id: 'user-123',
        theme_mode: 'system' as const,
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
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      
      mockUpdateUserPreferences.mockResolvedValue(mockUpdatedPreferences)

      // Act
      const result = await resetUserPreferencesAction()

      // Assert
      expect(result.success).toBe(true)
      expect(mockUpdateUserPreferences).toHaveBeenCalledWith('user-123', {
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
      })
      expect(mockRevalidatePath).toHaveBeenCalledWith('/settings')
    })

    it('should return error when user is not authenticated', async () => {
      // Arrange
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      })

      // Act
      const result = await resetUserPreferencesAction()

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Not authenticated')
      expect(mockUpdateUserPreferences).not.toHaveBeenCalled()
    })

    it('should handle reset errors', async () => {
      // Arrange
      const mockUser = { id: 'user-123' }
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      
      mockUpdateUserPreferences.mockRejectedValue(new Error('Reset failed'))

      // Act
      const result = await resetUserPreferencesAction()

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Reset failed')
    })

    it('should handle non-Error exceptions during reset', async () => {
      // Arrange
      const mockUser = { id: 'user-123' }
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      
      mockUpdateUserPreferences.mockRejectedValue('Unknown error')

      // Act
      const result = await resetUserPreferencesAction()

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to reset preferences')
    })
  })
}) 