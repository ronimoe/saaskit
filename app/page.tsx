"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { UnifiedHeader } from "@/components/layout/unified-header"
import { SiteFooter } from "@/components/site-footer"
import { 
  ArrowRight,
  Check,
  Star,
  Shield,
  Zap,
  Users,
  BarChart3,
  Code2,
  Palette,
  Layers,
  Globe,
  Lock,
  Sparkles,
  Play,
  ChevronRight
} from "lucide-react"

export default function LandingPage() {
  const [email, setEmail] = useState("")

  const handleNewsletterSignup = () => {
    if (email) {
      // In a real app, this would call an API
      console.log("Newsletter signup:", email)
      setEmail("")
      // You could add a toast notification here
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <UnifiedHeader variant="landing" />
      
      <main className="container mx-auto px-4">
        {/* Hero Section */}
        <section className="py-20 lg:py-32 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <Badge variant="secondary" className="text-sm">
              ✨ Built with Next.js 15 & TypeScript
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-slate-100 dark:via-slate-300 dark:to-slate-100 bg-clip-text text-transparent leading-tight">
              Modern SaaS Kit
              <br />
              <span className="text-3xl md:text-5xl lg:text-6xl">Ready to Ship</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Launch your SaaS faster with our complete Next.js starter kit. 
              Authentication, billing, beautiful UI components, and more — all ready to customize.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button size="lg" className="text-lg px-8 py-6 group" asChild>
                <Link href="/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 group" asChild>
                <Link href="/header-demo">
                  <Play className="mr-2 h-5 w-5" />
                  View Demo
                </Link>
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 border-2 border-white dark:border-slate-900" />
                ))}
              </div>
              <span className="ml-2">Trusted by 1000+ developers</span>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              Everything You Need
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ship faster with our
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                complete toolkit
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Every feature you need to build and scale your SaaS, from authentication to billing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Authentication */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Secure Authentication</CardTitle>
                <CardDescription>
                  Complete auth system with Supabase. Email, password, and social login ready.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Email & password authentication
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Social login (Google, GitHub)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Protected routes & middleware
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* UI Components */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Beautiful UI Components</CardTitle>
                <CardDescription>
                  50+ shadcn/ui components with dark mode, accessibility, and TypeScript.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Dark/light mode support
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Fully accessible components
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Customizable design system
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Billing */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Stripe Integration</CardTitle>
                <CardDescription>
                  Complete billing system with subscriptions, webhooks, and customer portal.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Subscription management
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Webhook handling
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Customer portal integration
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Developer Experience */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mb-4">
                  <Code2 className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Developer Ready</CardTitle>
                <CardDescription>
                  TypeScript, ESLint, Prettier, and testing setup. Production-ready code.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Full TypeScript support
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Testing with Jest & RTL
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Code quality tools
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Performance */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">High Performance</CardTitle>
                <CardDescription>
                  Optimized for speed with Next.js 15, App Router, and modern best practices.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Server & client components
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Optimized bundle size
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Edge-ready deployment
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Scalable */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mb-4">
                  <Layers className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Production Scalable</CardTitle>
                <CardDescription>
                  Built for scale with proper architecture, database design, and deployment ready.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Modular architecture
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Database migrations
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Vercel deployment ready
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="py-20">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              <Globe className="w-4 h-4 mr-2" />
              Modern Tech Stack
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Built with the best tools
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Industry-leading technologies for performance, scalability, and developer experience.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 max-w-4xl mx-auto">
            {[
              { name: "Next.js 15", icon: "⚡" },
              { name: "TypeScript", icon: "📘" },
              { name: "Tailwind CSS", icon: "🎨" },
              { name: "Supabase", icon: "🚀" },
              { name: "Stripe", icon: "💳" },
              { name: "shadcn/ui", icon: "🧩" },
            ].map((tech) => (
              <Card key={tech.name} className="text-center border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="text-3xl mb-2">{tech.icon}</div>
                  <div className="font-medium text-sm">{tech.name}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <Card className="max-w-4xl mx-auto border-0 shadow-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white">
            <CardContent className="p-12 text-center">
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to ship your SaaS?
                </h2>
                <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                  Join thousands of developers who've launched their SaaS faster with our starter kit.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 text-lg px-8 py-6" asChild>
                  <Link href="/signup">
                    Start Building Now
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                
                <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-lg px-8 py-6 shadow-lg" asChild>
                  <Link href="/pricing">
                    View Pricing
                    <Sparkles className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>

              <div className="space-y-4">
                <Separator className="bg-slate-700" />
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <div className="flex items-center gap-2">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                    />
                    <Button onClick={handleNewsletterSignup} variant="secondary">
                      Subscribe
                    </Button>
                  </div>
                  <p className="text-sm text-slate-400">
                    Get updates and launch tips
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
      
      <SiteFooter />
    </div>
  )
}
