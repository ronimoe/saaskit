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

// Mock account linking functions
jest.mock('@/lib/account-linking', () => ({
  checkAccountLinking: jest.fn(),
  linkOAuthToExistingAccount: jest.fn(),
  verifyLinkingToken: jest.fn(),
  isAccountLinkingEnabled: jest.fn()
}))

// Mock Supabase
jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn()
}))

import { POST } from '../route'
import { 
  checkAccountLinking, 
  linkOAuthToExistingAccount, 
  verifyLinkingToken,
  isAccountLinkingEnabled 
} from '@/lib/account-linking'
import { createClient } from '@/utils/supabase/server'

describe('/api/auth/link-account', () => {
  const createRequest = (body: unknown) => {
    return new MockNextRequest('http://localhost:3000/api/auth/link-account', {
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

  describe('Account linking disabled', () => {
    it('should return 503 when account linking is disabled', async () => {
      ;(isAccountLinkingEnabled as jest.Mock).mockReturnValue(false)

      const request = createRequest({
        action: 'check',
        email: 'test@example.com',
        provider: 'google'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(503)
      expect(data).toEqual({
        error: 'Account linking is not available'
      })
    })
  })

  describe('Check action', () => {
    beforeEach(() => {
      ;(isAccountLinkingEnabled as jest.Mock).mockReturnValue(true)
    })

    it('should return 400 when email is missing', async () => {
      const request = createRequest({
        action: 'check',
        provider: 'google'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        error: 'Email and provider are required'
      })
    })

    it('should return 400 when provider is missing', async () => {
      const request = createRequest({
        action: 'check',
        email: 'test@example.com'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        error: 'Email and provider are required'
      })
    })

    it('should successfully check account linking', async () => {
      const mockResult = {
        needsLinking: true,
        existingUserId: 'user-123',
        existingAuthMethod: 'email' as const,
        conflictType: 'email_exists' as const
      }

      ;(checkAccountLinking as jest.Mock).mockResolvedValue(mockResult)

      const request = createRequest({
        action: 'check',
        email: 'test@example.com',
        provider: 'google'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ result: mockResult })
      expect(checkAccountLinking).toHaveBeenCalledWith('test@example.com', 'google')
    })
  })

  describe('Link action', () => {
    beforeEach(() => {
      ;(isAccountLinkingEnabled as jest.Mock).mockReturnValue(true)
    })

    it('should return 400 when token is missing', async () => {
      const request = createRequest({
        action: 'link',
        oauthUserId: 'oauth-123',
        provider: 'google'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        error: 'Token, OAuth user ID, and provider are required'
      })
    })

    it('should return 400 when oauthUserId is missing', async () => {
      const request = createRequest({
        action: 'link',
        token: 'valid-token',
        provider: 'google'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        error: 'Token, OAuth user ID, and provider are required'
      })
    })

    it('should return 400 when provider is missing', async () => {
      const request = createRequest({
        action: 'link',
        token: 'valid-token',
        oauthUserId: 'oauth-123'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        error: 'Token, OAuth user ID, and provider are required'
      })
    })

    it('should return 400 when token is invalid', async () => {
      ;(verifyLinkingToken as jest.Mock).mockReturnValue(null)

      const request = createRequest({
        action: 'link',
        token: 'invalid-token',
        oauthUserId: 'oauth-123',
        provider: 'google'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        error: 'Invalid or expired linking token'
      })
    })

    it('should return 401 when user is not authenticated', async () => {
      ;(verifyLinkingToken as jest.Mock).mockReturnValue({
        email: 'test@example.com',
        provider: 'google'
      })

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
        action: 'link',
        token: 'valid-token',
        oauthUserId: 'oauth-123',
        provider: 'google'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toEqual({
        error: 'Authentication required'
      })
    })

    it('should return 403 when user ID mismatch', async () => {
      ;(verifyLinkingToken as jest.Mock).mockReturnValue({
        email: 'test@example.com',
        provider: 'google'
      })

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'different-user-id' } },
            error: null
          })
        }
      }
      ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

      const request = createRequest({
        action: 'link',
        token: 'valid-token',
        oauthUserId: 'oauth-123',
        provider: 'google'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data).toEqual({
        error: 'User ID mismatch'
      })
    })

    it('should return 400 when account linking not needed', async () => {
      ;(verifyLinkingToken as jest.Mock).mockReturnValue({
        email: 'test@example.com',
        provider: 'google'
      })

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'oauth-123' } },
            error: null
          })
        }
      }
      ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

      ;(checkAccountLinking as jest.Mock).mockResolvedValue({
        needsLinking: false
      })

      const request = createRequest({
        action: 'link',
        token: 'valid-token',
        oauthUserId: 'oauth-123',
        provider: 'google'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        error: 'Account linking not required or existing user not found'
      })
    })

    it('should return 500 when linking fails', async () => {
      ;(verifyLinkingToken as jest.Mock).mockReturnValue({
        email: 'test@example.com',
        provider: 'google'
      })

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'oauth-123' } },
            error: null
          })
        }
      }
      ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

      ;(checkAccountLinking as jest.Mock).mockResolvedValue({
        needsLinking: true,
        existingUserId: 'existing-user-123'
      })

      ;(linkOAuthToExistingAccount as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Database error'
      })

      const request = createRequest({
        action: 'link',
        token: 'valid-token',
        oauthUserId: 'oauth-123',
        provider: 'google'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        error: 'Database error'
      })
    })

    it('should successfully link accounts', async () => {
      ;(verifyLinkingToken as jest.Mock).mockReturnValue({
        email: 'test@example.com',
        provider: 'google'
      })

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'oauth-123' } },
            error: null
          })
        }
      }
      ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

      ;(checkAccountLinking as jest.Mock).mockResolvedValue({
        needsLinking: true,
        existingUserId: 'existing-user-123'
      })

      ;(linkOAuthToExistingAccount as jest.Mock).mockResolvedValue({
        success: true,
        linkedUserId: 'existing-user-123'
      })

      const request = createRequest({
        action: 'link',
        token: 'valid-token',
        oauthUserId: 'oauth-123',
        provider: 'google'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        linkedUserId: 'existing-user-123',
        message: 'Accounts linked successfully'
      })
    })
  })

  describe('Invalid action', () => {
    beforeEach(() => {
      ;(isAccountLinkingEnabled as jest.Mock).mockReturnValue(true)
    })

    it('should return 400 for invalid action', async () => {
      const request = createRequest({
        action: 'invalid',
        email: 'test@example.com',
        provider: 'google'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        error: 'Invalid action'
      })
    })
  })

  describe('Error handling', () => {
    beforeEach(() => {
      ;(isAccountLinkingEnabled as jest.Mock).mockReturnValue(true)
    })

    it('should handle JSON parsing errors', async () => {
      const request = new MockNextRequest('http://localhost:3000/api/auth/link-account', {
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
        error: 'Internal server error'
      })
    })
  })
}) 