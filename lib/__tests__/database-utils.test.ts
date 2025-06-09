/**
 * Database Utilities Test Suite
 * 
 * Comprehensive tests for database utility functions including
 * profile utilities, subscription utilities, validation helpers,
 * and query builders with both happy paths and edge cases.
 */

import {
  // Profile utilities
  createProfileData,
  transformProfileFormData,
  parseBillingAddress,
  getProfileDisplayName,
  validateProfileData,
  
  // Subscription utilities
  createSubscriptionFromStripe,
  isActiveSubscription,
  isCanceledButActive,
  isExpiredSubscription,
  getDaysUntilExpiry,
  formatSubscriptionPrice,
  createSubscriptionSummary,
  filterSubscriptions,
  
  // Query builders
  buildProfileFilters,
  buildSubscriptionFilters,
  
  // Type guards
  isSubscriptionActive,
  hasProfile,
  
  // Constants
  SUBSCRIPTION_STATUSES,
  SUBSCRIPTION_INTERVALS,
  SUPPORTED_CURRENCIES,
  DEFAULT_TIMEZONE,
  ACTIVE_SUBSCRIPTION_STATUSES,
} from '../database-utils'

import type {
  Profile,
  ProfileFormData,
  Subscription,
  SubscriptionFilters,
  ProfileFilters,
  BillingAddress,
  StripeSubscriptionData,
} from '@/types/database'

// ==================================================
// MOCK DATA
// ==================================================

const mockProfile: Profile = {
  id: 'profile-1',
  user_id: 'user-1',
  email: 'test@example.com',
  full_name: 'John Doe',
  avatar_url: null,
  phone: '+1234567890',
  company_name: 'Test Company',
  website_url: 'https://example.com',
  timezone: 'UTC',
  email_notifications: true,
  marketing_emails: false,
  billing_address: null,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
}

const mockBillingAddress: BillingAddress = {
  line1: '123 Main St',
  line2: 'Apt 4B',
  city: 'New York',
  state: 'NY',
  postal_code: '10001',
  country: 'US',
}

const mockSubscription: Subscription = {
  id: 'sub-1',
  user_id: 'user-1',
  profile_id: 'profile-1',
  stripe_customer_id: 'cus_test123',
  stripe_subscription_id: 'sub_test123',
  stripe_price_id: 'price_test123',
  status: 'active',
  plan_name: 'Pro Plan',
  plan_description: 'Professional subscription',
  interval: 'month',
  interval_count: 1,
  unit_amount: 2999,
  currency: 'usd',
  current_period_start: '2024-01-01T00:00:00.000Z',
  current_period_end: '2024-02-01T00:00:00.000Z',
  trial_start: null,
  trial_end: null,
  cancel_at_period_end: false,
  canceled_at: null,
  cancel_at: null,
  metadata: null,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
}

const mockStripeData: StripeSubscriptionData = {
  stripe_customer_id: 'cus_test123',
  stripe_subscription_id: 'sub_test123',
  stripe_price_id: 'price_test123',
  status: 'active',
  current_period_start: '2024-01-01T00:00:00.000Z',
  current_period_end: '2024-02-01T00:00:00.000Z',
  cancel_at_period_end: false,
}

// ==================================================
// PROFILE UTILITIES TESTS
// ==================================================

describe('Profile Utilities', () => {
  describe('createProfileData', () => {
    it('creates basic profile data with minimal inputs', () => {
      const result = createProfileData('user-1', 'test@example.com')
      
      expect(result).toEqual({
        user_id: 'user-1',
        email: 'test@example.com',
        full_name: null,
        phone: null,
        company_name: null,
        website_url: null,
        timezone: 'UTC',
        email_notifications: true,
        marketing_emails: false,
        billing_address: null,
      })
    })

    it('creates profile data with additional fields', () => {
      const additional = {
        full_name: 'John Doe',
        phone: '+1234567890',
        company_name: 'Test Company',
        website_url: 'https://example.com',
        timezone: 'America/New_York',
        email_notifications: false,
        marketing_emails: true,
        billing_address: mockBillingAddress,
      }
      
      const result = createProfileData('user-1', 'test@example.com', additional)
      
      expect(result).toEqual({
        user_id: 'user-1',
        email: 'test@example.com',
        full_name: 'John Doe',
        phone: '+1234567890',
        company_name: 'Test Company',
        website_url: 'https://example.com',
        timezone: 'America/New_York',
        email_notifications: false,
        marketing_emails: true,
        billing_address: JSON.stringify(mockBillingAddress),
      })
    })

    it('handles empty additional data object', () => {
      const result = createProfileData('user-1', 'test@example.com', {})
      
      expect(result.user_id).toBe('user-1')
      expect(result.email).toBe('test@example.com')
      expect(result.timezone).toBe('UTC')
      expect(result.email_notifications).toBe(true)
      expect(result.marketing_emails).toBe(false)
    })
  })

  describe('transformProfileFormData', () => {
    it('transforms form data correctly', () => {
      const formData: ProfileFormData = {
        full_name: 'John Doe',
        phone: '+1234567890',
        company_name: 'Test Company',
        website_url: 'https://example.com',
        timezone: 'America/New_York',
        email_notifications: false,
        marketing_emails: true,
        billing_address: mockBillingAddress,
      }
      
      const result = transformProfileFormData(formData)
      
      expect(result).toEqual({
        full_name: 'John Doe',
        phone: '+1234567890',
        company_name: 'Test Company',
        website_url: 'https://example.com',
        timezone: 'America/New_York',
        email_notifications: false,
        marketing_emails: true,
        billing_address: JSON.stringify(mockBillingAddress),
      })
    })

    it('handles undefined timezone defaulting to UTC', () => {
      const formData: ProfileFormData = {
        full_name: 'John Doe',
        email_notifications: true,
        marketing_emails: false,
      }
      
      const result = transformProfileFormData(formData)
      
      expect(result.timezone).toBe('UTC')
    })

    it('handles null billing address', () => {
      const formData: ProfileFormData = {
        full_name: 'John Doe',
        email_notifications: true,
        marketing_emails: false,
        billing_address: null,
      }
      
      const result = transformProfileFormData(formData)
      
      expect(result.billing_address).toBe(null)
    })
  })

  describe('parseBillingAddress', () => {
    it('parses valid JSON string billing address', () => {
      const jsonString = JSON.stringify(mockBillingAddress)
      const result = parseBillingAddress(jsonString)
      
      expect(result).toEqual(mockBillingAddress)
    })

    it('parses object billing address', () => {
      const result = parseBillingAddress(mockBillingAddress)
      
      expect(result).toEqual(mockBillingAddress)
    })

    it('returns null for null input', () => {
      expect(parseBillingAddress(null)).toBe(null)
    })

    it('returns null for undefined input', () => {
      expect(parseBillingAddress(undefined)).toBe(null)
    })

    it('returns null for invalid JSON', () => {
      expect(parseBillingAddress('invalid json')).toBe(null)
    })

    it('returns null for incomplete address (missing required fields)', () => {
      const incompleteAddress = {
        line1: '123 Main St',
        city: 'New York',
        // Missing postal_code and country
      }
      
      expect(parseBillingAddress(incompleteAddress)).toBe(null)
    })

    it('handles address with optional fields missing', () => {
      const minimalAddress = {
        line1: '123 Main St',
        city: 'New York',
        postal_code: '10001',
        country: 'US',
      }
      
      const result = parseBillingAddress(minimalAddress)
      
      expect(result).toEqual({
        line1: '123 Main St',
        city: 'New York',
        postal_code: '10001',
        country: 'US',
      })
    })
  })

  describe('getProfileDisplayName', () => {
    it('returns full name when available', () => {
      const result = getProfileDisplayName(mockProfile)
      expect(result).toBe('John Doe')
    })

    it('returns email username when full name is null', () => {
      const profileWithoutName = { ...mockProfile, full_name: null }
      const result = getProfileDisplayName(profileWithoutName)
      expect(result).toBe('test')
    })

    it('returns email username when full name is empty string', () => {
      const profileWithoutName = { ...mockProfile, full_name: '' }
      const result = getProfileDisplayName(profileWithoutName)
      expect(result).toBe('test')
    })

    it('returns "User" fallback for edge cases', () => {
      const profileWithEmptyEmail = { ...mockProfile, full_name: null, email: '@example.com' }
      const result = getProfileDisplayName(profileWithEmptyEmail)
      expect(result).toBe('User')
    })
  })

  describe('validateProfileData', () => {
    it('validates correct profile data', () => {
      const validData: ProfileFormData = {
        full_name: 'John Doe',
        phone: '+1234567890',
        website_url: 'https://example.com',
        email_notifications: true,
        marketing_emails: false,
        billing_address: mockBillingAddress,
      }
      
      const result = validateProfileData(validData)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('validates profile data with minimal fields', () => {
      const minimalData: ProfileFormData = {
        email_notifications: true,
        marketing_emails: false,
      }
      
      const result = validateProfileData(minimalData)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('rejects invalid website URL', () => {
      const invalidData: ProfileFormData = {
        website_url: 'not-a-url',
        email_notifications: true,
        marketing_emails: false,
      }
      
      const result = validateProfileData(invalidData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Website URL must be a valid HTTP/HTTPS URL')
    })

    it('rejects invalid phone number', () => {
      const invalidData: ProfileFormData = {
        phone: '123',
        email_notifications: true,
        marketing_emails: false,
      }
      
      const result = validateProfileData(invalidData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Phone number format is invalid')
    })

    it('rejects incomplete billing address', () => {
      const invalidData: ProfileFormData = {
        billing_address: {
          line1: '123 Main St',
          city: 'New York',
          // Missing required fields
        } as BillingAddress,
        email_notifications: true,
        marketing_emails: false,
      }
      
      const result = validateProfileData(invalidData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Billing address is incomplete')
    })

    it('accumulates multiple errors', () => {
      const invalidData: ProfileFormData = {
        website_url: 'invalid-url',
        phone: '123',
        email_notifications: true,
        marketing_emails: false,
      }
      
      const result = validateProfileData(invalidData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(2)
      expect(result.errors).toContain('Website URL must be a valid HTTP/HTTPS URL')
      expect(result.errors).toContain('Phone number format is invalid')
    })
  })
})

// ==================================================
// SUBSCRIPTION UTILITIES TESTS
// ==================================================

describe('Subscription Utilities', () => {
  describe('createSubscriptionFromStripe', () => {
    it('creates subscription from Stripe data', () => {
      const result = createSubscriptionFromStripe(
        'user-1',
        'profile-1',
        mockStripeData,
        'Pro Plan',
        'Professional subscription'
      )
      
      expect(result).toEqual({
        user_id: 'user-1',
        profile_id: 'profile-1',
        stripe_customer_id: 'cus_test123',
        stripe_subscription_id: 'sub_test123',
        stripe_price_id: 'price_test123',
        status: 'active',
        plan_name: 'Pro Plan',
        plan_description: 'Professional subscription',
        interval: 'month',
        current_period_start: '2024-01-01T00:00:00.000Z',
        current_period_end: '2024-02-01T00:00:00.000Z',
        trial_start: null,
        trial_end: null,
        cancel_at_period_end: false,
        canceled_at: null,
        cancel_at: null,
        unit_amount: 0,
        currency: 'usd',
      })
    })

    it('creates subscription without description', () => {
      const result = createSubscriptionFromStripe(
        'user-1',
        'profile-1',
        mockStripeData,
        'Pro Plan'
      )
      
      expect(result.plan_description).toBe(null)
    })

    it('handles trial data', () => {
      const stripeDataWithTrial = {
        ...mockStripeData,
        trial_start: '2024-01-01T00:00:00.000Z',
        trial_end: '2024-01-15T00:00:00.000Z',
      }
      
      const result = createSubscriptionFromStripe(
        'user-1',
        'profile-1',
        stripeDataWithTrial,
        'Pro Plan'
      )
      
      expect(result.trial_start).toBe('2024-01-01T00:00:00.000Z')
      expect(result.trial_end).toBe('2024-01-15T00:00:00.000Z')
    })

    it('handles cancellation data', () => {
      const stripeDataWithCancellation = {
        ...mockStripeData,
        cancel_at_period_end: true,
        canceled_at: '2024-01-15T00:00:00.000Z',
        cancel_at: '2024-02-01T00:00:00.000Z',
      }
      
      const result = createSubscriptionFromStripe(
        'user-1',
        'profile-1',
        stripeDataWithCancellation,
        'Pro Plan'
      )
      
      expect(result.cancel_at_period_end).toBe(true)
      expect(result.canceled_at).toBe('2024-01-15T00:00:00.000Z')
      expect(result.cancel_at).toBe('2024-02-01T00:00:00.000Z')
    })
  })

  describe('isActiveSubscription', () => {
    it('returns true for active subscription', () => {
      const activeSubscription = { ...mockSubscription, status: 'active' }
      expect(isActiveSubscription(activeSubscription)).toBe(true)
    })

    it('returns true for trialing subscription', () => {
      const trialingSubscription = { ...mockSubscription, status: 'trialing' }
      expect(isActiveSubscription(trialingSubscription)).toBe(true)
    })

    it('returns false for canceled subscription', () => {
      const canceledSubscription = { ...mockSubscription, status: 'canceled' }
      expect(isActiveSubscription(canceledSubscription)).toBe(false)
    })

    it('returns false for past_due subscription', () => {
      const pastDueSubscription = { ...mockSubscription, status: 'past_due' }
      expect(isActiveSubscription(pastDueSubscription)).toBe(false)
    })

    it('returns false for incomplete subscription', () => {
      const incompleteSubscription = { ...mockSubscription, status: 'incomplete' }
      expect(isActiveSubscription(incompleteSubscription)).toBe(false)
    })
  })

  describe('isCanceledButActive', () => {
    beforeEach(() => {
      // Mock current date to control time-based tests
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2024-01-15T00:00:00.000Z'))
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('returns true for canceled but still active subscription', () => {
      const canceledButActive = {
        ...mockSubscription,
        status: 'active',
        cancel_at_period_end: true,
        current_period_end: '2024-02-01T00:00:00.000Z', // Future date
      }
      
      expect(isCanceledButActive(canceledButActive)).toBe(true)
    })

    it('returns false when cancel_at_period_end is false', () => {
      const notCanceled = {
        ...mockSubscription,
        status: 'active',
        cancel_at_period_end: false,
      }
      
      expect(isCanceledButActive(notCanceled)).toBe(false)
    })

    it('returns false when cancel_at_period_end is null', () => {
      const notCanceled = {
        ...mockSubscription,
        status: 'active',
        cancel_at_period_end: null,
      }
      
      expect(isCanceledButActive(notCanceled)).toBe(false)
    })

    it('returns false when subscription is not active', () => {
      const inactiveSubscription = {
        ...mockSubscription,
        status: 'canceled',
        cancel_at_period_end: true,
        current_period_end: '2024-02-01T00:00:00.000Z',
      }
      
      expect(isCanceledButActive(inactiveSubscription)).toBe(false)
    })

    it('returns false when period has already ended', () => {
      const expiredSubscription = {
        ...mockSubscription,
        status: 'active',
        cancel_at_period_end: true,
        current_period_end: '2024-01-01T00:00:00.000Z', // Past date
      }
      
      expect(isCanceledButActive(expiredSubscription)).toBe(false)
    })
  })

  describe('isExpiredSubscription', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2024-01-15T00:00:00.000Z'))
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('returns false for active subscription with future end date', () => {
      const activeSubscription = {
        ...mockSubscription,
        status: 'active',
        current_period_end: '2024-02-01T00:00:00.000Z',
      }
      
      expect(isExpiredSubscription(activeSubscription)).toBe(false)
    })

    it('returns true for active subscription with past end date', () => {
      const expiredSubscription = {
        ...mockSubscription,
        status: 'active',
        current_period_end: '2024-01-01T00:00:00.000Z',
      }
      
      expect(isExpiredSubscription(expiredSubscription)).toBe(true)
    })

    it('returns true for inactive subscription', () => {
      const inactiveSubscription = {
        ...mockSubscription,
        status: 'canceled',
      }
      
      expect(isExpiredSubscription(inactiveSubscription)).toBe(true)
    })
  })

  describe('getDaysUntilExpiry', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2024-01-15T00:00:00.000Z'))
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('calculates days until expiry correctly', () => {
      const subscription = {
        ...mockSubscription,
        current_period_end: '2024-01-20T00:00:00.000Z', // 5 days from mock current date
      }
      
      expect(getDaysUntilExpiry(subscription)).toBe(5)
    })

    it('returns negative number for past expiry', () => {
      const subscription = {
        ...mockSubscription,
        current_period_end: '2024-01-10T00:00:00.000Z', // 5 days before mock current date
      }
      
      expect(getDaysUntilExpiry(subscription)).toBe(-5)
    })

    it('returns 0 for same day expiry', () => {
      const subscription = {
        ...mockSubscription,
        current_period_end: '2024-01-15T12:00:00.000Z', // Same day but later time
      }
      
      expect(getDaysUntilExpiry(subscription)).toBe(1) // Math.ceil rounds up
    })
  })

  describe('formatSubscriptionPrice', () => {
    it('formats monthly price correctly', () => {
      const result = formatSubscriptionPrice(2999, 'usd', 'month')
      expect(result).toBe('$29.99/mo')
    })

    it('formats yearly price correctly', () => {
      const result = formatSubscriptionPrice(29999, 'usd', 'year')
      expect(result).toBe('$299.99/yr')
    })

    it('formats different currencies correctly', () => {
      expect(formatSubscriptionPrice(2999, 'eur', 'month')).toBe('€29.99/mo')
      expect(formatSubscriptionPrice(2999, 'gbp', 'month')).toBe('£29.99/mo')
      expect(formatSubscriptionPrice(2999, 'cad', 'month')).toBe('CA$29.99/mo')
    })

    it('handles zero amount', () => {
      const result = formatSubscriptionPrice(0, 'usd', 'month')
      expect(result).toBe('$0.00/mo')
    })

    it('handles large amounts', () => {
      const result = formatSubscriptionPrice(99999, 'usd', 'month')
      expect(result).toBe('$999.99/mo')
    })
  })

  describe('createSubscriptionSummary', () => {
    it('creates subscription summary correctly', () => {
      const result = createSubscriptionSummary(mockSubscription)
      
      expect(result).toEqual({
        id: 'sub-1',
        plan_name: 'Pro Plan',
        status: 'active',
        current_period_end: '2024-02-01T00:00:00.000Z',
        unit_amount: 2999,
        currency: 'usd',
      })
    })
  })

  describe('filterSubscriptions', () => {
    const subscriptions: Subscription[] = [
      { ...mockSubscription, id: 'sub-1', status: 'active', interval: 'month', currency: 'usd' },
      { ...mockSubscription, id: 'sub-2', status: 'trialing', interval: 'year', currency: 'eur' },
      { ...mockSubscription, id: 'sub-3', status: 'canceled', interval: 'month', currency: 'usd' },
      { ...mockSubscription, id: 'sub-4', status: 'past_due', interval: 'month', currency: 'gbp' },
    ]

    it('filters by single status', () => {
      const filters: SubscriptionFilters = { status: 'active' }
      const result = filterSubscriptions(subscriptions, filters)
      
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('sub-1')
    })

    it('filters by multiple statuses', () => {
      const filters: SubscriptionFilters = { status: ['active', 'trialing'] }
      const result = filterSubscriptions(subscriptions, filters)
      
      expect(result).toHaveLength(2)
      expect(result.map(s => s.id)).toEqual(['sub-1', 'sub-2'])
    })

    it('filters by active_only', () => {
      const filters: SubscriptionFilters = { active_only: true }
      const result = filterSubscriptions(subscriptions, filters)
      
      expect(result).toHaveLength(2)
      expect(result.every(s => ['active', 'trialing'].includes(s.status))).toBe(true)
    })

    it('filters by interval', () => {
      const filters: SubscriptionFilters = { interval: 'month' }
      const result = filterSubscriptions(subscriptions, filters)
      
      expect(result).toHaveLength(3)
      expect(result.every(s => s.interval === 'month')).toBe(true)
    })

    it('filters by currency', () => {
      const filters: SubscriptionFilters = { currency: 'usd' }
      const result = filterSubscriptions(subscriptions, filters)
      
      expect(result).toHaveLength(2)
      expect(result.every(s => s.currency === 'usd')).toBe(true)
    })

    it('combines multiple filters', () => {
      const filters: SubscriptionFilters = { 
        status: 'active',
        interval: 'month',
        currency: 'usd'
      }
      const result = filterSubscriptions(subscriptions, filters)
      
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('sub-1')
    })

    it('returns empty array when no matches', () => {
      const filters: SubscriptionFilters = { status: 'incomplete' }
      const result = filterSubscriptions(subscriptions, filters)
      
      expect(result).toHaveLength(0)
    })

    it('filters by expiring_soon', () => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2024-01-15T00:00:00.000Z'))

      const subscriptionsWithExpiry = subscriptions.map(sub => ({
        ...sub,
        current_period_end: '2024-01-20T00:00:00.000Z', // 5 days from now
      }))

      const filters: SubscriptionFilters = { expiring_soon: true }
      const result = filterSubscriptions(subscriptionsWithExpiry, filters)
      
      expect(result).toHaveLength(4) // All subscriptions expire within 7 days

      jest.useRealTimers()
    })
  })
})

// ==================================================
// QUERY BUILDERS TESTS
// ==================================================

describe('Query Builders', () => {
  describe('buildProfileFilters', () => {
    it('builds email filter', () => {
      const filters: ProfileFilters = { email: 'test' }
      const result = buildProfileFilters(filters)
      
      expect(result).toEqual({ email: 'ilike.%test%' })
    })

    it('builds company name filter', () => {
      const filters: ProfileFilters = { company_name: 'acme' }
      const result = buildProfileFilters(filters)
      
      expect(result).toEqual({ company_name: 'ilike.%acme%' })
    })

    it('builds date range filters', () => {
      const filters: ProfileFilters = { 
        created_after: '2024-01-01',
        created_before: '2024-12-31'
      }
      const result = buildProfileFilters(filters)
      
      expect(result).toEqual({ 
        created_at: 'lte.2024-12-31' // Latest filter wins
      })
    })

    it('combines multiple filters', () => {
      const filters: ProfileFilters = { 
        email: 'test',
        company_name: 'acme',
        created_after: '2024-01-01'
      }
      const result = buildProfileFilters(filters)
      
      expect(result).toEqual({
        email: 'ilike.%test%',
        company_name: 'ilike.%acme%',
        created_at: 'gte.2024-01-01'
      })
    })

    it('returns empty object for empty filters', () => {
      const result = buildProfileFilters({})
      expect(result).toEqual({})
    })
  })

  describe('buildSubscriptionFilters', () => {
    it('builds single status filter', () => {
      const filters: SubscriptionFilters = { status: 'active' }
      const result = buildSubscriptionFilters(filters)
      
      expect(result).toEqual({ status: 'eq.active' })
    })

    it('builds multiple status filter', () => {
      const filters: SubscriptionFilters = { status: ['active', 'trialing'] }
      const result = buildSubscriptionFilters(filters)
      
      expect(result).toEqual({ status: 'in.(active,trialing)' })
    })

    it('builds interval filter', () => {
      const filters: SubscriptionFilters = { interval: 'month' }
      const result = buildSubscriptionFilters(filters)
      
      expect(result).toEqual({ interval: 'eq.month' })
    })

    it('builds currency filter', () => {
      const filters: SubscriptionFilters = { currency: 'usd' }
      const result = buildSubscriptionFilters(filters)
      
      expect(result).toEqual({ currency: 'eq.usd' })
    })

    it('builds expiring soon filter', () => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2024-01-15T00:00:00.000Z'))

      const filters: SubscriptionFilters = { expiring_soon: true }
      const result = buildSubscriptionFilters(filters)
      
      expect(result.current_period_end).toMatch(/^lte\.2024-01-22T/)

      jest.useRealTimers()
    })

    it('combines multiple filters', () => {
      const filters: SubscriptionFilters = { 
        status: 'active',
        interval: 'month',
        currency: 'usd'
      }
      const result = buildSubscriptionFilters(filters)
      
      expect(result).toEqual({
        status: 'eq.active',
        interval: 'eq.month',
        currency: 'eq.usd'
      })
    })
  })
})

// ==================================================
// TYPE GUARDS TESTS
// ==================================================

describe('Type Guards', () => {
  describe('isSubscriptionActive', () => {
    it('returns true for active subscription', () => {
      const activeSubscription = { ...mockSubscription, status: 'active' }
      expect(isSubscriptionActive(activeSubscription)).toBe(true)
    })

    it('returns true for trialing subscription', () => {
      const trialingSubscription = { ...mockSubscription, status: 'trialing' }
      expect(isSubscriptionActive(trialingSubscription)).toBe(true)
    })

    it('returns false for non-active subscription', () => {
      const canceledSubscription = { ...mockSubscription, status: 'canceled' }
      expect(isSubscriptionActive(canceledSubscription)).toBe(false)
    })
  })

  describe('hasProfile', () => {
    it('returns true for subscription with profile', () => {
      const subscriptionWithProfile = {
        ...mockSubscription,
        profile: mockProfile
      }
      
      expect(hasProfile(subscriptionWithProfile)).toBe(true)
    })

    it('returns false for subscription without profile', () => {
      expect(hasProfile(mockSubscription)).toBe(false)
    })

    it('returns false for null profile', () => {
      const subscriptionWithNullProfile = {
        ...mockSubscription,
        profile: null
      }
      
      expect(hasProfile(subscriptionWithNullProfile)).toBe(false)
    })

    it('returns false for undefined input', () => {
      expect(hasProfile(undefined)).toBe(false)
    })

    it('returns false for null input', () => {
      expect(hasProfile(null)).toBe(false)
    })

    it('returns false for subscription with profile as string', () => {
      const subscriptionWithStringProfile = {
        ...mockSubscription,
        profile: 'not-an-object'
      }
      
      expect(hasProfile(subscriptionWithStringProfile)).toBe(false)
    })
  })
})

// ==================================================
// CONSTANTS TESTS
// ==================================================

describe('Constants', () => {
  it('exports correct subscription statuses', () => {
    expect(SUBSCRIPTION_STATUSES).toEqual([
      'incomplete',
      'incomplete_expired', 
      'trialing',
      'active',
      'past_due',
      'canceled',
      'unpaid',
      'paused'
    ])
  })

  it('exports correct subscription intervals', () => {
    expect(SUBSCRIPTION_INTERVALS).toEqual(['month', 'year'])
  })

  it('exports correct supported currencies', () => {
    expect(SUPPORTED_CURRENCIES).toEqual(['usd', 'eur', 'gbp', 'cad'])
  })

  it('exports correct default timezone', () => {
    expect(DEFAULT_TIMEZONE).toBe('UTC')
  })

  it('exports correct active subscription statuses', () => {
    expect(ACTIVE_SUBSCRIPTION_STATUSES).toEqual(['active', 'trialing'])
  })
}) 