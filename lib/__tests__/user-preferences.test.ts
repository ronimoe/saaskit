/**
 * @jest-environment node
 */

import { jest } from '@jest/globals'
import {
  getUserPreferences,
  updateUserPreferences,
  createUserPreferences,
  getUserPreferencesClient,
  updateUserPreferencesClient,
  createUserPreferencesClient,
  getDefaultUserPreferences,
  mergeWithDefaults,
  isValidThemeMode,
  getPreferenceCSSClasses,
  applyPreferencesToDocument
} from '../user-preferences'
import { createClient } from '@/utils/supabase/server'
import { createClient as createClientClient } from '@/utils/supabase/client'
import type { UserPreferences } from '@/types/database'

// Mock dependencies
jest.mock('@/utils/supabase/server')
jest.mock('@/utils/supabase/client')

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockCreateClientClient = createClientClient as jest.MockedFunction<typeof createClientClient>

describe('User Preferences Library', () => {
  let mockSupabase: any

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      single: jest.fn()
    }
    
    mockCreateClient.mockResolvedValue(mockSupabase)
    mockCreateClientClient.mockReturnValue(mockSupabase)
  })

  const mockUserPreferences: UserPreferences = {
    id: 'pref-123',
    user_id: 'user-123',
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
    console_logging: true,
    enable_animations: true,
    enable_glassmorphism: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }

  describe('Server-side functions', () => {
    describe('getUserPreferences', () => {
      it('should return existing user preferences', async () => {
        // Arrange
        mockSupabase.single.mockResolvedValue({
          data: mockUserPreferences,
          error: null
        })

        // Act
        const result = await getUserPreferences('user-123')

        // Assert
        expect(result).toEqual(mockUserPreferences)
        expect(mockSupabase.from).toHaveBeenCalledWith('user_preferences')
        expect(mockSupabase.select).toHaveBeenCalledWith('*')
        expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', 'user-123')
      })

      it('should create preferences with defaults if they do not exist', async () => {
        // Arrange
        mockSupabase.single
          .mockResolvedValueOnce({ data: null, error: new Error('Not found') })
          .mockResolvedValueOnce({ data: mockUserPreferences, error: null })

        // Act
        const result = await getUserPreferences('user-123')

        // Assert
        expect(result).toEqual(mockUserPreferences)
        expect(mockSupabase.insert).toHaveBeenCalledWith({ user_id: 'user-123' })
      })

      it('should throw error if creation fails', async () => {
        // Arrange
        mockSupabase.single
          .mockResolvedValueOnce({ data: null, error: new Error('Not found') })
          .mockResolvedValueOnce({ data: null, error: new Error('Creation failed') })

        // Act & Assert
        await expect(getUserPreferences('user-123')).rejects.toThrow('Failed to get or create user preferences')
      })
    })

    describe('updateUserPreferences', () => {
      it('should update user preferences successfully', async () => {
        // Arrange
        const updates = { theme_mode: 'light' as const, compact_mode: false }
        const updatedPrefs = { ...mockUserPreferences, ...updates }
        
        mockSupabase.single
          .mockResolvedValueOnce({ data: mockUserPreferences, error: null })
          .mockResolvedValueOnce({ data: updatedPrefs, error: null })

        // Act
        const result = await updateUserPreferences('user-123', updates)

        // Assert
        expect(result).toEqual(updatedPrefs)
        expect(mockSupabase.update).toHaveBeenCalledWith(updates)
        expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', 'user-123')
      })

      it('should throw error if update fails', async () => {
        // Arrange
        const updates = { theme_mode: 'light' as const }
        
        mockSupabase.single
          .mockResolvedValueOnce({ data: mockUserPreferences, error: null })
          .mockResolvedValueOnce({ data: null, error: new Error('Update failed') })

        // Act & Assert
        await expect(updateUserPreferences('user-123', updates)).rejects.toThrow('Failed to update user preferences')
      })
    })

    describe('createUserPreferences', () => {
      it('should create user preferences with defaults', async () => {
        // Arrange
        mockSupabase.single.mockResolvedValue({
          data: mockUserPreferences,
          error: null
        })

        // Act
        const result = await createUserPreferences('user-123')

        // Assert
        expect(result).toEqual(mockUserPreferences)
        expect(mockSupabase.insert).toHaveBeenCalledWith({ user_id: 'user-123' })
      })

      it('should throw error if creation fails', async () => {
        // Arrange
        mockSupabase.single.mockResolvedValue({
          data: null,
          error: new Error('Creation failed')
        })

        // Act & Assert
        await expect(createUserPreferences('user-123')).rejects.toThrow('Failed to create user preferences')
      })
    })
  })

  describe('Client-side functions', () => {
    describe('getUserPreferencesClient', () => {
      it('should return user preferences from client', async () => {
        // Arrange
        mockSupabase.single.mockResolvedValue({
          data: mockUserPreferences,
          error: null
        })

        // Act
        const result = await getUserPreferencesClient('user-123')

        // Assert
        expect(result).toEqual(mockUserPreferences)
        expect(mockSupabase.from).toHaveBeenCalledWith('user_preferences')
        expect(mockSupabase.select).toHaveBeenCalledWith('*')
        expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', 'user-123')
      })

      it('should return null on error', async () => {
        // Arrange
        mockSupabase.single.mockResolvedValue({
          data: null,
          error: new Error('Fetch failed')
        })

        // Act
        const result = await getUserPreferencesClient('user-123')

        // Assert
        expect(result).toBeNull()
      })
    })

    describe('updateUserPreferencesClient', () => {
      it('should update user preferences from client', async () => {
        // Arrange
        const updates = { theme_mode: 'light' as const }
        const updatedPrefs = { ...mockUserPreferences, ...updates }
        
        mockSupabase.single.mockResolvedValue({
          data: updatedPrefs,
          error: null
        })

        // Act
        const result = await updateUserPreferencesClient('user-123', updates)

        // Assert
        expect(result).toEqual(updatedPrefs)
        expect(mockSupabase.update).toHaveBeenCalledWith(updates)
        expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', 'user-123')
      })

      it('should return null on error', async () => {
        // Arrange
        const updates = { theme_mode: 'light' as const }
        
        mockSupabase.single.mockResolvedValue({
          data: null,
          error: new Error('Update failed')
        })

        // Act
        const result = await updateUserPreferencesClient('user-123', updates)

        // Assert
        expect(result).toBeNull()
      })
    })

    describe('createUserPreferencesClient', () => {
      it('should create user preferences from client', async () => {
        // Arrange
        mockSupabase.single.mockResolvedValue({
          data: mockUserPreferences,
          error: null
        })

        // Act
        const result = await createUserPreferencesClient('user-123')

        // Assert
        expect(result).toEqual(mockUserPreferences)
        expect(mockSupabase.insert).toHaveBeenCalledWith({ user_id: 'user-123' })
      })

      it('should return null on error', async () => {
        // Arrange
        mockSupabase.single.mockResolvedValue({
          data: null,
          error: new Error('Creation failed')
        })

        // Act
        const result = await createUserPreferencesClient('user-123')

        // Assert
        expect(result).toBeNull()
      })
    })
  })

  describe('Utility functions', () => {
    describe('getDefaultUserPreferences', () => {
      it('should return default preferences', () => {
        // Act
        const defaults = getDefaultUserPreferences()

        // Assert
        expect(defaults).toEqual({
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
      })
    })

    describe('mergeWithDefaults', () => {
      it('should merge partial preferences with defaults', () => {
        // Arrange
        const partial = { theme_mode: 'dark' as const, compact_mode: true }

        // Act
        const result = mergeWithDefaults(partial)

        // Assert
        expect(result.theme_mode).toBe('dark')
        expect(result.compact_mode).toBe(true)
        expect(result.reduce_motion).toBe(false) // default value
        expect(result.console_logging).toBe(true) // default value
      })

      it('should handle empty preferences', () => {
        // Act
        const result = mergeWithDefaults({})

        // Assert
        expect(result).toEqual(getDefaultUserPreferences())
      })
    })

    describe('isValidThemeMode', () => {
      it('should validate correct theme modes', () => {
        expect(isValidThemeMode('system')).toBe(true)
        expect(isValidThemeMode('light')).toBe(true)
        expect(isValidThemeMode('dark')).toBe(true)
      })

      it('should reject invalid theme modes', () => {
        expect(isValidThemeMode('invalid')).toBe(false)
        expect(isValidThemeMode(null)).toBe(false)
        expect(isValidThemeMode(undefined)).toBe(false)
        expect(isValidThemeMode(123)).toBe(false)
      })
    })

    describe('getPreferenceCSSClasses', () => {
      it('should return correct CSS classes for preferences', () => {
        // Arrange
        const preferences = {
          ...mockUserPreferences,
          compact_mode: true,
          high_contrast: true,
          large_text: true,
          reduce_motion: true
        }

        // Act
        const classes = getPreferenceCSSClasses(preferences)

        // Assert
        expect(classes).toContain('compact-mode')
        expect(classes).toContain('high-contrast')
        expect(classes).toContain('large-text')
        expect(classes).toContain('reduce-motion')
      })

      it('should return empty array for default preferences', () => {
        // Arrange
        const preferences = {
          ...mockUserPreferences,
          compact_mode: false,
          high_contrast: false,
          large_text: false,
          reduce_motion: false
        }

        // Act
        const classes = getPreferenceCSSClasses(preferences)

        // Assert
        expect(classes).toEqual([])
      })
    })

    describe('applyPreferencesToDocument', () => {
      let mockBody: any
      let mockDocumentElement: any

      beforeEach(() => {
        mockBody = {
          classList: {
            add: jest.fn(),
            remove: jest.fn()
          }
        }
        
        mockDocumentElement = {
          setAttribute: jest.fn()
        }
        
        // Mock document with body and documentElement
        Object.defineProperty(global, 'document', {
          value: {
            body: mockBody,
            documentElement: mockDocumentElement
          },
          writable: true
        })
      })

      it('should apply CSS classes to document element', () => {
        // Arrange
        const preferences = {
          ...mockUserPreferences,
          compact_mode: true,
          high_contrast: true
        }

        // Act
        applyPreferencesToDocument(preferences)

        // Assert
        expect(mockBody.classList.add).toHaveBeenCalledWith('compact-mode', 'high-contrast')
        expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark')
      })

      it('should handle missing document gracefully', () => {
        // Arrange
        Object.defineProperty(global, 'document', {
          value: undefined,
          writable: true
        })

        // Act & Assert - should not throw
        expect(() => applyPreferencesToDocument(mockUserPreferences)).not.toThrow()
      })
    })
  })
}) 