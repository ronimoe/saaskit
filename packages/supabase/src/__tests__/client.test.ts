import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

import { createClient, createServerClient, createAdminClient } from '../client'

// Mock @supabase/ssr
vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({ from: vi.fn(), auth: vi.fn() })),
  createServerClient: vi.fn(() => ({ from: vi.fn(), auth: vi.fn() })),
}))

describe('Supabase Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set up environment variables for tests
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('createClient', () => {
    it('creates browser client', () => {
      const client = createClient()
      expect(client).toBeDefined()
      expect(client.from).toBeDefined()
      expect(client.auth).toBeDefined()
    })

    it('works even when SUPABASE_URL is missing', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      const client = createClient()
      expect(client).toBeDefined()
    })

    it('works even when SUPABASE_ANON_KEY is missing', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      const client = createClient()
      expect(client).toBeDefined()
    })
  })

  describe('createServerClient', () => {
    it('creates server client with cookie configuration', () => {
      const mockCookieStore = {
        getAll: vi.fn().mockReturnValue([{ name: 'session', value: 'token123' }]),
        set: vi.fn(),
      }

      const client = createServerClient(mockCookieStore)
      expect(client).toBeDefined()
      expect(client.from).toBeDefined()
      expect(client.auth).toBeDefined()
    })

    it('works even when cookie store is not provided', () => {
      const client = createServerClient(null as any)
      expect(client).toBeDefined()
    })

    it('handles cookie setting errors gracefully', () => {
      const mockCookieStore = {
        getAll: vi.fn().mockReturnValue([]),
        set: vi.fn().mockImplementation(() => {
          throw new Error('Cookie setting failed')
        }),
      }

      // This test verifies that the createServerClient function doesn't throw
      // when cookie.set throws an error (which is handled in the catch block)
      expect(() => {
        createServerClient(mockCookieStore)
      }).not.toThrow()
    })
  })

  describe('createAdminClient', () => {
    it('creates admin client with service role key', () => {
      const client = createAdminClient()
      expect(client).toBeDefined()
      expect(client.from).toBeDefined()
      expect(client.auth).toBeDefined()
    })

    it('throws error when SERVICE_ROLE_KEY is missing', () => {
      delete process.env.SUPABASE_SERVICE_ROLE_KEY

      expect(() => createAdminClient()).toThrow('SUPABASE_SERVICE_ROLE_KEY environment variable is not set')
    })
  })
}) 