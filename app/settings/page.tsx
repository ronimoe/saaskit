import { Suspense } from 'react'
import { createClient } from '@/utils/supabase/server'
import { UnifiedHeader } from '@/components/layout/unified-header'
import { GlassCard } from '@/components/ui/glass-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { InteractiveUserPreferences } from '@/components/interactive-user-preferences'
import { redirect } from 'next/navigation'
import { 
  Settings as SettingsIcon,
  Palette,
  Flag,
  Globe,
  Monitor,
  Users,
  Lightbulb,
  Shield,
  Zap,
} from 'lucide-react'

// Import configuration systems
import { getBrandConfig } from '@/lib/brand-server'
import { getUserPreferences } from '@/lib/user-preferences'

function SettingsPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <UnifiedHeader variant="app" />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
          
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="grid gap-6 md:grid-cols-2">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

async function SettingsContent() {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/login')
  }

  // Load configuration data
  const [brandConfig, userPreferences] = await Promise.all([
    getBrandConfig(),
    getUserPreferences(user.id)
  ])

  // Simple feature flags for display
  const featureFlags = {
    glassmorphism: { enabled: true },
    animations: { enabled: true },
    magneticEffects: { enabled: false },
    gamification: { enabled: false },
    advancedAnalytics: { enabled: true },
    aiFeatures: { enabled: false },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <UnifiedHeader variant="app" />
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-2">
              <SettingsIcon className="h-8 w-8 text-primary" />
              <span>Application Settings</span>
            </h1>
            <p className="text-muted-foreground">
              Manage your personal preferences and view application configuration.
            </p>
          </div>

          {/* Settings Tabs */}
          <Tabs defaultValue="preferences" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="preferences" className="flex items-center space-x-2">
                <Monitor className="h-4 w-4" />
                <span>Preferences</span>
              </TabsTrigger>
              <TabsTrigger value="branding" className="flex items-center space-x-2">
                <Palette className="h-4 w-4" />
                <span>Branding</span>
              </TabsTrigger>
              <TabsTrigger value="features" className="flex items-center space-x-2">
                <Flag className="h-4 w-4" />
                <span>Features</span>
              </TabsTrigger>
            </TabsList>

            {/* User Preferences (Interactive) */}
            <TabsContent value="preferences" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Monitor className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-2xl font-semibold">Personal Preferences</h2>
                </div>
                <p className="text-muted-foreground">
                  Customize your experience with personal display, accessibility, and notification settings.
                </p>
              </div>
              
              <InteractiveUserPreferences initialPreferences={userPreferences} />
            </TabsContent>

            {/* Branding Configuration (Read-only display) */}
            <TabsContent value="branding" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Brand Colors */}
                <GlassCard variant="primary" size="lg" depth="medium" glow="subtle">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Palette className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-lg font-semibold">Brand Colors</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Primary</span>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: `oklch(${brandConfig.colors.primary})` }}
                          />
                          <span className="text-xs text-muted-foreground font-mono">
                            {brandConfig.colors.primary}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Secondary</span>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: `oklch(${brandConfig.colors.secondary})` }}
                          />
                          <span className="text-xs text-muted-foreground font-mono">
                            {brandConfig.colors.secondary}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Accent</span>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: `oklch(${brandConfig.colors.accent})` }}
                          />
                          <span className="text-xs text-muted-foreground font-mono">
                            {brandConfig.colors.accent}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>

                {/* Company Information */}
                <GlassCard variant="secondary" size="lg" depth="low" glow="subtle">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <h3 className="text-lg font-semibold">Company Info</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Company Name</span>
                        <span className="text-sm">{brandConfig.company.name}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Tagline</span>
                        <span className="text-sm">{brandConfig.company.tagline}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Website</span>
                        <a 
                          href={brandConfig.company.website} 
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {brandConfig.company.website}
                        </a>
                      </div>
                    </div>
                  </div>
                </GlassCard>

                {/* Theme Settings */}
                <GlassCard variant="primary" size="lg" depth="medium" glow="subtle" className="md:col-span-2">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      <h3 className="text-lg font-semibold">Theme Configuration</h3>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Glassmorphism</span>
                        <Badge variant={brandConfig.theme?.enableGlassmorphism ?? true ? "default" : "secondary"}>
                          {brandConfig.theme?.enableGlassmorphism ?? true ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Animations</span>
                        <Badge variant={brandConfig.theme?.enableAnimations ?? true ? "default" : "secondary"}>
                          {brandConfig.theme?.enableAnimations ?? true ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">High Contrast</span>
                        <Badge variant={brandConfig.theme?.enableHighContrast ?? false ? "default" : "secondary"}>
                          {brandConfig.theme?.enableHighContrast ?? false ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Sans Font</span>
                        <span className="text-sm font-mono">{brandConfig.typography?.fontFamily.sans || 'Default'}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Mono Font</span>
                        <span className="text-sm font-mono">{brandConfig.typography?.fontFamily.mono || 'Default'}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Heading Font</span>
                        <span className="text-sm font-mono">{brandConfig.typography?.fontFamily.heading || 'Inherits Sans'}</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </TabsContent>

            {/* Feature Flags (Read-only display) */}
            <TabsContent value="features" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* UI Features */}
                <GlassCard variant="primary" size="lg" depth="medium" glow="subtle">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Monitor className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-lg font-semibold">UI Features</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Glassmorphism</span>
                        <Badge variant={featureFlags.glassmorphism.enabled ? "default" : "secondary"}>
                          {featureFlags.glassmorphism.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Animations</span>
                        <Badge variant={featureFlags.animations.enabled ? "default" : "secondary"}>
                          {featureFlags.animations.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Magnetic Effects</span>
                        <Badge variant={featureFlags.magneticEffects.enabled ? "default" : "secondary"}>
                          {featureFlags.magneticEffects.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </GlassCard>

                {/* Functional Features */}
                <GlassCard variant="secondary" size="lg" depth="low" glow="subtle">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      <h3 className="text-lg font-semibold">Functional Features</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Gamification</span>
                        <Badge variant={featureFlags.gamification.enabled ? "default" : "secondary"}>
                          {featureFlags.gamification.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Advanced Analytics</span>
                        <Badge variant={featureFlags.advancedAnalytics.enabled ? "default" : "secondary"}>
                          {featureFlags.advancedAnalytics.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">AI Features</span>
                        <Badge variant={featureFlags.aiFeatures.enabled ? "default" : "secondary"}>
                          {featureFlags.aiFeatures.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </GlassCard>

                {/* Feature Management Info */}
                <GlassCard variant="secondary" size="lg" depth="low" glow="subtle" className="md:col-span-2">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Flag className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      <h3 className="text-lg font-semibold">Feature Management</h3>
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>
                        Feature flags are configured through the application's configuration system. 
                        These settings control the availability of features across the application.
                      </p>
                      <p>
                        Changes to feature flags require application restart and are managed through 
                        the configuration files or environment variables.
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsPageSkeleton />}>
      <SettingsContent />
    </Suspense>
  )
} 