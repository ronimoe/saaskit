import {
  createGuestSession,
  getGuestSession,
  markSessionConsumed,
  isGuestCustomer,
  cleanupExpiredSessions,
  getPendingGuestSessions,
  type GuestSessionData,
  type CreateGuestSessionParams,
} from '@/lib/guest-session-manager'

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  createAdminClient: jest.fn(() => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    lt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
  })),
}))

jest.mock('@/lib/stripe-server', () => ({
  stripe: {
    checkout: {
      sessions: {
        retrieve: jest.fn(),
      },
    },
    customers: {
      retrieve: jest.fn(),
    },
  },
}))

// Create typed mocks
import { stripe } from '@/lib/stripe-server'
import { createAdminClient } from '@/lib/supabase'

const mockStripe = stripe as jest.Mocked<typeof stripe>
const mockSupabase = createAdminClient() as jest.Mocked<ReturnType<typeof createAdminClient>>

// Mock console methods
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation()
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation()

// Mock Date for consistent testing
const mockDate = new Date('2023-06-01T12:00:00Z')
jest.spyOn(global, 'Date').mockImplementation(() => mockDate)
Date.now = jest.fn(() => mockDate.getTime())

describe('Guest Session Manager', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockConsoleLog.mockClear()
    mockConsoleError.mockClear()
  })

  describe('createGuestSession', () => {
    const mockParams: CreateGuestSessionParams = {
      sessionId: 'cs_test_123',
      stripeCustomerId: 'cus_test_123',
      subscriptionId: 'sub_test_123',
      customerEmail: 'test@example.com',
      planName: 'Pro Plan',
      priceId: 'price_123',
      paymentStatus: 'paid',
      amount: 2999,
      currency: 'usd',
      metadata: { source: 'website' },
    }

    it('should create a guest session successfully', async () => {
      const result = await createGuestSession(mockParams)

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[GUEST SESSION] Creating session for: test@example.com'
      )
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[GUEST SESSION] Created session data:',
        expect.objectContaining({
          sessionId: 'cs_test_123',
          email: 'test@example.com',
          expiresAt: expect.any(String),
        })
      )
    })

    it('should handle missing optional fields', async () => {
      const minimalParams: CreateGuestSessionParams = {
        sessionId: 'cs_test_minimal',
        stripeCustomerId: 'cus_minimal',
        customerEmail: 'minimal@example.com',
        paymentStatus: 'pending',
      }

      const result = await createGuestSession(minimalParams)

      expect(result.success).toBe(true)
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[GUEST SESSION] Creating session for: minimal@example.com'
      )
    })

    it('should set correct expiration time (24 hours)', async () => {
      await createGuestSession(mockParams)

      // Check that expires_at is 24 hours from now
      const expectedExpiry = new Date(mockDate.getTime() + 24 * 60 * 60 * 1000)
      
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[GUEST SESSION] Created session data:',
        expect.objectContaining({
          expiresAt: expectedExpiry.toISOString(),
        })
      )
    })

    it('should handle errors gracefully', async () => {
      // Mock a scenario that would cause an error
      const invalidParams = null as any

      const result = await createGuestSession(invalidParams)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(mockConsoleError).toHaveBeenCalledWith(
        '[GUEST SESSION] Error creating session:',
        expect.any(Error)
      )
    })
  })

  describe('getGuestSession', () => {
    it('should retrieve session from Stripe when no database table exists', async () => {
      // Mock Stripe response
      const mockStripeSession = {
        id: 'cs_test_123',
        customer: {
          id: 'cus_test_123',
          email: 'test@example.com',
        },
        subscription: 'sub_test_123',
        payment_status: 'paid',
        amount_total: 2999,
        currency: 'usd',
        metadata: {
          planName: 'Pro Plan',
          priceId: 'price_123',
        },
        created: Math.floor(mockDate.getTime() / 1000),
      }

      mockStripe.checkout.sessions.retrieve.mockResolvedValue(mockStripeSession as any)

      const result = await getGuestSession('cs_test_123')

      expect(result.success).toBe(true)
      expect(result.session).toEqual({
        sessionId: 'cs_test_123',
        stripeCustomerId: 'cus_test_123',
        subscriptionId: 'sub_test_123',
        customerEmail: 'test@example.com',
        planName: 'Pro Plan',
        priceId: 'price_123',
        paymentStatus: 'paid',
        amount: 2999,
        currency: 'usd',
        metadata: {
          planName: 'Pro Plan',
          priceId: 'price_123',
        },
        expiresAt: new Date(mockDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        createdAt: mockDate.toISOString(),
      })

      expect(mockStripe.checkout.sessions.retrieve).toHaveBeenCalledWith('cs_test_123', {
        expand: ['customer', 'subscription'],
      })
    })

    it('should handle missing customer in Stripe session', async () => {
      const mockStripeSession = {
        id: 'cs_test_123',
        customer: null,
        payment_status: 'paid',
      }

      mockStripe.checkout.sessions.retrieve.mockResolvedValue(mockStripeSession as any)

      const result = await getGuestSession('cs_test_123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Session or customer not found')
    })

    it('should handle missing customer email', async () => {
      const mockStripeSession = {
        id: 'cs_test_123',
        customer: {
          id: 'cus_test_123',
          email: null,
        },
        payment_status: 'paid',
      }

      mockStripe.checkout.sessions.retrieve.mockResolvedValue(mockStripeSession as any)

      const result = await getGuestSession('cs_test_123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Customer email not found')
    })

    it('should handle subscription as object instead of string', async () => {
      const mockStripeSession = {
        id: 'cs_test_123',
        customer: {
          id: 'cus_test_123',
          email: 'test@example.com',
        },
        subscription: {
          id: 'sub_test_123',
        },
        payment_status: 'paid',
        created: Math.floor(mockDate.getTime() / 1000),
        metadata: {},
      }

      mockStripe.checkout.sessions.retrieve.mockResolvedValue(mockStripeSession as any)

      const result = await getGuestSession('cs_test_123')

      expect(result.success).toBe(true)
      expect(result.session?.subscriptionId).toBe('sub_test_123')
    })

    it('should handle Stripe API errors', async () => {
      mockStripe.checkout.sessions.retrieve.mockRejectedValue(new Error('Stripe API error'))

      const result = await getGuestSession('cs_test_123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Stripe API error')
      expect(mockConsoleError).toHaveBeenCalledWith(
        '[GUEST SESSION] Error fetching from Stripe:',
        expect.any(Error)
      )
    })

    it('should handle pending payment status', async () => {
      const mockStripeSession = {
        id: 'cs_test_123',
        customer: {
          id: 'cus_test_123',
          email: 'test@example.com',
        },
        payment_status: 'unpaid',
        created: Math.floor(mockDate.getTime() / 1000),
        metadata: {},
      }

      mockStripe.checkout.sessions.retrieve.mockResolvedValue(mockStripeSession as any)

      const result = await getGuestSession('cs_test_123')

      expect(result.success).toBe(true)
      expect(result.session?.paymentStatus).toBe('pending')
    })

    it('should handle general errors gracefully', async () => {
      mockStripe.checkout.sessions.retrieve.mockImplementation(() => {
        throw new Error('Network error')
      })

      const result = await getGuestSession('invalid_session')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
      expect(mockConsoleError).toHaveBeenCalledWith(
        '[GUEST SESSION] Error retrieving session:',
        expect.any(Error)
      )
    })
  })

  describe('markSessionConsumed', () => {
    it('should mark session as consumed successfully', async () => {
      const result = await markSessionConsumed('cs_test_123', 'user_456')

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[GUEST SESSION] Marking session cs_test_123 as consumed by user user_456'
      )
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[GUEST SESSION] Session cs_test_123 marked as consumed'
      )
    })

    it('should handle errors gracefully', async () => {
      // Simulate error by passing invalid parameters
      const result = await markSessionConsumed(null as any, null as any)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(mockConsoleError).toHaveBeenCalledWith(
        '[GUEST SESSION] Error marking session consumed:',
        expect.any(Error)
      )
    })
  })

  describe('isGuestCustomer', () => {
    it('should identify customer linked to user profile', async () => {
      // Mock customer found in profiles table
      mockSupabase.single.mockResolvedValue({
        data: { user_id: 'user_123' },
        error: null,
      })

      const result = await isGuestCustomer('cus_test_123')

      expect(result.isGuest).toBe(false)
      expect(result.userId).toBe('user_123')
      expect(result.error).toBeUndefined()

      expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
      expect(mockSupabase.select).toHaveBeenCalledWith('user_id')
      expect(mockSupabase.eq).toHaveBeenCalledWith('stripe_customer_id', 'cus_test_123')
    })

    it('should identify guest customer not in profiles table', async () => {
      // Mock customer not found in profiles table
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      })

      // Mock Stripe customer without user_id metadata
      mockStripe.customers.retrieve.mockResolvedValue({
        id: 'cus_test_123',
        metadata: {},
      } as any)

      const result = await isGuestCustomer('cus_test_123')

      expect(result.isGuest).toBe(true)
      expect(result.userId).toBeUndefined()
      expect(result.error).toBeUndefined()
    })

    it('should find user ID in Stripe metadata when not in profiles', async () => {
      // Mock customer not found in profiles table
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      })

      // Mock Stripe customer with user_id metadata
      mockStripe.customers.retrieve.mockResolvedValue({
        id: 'cus_test_123',
        metadata: {
          user_id: 'user_456',
        },
      } as any)

      const result = await isGuestCustomer('cus_test_123')

      expect(result.isGuest).toBe(false)
      expect(result.userId).toBe('user_456')
    })

    it('should handle deleted customer from Stripe', async () => {
      // Mock customer not found in profiles table
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      })

      // Mock deleted Stripe customer
      mockStripe.customers.retrieve.mockResolvedValue({
        id: 'cus_test_123',
        deleted: true,
      } as any)

      const result = await isGuestCustomer('cus_test_123')

      expect(result.isGuest).toBe(true)
    })

    it('should handle database errors', async () => {
      // Mock database error
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST001', message: 'Database error' },
      })

      const result = await isGuestCustomer('cus_test_123')

      expect(result.isGuest).toBe(false)
      expect(result.error).toBe('Database error')
      expect(mockConsoleError).toHaveBeenCalledWith(
        '[GUEST SESSION] Error checking customer:',
        expect.objectContaining({ message: 'Database error' })
      )
    })

    it('should handle Stripe API errors', async () => {
      // Mock customer not found in profiles table
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      })

      // Mock Stripe API error
      mockStripe.customers.retrieve.mockRejectedValue(new Error('Stripe error'))

      const result = await isGuestCustomer('cus_test_123')

      expect(result.isGuest).toBe(false)
      expect(result.error).toBe('Stripe error')
      expect(mockConsoleError).toHaveBeenCalledWith(
        '[GUEST SESSION] Error checking if guest customer:',
        expect.any(Error)
      )
    })
  })

  describe('cleanupExpiredSessions', () => {
    it('should run cleanup successfully (mock implementation)', async () => {
      const result = await cleanupExpiredSessions()

      expect(result.success).toBe(true)
      expect(result.deletedCount).toBe(0)
      expect(result.error).toBeUndefined()

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[GUEST SESSION] Starting cleanup of expired sessions'
      )
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[GUEST SESSION] Cleanup completed (mock implementation)'
      )
    })

    it('should handle errors gracefully', async () => {
      // Mock an error by overriding the console.log to throw
      mockConsoleLog.mockImplementationOnce(() => {
        throw new Error('Cleanup error')
      })

      const result = await cleanupExpiredSessions()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Cleanup error')
      expect(mockConsoleError).toHaveBeenCalledWith(
        '[GUEST SESSION] Error during cleanup:',
        expect.any(Error)
      )
    })
  })

  describe('getPendingGuestSessions', () => {
    it('should return empty array (mock implementation)', async () => {
      const result = await getPendingGuestSessions()

      expect(result.success).toBe(true)
      expect(result.sessions).toEqual([])
      expect(result.error).toBeUndefined()
    })

    it('should handle errors gracefully', async () => {
      // Mock console.log to throw error to simulate failure
      mockConsoleLog.mockImplementationOnce(() => {
        throw new Error('Query error')
      })

      const result = await getPendingGuestSessions()

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(mockConsoleError).toHaveBeenCalledWith(
        '[GUEST SESSION] Error getting pending sessions:',
        expect.any(Error)
      )
    })
  })

  describe('Integration scenarios', () => {
    it('should handle complete guest session lifecycle', async () => {
      // 1. Create guest session
      const sessionParams: CreateGuestSessionParams = {
        sessionId: 'cs_lifecycle_test',
        stripeCustomerId: 'cus_lifecycle_test',
        customerEmail: 'lifecycle@example.com',
        paymentStatus: 'paid',
      }

      const createResult = await createGuestSession(sessionParams)
      expect(createResult.success).toBe(true)

      // 2. Check if customer is guest
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      })
      mockStripe.customers.retrieve.mockResolvedValue({
        id: 'cus_lifecycle_test',
        metadata: {},
      } as any)

      const guestCheckResult = await isGuestCustomer('cus_lifecycle_test')
      expect(guestCheckResult.isGuest).toBe(true)

      // 3. Mark session as consumed
      const consumedResult = await markSessionConsumed('cs_lifecycle_test', 'user_lifecycle')
      expect(consumedResult.success).toBe(true)

      // 4. Run cleanup
      const cleanupResult = await cleanupExpiredSessions()
      expect(cleanupResult.success).toBe(true)
    })

    it('should handle error propagation through workflow', async () => {
      // Test error handling across different operations
      const invalidParams = { invalid: 'data' } as any

      const createResult = await createGuestSession(invalidParams)
      expect(createResult.success).toBe(false)

      const getResult = await getGuestSession('')
      expect(getResult.success).toBe(false)

      const markResult = await markSessionConsumed('', '')
      expect(markResult.success).toBe(false)
    })
  })

  describe('Edge cases and data validation', () => {
    it('should handle very long email addresses', async () => {
      const longEmail = 'a'.repeat(100) + '@example.com'
      const params: CreateGuestSessionParams = {
        sessionId: 'cs_long_email',
        stripeCustomerId: 'cus_long_email',
        customerEmail: longEmail,
        paymentStatus: 'paid',
      }

      const result = await createGuestSession(params)
      expect(result.success).toBe(true)
    })

    it('should handle special characters in metadata', async () => {
      const params: CreateGuestSessionParams = {
        sessionId: 'cs_special_chars',
        stripeCustomerId: 'cus_special_chars',
        customerEmail: 'test@example.com',
        paymentStatus: 'paid',
        metadata: {
          'special-key': 'value with spaces & symbols!',
          emoji: '🎉',
        },
      }

      const result = await createGuestSession(params)
      expect(result.success).toBe(true)
    })

    it('should handle large amounts and different currencies', async () => {
      const params: CreateGuestSessionParams = {
        sessionId: 'cs_large_amount',
        stripeCustomerId: 'cus_large_amount',
        customerEmail: 'bigspender@example.com',
        paymentStatus: 'paid',
        amount: 999999999, // Very large amount
        currency: 'eur',
      }

      const result = await createGuestSession(params)
      expect(result.success).toBe(true)
    })
  })
}) 