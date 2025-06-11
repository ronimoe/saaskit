import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Mail, Github, Globe, Code2, Zap, Heart } from "lucide-react"
import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <Code2 className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                SaaS Kit
              </h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md leading-relaxed">
              The complete Next.js SaaS starter kit with authentication, payments, database, and beautiful UI components. 
              Ship your SaaS faster with production-ready code.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                <Zap className="w-3 h-3 mr-1" />
                Next.js 15
              </Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                TypeScript
              </Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Supabase
              </Badge>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Quick Links</h4>
            <div className="space-y-3">
              <Link href="/pricing" className="block text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                Pricing
              </Link>
              <Link href="/login" className="block text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                Sign In
              </Link>
              <Link href="/signup" className="block text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                Get Started
              </Link>
            </div>
          </div>

          {/* Resources & Contact */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Resources</h4>
            <div className="space-y-3">
              <a 
                href="https://github.com/ronimoe/saaskit" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors group"
              >
                <Github className="w-4 h-4 group-hover:scale-110 transition-transform" />
                GitHub Repository
              </a>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Mail className="w-4 h-4" />
                hello@saaskit.com
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Globe className="w-4 h-4" />
                www.saaskit.com
              </div>
            </div>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span>© 2025 SaaS Kit. Built with</span>
            <Heart className="w-4 h-4 text-red-500" />
            <span>for the love of code</span>
          </div>
          
          {/* GitHub Stars Button */}
          <Button 
            variant="outline" 
            size="sm" 
            className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800" 
            asChild
          >
            <a 
              href="https://github.com/ronimoe/saaskit" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Github className="w-4 h-4" />
              Star on GitHub
            </a>
          </Button>
        </div>
      </div>
    </footer>
  )
} 