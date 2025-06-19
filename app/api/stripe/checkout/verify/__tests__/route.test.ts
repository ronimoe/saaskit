/**
 * Checkout Verification API Tests
 * 
 * Comprehensive test suite for the checkout verification endpoint including:
 * - Request validation tests
 * - Payment verification scenarios
 * - Security validation (user authorization)
 * - Stripe integration testing
 * - Error handling scenarios
 * - Edge cases and malformed data
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import { NextRequest } from 'next/server'
import type { MockedFunction } from 'jest-mock'

// Import the API handler
import { POST } from '../route'

// Mock dependencies
jest.mock('@supabase/supabase-js')
jest.mock('@/lib/stripe-server', () => ({
  __esModule: true,
  stripe: {
    checkout: {
      sessions: {
        retrieve: jest.fn()
      }
    },
    customers: {
      retrieve: jest.fn()
    },
    subscriptions: {
      retrieve: jest.fn()
    },
    prices: {
      retrieve: jest.fn()
    },
    products: {
      retrieve: jest.fn()
    }
  }
}))
jest.mock('@/lib/stripe-sync', () => ({
  __esModule: true,
  syncStripeCustomerData: jest.fn()
}))

// Import our manually mocked modules
import { stripe } from '@/lib/stripe-server'
import { syncStripeCustomerData } from '@/lib/stripe-sync'
import { createClient } from '@supabase/supabase-js'

// Type the mocked modules
const mockedCreateClient = createClient as MockedFunction<typeof createClient>
const mockStripe = stripe as jest.Mocked<typeof stripe>
const mockSyncStripeCustomerData = syncStripeCustomerData as jest.MockedFunction<typeof syncStripeCustomerData>

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn()
      }))
    })),
    insert: jest.fn(),
    update: jest.fn()
  }))
}

// Test data
const mockValidRequest = {
  sessionId: 'cs_test_session123',
  userId: 'user_123'
}

const mockStripeSession = {
  id: 'cs_test_session123',
  payment_status: 'paid',
  customer: 'cus_stripe123',
  subscription: 'sub_stripe123',
  metadata: {
    userId: 'user_123'
  }
}

const mockStripeSessionWithCustomerObject = {
  ...mockStripeSession,
  customer: {
    id: 'cus_stripe123',
    email: 'test@example.com'
  }
}

const mockSubscriptionData = {
  planName: 'Pro Plan',
  status: 'active',
  priceId: 'price_123',
  currentPeriodEnd: 1735689600, // 2025-01-01
  subscriptionId: 'sub_stripe123'
}

// Helper function to create mock NextRequest
function createMockRequest(body: Record<string, unknown>): NextRequest {
  return {
    json: jest.fn().mockResolvedValue(body as never),
    headers: new Headers(),
    url: 'http://localhost:3000/api/checkout/verify',
    method: 'POST'
  } as unknown as NextRequest
}

describe('Checkout Verification API', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
    
    // Setup default mock implementations
    mockedCreateClient.mockReturnValue(mockSupabaseClient as any)
    
    // Setup default Stripe mocks
    mockStripe.checkout.sessions.retrieve.mockResolvedValue(mockStripeSession as any)
    mockStripe.customers.retrieve.mockResolvedValue({
      id: 'cus_stripe123',
      email: 'test@example.com',
      deleted: false
    } as any)
    mockSyncStripeCustomerData.mockResolvedValue(mockSubscriptionData)
    
    // Mock console methods to avoid noise in tests
    jest.spyOn(console, 'error').mockImplementation(() => {})
    
    // Set up environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Request Validation', () => {
    it('should return 400 when sessionId is missing', async () => {
      // Arrange
      const request = createMockRequest({
        userId: 'user_123'
        // sessionId missing
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing required field: sessionId')
    })

    it('should return 400 when userId is missing', async () => {
      // Arrange
      const request = createMockRequest({
        sessionId: 'cs_test_session123'
        // userId missing - this should trigger the authenticated user check
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing required field: userId for authenticated checkout')
    })

    it('should return 400 when both fields are missing', async () => {
      // Arrange
      const request = createMockRequest({})

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing required field: sessionId')
    })

    it('should return 400 when fields are empty strings', async () => {
      // Arrange
      const request = createMockRequest({
        sessionId: '',
        userId: ''
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing required field: sessionId')
    })

    it('should return 400 when fields are null', async () => {
      // Arrange
      const request = createMockRequest({
        sessionId: null,
        userId: null
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing required field: sessionId')
    })
  })

  describe('Stripe Session Retrieval', () => {
    it('should retrieve session with correct parameters', async () => {
      // Arrange
      const request = createMockRequest(mockValidRequest)
      mockStripe.checkout.sessions.retrieve.mockResolvedValue(mockStripeSession as any)
      mockSyncStripeCustomerData.mockResolvedValue(mockSubscriptionData)

      // Act
      await POST(request)

      // Assert
      expect(mockStripe.checkout.sessions.retrieve).toHaveBeenCalledWith(
        'cs_test_session123',
        { expand: ['subscription', 'customer'] }
      )
    })

    it('should handle Stripe API errors gracefully', async () => {
      // Arrange
      const request = createMockRequest(mockValidRequest)
      mockStripe.checkout.sessions.retrieve.mockRejectedValue(
        new Error('Session not found')
      )

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to verify checkout session')
      expect(console.error).toHaveBeenCalledWith(
        'Error verifying checkout session:',
        new Error('Session not found'),
      )
    })

    it('should handle invalid session ID format', async () => {
      // Arrange
      const request = createMockRequest({
        sessionId: 'invalid_session_format',
        userId: 'user_123'
      })
      mockStripe.checkout.sessions.retrieve.mockRejectedValue(
        new Error('Invalid session ID format')
      )

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to verify checkout session')
    })
  })

  describe('Security Validation', () => {
    it('should return 403 when session userId does not match request userId', async () => {
      // Arrange
      const request = createMockRequest({
        sessionId: 'cs_test_session123',
        userId: 'user_456' // Different user ID
      })
      
      const sessionWithDifferentUser = {
        ...mockStripeSession,
        metadata: { userId: 'user_123' } // Original user
      }
      
      mockStripe.checkout.sessions.retrieve.mockResolvedValue(sessionWithDifferentUser as any)

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(403)
      expect(data.error).toBe('Unauthorized: Session does not belong to user')
    })

    it('should return 403 when session has no metadata', async () => {
      // Arrange
      const request = createMockRequest(mockValidRequest)
      const sessionWithoutMetadata = {
        ...mockStripeSession,
        metadata: null
      }
      
      mockStripe.checkout.sessions.retrieve.mockResolvedValue(sessionWithoutMetadata as any)

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(403)
      expect(data.error).toBe('Unauthorized: Session does not belong to user')
    })

    it('should return 403 when session metadata has no userId', async () => {
      // Arrange
      const request = createMockRequest(mockValidRequest)
      const sessionWithoutUserId = {
        ...mockStripeSession,
        metadata: { someOtherField: 'value' }
      }
      
      mockStripe.checkout.sessions.retrieve.mockResolvedValue(sessionWithoutUserId as any)

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(403)
      expect(data.error).toBe('Unauthorized: Session does not belong to user')
    })
  })

  describe('Payment Status Validation', () => {
    it('should return 400 when payment status is not paid', async () => {
      // Arrange
      const request = createMockRequest(mockValidRequest)
      const unpaidSession = {
        ...mockStripeSession,
        payment_status: 'unpaid'
      }
      
      mockStripe.checkout.sessions.retrieve.mockResolvedValue(unpaidSession as any)

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data.error).toBe('Payment was not successful')
    })

    it('should return 400 when payment status is requires_payment_method', async () => {
      // Arrange
      const request = createMockRequest(mockValidRequest)
      const failedSession = {
        ...mockStripeSession,
        payment_status: 'requires_payment_method'
      }
      
      mockStripe.checkout.sessions.retrieve.mockResolvedValue(failedSession as any)

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data.error).toBe('Payment was not successful')
    })

    it('should return 400 when payment status is processing', async () => {
      // Arrange
      const request = createMockRequest(mockValidRequest)
      const processingSession = {
        ...mockStripeSession,
        payment_status: 'processing'
      }
      
      mockStripe.checkout.sessions.retrieve.mockResolvedValue(processingSession as any)

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data.error).toBe('Payment was not successful')
    })
  })

  describe('Customer Validation', () => {
    it('should return 400 when customer is null', async () => {
      // Arrange
      const request = createMockRequest(mockValidRequest)
      const sessionWithoutCustomer = {
        ...mockStripeSession,
        customer: null
      }
      
      mockStripe.checkout.sessions.retrieve.mockResolvedValue(sessionWithoutCustomer as any)

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data.error).toBe('No customer found in session')
    })

    it('should return 400 when customer is undefined', async () => {
      // Arrange
      const request = createMockRequest(mockValidRequest)
      const sessionWithoutCustomer = {
        ...mockStripeSession,
        customer: undefined
      }
      
      mockStripe.checkout.sessions.retrieve.mockResolvedValue(sessionWithoutCustomer as any)

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data.error).toBe('No customer found in session')
    })

    it('should handle customer as string ID', async () => {
      // Arrange
      const request = createMockRequest(mockValidRequest)
      mockStripe.checkout.sessions.retrieve.mockResolvedValue(mockStripeSession as any)
      mockSyncStripeCustomerData.mockResolvedValue(mockSubscriptionData)

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data.customer.id).toBe('cus_stripe123')
      expect(mockSyncStripeCustomerData).toHaveBeenCalledWith('cus_stripe123')
    })

    it('should handle customer as object with ID', async () => {
      // Arrange
      const request = createMockRequest(mockValidRequest)
      mockStripe.checkout.sessions.retrieve.mockResolvedValue(mockStripeSessionWithCustomerObject as any)
      mockSyncStripeCustomerData.mockResolvedValue(mockSubscriptionData)

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data.customer.id).toBe('cus_stripe123')
      expect(mockSyncStripeCustomerData).toHaveBeenCalledWith('cus_stripe123')
    })
  })

  describe('Subscription Data Sync', () => {
    it('should sync subscription data successfully', async () => {
      // Arrange
      const request = createMockRequest(mockValidRequest)
      mockStripe.checkout.sessions.retrieve.mockResolvedValue(mockStripeSession as any)
      mockSyncStripeCustomerData.mockResolvedValue(mockSubscriptionData)

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(mockSyncStripeCustomerData).toHaveBeenCalledWith('cus_stripe123')
      expect(response.status).toBe(200)
      expect(data.subscription).toEqual({
        planName: 'Pro Plan',
        status: 'active',
        priceId: 'price_123',
        currentPeriodEnd: '2025-01-01T00:00:00.000Z',
        subscriptionId: 'sub_stripe123'
      })
    })

    it('should handle sync errors gracefully', async () => {
      // Arrange
      const request = createMockRequest(mockValidRequest)
      mockStripe.checkout.sessions.retrieve.mockResolvedValue(mockStripeSession as any)
      // Clear the default mock and set up rejection for this test
      mockSyncStripeCustomerData.mockClear()
      mockSyncStripeCustomerData.mockImplementation(() => 
        Promise.reject(new Error('Sync failed'))
      )

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to sync Stripe data')
      expect(console.error).toHaveBeenCalledWith(
        'Failed to sync stripe customer data.',
        new Error('Sync failed'),
      )
    })

    it('should handle partial subscription data', async () => {
      // Arrange
      const request = createMockRequest(mockValidRequest)
      const partialSubscriptionData = {
        planName: null,
        status: 'active',
        priceId: 'price_123',
        currentPeriodEnd: null,
        subscriptionId: 'sub_stripe123'
      }
      
      mockStripe.checkout.sessions.retrieve.mockResolvedValue(mockStripeSession as any)
      mockSyncStripeCustomerData.mockResolvedValue(partialSubscriptionData)

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data.subscription.planName).toBe('Unknown Plan')
      expect(data.subscription.currentPeriodEnd).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/)
    })

    it('should fall back to current date if currentPeriodEnd is null', async () => {
      // Arrange
      const request = createMockRequest(mockValidRequest)
      const subscriptionWithNullTimestamp = {
        ...mockSubscriptionData,
        currentPeriodEnd: null
      }
      
      mockStripe.checkout.sessions.retrieve.mockResolvedValue(mockStripeSession as any)
      mockSyncStripeCustomerData.mockResolvedValue(subscriptionWithNullTimestamp)

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data.subscription.currentPeriodEnd).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/)
    })
  })

  describe('Response Format', () => {
    it('should return correctly formatted response for successful verification', async () => {
      // Arrange
      const request = createMockRequest(mockValidRequest)
      mockStripe.checkout.sessions.retrieve.mockResolvedValue(mockStripeSession as any)
      mockSyncStripeCustomerData.mockResolvedValue(mockSubscriptionData)

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toEqual({
        sessionId: 'cs_test_session123',
        subscription: {
          planName: 'Pro Plan',
          status: 'active',
          priceId: 'price_123',
          currentPeriodEnd: '2025-01-01T00:00:00.000Z',
          subscriptionId: 'sub_stripe123'
        },
        customer: {
          id: 'cus_stripe123'
        },
        isGuest: false
      })
    })

    it('should handle missing optional subscription fields', async () => {
      // Arrange
      const request = createMockRequest(mockValidRequest)
      const minimalSubscriptionData = {
        status: 'active'
      }
      
      mockStripe.checkout.sessions.retrieve.mockResolvedValue(mockStripeSession as any)
      mockSyncStripeCustomerData.mockResolvedValue(minimalSubscriptionData as any)

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data.subscription.planName).toBe('Unknown Plan')
      expect(data.subscription.status).toBe('active')
      expect(data.subscription.currentPeriodEnd).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/)
    })
  })

  describe('Error Handling', () => {
    it('should handle malformed JSON in request', async () => {
      // Arrange
      const mockJsonFn = jest.fn().mockRejectedValue(new Error('Invalid JSON') as never)
      const request = {
        json: mockJsonFn,
        headers: new Headers(),
        url: 'http://localhost:3000/api/checkout/verify',
        method: 'POST'
      } as unknown as NextRequest

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to verify checkout session')
    })

    it('should handle unexpected errors gracefully', async () => {
      // Arrange
      const request = createMockRequest(mockValidRequest)
      mockStripe.checkout.sessions.retrieve.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to verify checkout session')
      expect(console.error).toHaveBeenCalled()
    })

    it('should handle network timeouts', async () => {
      // Arrange
      const request = createMockRequest(mockValidRequest)
      mockStripe.checkout.sessions.retrieve.mockRejectedValue(
        new Error('Request timeout')
      )

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to verify checkout session')
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long session IDs', async () => {
      // Arrange
      const longSessionId = 'cs_' + 'a'.repeat(1000)
      const request = createMockRequest({
        sessionId: longSessionId,
        userId: 'user_123'
      })
      
      mockStripe.checkout.sessions.retrieve.mockResolvedValue({
        ...mockStripeSession,
        id: longSessionId
      } as any)
      mockSyncStripeCustomerData.mockResolvedValue(mockSubscriptionData)

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data.sessionId).toBe(longSessionId)
    })

    it('should handle special characters in user IDs', async () => {
      // Arrange
      const specialUserId = 'user_123-test@example.com'
      const request = createMockRequest({
        sessionId: 'cs_test_session123',
        userId: specialUserId
      })
      
      mockStripe.checkout.sessions.retrieve.mockResolvedValue({
        ...mockStripeSession,
        metadata: { userId: specialUserId }
      } as any)
      mockSyncStripeCustomerData.mockResolvedValue(mockSubscriptionData)

      // Act
      const response = await POST(request)

      // Assert
      expect(response.status).toBe(200)
    })

    it('should handle timestamps at edge values', async () => {
      // Arrange
      const request = createMockRequest(mockValidRequest)
      const subscriptionWithEdgeTimestamp = {
        ...mockSubscriptionData,
        currentPeriodEnd: 0 // Unix epoch
      }
      
      mockStripe.checkout.sessions.retrieve.mockResolvedValue(mockStripeSession as any)
      mockSyncStripeCustomerData.mockResolvedValue(subscriptionWithEdgeTimestamp)

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data.subscription.currentPeriodEnd).toBe('1970-01-01T00:00:00.000Z')
    })

    it('should handle concurrent requests for same session', async () => {
      // Arrange
      const request1 = createMockRequest(mockValidRequest)
      const request2 = createMockRequest(mockValidRequest)
      
      mockStripe.checkout.sessions.retrieve.mockResolvedValue(mockStripeSession as any)
      mockSyncStripeCustomerData.mockResolvedValue(mockSubscriptionData)

      // Act
      const [response1, response2] = await Promise.all([
        POST(request1),
        POST(request2)
      ])

      // Assert
      expect(response1.status).toBe(200)
      expect(response2.status).toBe(200)
      
      // Both should succeed with same data
      const data1 = await response1.json()
      const data2 = await response2.json()
      expect(data1.sessionId).toBe(data2.sessionId)
    })
  })

  describe('Payment Verification', () => {
    it('should handle sync errors gracefully', async () => {
      // Arrange
      const request = createMockRequest(mockValidRequest)
      mockStripe.checkout.sessions.retrieve.mockResolvedValue(
        mockStripeSessionWithCustomerObject as any,
      )
      mockSyncStripeCustomerData.mockClear()
      mockSyncStripeCustomerData.mockImplementation(() =>
        Promise.reject(new Error('Sync failed')),
      )

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to sync Stripe data')
      expect(console.error).toHaveBeenCalledWith(
        'Failed to sync stripe customer data.',
        new Error('Sync failed'),
      )
    })
  })

  describe('User Authorization', () => {
    // ... existing code ...
  })
})