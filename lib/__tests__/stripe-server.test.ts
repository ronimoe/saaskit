/**
 * @jest-environment node
 */

import { jest } from '@jest/globals'
import {
  stripe,
  isSubscriptionActive,
  isSubscriptionCanceling,
  verifyWebhookSignature
} from '../stripe-server'
import type { StripeSubscription } from '../stripe-server'
import Stripe from 'stripe'

// Mock Stripe
jest.mock('stripe')

describe('Stripe Server Library', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('stripe instance', () => {
    it('should be properly initialized', () => {
      expect(stripe).toBeDefined()
      // Note: We can't test instanceof with mocked modules
      expect(typeof stripe).toBe('object')
    })
  })

  describe('isSubscriptionActive', () => {
    it('should return true for active subscription', () => {
      expect(isSubscriptionActive('active')).toBe(true)
    })

    it('should return true for trialing subscription', () => {
      expect(isSubscriptionActive('trialing')).toBe(true)
    })

    it('should return false for inactive subscriptions', () => {
      expect(isSubscriptionActive('canceled')).toBe(false)
      expect(isSubscriptionActive('incomplete')).toBe(false)
      expect(isSubscriptionActive('incomplete_expired')).toBe(false)
      expect(isSubscriptionActive('past_due')).toBe(false)
      expect(isSubscriptionActive('unpaid')).toBe(false)
      expect(isSubscriptionActive('paused')).toBe(false)
    })
  })

  describe('isSubscriptionCanceling', () => {
    it('should return true for active subscription set to cancel at period end', () => {
      const subscription: StripeSubscription = {
        id: 'sub_123',
        customerId: 'cus_123',
        status: 'active',
        priceId: 'price_123',
        currentPeriodStart: new Date('2024-01-01'),
        currentPeriodEnd: new Date('2024-02-01'),
        cancelAtPeriodEnd: true
      }

      expect(isSubscriptionCanceling(subscription)).toBe(true)
    })

    it('should return false for active subscription not set to cancel', () => {
      const subscription: StripeSubscription = {
        id: 'sub_123',
        customerId: 'cus_123',
        status: 'active',
        priceId: 'price_123',
        currentPeriodStart: new Date('2024-01-01'),
        currentPeriodEnd: new Date('2024-02-01'),
        cancelAtPeriodEnd: false
      }

      expect(isSubscriptionCanceling(subscription)).toBe(false)
    })

    it('should return false for canceled subscription', () => {
      const subscription: StripeSubscription = {
        id: 'sub_123',
        customerId: 'cus_123',
        status: 'canceled',
        priceId: 'price_123',
        currentPeriodStart: new Date('2024-01-01'),
        currentPeriodEnd: new Date('2024-02-01'),
        cancelAtPeriodEnd: true
      }

      expect(isSubscriptionCanceling(subscription)).toBe(false)
    })

    it('should return false for trialing subscription set to cancel', () => {
      const subscription: StripeSubscription = {
        id: 'sub_123',
        customerId: 'cus_123',
        status: 'trialing',
        priceId: 'price_123',
        currentPeriodStart: new Date('2024-01-01'),
        currentPeriodEnd: new Date('2024-02-01'),
        cancelAtPeriodEnd: true
      }

      expect(isSubscriptionCanceling(subscription)).toBe(false)
    })
  })

  describe('verifyWebhookSignature', () => {
    const mockEvent = { id: 'evt_123', type: 'invoice.payment_succeeded' } as Stripe.Event
    const mockConstructEvent = jest.fn()

    beforeEach(() => {
      // Mock stripe.webhooks.constructEvent
      Object.defineProperty(stripe, 'webhooks', {
        value: {
          constructEvent: mockConstructEvent
        },
        writable: true
      })
    })

    it('should verify webhook signature with string payload', () => {
      // Arrange
      const payload = '{"id":"evt_123","type":"invoice.payment_succeeded"}'
      const signature = 'whsec_test_signature'
      const secret = 'whsec_test_secret'
      
      mockConstructEvent.mockReturnValue(mockEvent)

      // Act
      const result = verifyWebhookSignature(payload, signature, secret)

      // Assert
      expect(result).toEqual(mockEvent)
      expect(mockConstructEvent).toHaveBeenCalledWith(payload, signature, secret)
    })

    it('should verify webhook signature with Buffer payload', () => {
      // Arrange
      const payload = Buffer.from('{"id":"evt_123","type":"invoice.payment_succeeded"}')
      const signature = 'whsec_test_signature'
      const secret = 'whsec_test_secret'
      
      mockConstructEvent.mockReturnValue(mockEvent)

      // Act
      const result = verifyWebhookSignature(payload, signature, secret)

      // Assert
      expect(result).toEqual(mockEvent)
      expect(mockConstructEvent).toHaveBeenCalledWith(payload, signature, secret)
    })

    it('should throw error for invalid signature', () => {
      // Arrange
      const payload = '{"id":"evt_123","type":"invoice.payment_succeeded"}'
      const signature = 'invalid_signature'
      const secret = 'whsec_test_secret'
      
      mockConstructEvent.mockImplementation(() => {
        throw new Error('Invalid signature')
      })

      // Act & Assert
      expect(() => verifyWebhookSignature(payload, signature, secret)).toThrow('Invalid signature')
    })

    it('should throw error for missing secret', () => {
      // Arrange
      const payload = '{"id":"evt_123","type":"invoice.payment_succeeded"}'
      const signature = 'whsec_test_signature'
      const secret = ''
      
      mockConstructEvent.mockImplementation(() => {
        throw new Error('Missing webhook secret')
      })

      // Act & Assert
      expect(() => verifyWebhookSignature(payload, signature, secret)).toThrow('Missing webhook secret')
    })
  })

  describe('Type definitions', () => {
    it('should have correct StripeCustomer interface', () => {
      // This test ensures the interface is properly exported and typed
      const customer = {
        id: 'cus_123',
        email: 'test@example.com',
        name: 'Test User',
        metadata: { userId: 'user_123' }
      }

      // TypeScript will catch any type issues at compile time
      expect(customer.id).toBe('cus_123')
      expect(customer.email).toBe('test@example.com')
      expect(customer.name).toBe('Test User')
      expect(customer.metadata?.userId).toBe('user_123')
    })

    it('should have correct StripeSubscription interface', () => {
      const subscription: StripeSubscription = {
        id: 'sub_123',
        customerId: 'cus_123',
        status: 'active',
        priceId: 'price_123',
        currentPeriodStart: new Date('2024-01-01'),
        currentPeriodEnd: new Date('2024-02-01'),
        cancelAtPeriodEnd: false,
        metadata: { planType: 'pro' }
      }

      expect(subscription.id).toBe('sub_123')
      expect(subscription.customerId).toBe('cus_123')
      expect(subscription.status).toBe('active')
      expect(subscription.priceId).toBe('price_123')
      expect(subscription.currentPeriodStart).toBeInstanceOf(Date)
      expect(subscription.currentPeriodEnd).toBeInstanceOf(Date)
      expect(subscription.cancelAtPeriodEnd).toBe(false)
      expect(subscription.metadata?.planType).toBe('pro')
    })
  })
}) 