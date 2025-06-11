'use client'

import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/ui/glass-card'
import { UnfoldableFeatureCard } from '@/components/ui/unfoldable-feature-card'
import { FeatureConnections } from '@/components/ui/feature-connections'
import { AnimatedProductMockup } from '@/components/ui/animated-product-mockup'
import { ParticleBackground } from '@/components/ui/particle-background'
import { Button } from '@/components/ui/button'
import { UnifiedHeader } from '@/components/layout/unified-header'

import { 
  Shield, 
  Zap, 
  Globe, 
  Users, 
  BarChart3, 
  Lock, 
  Smartphone, 
  Cloud, 
  Palette, 
  Code, 
  Star,
  ArrowRight,
  Sparkles,
  Layers,
  Target,
  Database,
  Settings,
  Settings2,
  Eye,
  CreditCard,
  RefreshCw,
  Maximize,
  Server,
  FileText
} from 'lucide-react'
import Link from 'next/link'

const features = [
  {
    id: 'auth',
    title: 'Advanced Authentication',
    description: 'Complete auth system with email/password, OAuth, and magic links',
    icon: Shield,
    color: 'from-blue-500 to-cyan-500',
    category: 'Security',
    highlights: ['Multi-provider OAuth', 'Magic link auth', 'Session management', 'Password reset'],
    status: 'Available',
    extendedDescription: 'Our authentication system provides enterprise-grade security with support for multiple authentication methods including social providers, magic links, and traditional email/password flows.',
    featureHighlights: [
      {
        title: 'Social Authentication',
        description: 'Google, GitHub, Twitter, and more OAuth providers',
        icon: Users
      },
      {
        title: 'Magic Links',
        description: 'Passwordless authentication via secure email links',
        icon: Zap
      },
      {
        title: 'Session Management',
        description: 'Secure JWT tokens with automatic refresh',
        icon: RefreshCw
      }
    ],
    interactivePreview: {
      type: 'auth' as const,
      title: 'Live Authentication Demo',
      description: 'See how our authentication system works in real-time'
    },
    codeExample: `// Simple authentication setup
import { auth } from '@/lib/supabase'

await auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: '/dashboard'
  }
})`
  },
  {
    id: 'payments',
    title: 'Stripe Integration',
    description: 'Full payment processing with subscriptions and billing management',
    icon: CreditCard,
    color: 'from-green-500 to-emerald-500',
    category: 'Payments',
    highlights: ['Subscription billing', 'Customer portal', 'Webhook handling', 'Invoice generation'],
    status: 'Available',
    extendedDescription: 'Complete Stripe integration with subscription management, automatic billing, webhook handling, and a customer portal for self-service billing management.',
    featureHighlights: [
      {
        title: 'Subscription Management',
        description: 'Automatic billing cycles and plan changes',
        icon: RefreshCw
      },
      {
        title: 'Customer Portal',
        description: 'Self-service billing and subscription management',
        icon: Settings
      },
      {
        title: 'Webhook Security',
        description: 'Secure webhook endpoints with signature verification',
        icon: Shield
      }
    ],
    interactivePreview: {
      type: 'payment' as const,
      title: 'Payment Processing Demo',
      description: 'Experience our seamless payment flow'
    },
    codeExample: `// Create checkout session
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{
    price: 'price_1234567890',
    quantity: 1,
  }],
  mode: 'subscription',
  success_url: '/success',
  cancel_url: '/cancel',
})`
  },
  {
    id: 'database',
    title: 'Supabase Database',
    description: 'PostgreSQL with real-time subscriptions and row-level security',
    icon: Database,
    color: 'from-purple-500 to-pink-500',
    category: 'Backend',
    highlights: ['Real-time updates', 'Row-level security', 'Auto-generated APIs', 'Type safety'],
    status: 'Available',
    extendedDescription: 'Powered by PostgreSQL with real-time capabilities, automatic API generation, and built-in security through Row Level Security policies.',
    featureHighlights: [
      {
        title: 'Real-time Subscriptions',
        description: 'Live data updates across all connected clients',
        icon: Zap
      },
      {
        title: 'Auto-generated APIs',
        description: 'RESTful APIs generated automatically from your schema',
        icon: Code
      },
      {
        title: 'Type Safety',
        description: 'Generated TypeScript types for your database schema',
        icon: FileText
      }
    ],
    interactivePreview: {
      type: 'api' as const,
      title: 'Database API Demo',
      description: 'See live API responses from your database'
    },
    codeExample: `// Real-time subscription
const subscription = supabase
  .channel('public:profiles')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'profiles' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()`
  },
  {
    id: 'ui',
    title: 'Modern UI Components',
    description: 'Beautiful, accessible components built with shadcn/ui and Tailwind',
    icon: Palette,
    color: 'from-orange-500 to-red-500',
    category: 'Design',
    highlights: ['Dark mode support', 'Responsive design', 'Accessibility first', 'Custom themes'],
    status: 'Available',
    extendedDescription: 'A comprehensive design system built on shadcn/ui with full customization capabilities, accessibility features, and responsive design patterns.',
    featureHighlights: [
      {
        title: 'Design System',
        description: 'Consistent, reusable components across your app',
        icon: Layers
      },
      {
        title: 'Accessibility',
        description: 'WCAG compliant with keyboard navigation support',
        icon: Eye
      },
      {
        title: 'Customization',
        description: 'Easy theming with CSS variables and Tailwind',
        icon: Palette
      }
    ],
    interactivePreview: {
      type: 'dashboard' as const,
      title: 'UI Components Showcase',
      description: 'Explore our beautiful component library'
    },
    codeExample: `// Using our UI components
import { Button, Card, Badge } from '@/components/ui'

<Card className="p-6">
  <Badge variant="success">New Feature</Badge>
  <Button size="lg" variant="primary">
    Get Started
  </Button>
</Card>`
  },
  {
    id: 'performance',
    title: 'Lightning Fast',
    description: 'Optimized for speed with Next.js 15 and modern best practices',
    icon: Zap,
    color: 'from-yellow-500 to-orange-500',
    category: 'Performance',
    highlights: ['Server components', 'Edge deployment', 'Image optimization', 'Code splitting'],
    status: 'Available',
    extendedDescription: 'Built with performance in mind using Next.js 15, server components, edge deployment, and automatic optimizations for the fastest possible user experience.',
    featureHighlights: [
      {
        title: 'Server Components',
        description: 'Zero JavaScript for static content delivery',
        icon: Server
      },
      {
        title: 'Edge Deployment',
        description: 'Global edge network for minimal latency',
        icon: Globe
      },
      {
        title: 'Code Splitting',
        description: 'Automatic bundle optimization and lazy loading',
        icon: Maximize
      }
    ],
    interactivePreview: {
      type: 'dashboard' as const,
      title: 'Performance Metrics',
      description: 'See real-time performance analytics'
    },
    codeExample: `// Server component example
import { Suspense } from 'react'
import { Analytics } from './analytics'

export default function Dashboard() {
  return (
    <Suspense fallback={<AnalyticsSkeleton />}>
      <Analytics />
    </Suspense>
  )
}`
  },
  {
    id: 'analytics',
    title: 'Advanced Analytics',
    description: 'Comprehensive insights and user behavior tracking',
    icon: BarChart3,
    color: 'from-indigo-500 to-purple-500',
    category: 'Analytics',
    highlights: ['User tracking', 'Revenue metrics', 'Custom events', 'Real-time dashboards'],
    status: 'Coming Soon',
    extendedDescription: 'Powerful analytics platform with real-time data visualization, custom event tracking, and comprehensive business intelligence features.',
    featureHighlights: [
      {
        title: 'Real-time Analytics',
        description: 'Live data updates with beautiful visualizations',
        icon: BarChart3
      },
      {
        title: 'Custom Events',
        description: 'Track any user interaction or business metric',
        icon: Target
      },
      {
        title: 'Revenue Tracking',
        description: 'Monitor MRR, churn, and customer lifetime value',
        icon: CreditCard
      }
    ],
    interactivePreview: {
      type: 'dashboard' as const,
      title: 'Analytics Dashboard Preview',
      description: 'Preview of our upcoming analytics features'
    },
    codeExample: `// Track custom events
import { analytics } from '@/lib/analytics'

analytics.track('feature_used', {
  feature: 'advanced_search',
  user_id: user.id,
  timestamp: new Date()
})`
  },
  {
    id: 'mobile',
    title: 'Mobile First',
    description: 'Responsive design that works perfectly on all devices',
    icon: Smartphone,
    color: 'from-teal-500 to-cyan-500',
    category: 'Mobile',
    highlights: ['Progressive Web App', 'Touch optimized', 'Offline support', 'Native feel'],
    status: 'Available',
    extendedDescription: 'Mobile-first design approach with progressive web app capabilities, touch-optimized interactions, and offline functionality for a native app experience.',
    featureHighlights: [
      {
        title: 'Progressive Web App',
        description: 'Install on mobile devices like a native app',
        icon: Smartphone
      },
      {
        title: 'Touch Gestures',
        description: 'Swipe, pinch, and touch interactions',
        icon: Zap
      },
      {
        title: 'Offline Mode',
        description: 'Core functionality works without internet',
        icon: Cloud
      }
    ],
    interactivePreview: {
      type: 'mobile' as const,
      title: 'Mobile Experience',
      description: 'See how your app looks and feels on mobile'
    },
    codeExample: `// Service worker for offline support
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(() => console.log('SW registered'))
    .catch(() => console.log('SW registration failed'))
}`
  },
  {
    id: 'api',
    title: 'RESTful APIs',
    description: 'Type-safe APIs with automatic documentation and validation',
    icon: Code,
    color: 'from-slate-500 to-gray-500',
    category: 'Development',
    highlights: ['OpenAPI docs', 'Type validation', 'Rate limiting', 'Error handling'],
    status: 'Available',
    extendedDescription: 'Comprehensive API system with automatic documentation generation, request validation, rate limiting, and standardized error handling.',
    featureHighlights: [
      {
        title: 'Type Validation',
        description: 'Automatic request/response validation with Zod',
        icon: Shield
      },
      {
        title: 'Auto Documentation',
        description: 'OpenAPI specs generated from your code',
        icon: FileText
      },
      {
        title: 'Rate Limiting',
        description: 'Built-in protection against API abuse',
        icon: Settings
      }
    ],
    interactivePreview: {
      type: 'api' as const,
      title: 'API Explorer',
      description: 'Test API endpoints in real-time'
    },
    codeExample: `// Type-safe API route
import { z } from 'zod'
import { NextRequest } from 'next/server'

const schema = z.object({
  name: z.string(),
  email: z.string().email()
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const validated = schema.parse(body)
  
  // Process validated data
  return Response.json({ success: true })
}`
  },
  {
    id: 'security',
    title: 'Enterprise Security',
    description: 'Bank-grade security with encryption and compliance features',
    icon: Lock,
    color: 'from-red-500 to-pink-500',
    category: 'Security',
    highlights: ['Data encryption', 'GDPR compliance', 'Security headers', 'Audit logging'],
    status: 'Available',
    extendedDescription: 'Enterprise-grade security features including end-to-end encryption, GDPR compliance tools, security headers, and comprehensive audit logging.',
    featureHighlights: [
      {
        title: 'Data Encryption',
        description: 'End-to-end encryption for sensitive data',
        icon: Lock
      },
      {
        title: 'GDPR Compliance',
        description: 'Built-in tools for data privacy compliance',
        icon: Shield
      },
      {
        title: 'Audit Logs',
        description: 'Comprehensive logging for security analysis',
        icon: FileText
      }
    ],
    interactivePreview: {
      type: 'auth' as const,
      title: 'Security Features Demo',
      description: 'Experience our security measures in action'
    },
    codeExample: `// Secure data handling
import { encrypt, decrypt } from '@/lib/crypto'

// Encrypt sensitive data before storage
const encryptedData = await encrypt(sensitiveData)
await db.users.update({
  where: { id: userId },
  data: { encrypted_field: encryptedData }
})`
  },
  {
    id: 'scaling',
    title: 'Auto Scaling',
    description: 'Scales automatically with your user base and traffic',
    icon: Globe,
    color: 'from-emerald-500 to-teal-500',
    category: 'Infrastructure',
    highlights: ['Global CDN', 'Auto scaling', 'Load balancing', 'Edge computing'],
    status: 'Available',
    extendedDescription: 'Built-in auto-scaling capabilities with global CDN distribution, intelligent load balancing, and edge computing for optimal performance worldwide.',
    featureHighlights: [
      {
        title: 'Global CDN',
        description: 'Content delivery from 300+ edge locations',
        icon: Globe
      },
      {
        title: 'Auto Scaling',
        description: 'Automatic resource scaling based on demand',
        icon: Maximize
      },
      {
        title: 'Load Balancing',
        description: 'Intelligent traffic distribution across servers',
        icon: Server
      }
    ],
    interactivePreview: {
      type: 'dashboard' as const,
      title: 'Infrastructure Monitoring',
      description: 'Monitor your app\'s global performance'
    },
    codeExample: `// Edge function example
export const config = {
  runtime: 'edge',
  regions: ['iad1', 'sfo1', 'fra1']
}

export default async function handler(req) {
  // This runs at the edge, closest to your users
  return new Response('Hello from the edge!')
}`
  },
  {
    id: 'collaboration',
    title: 'Team Collaboration',
    description: 'Built-in tools for team management and collaboration',
    icon: Users,
    color: 'from-blue-500 to-indigo-500',
    category: 'Collaboration',
    highlights: ['Role management', 'Team invites', 'Shared workspaces', 'Activity feeds'],
    status: 'Coming Soon',
    extendedDescription: 'Comprehensive team collaboration features with role-based access control, team invitations, shared workspaces, and real-time activity feeds.',
    featureHighlights: [
      {
        title: 'Role Management',
        description: 'Fine-grained permissions and access control',
        icon: Shield
      },
      {
        title: 'Team Invites',
        description: 'Easy team member onboarding and management',
        icon: Users
      },
      {
        title: 'Activity Feeds',
        description: 'Real-time updates on team activities',
        icon: BarChart3
      }
    ],
    interactivePreview: {
      type: 'dashboard' as const,
      title: 'Team Dashboard Preview',
      description: 'See how teams collaborate in your app'
    },
    codeExample: `// Team management
import { teams } from '@/lib/teams'

await teams.invite({
  email: 'colleague@company.com',
  role: 'editor',
  workspace: 'main'
})`
  },
  {
    id: 'customization',
    title: 'Full Customization',
    description: 'Completely customizable to match your brand and requirements',
    icon: Settings,
    color: 'from-violet-500 to-purple-500',
    category: 'Customization',
    highlights: ['Custom branding', 'White labeling', 'Feature flags', 'Environment configs'],
    status: 'Available',
    extendedDescription: 'Complete customization capabilities including custom branding, white-label options, feature flags, and environment-specific configurations.',
    featureHighlights: [
      {
        title: 'Brand Customization',
        description: 'Colors, logos, and styling to match your brand',
        icon: Palette
      },
      {
        title: 'Feature Flags',
        description: 'Control feature rollouts and A/B testing',
        icon: Settings2
      },
      {
        title: 'White Labeling',
        description: 'Complete brand removal for reseller partners',
        icon: Eye
      }
    ],
    interactivePreview: {
      type: 'dashboard' as const,
      title: 'Customization Options',
      description: 'See how you can customize your app'
    },
    codeExample: `// Feature flags
import { featureFlags } from '@/lib/config'

if (featureFlags.advancedAnalytics) {
  return <AdvancedAnalytics />
}

return <BasicAnalytics />`
  }
]

// Define feature connections for the animation system
const featureConnections = [
  { from: 'auth', to: 'database', type: 'integration' as const, delay: 0 },
  { from: 'database', to: 'api', type: 'flow' as const, delay: 0.3 },
  { from: 'api', to: 'ui', type: 'dependency' as const, delay: 0.6 },
  { from: 'auth', to: 'payments', type: 'integration' as const, delay: 0.9 },
  { from: 'payments', to: 'analytics', type: 'flow' as const, delay: 1.2 },
  { from: 'ui', to: 'mobile', type: 'dependency' as const, delay: 1.5 },
  { from: 'database', to: 'security', type: 'integration' as const, delay: 1.8 },
  { from: 'api', to: 'scaling', type: 'dependency' as const, delay: 2.1 },
  { from: 'collaboration', to: 'customization', type: 'flow' as const, delay: 2.4 }
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <UnifiedHeader variant="landing" />
      
      {/* Enhanced Hero Section with Animated Mockups */}
      <section className="relative overflow-hidden py-24">
        {/* Particle Background */}
        <ParticleBackground 
          particleCount={50}
          speed={0.3}
          interactive={true}
          colors={['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B']}
          className="opacity-20"
        />
        
        {/* Floating Elements */}
        <div className="floating-element top-20 left-10 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl float-animation" />
        <div className="floating-element top-40 right-20 w-16 h-16 bg-gradient-to-br from-pink-500/20 to-orange-500/20 rounded-full blur-lg float-slow" />
        <div className="floating-element bottom-32 left-20 w-24 h-24 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-full blur-xl float-fast" />
        
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-pink-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="relative container mx-auto px-4 text-center">
          <Badge className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
            <Sparkles className="w-4 h-4 mr-2" />
            Interactive Feature Experience
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
            Everything You Need
            <br />
            <span className="text-4xl md:text-6xl">And More</span>
          </h1>
          
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Discover the comprehensive feature set with interactive demos, unfoldable details, and live previews.
          </p>
          
          {/* Animated Product Mockup */}
          <AnimatedProductMockup className="my-16" />
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
              <Star className="w-5 h-5 mr-2" />
              Explore Features
            </Button>
            <Button size="lg" variant="outline" className="border-2 hover:bg-slate-50 dark:hover:bg-slate-800">
              View Live Demo
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Interactive Features Grid with Connections */}
      <section className="relative container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Interactive Feature Showcase
          </h2>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Click any feature card to unfold detailed information, interactive previews, and code examples
          </p>
        </div>

        {/* Feature Grid Container */}
        <div className="relative">
          {/* Connecting Lines Layer */}
          <FeatureConnections 
            connections={featureConnections}
            features={features.map(f => ({ id: f.id, title: f.title }))}
            animated={true}
          />
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
            {features.map((feature, index) => {
              return (
                <UnfoldableFeatureCard
                  key={feature.id}
                  {...feature}
                  id={`feature-${feature.id}`}
                  magneticGlow={index % 3 === 0}
                  className="relative z-20"
                />
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">12+</div>
              <div className="text-slate-300">Interactive Features</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">99.9%</div>
              <div className="text-slate-300">Uptime</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">50ms</div>
              <div className="text-slate-300">Load Time</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-slate-300">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <GlassCard 
          variant="floating" 
          size="xl" 
          depth="floating" 
          glow="strong"
          className="max-w-4xl mx-auto"
        >
          <div className="space-y-6">
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
              <Target className="w-4 h-4 mr-2" />
              Ready to Launch
            </Badge>
            
            <h2 className="text-3xl md:text-4xl font-bold">
              Start Building Your SaaS Today
            </h2>
            
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Join thousands of developers who are building amazing SaaS applications with our comprehensive, interactive feature set.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <Link href="/signup">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Get Started Free
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-2">
                <Link href="/pricing">
                  View Pricing
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </GlassCard>
      </section>
    </div>
  )
} 