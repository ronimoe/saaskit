/**
 * Test suite for lib/stripe.ts
 * Testing re-export functionality with proper coverage
 */

// First, unmock the stripe module so we can test the real re-exports
jest.unmock('@/lib/stripe');

// Mock the dependencies before importing
jest.mock('@/lib/stripe-client', () => ({
  getStripe: jest.fn().mockResolvedValue({ id: 'mock-stripe-client' })
}));

jest.mock('@/lib/stripe-server', () => ({
  stripe: { id: 'mock-stripe-server' }
}));

jest.mock('@/lib/stripe-plans', () => ({
  SUBSCRIPTION_PLANS: { pro: { name: 'Pro Plan' } },
  formatPrice: jest.fn((amount) => `$${amount / 100}`),
  getPlanByPriceId: jest.fn((priceId) => 'pro')
}));

describe('Stripe Module Re-exports', () => {
  describe('Re-export functionality', () => {
    it('should re-export getStripe from stripe-client', async () => {
      const { getStripe } = await import('@/lib/stripe');
      
      expect(getStripe).toBeDefined();
      expect(typeof getStripe).toBe('function');
      
      const result = await getStripe();
      expect(result).toEqual({ id: 'mock-stripe-client' });
    });

    it('should re-export stripe from stripe-server', async () => {
      const { stripe } = await import('@/lib/stripe');
      
      expect(stripe).toBeDefined();
      expect(stripe).toEqual({ id: 'mock-stripe-server' });
    });

    it('should re-export SUBSCRIPTION_PLANS from stripe-plans', async () => {
      const { SUBSCRIPTION_PLANS } = await import('@/lib/stripe');
      
      expect(SUBSCRIPTION_PLANS).toBeDefined();
      expect(SUBSCRIPTION_PLANS).toEqual({ pro: { name: 'Pro Plan' } });
    });

    it('should re-export formatPrice from stripe-plans', async () => {
      const { formatPrice } = await import('@/lib/stripe');
      
      expect(formatPrice).toBeDefined();
      expect(typeof formatPrice).toBe('function');
      
      const result = formatPrice(2000);
      expect(result).toBe('$20');
    });

    it('should re-export getPlanByPriceId from stripe-plans', async () => {
      const { getPlanByPriceId } = await import('@/lib/stripe');
      
      expect(getPlanByPriceId).toBeDefined();
      expect(typeof getPlanByPriceId).toBe('function');
      
      const result = getPlanByPriceId('price_123');
      expect(result).toBe('pro');
    });
  });

  describe('Named imports', () => {
    it('should support destructured imports', async () => {
      const { 
        stripe, 
        getStripe, 
        SUBSCRIPTION_PLANS, 
        formatPrice, 
        getPlanByPriceId 
      } = await import('@/lib/stripe');
      
      expect(stripe).toBeDefined();
      expect(getStripe).toBeDefined();
      expect(SUBSCRIPTION_PLANS).toBeDefined();
      expect(formatPrice).toBeDefined();
      expect(getPlanByPriceId).toBeDefined();
    });

    it('should support namespace import', async () => {
      const StripeModule = await import('@/lib/stripe');
      
      expect(StripeModule).toHaveProperty('stripe');
      expect(StripeModule).toHaveProperty('getStripe');
      expect(StripeModule).toHaveProperty('SUBSCRIPTION_PLANS');
      expect(StripeModule).toHaveProperty('formatPrice');
      expect(StripeModule).toHaveProperty('getPlanByPriceId');
    });
  });

  describe('Module structure', () => {
    it('should maintain proper export structure', async () => {
      const stripeModule = await import('@/lib/stripe');
      
      // Verify all expected exports are present
      const expectedExports = [
        'stripe',
        'getStripe', 
        'SUBSCRIPTION_PLANS',
        'formatPrice',
        'getPlanByPriceId'
      ];
      
      expectedExports.forEach(exportName => {
        expect(stripeModule).toHaveProperty(exportName);
      });
    });

    it('should be a proper ES module', () => {
      // This test ensures the module can be required in CommonJS style too
      expect(() => {
        const stripeModule = require('@/lib/stripe');
        expect(typeof stripeModule).toBe('object');
        expect(stripeModule).not.toBeNull();
      }).not.toThrow();
    });
  });

  describe('Function execution', () => {
    it('should execute re-exported functions correctly', async () => {
      const { formatPrice, getPlanByPriceId } = await import('@/lib/stripe');
      
      // Test that the functions actually work through the re-export
      expect(formatPrice(1000)).toBe('$10');
      expect(getPlanByPriceId('test_price')).toBe('pro');
    });

    it('should handle async re-exported functions', async () => {
      const { getStripe } = await import('@/lib/stripe');
      
      // Test async function through re-export
      const result = await getStripe();
      expect(result).toEqual({ id: 'mock-stripe-client' });
    });
  });
}); 