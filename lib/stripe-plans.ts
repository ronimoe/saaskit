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

// Helper functions
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export const getPlanByPriceId = (priceId: string): SubscriptionPlan | null => {
  for (const [planKey, plan] of Object.entries(SUBSCRIPTION_PLANS)) {
    if (plan.priceId === priceId) {
      return planKey as SubscriptionPlan;
    }
  }
  return null;
}; 