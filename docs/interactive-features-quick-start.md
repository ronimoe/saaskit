# Interactive Features Quick Start Guide

## 🚀 Getting Started

This guide will help you implement the interactive features system in 15 minutes or less.

## Prerequisites

- Next.js 13+ with App Router
- Tailwind CSS 3.3+
- TypeScript
- React 18+

## Installation

### 1. Install Dependencies

```bash
npm install lucide-react framer-motion
# or
yarn add lucide-react framer-motion
```

### 2. Copy Component Files

Copy these component files to your project:

```
components/ui/
├── unfoldable-feature-card.tsx
├── feature-connections.tsx
├── animated-product-mockup.tsx
├── magnetic-glass-card.tsx      # Dependency
└── particle-background.tsx      # Optional background effect
```

## Quick Implementation

### Step 1: Create Feature Data

```typescript
// data/features.ts
import { Shield, Database, CreditCard, Smartphone, Zap, BarChart3 } from 'lucide-react'

export const features = [
  {
    id: 'auth',
    title: 'Authentication',
    description: 'Secure user authentication with OAuth',
    icon: Shield,
    color: 'from-blue-500 to-cyan-500',
    category: 'Security',
    highlights: ['OAuth Providers', 'Magic Links', 'Session Management'],
    status: 'Available',
    extendedDescription: 'Complete authentication system with multiple providers...',
    interactivePreview: {
      type: 'auth' as const,
      title: 'Auth Demo',
      description: 'See authentication in action'
    },
    codeExample: `await auth.signInWithOAuth({ provider: 'google' })`
  },
  {
    id: 'database',
    title: 'Database',
    description: 'PostgreSQL with Supabase integration',
    icon: Database,
    color: 'from-green-500 to-emerald-500',
    category: 'Backend',
    highlights: ['PostgreSQL', 'Real-time', 'Row Level Security'],
    status: 'Available',
    extendedDescription: 'Full-featured database with real-time capabilities...',
    interactivePreview: {
      type: 'dashboard' as const,
      title: 'Database Demo',
      description: 'Explore database features'
    },
    codeExample: `const { data } = await supabase.from('users').select('*')`
  },
  {
    id: 'payments',
    title: 'Payments',
    description: 'Stripe integration for subscriptions',
    icon: CreditCard,
    color: 'from-purple-500 to-pink-500',
    category: 'Commerce',
    highlights: ['Stripe', 'Subscriptions', 'Webhooks'],
    status: 'Available',
    extendedDescription: 'Complete payment processing with Stripe...',
    interactivePreview: {
      type: 'payment' as const,
      title: 'Payment Demo',
      description: 'See checkout process'
    },
    codeExample: `const session = await stripe.checkout.sessions.create({...})`
  }
]

export const connections = [
  { from: 'auth', to: 'database', type: 'integration' as const, delay: 0 },
  { from: 'database', to: 'api', type: 'flow' as const, delay: 0.3 },
  { from: 'api', to: 'payments', type: 'dependency' as const, delay: 0.6 }
]
```

### Step 2: Create Features Page

```typescript
// app/features/page.tsx
'use client'

import { UnfoldableFeatureCard } from '@/components/ui/unfoldable-feature-card'
import { FeatureConnections } from '@/components/ui/feature-connections'
import { AnimatedProductMockup } from '@/components/ui/animated-product-mockup'
import { features, connections } from '@/data/features'

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Powerful <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Features</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-12">
            Explore our interactive feature showcase
          </p>
          
          <AnimatedProductMockup className="mt-12" />
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            {/* Animated Connections */}
            <FeatureConnections 
              connections={connections}
              features={features.map(f => ({ id: f.id, title: f.title }))}
              animated={true}
            />
            
            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-20">
              {features.map((feature, index) => (
                <UnfoldableFeatureCard
                  key={feature.id}
                  {...feature}
                  id={`feature-${feature.id}`}
                  magneticGlow={index % 3 === 0}
                  className="relative z-20"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
```

### Step 3: Add to Navigation

```typescript
// components/layout/navigation.tsx
const navItems = [
  { href: '/', label: 'Home' },
  { href: '/features', label: 'Features' }, // Add this
  { href: '/pricing', label: 'Pricing' },
  // ... other nav items
]
```

## Customization Examples

### Custom Feature with Extended Data

```typescript
const customFeature = {
  id: 'analytics',
  title: 'Advanced Analytics',
  description: 'Real-time analytics and reporting',
  icon: BarChart3,
  color: 'from-orange-500 to-red-500',
  category: 'Analytics',
  highlights: ['Real-time Data', 'Custom Reports', 'Data Export'],
  status: 'Beta',
  extendedDescription: 'Comprehensive analytics platform with real-time insights, custom dashboard creation, and advanced reporting capabilities. Track user behavior, performance metrics, and business KPIs.',
  featureHighlights: [
    {
      title: 'Real-time Dashboard',
      description: 'Live data updates and interactive charts',
      icon: BarChart3
    },
    {
      title: 'Custom Reports',
      description: 'Build and schedule custom reports',
      icon: FileText
    }
  ],
  interactivePreview: {
    type: 'dashboard' as const,
    title: 'Analytics Demo',
    description: 'Explore our analytics dashboard'
  },
  codeExample: `
// Track custom events
analytics.track('user_signup', {
  plan: 'pro',
  source: 'landing_page'
})

// Get real-time metrics
const metrics = await analytics.getMetrics({
  timeframe: '24h',
  metrics: ['users', 'revenue', 'conversions']
})
  `,
  demoUrl: '/demo/analytics'
}
```

### Custom Connection Types

```typescript
const advancedConnections = [
  { 
    from: 'auth', 
    to: 'database', 
    type: 'integration' as const,
    delay: 0,
    color: '#3B82F6' // Custom blue
  },
  { 
    from: 'database', 
    to: 'analytics', 
    type: 'flow' as const,
    delay: 0.3,
    color: '#10B981' // Custom green
  },
  { 
    from: 'analytics', 
    to: 'notifications', 
    type: 'dependency' as const,
    delay: 0.6,
    color: '#8B5CF6' // Custom purple
  }
]
```

### Themed Styling

```typescript
// Add custom CSS classes
<UnfoldableFeatureCard
  {...feature}
  className="
    hover:shadow-2xl 
    hover:shadow-blue-500/25 
    border-2 border-transparent 
    hover:border-blue-500/50
    transition-all duration-500
  "
  magneticGlow={true}
  magneticStrength={0.3}
/>
```

## Common Patterns

### 1. Feature Categories

```typescript
const featuresByCategory = {
  'Security': features.filter(f => f.category === 'Security'),
  'Backend': features.filter(f => f.category === 'Backend'),
  'Commerce': features.filter(f => f.category === 'Commerce')
}

// Render by category
{Object.entries(featuresByCategory).map(([category, categoryFeatures]) => (
  <div key={category}>
    <h3>{category}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {categoryFeatures.map(feature => (
        <UnfoldableFeatureCard key={feature.id} {...feature} />
      ))}
    </div>
  </div>
))}
```

### 2. Progressive Enhancement

```typescript
'use client'

import { useState, useEffect } from 'react'

export default function FeaturesPage() {
  const [enhanced, setEnhanced] = useState(false)

  useEffect(() => {
    // Enable enhanced features after hydration
    setEnhanced(true)
  }, [])

  return (
    <div>
      {enhanced ? (
        <FeatureConnections animated={true} {...props} />
      ) : (
        <div>Loading interactive features...</div>
      )}
    </div>
  )
}
```

### 3. Mobile Optimization

```typescript
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
  {features.map((feature) => (
    <UnfoldableFeatureCard
      {...feature}
      // Reduce magnetic effects on mobile
      magnetic={window.innerWidth > 768}
      magneticStrength={window.innerWidth > 768 ? 0.2 : 0}
    />
  ))}
</div>
```

## Troubleshooting

### Issue: Connections Not Appearing

**Solution**: Ensure feature IDs match exactly
```typescript
// ❌ Wrong - ID mismatch
<UnfoldableFeatureCard id="auth-feature" />
{ from: 'auth', to: 'database' } // Looking for 'auth'

// ✅ Correct - IDs match
<UnfoldableFeatureCard id="feature-auth" />
{ from: 'auth', to: 'database' } // Will find 'feature-auth'
```

### Issue: Performance on Mobile

**Solution**: Reduce animations for mobile
```typescript
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

<FeatureConnections 
  animated={!isMobile} 
  connections={connections}
/>
```

### Issue: Hydration Mismatch

**Solution**: Use dynamic imports for client components
```typescript
import dynamic from 'next/dynamic'

const FeatureConnections = dynamic(
  () => import('@/components/ui/feature-connections'),
  { ssr: false }
)
```

## Next Steps

1. **Add More Features**: Expand your feature data with additional capabilities
2. **Custom Animations**: Create new connection types and animation patterns
3. **Integration**: Connect with your existing component library
4. **Analytics**: Track user interactions with features
5. **A/B Testing**: Experiment with different layouts and animations

## Resources

- [Full API Reference](./interactive-components-api.md)
- [Complete System Documentation](./interactive-features-system.md)
- [Animation System Guide](./animations-system.md)
- [Glass Components](./glass-components.md)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the full documentation
3. Examine the example implementations
4. Create an issue in the project repository 