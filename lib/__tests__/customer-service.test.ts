/**
 * @jest-environment node
 */
import type { Profile } from '@/types/database'

// Mock Stripe with proper TypeScript typing
const mockStripeCreate = jest.fn()
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    customers: {
      create: mockStripeCreate
    }
  }))
})

// Mock the Supabase client module
const mockRpc = jest.fn()
const mockSingle = jest.fn()
const mockEq = jest.fn(() => ({ single: mockSingle }))
const mockSelect = jest.fn()
const mockUpdateEq = jest.fn(() => ({ select: mockSelect }))
const mockUpdate = jest.fn(() => ({ eq: mockUpdateEq }))
const mockSelectQuery = jest.fn(() => ({ eq: mockEq }))
const mockFrom = jest.fn((table: string) => {
  if (table === 'profiles') {
    return { 
      select: mockSelectQuery,
      update: mockUpdate
    }
  }
  return { 
    select: mockSelectQuery,
    update: mockUpdate
  }
})

jest.mock('@/lib/supabase', () => ({
  createAdminClient: () => ({
    rpc: mockRpc,
    from: mockFrom
  })
}))

import {
  createCustomerAndProfile,
  createStripeCustomer,
  getCustomerByUserId,
  updateCustomerStripeId
} from '../customer-service'

// Mock console methods
const consoleSpy = {
  log: jest.spyOn(console, 'log').mockImplementation(),
  error: jest.spyOn(console, 'error').mockImplementation()
}

describe('Customer Service', () => {
  const mockProfile: Profile = {
    id: 'profile-123',
    user_id: 'user-123',
    email: 'test@example.com',
    full_name: 'John Doe',
    stripe_customer_id: 'cus_test123',
    avatar_url: null,
    billing_address: null,
    company_name: null,
    phone: null,
    website_url: null,
    timezone: null,
    email_notifications: true,
    marketing_emails: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    consoleSpy.log.mockClear()
    consoleSpy.error.mockClear()
  })

  describe('createCustomerAndProfile', () => {
    it('should create customer and profile successfully', async () => {
      mockRpc.mockResolvedValueOnce({
        data: [{
          profile_id: 'profile-123',
          created_customer: true,
          created_profile: true
        }],
        error: null
      })

      mockSingle.mockResolvedValueOnce({
        data: mockProfile,
        error: null
      })

      const result = await createCustomerAndProfile(
        'user-123',
        'test@example.com',
        'cus_test123',
        'John Doe'
      )

      expect(result).toEqual({
        success: true,
        profile: mockProfile,
        stripeCustomerId: 'cus_test123',
        isNewCustomer: true,
        isNewProfile: true
      })

      expect(mockRpc).toHaveBeenCalledWith('create_customer_and_profile_atomic', {
        p_user_id: 'user-123',
        p_email: 'test@example.com',
        p_stripe_customer_id: 'cus_test123',
        p_full_name: 'John Doe'
      })
    })

    it('should handle database error', async () => {
      mockRpc.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database connection failed' }
      })

      const result = await createCustomerAndProfile(
        'user-123',
        'test@example.com',
        'cus_test123'
      )

      expect(result).toEqual({
        success: false,
        profile: null,
        stripeCustomerId: null,
        error: 'Database error: Database connection failed'
      })
    })

    it('should handle unexpected errors', async () => {
      mockRpc.mockRejectedValueOnce(new Error('Unexpected error'))

      const result = await createCustomerAndProfile(
        'user-123',
        'test@example.com',
        'cus_test123'
      )

      expect(result).toEqual({
        success: false,
        profile: null,
        stripeCustomerId: null,
        error: 'Unexpected error'
      })
    })
  })

  describe('createStripeCustomer', () => {
    it('should create Stripe customer successfully', async () => {
      const mockCustomer = {
        id: 'cus_new123',
        email: 'test@example.com',
        name: 'John Doe'
      }

      mockStripeCreate.mockResolvedValueOnce(mockCustomer)

      const result = await createStripeCustomer('test@example.com', 'John Doe', { userId: 'user-123' })

      expect(result).toEqual({
        success: true,
        customer: mockCustomer
      })
    })

    it('should handle Stripe API error', async () => {
      mockStripeCreate.mockRejectedValueOnce(new Error('Stripe API error'))

      const result = await createStripeCustomer('test@example.com')

      expect(result).toEqual({
        success: false,
        error: 'Stripe API error'
      })
    })
  })

  describe('getCustomerByUserId', () => {
    it('should get customer by user ID successfully', async () => {
      mockSingle.mockResolvedValueOnce({
        data: mockProfile,
        error: null
      })

      const result = await getCustomerByUserId('user-123')

      expect(result).toEqual({
        success: true,
        profile: mockProfile,
        stripeCustomerId: 'cus_test123'
      })

      expect(mockFrom).toHaveBeenCalledWith('profiles')
      expect(mockSelectQuery).toHaveBeenCalledWith('*')
      expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123')
    })

    it('should handle profile not found', async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'Profile not found' }
      })

      const result = await getCustomerByUserId('user-123')

      expect(result).toEqual({
        success: false,
        error: 'Profile not found'
      })
    })
  })

  describe('updateCustomerStripeId', () => {
    it('should update customer Stripe ID successfully', async () => {
      mockSelect.mockResolvedValueOnce({
        data: [{ id: 'profile-123' }],
        error: null
      })

      const result = await updateCustomerStripeId('user-123', 'cus_new123')

      expect(result).toEqual({
        success: true
      })

      expect(mockFrom).toHaveBeenCalledWith('profiles')
      expect(mockUpdate).toHaveBeenCalledWith({ stripe_customer_id: 'cus_new123' })
      expect(mockUpdateEq).toHaveBeenCalledWith('user_id', 'user-123')
    })

    it('should handle update error', async () => {
      mockSelect.mockResolvedValueOnce({
        data: null,
        error: { message: 'Update failed' }
      })

      const result = await updateCustomerStripeId('user-123', 'cus_new123')

      expect(result).toEqual({
        success: false,
        error: 'Update failed'
      })
    })
  })
}) 