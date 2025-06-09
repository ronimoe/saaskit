import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Plus, Mail, Github, Twitter, Globe } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="mt-12">
      <Card>
        <CardContent className="p-6">
          {/* Call to Action Section */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold mb-2">Ready to get started?</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              This demo showcases the power and flexibility of shadcn/ui components.
              Build your next project with these beautiful, accessible components.
            </p>
            <div className="flex justify-center gap-4">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Get Started
              </Button>
              <Button variant="outline">
                Learn More
              </Button>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Contact & Links Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            {/* Contact Info */}
            <div>
              <h4 className="font-semibold mb-3 text-slate-900 dark:text-slate-100">Contact</h4>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Mail className="w-4 h-4" />
                  hello@saaskit.com
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Globe className="w-4 h-4" />
                  www.saaskit.com
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h4 className="font-semibold mb-3 text-slate-900 dark:text-slate-100">Follow Us</h4>
              <div className="flex justify-center md:justify-start gap-4">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Github className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Twitter className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold mb-3 text-slate-900 dark:text-slate-100">Resources</h4>
              <div className="space-y-2 text-sm">
                <Button variant="link" className="h-auto p-0 text-slate-600 dark:text-slate-300">
                  Documentation
                </Button>
                <Button variant="link" className="h-auto p-0 text-slate-600 dark:text-slate-300">
                  Examples
                </Button>
                <Button variant="link" className="h-auto p-0 text-slate-600 dark:text-slate-300">
                  GitHub
                </Button>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Copyright */}
          <div className="text-center text-sm text-slate-500 dark:text-slate-400">
            © 2025 SaaS Kit. Built with shadcn/ui and Next.js.
          </div>
        </CardContent>
      </Card>
    </footer>
  )
} 