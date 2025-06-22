/**
 * @jest-environment node
 */

import { jest } from '@jest/globals'

// Mock environment variables before importing the module
const mockEnv = {
  STRIPE_STARTER_PRICE_ID: 'price_starter_123',
  STRIPE_PRO_PRICE_ID: 'price_pro_123',
  STRIPE_ENTERPRISE_PRICE_ID: 'price_enterprise_123'
}

// Set env vars before module import
Object.assign(process.env, mockEnv)

import {
  SUBSCRIPTION_PLANS,
  formatPrice,
  getPlanByPriceId,
  type SubscriptionPlan
} from '../stripe-plans'

describe('Stripe Plans Library', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('SUBSCRIPTION_PLANS', () => {
    it('should have all required plan configurations', () => {
      expect(SUBSCRIPTION_PLANS.STARTER).toBeDefined()
      expect(SUBSCRIPTION_PLANS.PRO).toBeDefined()
      expect(SUBSCRIPTION_PLANS.ENTERPRISE).toBeDefined()
    })

    it('should have correct STARTER plan configuration', () => {
      const starter = SUBSCRIPTION_PLANS.STARTER
      expect(starter.name).toBe('Starter')
      expect(starter.description).toBe('Perfect for getting started')
      expect(starter.price).toBe(9.99)
      expect(starter.features).toContain('Up to 3 projects')
      expect(starter.features).toContain('Basic analytics')
      expect(starter.features).toContain('Email support')
      expect(starter.features).toContain('5GB storage')
    })

    it('should have correct PRO plan configuration', () => {
      const pro = SUBSCRIPTION_PLANS.PRO
      expect(pro.name).toBe('Pro')
      expect(pro.description).toBe('For growing businesses')
      expect(pro.price).toBe(29.99)
      expect(pro.features).toContain('Up to 10 projects')
      expect(pro.features).toContain('Advanced analytics')
      expect(pro.features).toContain('Priority support')
      expect(pro.features).toContain('50GB storage')
      expect(pro.features).toContain('Team collaboration')
    })

    it('should have correct ENTERPRISE plan configuration', () => {
      const enterprise = SUBSCRIPTION_PLANS.ENTERPRISE
      expect(enterprise.name).toBe('Enterprise')
      expect(enterprise.description).toBe('For large organizations')
      expect(enterprise.price).toBe(99.99)
      expect(enterprise.features).toContain('Unlimited projects')
      expect(enterprise.features).toContain('Custom analytics')
      expect(enterprise.features).toContain('24/7 phone support')
      expect(enterprise.features).toContain('500GB storage')
      expect(enterprise.features).toContain('Advanced team features')
      expect(enterprise.features).toContain('Custom integrations')
    })

    it('should use environment variables for price IDs', () => {
      // These should be string values (either from env or empty string fallback)
      expect(typeof SUBSCRIPTION_PLANS.STARTER.priceId).toBe('string')
      expect(typeof SUBSCRIPTION_PLANS.PRO.priceId).toBe('string')
      expect(typeof SUBSCRIPTION_PLANS.ENTERPRISE.priceId).toBe('string')
      
      // With our mocked env vars, they should have the expected values
      expect(SUBSCRIPTION_PLANS.STARTER.priceId).toBe('price_starter_123')
      expect(SUBSCRIPTION_PLANS.PRO.priceId).toBe('price_pro_123')
      expect(SUBSCRIPTION_PLANS.ENTERPRISE.priceId).toBe('price_enterprise_123')
    })
  })

  describe('formatPrice', () => {
    it('should format prices correctly in USD', () => {
      expect(formatPrice(9.99)).toBe('$9.99')
      expect(formatPrice(29.99)).toBe('$29.99')
      expect(formatPrice(99.99)).toBe('$99.99')
    })

    it('should handle whole numbers', () => {
      expect(formatPrice(10)).toBe('$10.00')
      expect(formatPrice(100)).toBe('$100.00')
    })

    it('should handle zero', () => {
      expect(formatPrice(0)).toBe('$0.00')
    })

    it('should handle large numbers', () => {
      expect(formatPrice(1000)).toBe('$1,000.00')
      expect(formatPrice(10000)).toBe('$10,000.00')
    })
  })

  describe('getPlanByPriceId', () => {
    it('should return plan for matching configured price ID', () => {
      expect(getPlanByPriceId('price_starter_123')).toBe('STARTER')
      expect(getPlanByPriceId('price_pro_123')).toBe('PRO')
      expect(getPlanByPriceId('price_enterprise_123')).toBe('ENTERPRISE')
    })

    it('should return plan based on metadata plan_type', () => {
      const priceDetails = {
        metadata: { plan_type: 'starter' }
      }
      expect(getPlanByPriceId('unknown_price_id', priceDetails)).toBe('STARTER')

      const priceDetails2 = {
        metadata: { plan_type: 'PRO' }
      }
      expect(getPlanByPriceId('unknown_price_id', priceDetails2)).toBe('PRO')

      const priceDetails3 = {
        metadata: { plan_type: 'ENTERPRISE' }
      }
      expect(getPlanByPriceId('unknown_price_id', priceDetails3)).toBe('ENTERPRISE')
    })

    it('should return plan based on unit_amount matching', () => {
      const starterPriceDetails = {
        unit_amount: 999 // $9.99 in cents
      }
      expect(getPlanByPriceId('unknown_price_id', starterPriceDetails)).toBe('STARTER')

      const proPriceDetails = {
        unit_amount: 2999 // $29.99 in cents
      }
      expect(getPlanByPriceId('unknown_price_id', proPriceDetails)).toBe('PRO')

      const enterprisePriceDetails = {
        unit_amount: 9999 // $99.99 in cents
      }
      expect(getPlanByPriceId('unknown_price_id', enterprisePriceDetails)).toBe('ENTERPRISE')
    })

    it('should handle small rounding differences in price matching', () => {
      const priceDetails = {
        unit_amount: 1000 // $10.00 in cents (close to $9.99)
      }
      expect(getPlanByPriceId('unknown_price_id', priceDetails)).toBe('STARTER')
    })

    it('should return plan based on product name', () => {
      const starterProduct = {
        product: { name: 'My STARTER Plan' }
      }
      expect(getPlanByPriceId('unknown_price_id', starterProduct)).toBe('STARTER')

      const proProduct = {
        product: { name: 'Professional PRO Package' }
      }
      expect(getPlanByPriceId('unknown_price_id', proProduct)).toBe('PRO')

      const enterpriseProduct = {
        product: { name: 'ENTERPRISE Solution' }
      }
      expect(getPlanByPriceId('unknown_price_id', enterpriseProduct)).toBe('ENTERPRISE')
    })

    it('should prioritize metadata over price amount', () => {
      const priceDetails = {
        metadata: { plan_type: 'starter' },
        unit_amount: 2999 // PRO price
      }
      expect(getPlanByPriceId('unknown_price_id', priceDetails)).toBe('STARTER')
    })

    it('should return null for unknown price ID without details', () => {
      expect(getPlanByPriceId('unknown_price_id')).toBeNull()
    })

    it('should return null for price ID with no matching criteria', () => {
      const priceDetails = {
        metadata: { plan_type: 'unknown' },
        unit_amount: 5000, // No matching price
        product: { name: 'Unknown Plan' }
      }
      expect(getPlanByPriceId('unknown_price_id', priceDetails)).toBeNull()
    })

    it('should handle missing product name gracefully', () => {
      const priceDetails = {
        product: {} // No name property
      }
      expect(getPlanByPriceId('unknown_price_id', priceDetails)).toBeNull()
    })

    it('should handle string product instead of object', () => {
      const priceDetails = {
        product: 'string_product_id'
      }
      expect(getPlanByPriceId('unknown_price_id', priceDetails)).toBeNull()
    })

    it('should handle null/undefined product', () => {
      const priceDetails = {
        product: null as any
      }
      expect(getPlanByPriceId('unknown_price_id', priceDetails)).toBeNull()

      const priceDetails2 = {
        product: undefined
      }
      expect(getPlanByPriceId('unknown_price_id', priceDetails2)).toBeNull()
    })
  })

  describe('Type definitions', () => {
    it('should export correct SubscriptionPlan type', () => {
      // Test that the type allows correct values
      const validPlans: SubscriptionPlan[] = ['STARTER', 'PRO', 'ENTERPRISE']
      expect(validPlans).toHaveLength(3)
    })

    it('should have correct plan structure', () => {
      // Test that each plan has the expected structure
      Object.values(SUBSCRIPTION_PLANS).forEach(plan => {
        expect(plan).toHaveProperty('name')
        expect(plan).toHaveProperty('description')
        expect(plan).toHaveProperty('priceId')
        expect(plan).toHaveProperty('price')
        expect(plan).toHaveProperty('features')
        expect(Array.isArray(plan.features)).toBe(true)
        expect(typeof plan.name).toBe('string')
        expect(typeof plan.description).toBe('string')
        expect(typeof plan.priceId).toBe('string')
        expect(typeof plan.price).toBe('number')
      })
    })
  })
}) 