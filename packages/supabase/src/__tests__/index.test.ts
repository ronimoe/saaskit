import { describe, it, expect } from 'vitest'

describe('Package Exports', () => {
  describe('Client exports', () => {
    it('exports createClient', async () => {
      const { createClient } = await import('../client')
      expect(typeof createClient).toBe('function')
    })

    it('exports createServerClient', async () => {
      const { createServerClient } = await import('../client')
      expect(typeof createServerClient).toBe('function')
    })

    it('exports createAdminClient', async () => {
      const { createAdminClient } = await import('../client')
      expect(typeof createAdminClient).toBe('function')
    })
  })

  describe('Auth exports', () => {
    it('exports auth helper functions', async () => {
      const authHelpers = await import('../auth-helpers')
      
      expect(typeof authHelpers.getCurrentUser).toBe('function')
      expect(typeof authHelpers.getCurrentSession).toBe('function')
      expect(typeof authHelpers.signInWithPassword).toBe('function')
      expect(typeof authHelpers.signUpWithPassword).toBe('function')
      expect(typeof authHelpers.signInWithOAuth).toBe('function')
      expect(typeof authHelpers.signOut).toBe('function')
      expect(typeof authHelpers.resetPassword).toBe('function')
      expect(typeof authHelpers.updatePassword).toBe('function')
      expect(typeof authHelpers.updateUserMetadata).toBe('function')
      expect(typeof authHelpers.isAuthenticated).toBe('function')
      expect(typeof authHelpers.getUserId).toBe('function')
    })
  })

  describe('Database exports', () => {
    it('exports database operation objects', async () => {
      const database = await import('../database')
      
      expect(typeof database.users).toBe('object')
      expect(typeof database.products).toBe('object')
      expect(typeof database.subscriptions).toBe('object')
      expect(typeof database.userProducts).toBe('object')
    })

    it('exports database utility functions', async () => {
      const database = await import('../database')
      
      expect(typeof database.validateRequired).toBe('function')
      expect(typeof database.sanitizeEmail).toBe('function')
      expect(typeof database.createErrorResponse).toBe('function')
      expect(typeof database.createSuccessResponse).toBe('function')
    })
  })

  describe('Storage exports', () => {
    it('exports storage operation functions', async () => {
      const storage = await import('../storage')
      
      expect(typeof storage.uploadFile).toBe('function')
      expect(typeof storage.downloadFile).toBe('function')
      expect(typeof storage.deleteFile).toBe('function')
      expect(typeof storage.listFiles).toBe('function')
      expect(typeof storage.getPublicUrl).toBe('function')
      expect(typeof storage.createSignedUrl).toBe('function')
      expect(typeof storage.copyFile).toBe('function')
      expect(typeof storage.moveFile).toBe('function')
      expect(typeof storage.createBucket).toBe('function')
    })
  })

  describe('Type exports', () => {
    it('exports TypeScript types', async () => {
      const types = await import('../types')
      
      // Types are compile-time only, so we check if the module imports without error
      expect(types).toBeDefined()
    })
  })

  describe('Realtime exports', () => {
    it('exports realtime functions', async () => {
      const realtime = await import('../realtime')
      
      expect(typeof realtime.subscribeToTable).toBe('function')
      expect(typeof realtime.subscribeToRow).toBe('function')
      expect(typeof realtime.createChannel).toBe('function')
      expect(typeof realtime.unsubscribeChannel).toBe('function')
    })
  })

  describe('Main index exports', () => {
    it('re-exports all modules from main index', async () => {
      const mainIndex = await import('../index')
      
      // Check that main exports are available
      expect(mainIndex).toBeDefined()
      
      // Verify key exports are re-exported (sample check)
      expect(typeof mainIndex.createClient).toBe('function')
      expect(typeof mainIndex.users).toBe('object')
      expect(typeof mainIndex.uploadFile).toBe('function')
      expect(typeof mainIndex.subscribeToTable).toBe('function')
    })
  })
}) 