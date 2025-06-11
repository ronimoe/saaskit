// Subscription plan configuration
export const SUBSCRIPTION_PLANS = {
  STARTER: {
    name: 'Starter',
    description: 'Perfect for getting started',
    priceId: process.env.STRIPE_STARTER_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID || '',
    price: 9.99,
    features: [
      'Up to 3 projects',
      'Basic analytics',
      'Email support',
      '5GB storage',
    ],
  },
  PRO: {
    name: 'Pro',
    description: 'For growing businesses',
    priceId: process.env.STRIPE_PRO_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || '',
    price: 29.99,
    features: [
      'Up to 10 projects',
      'Advanced analytics',
      'Priority support',
      '50GB storage',
      'Team collaboration',
    ],
  },
  ENTERPRISE: {
    name: 'Enterprise',
    description: 'For large organizations',
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID || '',
    price: 99.99,
    features: [
      'Unlimited projects',
      'Custom analytics',
      '24/7 phone support',
      '500GB storage',
      'Advanced team features',
      'Custom integrations',
    ],
  },
} as const;

// Type definitions
export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;

export type SubscriptionPlanPrice = {
  id: string;
  currency: string;
  unitAmount: number;
  interval: 'month' | 'year';
  active: boolean;
};

// Helper functions
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export const getPlanByPriceId = (priceId: string, priceDetails?: { metadata?: Record<string, string>, unit_amount?: number, product?: string | { name?: string } }): SubscriptionPlan | null => {
  // First check for direct match with configured price IDs
  for (const [planKey, plan] of Object.entries(SUBSCRIPTION_PLANS)) {
    if (plan.priceId === priceId) {
      return planKey as SubscriptionPlan;
    }
  }
  
  // If price details are provided, check metadata or price amount
  if (priceDetails) {
    // Check metadata for plan_type
    if (priceDetails.metadata?.plan_type) {
      const planType = priceDetails.metadata.plan_type.toUpperCase();
      if (planType === 'STARTER' || planType === 'PRO' || planType === 'ENTERPRISE') {
        return planType as SubscriptionPlan;
      }
    }
    
    // Fall back to matching by price amount
    if (priceDetails.unit_amount) {
      // Convert cents to dollars for comparison
      const priceAmount = priceDetails.unit_amount / 100;
      
      // Match price amounts with a small tolerance for rounding
      if (Math.abs(priceAmount - SUBSCRIPTION_PLANS.STARTER.price) < 0.01) {
        return 'STARTER';
      } else if (Math.abs(priceAmount - SUBSCRIPTION_PLANS.PRO.price) < 0.01) {
        return 'PRO';
      } else if (Math.abs(priceAmount - SUBSCRIPTION_PLANS.ENTERPRISE.price) < 0.01) {
        return 'ENTERPRISE';
      }
    }
    
    // Check product name if available
    if (priceDetails.product && typeof priceDetails.product === 'object' && priceDetails.product.name) {
      const productName = priceDetails.product.name.toUpperCase();
      if (productName.includes('STARTER')) {
        return 'STARTER';
      } else if (productName.includes('PRO')) {
        return 'PRO';
      } else if (productName.includes('ENTERPRISE')) {
        return 'ENTERPRISE';
      }
    }
  }
  
  console.warn(`Could not determine plan for price ID: ${priceId}. Metadata:`, priceDetails?.metadata);
  return null;
}; 