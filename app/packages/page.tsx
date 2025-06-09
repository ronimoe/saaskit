import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@saas/ui'
import { Package, Shield, Mail, Wrench, Database, FileCode, Palette } from 'lucide-react'

export default function PackagesPage() {
  const packages = [
    {
      name: '@saas/auth',
      description: 'Authentication and authorization utilities',
      version: '0.1.0',
      type: 'Library',
      icon: Shield,
    },
    {
      name: '@saas/billing',
      description: 'Subscription and payment processing',
      version: '0.1.0',
      type: 'Library',
      icon: Package,
    },
    {
      name: '@saas/email',
      description: 'Email templates and sending utilities',
      version: '0.1.0',
      type: 'Library',
      icon: Mail,
    },
    {
      name: '@saas/lib',
      description: 'Shared utilities and helper functions',
      version: '0.1.0',
      type: 'Library',
      icon: Wrench,
    },
    {
      name: '@saas/supabase',
      description: 'Supabase client and database utilities',
      version: '0.1.0',
      type: 'Library',
      icon: Database,
    },
    {
      name: '@saas/types',
      description: 'Shared TypeScript types and interfaces',
      version: '0.1.0',
      type: 'Library',
      icon: FileCode,
    },
    {
      name: '@saas/ui',
      description: 'Reusable React components and UI elements',
      version: '0.1.0',
      type: 'Library',
      icon: Palette,
    },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          📦 Monorepo Packages
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          All shared packages available in the SaaS Kit monorepo. These packages can be imported 
          and used across different applications in the workspace.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => {
          const IconComponent = pkg.icon
          return (
            <Card key={pkg.name} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-md">
                          {pkg.type}
                        </span>
                        <span className="text-xs text-muted-foreground">v{pkg.version}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <CardDescription className="mt-3">
                  {pkg.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-end">
                  <span className="text-sm text-green-600 font-medium flex items-center space-x-1">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    <span>Installed</span>
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>💡</span>
            <span>Usage Example</span>
          </CardTitle>
          <CardDescription>
            Here&apos;s how you can import and use these packages in your application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
            <code>{`// Import packages in your application
import { Button } from '@saas/ui'
import { useAuth } from '@saas/auth'
import { formatCurrency } from '@saas/lib'

// Use in your components
const { user } = useAuth()
const price = formatCurrency(2999)`}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  )
} 