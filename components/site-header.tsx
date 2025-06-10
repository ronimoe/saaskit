"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sparkles, Zap, Shield, Globe, Code2, LogIn } from "lucide-react"

export function SiteHeader() {
  return (
    <header className="mb-12">
      {/* Top Navigation Bar */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200 dark:border-slate-700">
        {/* Logo Section */}
        <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
            <Code2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">SaaS Kit</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Modern SaaS Platform</p>
          </div>
        </Link>

        {/* Navigation & Controls */}
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <Link href="/login">
              <LogIn className="h-4 w-4" />
              Login
            </Link>
          </Button>
          <ThemeToggle />
        </div>
      </div>

      {/* Main Header */}
      <div className="text-center">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          SaaS Kit Platform
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 mb-6">
          Build your next SaaS application with modern UI components and best practices
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="secondary">
            <Sparkles className="w-3 h-3 mr-1" />
            Modern
          </Badge>
          <Badge variant="secondary">
            <Zap className="w-3 h-3 mr-1" />
            Scalable
          </Badge>
          <Badge variant="secondary">
            <Shield className="w-3 h-3 mr-1" />
            Secure
          </Badge>
          <Badge variant="secondary">
            <Globe className="w-3 h-3 mr-1" />
            Cloud-Ready
          </Badge>
        </div>
      </div>
    </header>
  )
} 