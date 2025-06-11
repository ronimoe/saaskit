import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { GlassCard } from '@/components/ui/glass-card'
import { MagneticGlassCard } from '@/components/ui/magnetic-glass-card'
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
  Check,
  Sparkles,
  Layers,
  Target,
  Database,
  Settings,
  Settings2,
  Eye,
  CreditCard
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
    status: 'Available'
  },
  {
    id: 'payments',
    title: 'Stripe Integration',
    description: 'Full payment processing with subscriptions and billing management',
    icon: CreditCard,
    color: 'from-green-500 to-emerald-500',
    category: 'Payments',
    highlights: ['Subscription billing', 'Customer portal', 'Webhook handling', 'Invoice generation'],
    status: 'Available'
  },
  {
    id: 'database',
    title: 'Supabase Database',
    description: 'PostgreSQL with real-time subscriptions and row-level security',
    icon: Database,
    color: 'from-purple-500 to-pink-500',
    category: 'Backend',
    highlights: ['Real-time updates', 'Row-level security', 'Auto-generated APIs', 'Type safety'],
    status: 'Available'
  },
  {
    id: 'ui',
    title: 'Modern UI Components',
    description: 'Beautiful, accessible components built with shadcn/ui and Tailwind',
    icon: Palette,
    color: 'from-orange-500 to-red-500',
    category: 'Design',
    highlights: ['Dark mode support', 'Responsive design', 'Accessibility first', 'Custom themes'],
    status: 'Available'
  },
  {
    id: 'performance',
    title: 'Lightning Fast',
    description: 'Optimized for speed with Next.js 15 and modern best practices',
    icon: Zap,
    color: 'from-yellow-500 to-orange-500',
    category: 'Performance',
    highlights: ['Server components', 'Edge deployment', 'Image optimization', 'Code splitting'],
    status: 'Available'
  },
  {
    id: 'analytics',
    title: 'Advanced Analytics',
    description: 'Comprehensive insights and user behavior tracking',
    icon: BarChart3,
    color: 'from-indigo-500 to-purple-500',
    category: 'Analytics',
    highlights: ['User tracking', 'Revenue metrics', 'Custom events', 'Real-time dashboards'],
    status: 'Coming Soon'
  },
  {
    id: 'mobile',
    title: 'Mobile First',
    description: 'Responsive design that works perfectly on all devices',
    icon: Smartphone,
    color: 'from-teal-500 to-cyan-500',
    category: 'Mobile',
    highlights: ['Progressive Web App', 'Touch optimized', 'Offline support', 'Native feel'],
    status: 'Available'
  },
  {
    id: 'api',
    title: 'RESTful APIs',
    description: 'Type-safe APIs with automatic documentation and validation',
    icon: Code,
    color: 'from-slate-500 to-gray-500',
    category: 'Development',
    highlights: ['OpenAPI docs', 'Type validation', 'Rate limiting', 'Error handling'],
    status: 'Available'
  },
  {
    id: 'security',
    title: 'Enterprise Security',
    description: 'Bank-grade security with encryption and compliance features',
    icon: Lock,
    color: 'from-red-500 to-pink-500',
    category: 'Security',
    highlights: ['Data encryption', 'GDPR compliance', 'Security headers', 'Audit logging'],
    status: 'Available'
  },
  {
    id: 'scaling',
    title: 'Auto Scaling',
    description: 'Scales automatically with your user base and traffic',
    icon: Globe,
    color: 'from-emerald-500 to-teal-500',
    category: 'Infrastructure',
    highlights: ['Global CDN', 'Auto scaling', 'Load balancing', 'Edge computing'],
    status: 'Available'
  },
  {
    id: 'collaboration',
    title: 'Team Collaboration',
    description: 'Built-in tools for team management and collaboration',
    icon: Users,
    color: 'from-blue-500 to-indigo-500',
    category: 'Collaboration',
    highlights: ['Role management', 'Team invites', 'Shared workspaces', 'Activity feeds'],
    status: 'Coming Soon'
  },
  {
    id: 'customization',
    title: 'Full Customization',
    description: 'Completely customizable to match your brand and requirements',
    icon: Settings,
    color: 'from-violet-500 to-purple-500',
    category: 'Customization',
    highlights: ['Custom branding', 'White labeling', 'Feature flags', 'Environment configs'],
    status: 'Available'
  }
]

const categories = ['All', 'Security', 'Payments', 'Backend', 'Design', 'Performance', 'Analytics', 'Mobile', 'Development', 'Infrastructure', 'Collaboration', 'Customization']

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <UnifiedHeader variant="landing" />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Floating Elements */}
        <div className="floating-element top-20 left-10 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl float-animation" />
        <div className="floating-element top-40 right-20 w-16 h-16 bg-gradient-to-br from-pink-500/20 to-orange-500/20 rounded-full blur-lg float-slow" />
        <div className="floating-element bottom-32 left-20 w-24 h-24 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-full blur-xl float-fast" />
        
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-pink-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="relative container mx-auto px-4 py-24 text-center">
          <Badge className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
            <Sparkles className="w-4 h-4 mr-2" />
            Next-Generation Features
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
            Everything You Need
            <br />
            <span className="text-4xl md:text-6xl">And More</span>
          </h1>
          
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Discover the comprehensive feature set that makes our SaaS kit the most complete solution for modern web applications.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
              <Star className="w-5 h-5 mr-2" />
              Start Building
            </Button>
            <Button size="lg" variant="outline" className="border-2 hover:bg-slate-50 dark:hover:bg-slate-800">
              View Demo
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid with Modern Layout */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powerful Features
          </h2>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Every feature is crafted with attention to detail and modern best practices
          </p>
        </div>

                {/* Particle Background */}
        <ParticleBackground 
          particleCount={30}
          speed={0.5}
          interactive={true}
          colors={['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B']}
          className="opacity-30"
        />
        
        {/* Interactive Feature Grid with Non-Traditional Layout */}
        <div className="asymmetric-grid staggered-grid relative z-10">
          {features.map((feature, index) => {
            const Icon = feature.icon
            const gridClass = `grid-cell-${(index % 9) + 1}` // Cycle through 9 different cell types
            return (
              <MagneticGlassCard 
                key={feature.id}
                variant="primary"
                size="md" 
                depth="medium"
                glow="medium"
                interactive="hover"
                magnetic={true}
                magneticStrength={0.2}
                magneticGlow={index % 3 === 0} // Add glow to every third card
                className={`group relative staggered-item ${gridClass} card-3d hover-float`}
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <Badge 
                    variant={feature.status === 'Available' ? 'default' : 'secondary'}
                    className={`text-xs ${
                      feature.status === 'Available' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                    }`}
                  >
                    {feature.status}
                  </Badge>
                </div>
                
                <div className="relative p-6">
                  {/* Icon with Gradient */}
                  <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${feature.color} mb-4 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  {/* Category */}
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                    {feature.category}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg font-semibold mb-3 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    {feature.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  {/* Highlights */}
                  <div className="space-y-2">
                    {feature.highlights.slice(0, 2).map((highlight, idx) => (
                      <div key={idx} className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                        <Check className="w-3 h-3 mr-2 text-green-500" />
                        {highlight}
                      </div>
                    ))}
                    {feature.highlights.length > 2 && (
                      <div className="text-xs text-slate-400">
                        +{feature.highlights.length - 2} more features
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Hover Effect Border */}
                <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none`} />
              </MagneticGlassCard>
            )
          })}
        </div>
      </section>

      {/* Dynamic Theme Showcase Section */}
      <section className="relative container mx-auto px-4 py-20 diagonal-section diagonal-top diagonal-bottom bg-gradient-to-br from-slate-100/50 to-blue-50/30 dark:from-slate-800/50 dark:to-blue-900/30">
        <div className="diagonal-content">
        <div className="text-center mb-16">
          <Badge className="mb-6 bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0">
            <Palette className="w-4 h-4 mr-2" />
            Dynamic Theming
          </Badge>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Adaptive Color System
          </h2>
          
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8">
            Experience real-time color adaptation, interactive themes, and seamless transitions that respond to user preferences and interactions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Interactive Demo */}
          <div className="space-y-6">
            <GlassCard variant="primary" size="lg" depth="medium" glow="medium" className="interactive-colors">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-brand-primary rounded-lg flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Dynamic Primary Colors</h3>
                    <p className="text-sm text-muted-foreground">Hover to see real-time adaptation</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-16 bg-brand-primary rounded-lg border-2 border-brand-primary/20 interactive-colors"></div>
                  <div className="h-16 bg-brand-secondary rounded-lg border-2 border-brand-secondary/20 interactive-colors"></div>
                  <div className="h-16 bg-brand-accent rounded-lg border-2 border-brand-accent/20 interactive-colors"></div>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Colors automatically adapt based on your theme selection and user interactions
                </div>
              </div>
            </GlassCard>
            
            <div className="grid grid-cols-2 gap-4">
              <GlassCard variant="subtle" size="md" glow="subtle" className="conditional-glassmorphism">
                <div className="text-center">
                  <Layers className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="font-medium">Glassmorphism</div>
                  <div className="text-xs text-muted-foreground">Adaptive transparency</div>
                </div>
              </GlassCard>
              
              <GlassCard variant="subtle" size="md" glow="subtle" className="conditional-animation">
                <div className="text-center">
                  <Zap className="w-8 h-8 mx-auto mb-2 text-primary animate-pulse" />
                  <div className="font-medium">Smart Animations</div>
                  <div className="text-xs text-muted-foreground">Performance aware</div>
                </div>
              </GlassCard>
            </div>
          </div>
          
          {/* Features List */}
          <div className="space-y-6">
            <GlassCard variant="secondary" size="lg" depth="medium" glow="subtle">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Palette className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Real-time Color Adaptation</h3>
                    <p className="text-sm text-muted-foreground">
                      Colors dynamically adjust based on user interactions, creating a responsive and engaging visual experience.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Settings2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Intelligent Theme Switching</h3>
                    <p className="text-sm text-muted-foreground">
                      Seamless transitions between light, dark, and custom themes with smooth animations and perfect color consistency.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Accessibility First</h3>
                    <p className="text-sm text-muted-foreground">
                      High contrast modes, reduced motion support, and WCAG compliance ensure accessibility for all users.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Brand Integration</h3>
                    <p className="text-sm text-muted-foreground">
                      Customize colors to match your brand with automatic generation of complementary palettes and color schemes.
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
        </div>
      </section>

      {/* Interactive Data Visualization Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <Badge className="mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0">
            <BarChart3 className="w-4 h-4 mr-2" />
            Interactive Analytics
          </Badge>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Real-Time Data Visualizations
          </h2>
          
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8">
            Experience our advanced charting system with D3.js-powered interactive visualizations, real-time data updates, and responsive design.
          </p>
        </div>

                 {/* Demo with curved layout */}
         <div className="curved-grid max-w-6xl mx-auto">
           <div className="perspective-container">
             <div className="transform-3d tilt-left">
               <GlassCard variant="primary" size="xl" depth="floating" glow="strong">
                 <div className="h-[400px] flex items-center justify-center">
                   <div className="text-center space-y-4">
                     <BarChart3 className="w-16 h-16 mx-auto text-indigo-500" />
                     <div>
                       <h3 className="text-xl font-semibold mb-2">Interactive Data Visualizations</h3>
                       <p className="text-muted-foreground">
                         Advanced D3.js charts with real-time data, smooth animations, and interactive tooltips
                       </p>
                     </div>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                       <div className="h-16 bg-gradient-to-t from-blue-500 to-cyan-400 rounded opacity-80"></div>
                       <div className="h-20 bg-gradient-to-t from-purple-500 to-pink-400 rounded opacity-80"></div>
                       <div className="h-12 bg-gradient-to-t from-green-500 to-emerald-400 rounded opacity-80"></div>
                       <div className="h-16 bg-gradient-to-t from-orange-500 to-yellow-400 rounded opacity-80"></div>
                     </div>
                   </div>
                 </div>
               </GlassCard>
             </div>
           </div>
         </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">12+</div>
              <div className="text-slate-300">Core Features</div>
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
              Join thousands of developers who are building amazing SaaS applications with our comprehensive feature set.
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