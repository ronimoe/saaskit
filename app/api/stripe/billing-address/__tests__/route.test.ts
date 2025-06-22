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

// Mock Stripe server
jest.mock('@/lib/stripe-server', () => ({
  stripe: {
    customers: {
      retrieve: jest.fn(),
      update: jest.fn()
    }
  }
}))

// Mock customer service
jest.mock('@/lib/customer-service', () => ({
  getCustomerByUserId: jest.fn()
}))

import { POST, PUT } from '../route'
import { stripe } from '@/lib/stripe-server'
import { getCustomerByUserId } from '@/lib/customer-service'

describe('/api/stripe/billing-address', () => {
  const createRequest = (body: unknown, method: string = 'POST') => {
    return new MockNextRequest('http://localhost:3000/api/stripe/billing-address', {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }) as any
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST (Get billing address)', () => {
    it('should return 400 when userId is missing', async () => {
      const request = createRequest({})

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        error: 'Missing required field: userId'
      })
    })

    it('should return null address when no Stripe customer found', async () => {
      ;(getCustomerByUserId as jest.Mock).mockResolvedValue({
        success: false,
        stripeCustomerId: null
      })

      const request = createRequest({
        userId: 'user-123'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        address: null
      })

      expect(getCustomerByUserId).toHaveBeenCalledWith('user-123')
    })

    it('should return null address when customer service returns no stripeCustomerId', async () => {
      ;(getCustomerByUserId as jest.Mock).mockResolvedValue({
        success: true,
        stripeCustomerId: null
      })

      const request = createRequest({
        userId: 'user-123'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        address: null
      })
    })

    it('should return null address when Stripe customer is deleted', async () => {
      ;(getCustomerByUserId as jest.Mock).mockResolvedValue({
        success: true,
        stripeCustomerId: 'cus_123'
      })

      ;(stripe.customers.retrieve as jest.Mock).mockResolvedValue({
        deleted: true
      })

      const request = createRequest({
        userId: 'user-123'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        address: null
      })

      expect(stripe.customers.retrieve).toHaveBeenCalledWith('cus_123')
    })

    it('should return null address when customer has no address', async () => {
      ;(getCustomerByUserId as jest.Mock).mockResolvedValue({
        success: true,
        stripeCustomerId: 'cus_123'
      })

      ;(stripe.customers.retrieve as jest.Mock).mockResolvedValue({
        deleted: false,
        address: null
      })

      const request = createRequest({
        userId: 'user-123'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        address: null
      })
    })

    it('should return formatted address when customer has address', async () => {
      ;(getCustomerByUserId as jest.Mock).mockResolvedValue({
        success: true,
        stripeCustomerId: 'cus_123'
      })

      ;(stripe.customers.retrieve as jest.Mock).mockResolvedValue({
        deleted: false,
        address: {
          line1: '123 Main St',
          line2: 'Apt 4B',
          city: 'New York',
          state: 'NY',
          postal_code: '10001',
          country: 'US'
        }
      })

      const request = createRequest({
        userId: 'user-123'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        address: {
          line1: '123 Main St',
          line2: 'Apt 4B',
          city: 'New York',
          state: 'NY',
          postal_code: '10001',
          country: 'US'
        }
      })
    })

    it('should handle partial address data', async () => {
      ;(getCustomerByUserId as jest.Mock).mockResolvedValue({
        success: true,
        stripeCustomerId: 'cus_123'
      })

      ;(stripe.customers.retrieve as jest.Mock).mockResolvedValue({
        deleted: false,
        address: {
          line1: '123 Main St',
          line2: null,
          city: 'New York',
          state: null,
          postal_code: '10001',
          country: null
        }
      })

      const request = createRequest({
        userId: 'user-123'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        address: {
          line1: '123 Main St',
          line2: '',
          city: 'New York',
          state: '',
          postal_code: '10001',
          country: 'US'
        }
      })
    })

    it('should handle errors during address retrieval', async () => {
      ;(getCustomerByUserId as jest.Mock).mockResolvedValue({
        success: true,
        stripeCustomerId: 'cus_123'
      })

      ;(stripe.customers.retrieve as jest.Mock).mockRejectedValue(new Error('Stripe API error'))

      const request = createRequest({
        userId: 'user-123'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        error: 'Failed to fetch billing address'
      })
    })

    it('should handle JSON parsing errors', async () => {
      const request = new MockNextRequest('http://localhost:3000/api/stripe/billing-address', {
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
        error: 'Failed to fetch billing address'
      })
    })
  })

  describe('PUT (Update billing address)', () => {
    it('should return 400 when userId is missing', async () => {
      const request = createRequest({
        address: {
          line1: '123 Main St',
          city: 'New York',
          state: 'NY',
          postal_code: '10001',
          country: 'US'
        }
      }, 'PUT')

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        error: 'Missing required fields: userId, address'
      })
    })

    it('should return 400 when address is missing', async () => {
      const request = createRequest({
        userId: 'user-123'
      }, 'PUT')

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        error: 'Missing required fields: userId, address'
      })
    })

    it('should return 400 when required address fields are missing', async () => {
      const request = createRequest({
        userId: 'user-123',
        address: {
          line1: '123 Main St',
          city: 'New York'
          // Missing state, postal_code, country
        }
      }, 'PUT')

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        error: 'Missing required address fields: line1, city, state, postal_code, country'
      })
    })

    it('should return 404 when no Stripe customer found', async () => {
      ;(getCustomerByUserId as jest.Mock).mockResolvedValue({
        success: false,
        stripeCustomerId: null
      })

      const request = createRequest({
        userId: 'user-123',
        address: {
          line1: '123 Main St',
          city: 'New York',
          state: 'NY',
          postal_code: '10001',
          country: 'US'
        }
      }, 'PUT')

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data).toEqual({
        error: 'No billing account found. Please create a subscription first.'
      })
    })

    it('should return 404 when customer service returns no stripeCustomerId', async () => {
      ;(getCustomerByUserId as jest.Mock).mockResolvedValue({
        success: true,
        stripeCustomerId: null
      })

      const request = createRequest({
        userId: 'user-123',
        address: {
          line1: '123 Main St',
          city: 'New York',
          state: 'NY',
          postal_code: '10001',
          country: 'US'
        }
      }, 'PUT')

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data).toEqual({
        error: 'No billing account found. Please create a subscription first.'
      })
    })

    it('should successfully update billing address', async () => {
      ;(getCustomerByUserId as jest.Mock).mockResolvedValue({
        success: true,
        stripeCustomerId: 'cus_123'
      })

      const updatedAddress = {
        line1: '123 Main St',
        line2: 'Apt 4B',
        city: 'New York',
        state: 'NY',
        postal_code: '10001',
        country: 'US'
      }

      ;(stripe.customers.update as jest.Mock).mockResolvedValue({
        address: updatedAddress
      })

      const request = createRequest({
        userId: 'user-123',
        address: updatedAddress
      }, 'PUT')

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        address: updatedAddress
      })

      expect(stripe.customers.update).toHaveBeenCalledWith('cus_123', {
        address: {
          line1: '123 Main St',
          line2: 'Apt 4B',
          city: 'New York',
          state: 'NY',
          postal_code: '10001',
          country: 'US'
        }
      })
    })

    it('should successfully update billing address without line2', async () => {
      ;(getCustomerByUserId as jest.Mock).mockResolvedValue({
        success: true,
        stripeCustomerId: 'cus_123'
      })

      const addressWithoutLine2 = {
        line1: '123 Main St',
        city: 'New York',
        state: 'NY',
        postal_code: '10001',
        country: 'US'
      }

      const expectedStripeAddress = {
        line1: '123 Main St',
        line2: null,
        city: 'New York',
        state: 'NY',
        postal_code: '10001',
        country: 'US'
      }

      ;(stripe.customers.update as jest.Mock).mockResolvedValue({
        address: expectedStripeAddress
      })

      const request = createRequest({
        userId: 'user-123',
        address: addressWithoutLine2
      }, 'PUT')

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        address: expectedStripeAddress
      })

      expect(stripe.customers.update).toHaveBeenCalledWith('cus_123', {
        address: expectedStripeAddress
      })
    })

    it('should handle Stripe API errors during update', async () => {
      ;(getCustomerByUserId as jest.Mock).mockResolvedValue({
        success: true,
        stripeCustomerId: 'cus_123'
      })

      ;(stripe.customers.update as jest.Mock).mockRejectedValue(new Error('Stripe API error'))

      const request = createRequest({
        userId: 'user-123',
        address: {
          line1: '123 Main St',
          city: 'New York',
          state: 'NY',
          postal_code: '10001',
          country: 'US'
        }
      }, 'PUT')

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        error: 'Failed to update billing address'
      })
    })

    it('should handle JSON parsing errors', async () => {
      const request = new MockNextRequest('http://localhost:3000/api/stripe/billing-address', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: 'invalid json'
      }) as any

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        error: 'Failed to update billing address'
      })
    })
  })
}) 