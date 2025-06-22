/**
 * @jest-environment node
 */

// Mock NextRequest properly with json() method
class MockNextRequest {
  private body: string
  private url: string
  private method: string
  private headers: Headers

  constructor(url: string, options: any) {
    this.url = url
    this.method = options.method
    this.headers = new Headers(options.headers)
    this.body = options.body
  }

  async json() {
    return JSON.parse(this.body)
  }
}

// Override the global NextRequest mock
jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server')
  return {
    ...originalModule,
    NextRequest: MockNextRequest,
    NextResponse: {
      json: jest.fn((data, init) => ({
        status: init?.status || 200,
        json: jest.fn().mockResolvedValue(data)
      }))
    }
  }
})

// Mock account reconciliation functions
jest.mock('@/lib/account-reconciliation', () => ({
  reconcileGuestPayment: jest.fn(),
  handleDuplicateEmailScenario: jest.fn()
}))

// Mock guest session manager
jest.mock('@/lib/guest-session-manager', () => ({
  markSessionConsumed: jest.fn()
}))

// Mock Supabase
jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn()
}))

import { POST } from '../route'
import { reconcileGuestPayment, handleDuplicateEmailScenario } from '@/lib/account-reconciliation'
import { markSessionConsumed } from '@/lib/guest-session-manager'
import { createClient } from '@/utils/supabase/server'

describe('/api/reconcile-account', () => {
  const createRequest = (body: unknown) => {
    return new MockNextRequest('http://localhost:3000/api/reconcile-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }) as any
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Authentication', () => {
    it('should return 401 when user is not authenticated', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: new Error('Not authenticated')
          })
        }
      }
      ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

      const request = createRequest({
        sessionId: 'session-123',
        userEmail: 'test@example.com'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toEqual({
        error: 'Authentication required'
      })
    })

    it('should return 401 when auth error occurs', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: new Error('Auth error')
          })
        }
      }
      ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

      const request = createRequest({
        sessionId: 'session-123',
        userEmail: 'test@example.com'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toEqual({
        error: 'Authentication required'
      })
    })
  })

  describe('Validation', () => {
    beforeEach(() => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user-123', email: 'test@example.com' } },
            error: null
          })
        }
      }
      ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
    })

    it('should return 400 when sessionId is missing', async () => {
      const request = createRequest({
        userEmail: 'test@example.com'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        error: 'Missing required fields: sessionId and userEmail'
      })
    })

    it('should return 400 when userEmail is missing', async () => {
      const request = createRequest({
        sessionId: 'session-123'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        error: 'Missing required fields: sessionId and userEmail'
      })
    })

    it('should return 403 when email does not match authenticated user', async () => {
      const request = createRequest({
        sessionId: 'session-123',
        userEmail: 'different@example.com'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data).toEqual({
        error: 'Email mismatch with authenticated user'
      })
    })
  })

  describe('Successful reconciliation', () => {
    beforeEach(() => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user-123', email: 'test@example.com' } },
            error: null
          })
        }
      }
      ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
    })

    it('should successfully reconcile payment without stripeCustomerId', async () => {
      const mockResult = {
        success: true,
        message: 'Payment reconciled successfully',
        profileId: 'profile-123',
        subscriptionLinked: true,
        operation: 'linked'
      }

      ;(reconcileGuestPayment as jest.Mock).mockResolvedValue(mockResult)
      ;(markSessionConsumed as jest.Mock).mockResolvedValue(undefined)

      const request = createRequest({
        sessionId: 'session-123',
        userEmail: 'test@example.com'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        message: 'Payment reconciled successfully',
        profileId: 'profile-123',
        subscriptionLinked: true,
        operation: 'linked'
      })

      expect(reconcileGuestPayment).toHaveBeenCalledWith({
        sessionId: 'session-123',
        userEmail: 'test@example.com',
        userId: 'user-123',
        stripeCustomerId: ''
      })

      expect(markSessionConsumed).toHaveBeenCalledWith('session-123', 'user-123')
    })

    it('should successfully reconcile payment with stripeCustomerId', async () => {
      const mockResult = {
        success: true,
        message: 'Payment reconciled successfully',
        profileId: 'profile-123',
        subscriptionLinked: true,
        operation: 'linked'
      }

      ;(reconcileGuestPayment as jest.Mock).mockResolvedValue(mockResult)
      ;(markSessionConsumed as jest.Mock).mockResolvedValue(undefined)

      const request = createRequest({
        sessionId: 'session-123',
        userEmail: 'test@example.com',
        stripeCustomerId: 'cus_123'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        message: 'Payment reconciled successfully',
        profileId: 'profile-123',
        subscriptionLinked: true,
        operation: 'linked'
      })

      expect(reconcileGuestPayment).toHaveBeenCalledWith({
        sessionId: 'session-123',
        userEmail: 'test@example.com',
        userId: 'user-123',
        stripeCustomerId: 'cus_123'
      })
    })
  })

  describe('Duplicate email scenario', () => {
    beforeEach(() => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user-123', email: 'test@example.com' } },
            error: null
          })
        }
      }
      ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
    })

    it('should handle duplicate email error', async () => {
      ;(reconcileGuestPayment as jest.Mock).mockResolvedValue({
        success: false,
        error: 'duplicate email detected'
      })

      ;(handleDuplicateEmailScenario as jest.Mock).mockResolvedValue({
        message: 'Duplicate email scenario handled',
        error: 'Multiple accounts found'
      })

      const request = createRequest({
        sessionId: 'session-123',
        userEmail: 'test@example.com'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data).toEqual({
        success: false,
        message: 'Duplicate email scenario handled',
        error: 'Multiple accounts found',
        requiresSupport: true
      })

      expect(handleDuplicateEmailScenario).toHaveBeenCalledWith(
        'test@example.com',
        'user-123',
        'session-123'
      )
    })

    it('should handle Multiple accounts error', async () => {
      ;(reconcileGuestPayment as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Multiple accounts found'
      })

      ;(handleDuplicateEmailScenario as jest.Mock).mockResolvedValue({
        message: 'Multiple accounts scenario handled',
        error: 'Contact support required'
      })

      const request = createRequest({
        sessionId: 'session-123',
        userEmail: 'test@example.com'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data).toEqual({
        success: false,
        message: 'Multiple accounts scenario handled',
        error: 'Contact support required',
        requiresSupport: true
      })
    })
  })

  describe('Failed reconciliation', () => {
    beforeEach(() => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user-123', email: 'test@example.com' } },
            error: null
          })
        }
      }
      ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
    })

    it('should return 400 for general reconciliation failure', async () => {
      ;(reconcileGuestPayment as jest.Mock).mockResolvedValue({
        success: false,
        message: 'Reconciliation failed',
        error: 'Invalid session'
      })

      const request = createRequest({
        sessionId: 'session-123',
        userEmail: 'test@example.com'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        success: false,
        message: 'Reconciliation failed',
        error: 'Invalid session'
      })
    })

    it('should return 400 for reconciliation failure without message', async () => {
      ;(reconcileGuestPayment as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Database error'
      })

      const request = createRequest({
        sessionId: 'session-123',
        userEmail: 'test@example.com'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        success: false,
        message: 'Failed to reconcile payment',
        error: 'Database error'
      })
    })
  })

  describe('Error handling', () => {
    beforeEach(() => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user-123', email: 'test@example.com' } },
            error: null
          })
        }
      }
      ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
    })

    it('should handle JSON parsing errors', async () => {
      const request = new MockNextRequest('http://localhost:3000/api/reconcile-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: 'invalid json'
      }) as any

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        error: 'Internal server error during reconciliation'
      })
    })

    it('should handle unexpected errors during reconciliation', async () => {
      ;(reconcileGuestPayment as jest.Mock).mockRejectedValue(new Error('Unexpected error'))

      const request = createRequest({
        sessionId: 'session-123',
        userEmail: 'test@example.com'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        error: 'Internal server error during reconciliation'
      })
    })
  })
}) 