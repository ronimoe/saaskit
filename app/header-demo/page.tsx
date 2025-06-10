"use client"

import React from 'react'
import { PreAuthHeader, AuthHeader, AppHeader } from '@/components/layout/unified-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function HeaderDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back button */}
        <div className="mb-8">
          <Button variant="outline" asChild>
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Unified Header System
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-6">
            Adaptive header variations based on authentication state and page context
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="secondary">Brand Consistency</Badge>
            <Badge variant="secondary">Adaptive Design</Badge>
            <Badge variant="secondary">User Experience</Badge>
            <Badge variant="secondary">shadcn/ui</Badge>
          </div>
        </div>

        {/* Header Variants */}
        <div className="space-y-12">
          
          {/* Landing Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                Landing/Marketing Header
              </CardTitle>
              <CardDescription>
                Used on public pages like homepage, features, pricing. Includes main navigation and CTA buttons.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <PreAuthHeader variant="landing" showNavigation={true} />
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">Features:</p>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <li>• Logo with brand name and tagline</li>
                  <li>• Main navigation (Home, Features, Pricing, Docs)</li>
                  <li>• Sign In and Sign Up CTA buttons</li>
                  <li>• Mobile-responsive with hamburger menu</li>
                  <li>• Theme toggle</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Auth Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                Authentication Header
              </CardTitle>
              <CardDescription>
                Minimal header for login, signup, and password reset pages. Clean and distraction-free.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <AuthHeader variant="auth" />
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">Features:</p>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <li>• Logo only (maintains brand presence)</li>
                  <li>• Context-aware alternate action (Sign In ↔ Sign Up)</li>
                  <li>• Minimal design to focus on authentication form</li>
                  <li>• Theme toggle for accessibility</li>
                  <li>• No distracting navigation elements</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* App Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                Application Header
              </CardTitle>
              <CardDescription>
                Full-featured header for authenticated users. Includes app navigation, search, notifications, and user menu.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <AppHeader variant="app" showSearch={true} showNotifications={true} />
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">Features:</p>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <li>• Logo with app-focused navigation</li>
                  <li>• App navigation (Dashboard, Settings, Billing)</li>
                  <li>• Search functionality</li>
                  <li>• Notifications bell with badge</li>
                  <li>• User avatar with dropdown menu</li>
                  <li>• Mobile-responsive with slide-out menu</li>
                  <li>• Active page highlighting</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Implementation Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Implementation Benefits</CardTitle>
              <CardDescription>
                Why this unified approach improves your SaaS application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2 text-green-600 dark:text-green-400">Benefits</h4>
                  <ul className="text-sm space-y-1">
                    <li>✅ Consistent brand experience</li>
                    <li>✅ Automatic context switching</li>
                    <li>✅ Reduced code duplication</li>
                    <li>✅ Better accessibility</li>
                    <li>✅ Mobile-first responsive design</li>
                    <li>✅ Easy to maintain and extend</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-blue-600 dark:text-blue-400">Technical Features</h4>
                  <ul className="text-sm space-y-1">
                    <li>🔧 Automatic authentication detection</li>
                    <li>🔧 Path-based context switching</li>
                    <li>🔧 Loading state handling</li>
                    <li>🔧 TypeScript type safety</li>
                    <li>🔧 shadcn/ui components</li>
                    <li>🔧 Tailwind CSS styling</li>
                  </ul>
                </div>
              </div>

              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Usage Example</h4>
                <pre className="text-sm overflow-x-auto">
{`// Automatic variant detection
<UnifiedHeader />

// Manual variant specification
<UnifiedHeader variant="landing" />
<UnifiedHeader variant="auth" />
<UnifiedHeader variant="app" showSearch={false} />`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 