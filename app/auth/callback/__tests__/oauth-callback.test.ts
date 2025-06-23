/**
 * Comprehensive test suite for OAuth callback handler
 * Testing all authentication flows and error scenarios
 */

import { NextRequest } from 'next/server'
import { GET } from '../route'

// Mock NextResponse first
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    url: string
    nextUrl: URL
    method: string = 'GET'
    headers: Headers = new Headers()
    
    constructor(url: string) {
      this.url = url
      this.nextUrl = new URL(url)
    }
  },
  NextResponse: {
    redirect: jest.fn()
  }
}))

// Mock external dependencies using jest.fn() directly in mock definitions
jest.mock('@/lib/supabase', () => ({
  createServerComponentClient: jest.fn()
}))

jest.mock('@/lib/customer-service', () => ({
  ensureCustomerExists: jest.fn()
}))

jest.mock('@/lib/account-linking', () => ({
  checkAccountLinking: jest.fn(),
  generateLinkingToken: jest.fn()
}))

// Mock the dynamic import for stripe-sync
jest.mock('@/lib/stripe-sync', () => ({
  ensureStripeCustomer: jest.fn(),
}))

// Import the mocked modules to get access to the mock functions
import { createServerComponentClient } from '@/lib/supabase'
import { ensureCustomerExists } from '@/lib/customer-service'
import { checkAccountLinking, generateLinkingToken } from '@/lib/account-linking'
import { NextResponse } from 'next/server'
import { ensureStripeCustomer } from '@/lib/stripe-sync'

// Create typed mocks
const mockCreateServerComponentClient = createServerComponentClient as jest.MockedFunction<typeof createServerComponentClient>
const mockEnsureCustomerExists = ensureCustomerExists as jest.MockedFunction<typeof ensureCustomerExists>
const mockCheckAccountLinking = checkAccountLinking as jest.MockedFunction<typeof checkAccountLinking>
const mockGenerateLinkingToken = generateLinkingToken as jest.MockedFunction<typeof generateLinkingToken>
const mockEnsureStripeCustomer = ensureStripeCustomer as jest.Mock

// Create mock functions for dynamic imports
const mockExchangeCodeForSession = jest.fn()
const mockGetUser = jest.fn()

// Mock console methods
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation()
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation()
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation()

// Mock Date.now for consistent testing
const mockDateNow = jest.spyOn(Date, 'now')

describe('OAuth Callback Handler', () => {
  // Mock request helpers
  const createMockRequest = (url: string): NextRequest => {
    return new NextRequest(url)
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockDateNow.mockReturnValue(1000000) // Fixed timestamp
    
    // Setup NextResponse.redirect mock
    const mockRedirect = NextResponse.redirect as jest.MockedFunction<typeof NextResponse.redirect>
    mockRedirect.mockImplementation((url: string | URL) => {
      const urlString = url.toString()
      return {
        status: 302,
        headers: {
          get: (name: string) => {
            if (name === 'location') return urlString
            return null
          }
        }
      } as any
    })
    
    // Setup default mocks
    mockCreateServerComponentClient.mockResolvedValue({
      auth: {
        exchangeCodeForSession: mockExchangeCodeForSession,
        getUser: mockGetUser
      }
    } as any)
    
    mockEnsureCustomerExists.mockResolvedValue({
      success: true,
      profile: {
        id: 'profile_123',
        avatar_url: null,
        billing_address: null,
        company_name: null,
        created_at: null,
        email: '',
        email_notifications: null,
        full_name: null,
        marketing_emails: null,
        phone: null,
        stripe_customer_id: null,
        timezone: null,
        updated_at: null,
        user_id: '',
        website_url: null
      },
      stripeCustomerId: 'cus_test123',
      isNewCustomer: true,
      isNewProfile: true
    })
    
    mockCheckAccountLinking.mockResolvedValue({ needsLinking: false })
    mockGenerateLinkingToken.mockReturnValue('token_123')
    mockEnsureStripeCustomer.mockResolvedValue({})
  })

  describe('OAuth Error Handling', () => {
    it('should handle access_denied error', async () => {
      const request = createMockRequest('https://example.com/auth/callback?error=access_denied')
      
      const response = await GET(request)
      
      expect(response.status).toBe(302)
      const location = response.headers.get('location')
      expect(location).toMatch(/^https:\/\/example\.com\/login\?/)
      expect(location).toContain('error=You+cancelled+the+sign-in+process.+Please+try+again+if+you+want+to+continue.')
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Auth callback error:',
        expect.objectContaining({ error: 'access_denied' })
      )
    })

    it('should handle invalid_grant error', async () => {
      const request = createMockRequest('https://example.com/auth/callback?error=invalid_grant')
      
      const response = await GET(request)
      
      expect(response.status).toBe(302)
      expect(response.headers.get('location')).toContain('error=The+authorization+code+is+invalid+or+expired.+Please+try+signing+in+again.')
    })

    it('should handle server_error with custom description', async () => {
      const request = createMockRequest('https://example.com/auth/callback?error=server_error&error_description=Google%20encountered%20an%20error%20during%20sign-in')
      
      const response = await GET(request)
      
      expect(response.status).toBe(302)
      expect(response.headers.get('location')).toContain('error=Google+encountered+an+error+during+sign-in.+Please+try+again+in+a+moment.')
    })

    it('should handle unknown error with description', async () => {
      const request = createMockRequest('https://example.com/auth/callback?error=unknown_error&error_description=Custom+description')
      
      const response = await GET(request)
      
      expect(response.status).toBe(302)
      expect(response.headers.get('location')).toContain('error=Custom+description')
    })

    it('should handle all OAuth error types', async () => {
      const errorTypes = [
        'invalid_request',
        'temporarily_unavailable', 
        'invalid_scope'
      ]
      
      for (const errorType of errorTypes) {
        const request = createMockRequest(`https://example.com/auth/callback?error=${errorType}`)
        const response = await GET(request)
        
        expect(response.status).toBe(302)
        const location = response.headers.get('location')
        expect(location).toMatch(/^https:\/\/example\.com\/login\?/)
        expect(location).toContain('error=')
      }
    })
  })

  describe('Code Exchange Flow', () => {
    it('should handle successful code exchange for existing user', async () => {
      const request = createMockRequest('https://example.com/auth/callback?code=auth_code_123&next=/dashboard')
      
      mockExchangeCodeForSession.mockResolvedValue({ error: null })
      mockGetUser.mockResolvedValue({
        data: {
          user: {
            id: 'user_123',
            email: 'test@example.com',
            created_at: '2020-01-01T00:00:00Z', // Old user
            app_metadata: { providers: ['email'] }
          }
        }
      })
      
      const response = await GET(request)
      
      expect(response.status).toBe(302)
      expect(response.headers.get('location')).toBe('https://example.com/dashboard')
      expect(mockExchangeCodeForSession).toHaveBeenCalledWith('auth_code_123')
    })

    it('should handle code exchange error with invalid_grant', async () => {
      const request = createMockRequest('https://example.com/auth/callback?code=invalid_code')
      
      mockExchangeCodeForSession.mockResolvedValue({
        error: { message: 'invalid_grant' }
      })
      
      const response = await GET(request)
      
      expect(response.status).toBe(302)
      const location = response.headers.get('location')
      expect(location).toMatch(/^https:\/\/example\.com\/login\?/)
      expect(location).toContain('error=The+authorization+code+is+invalid+or+expired.+Please+try+signing+in+again.')
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Code exchange error:',
        expect.objectContaining({ code: 'invalid_co...' })
      )
    })

    it('should handle network error during code exchange', async () => {
      const request = createMockRequest('https://example.com/auth/callback?code=auth_code_123')
      
      mockExchangeCodeForSession.mockResolvedValue({
        error: { message: 'network error occurred' }
      })
      
      const response = await GET(request)
      
      expect(response.status).toBe(302)
      expect(response.headers.get('location')).toContain('error=Network+error+during+authentication.+Please+check+your+connection+and+try+again.')
    })

    it('should handle generic exchange error', async () => {
      const request = createMockRequest('https://example.com/auth/callback?code=auth_code_123')
      
      mockExchangeCodeForSession.mockResolvedValue({
        error: { message: 'Some other error' }
      })
      
      const response = await GET(request)
      
      expect(response.status).toBe(302)
      expect(response.headers.get('location')).toContain('error=Authentication+failed.+Please+try+again.')
    })
  })

  describe('New User Detection and Setup', () => {
    const baseTime = 1000000
    const recentTime = baseTime + 30000 // 30 seconds later
    
    beforeEach(() => {
      mockDateNow.mockReturnValue(recentTime)
    })

    it('should detect new OAuth user and create Stripe customer', async () => {
      const request = createMockRequest('https://example.com/auth/callback?code=auth_code_123')
      
      mockExchangeCodeForSession.mockResolvedValue({ error: null })
      mockGetUser.mockResolvedValue({
        data: {
          user: {
            id: 'user_123',
            email: 'test@example.com',
            created_at: new Date(baseTime).toISOString(), // Recent signup
            app_metadata: { providers: ['google'] },
            user_metadata: {}
          }
        }
      })
      
      const response = await GET(request)
      
      expect(response.status).toBe(302)
      const location = response.headers.get('location')
      expect(location).toMatch(/^https:\/\/example\.com\/auth\/setup-profile\?/)
      expect(location).toContain('message=Successfully+signed+up+with+Google%21+Let%27s+complete+your+profile.')
      expect(mockEnsureStripeCustomer).toHaveBeenCalledWith('user_123', 'test@example.com')
      expect(mockConsoleLog).toHaveBeenCalledWith('[AUTH CALLBACK] Stripe customer created for OAuth user')
    })

    it('should handle Stripe customer creation failure gracefully', async () => {
      const request = createMockRequest('https://example.com/auth/callback?code=auth_code_123')
      
      mockExchangeCodeForSession.mockResolvedValue({ error: null })
      mockGetUser.mockResolvedValue({
        data: {
          user: {
            id: 'user_123',
            email: 'test@example.com',
            created_at: new Date(baseTime).toISOString(),
            app_metadata: { providers: ['google'] }
          }
        }
      })
      
      mockEnsureStripeCustomer.mockRejectedValue(new Error('Stripe API error'))
      
      const response = await GET(request)
      
      expect(response.status).toBe(302)
      const location = response.headers.get('location')
      expect(location).toMatch(/^https:\/\/example\.com\/auth\/setup-profile\?/)
      expect(mockConsoleError).toHaveBeenCalledWith(
        '[AUTH CALLBACK] Stripe customer creation failed:',
        expect.any(Error)
      )
    })

    it('should create customer and profile for email signup', async () => {
      const request = createMockRequest('https://example.com/auth/callback?code=auth_code_123&type=signup')
      
      mockExchangeCodeForSession.mockResolvedValue({ error: null })
      mockGetUser.mockResolvedValue({
        data: {
          user: {
            id: 'user_123',
            email: 'test@example.com',
            created_at: '2020-01-01T00:00:00Z', // Old timestamp
            app_metadata: { providers: ['email'] },
            user_metadata: { full_name: 'Test User' }
          }
        }
      })
      
      const response = await GET(request)
      
      expect(response.status).toBe(302)
      const location = response.headers.get('location')
      expect(location).toMatch(/^https:\/\/example\.com\/profile\?/)
      expect(location).toContain('message=Email+confirmed+successfully%21+Welcome+to+your+account.')
      expect(mockEnsureCustomerExists).toHaveBeenCalledWith('user_123', 'test@example.com', 'Test User')
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[AUTH CALLBACK] Customer and profile created successfully',
        expect.objectContaining({
          profileId: 'profile_123',
          stripeCustomerId: 'cus_test123'
        })
      )
    })
  })

  describe('Password Reset Flow', () => {
    it('should redirect to password reset confirmation', async () => {
      const request = createMockRequest('https://example.com/auth/callback?code=auth_code_123&type=recovery')
      
      mockExchangeCodeForSession.mockResolvedValue({ error: null })
      mockGetUser.mockResolvedValue({
        data: {
          user: {
            id: 'user_123',
            email: 'test@example.com',
            created_at: '2020-01-01T00:00:00Z',
            app_metadata: { providers: ['email'] }
          }
        }
      })
      
      const response = await GET(request)
      
      expect(response.status).toBe(302)
      expect(response.headers.get('location')).toBe('https://example.com/reset-password/confirm')
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing code parameter', async () => {
      const request = createMockRequest('https://example.com/auth/callback')
      
      const response = await GET(request)
      
      expect(response.status).toBe(302)
      const location = response.headers.get('location')
      expect(location).toMatch(/^https:\/\/example\.com\/login\?/)
      expect(location).toContain('error=Invalid+authentication+request.')
      expect(mockConsoleWarn).toHaveBeenCalledWith('Auth callback called without code parameter')
    })

    it('should handle unexpected errors during processing', async () => {
      const request = createMockRequest('https://example.com/auth/callback?code=auth_code_123')
      
      mockCreateServerComponentClient.mockRejectedValue(new Error('Unexpected error'))
      
      const response = await GET(request)
      
      expect(response.status).toBe(302)
      const location = response.headers.get('location')
      expect(location).toMatch(/^https:\/\/example\.com\/login\?/)
      expect(location).toContain('error=An+unexpected+error+occurred+during+authentication.')
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Auth callback processing error:',
        expect.any(Error)
      )
    })

    it('should handle custom next parameter', async () => {
      const request = createMockRequest('https://example.com/auth/callback?code=auth_code_123&next=/custom-page')
      
      mockExchangeCodeForSession.mockResolvedValue({ error: null })
      mockGetUser.mockResolvedValue({
        data: {
          user: {
            id: 'user_123',
            email: 'test@example.com',
            created_at: '2020-01-01T00:00:00Z',
            app_metadata: { providers: ['email'] }
          }
        }
      })
      
      const response = await GET(request)
      
      expect(response.status).toBe(302)
      expect(response.headers.get('location')).toBe('https://example.com/custom-page')
    })

    it('should handle existing OAuth user signin', async () => {
      const request = createMockRequest('https://example.com/auth/callback?code=auth_code_123')
      
      mockExchangeCodeForSession.mockResolvedValue({ error: null })
      mockGetUser.mockResolvedValue({
        data: {
          user: {
            id: 'user_123',
            email: 'test@example.com',
            created_at: new Date(500000).toISOString(), // Old user
            app_metadata: { providers: ['google'] }
          }
        }
      })
      
      const response = await GET(request)
      
      expect(response.status).toBe(302)
      const location = response.headers.get('location')
      expect(location).toBe('https://example.com/profile?message=Successfully+signed+in+with+Google%21')
    })
  })
}) 