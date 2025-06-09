import Link from 'next/link'
import { Button } from '@saas/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@saas/ui'
import { Package, Building2, CheckCircle } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold tracking-tight">
          Hello SaaS Kit! 🚀
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Welcome to the SaaS Kit monorepo demo application. 
          This demonstrates our working monorepo infrastructure with beautiful, modern UI components.
        </p>
      </div>

      {/* Main Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Package className="h-6 w-6 text-primary" />
              <CardTitle>Explore Packages</CardTitle>
            </div>
            <CardDescription>
              View all the shared packages available in our monorepo, including UI components, 
              authentication, billing, and more.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/packages">
                View Packages
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Building2 className="h-6 w-6 text-primary" />
              <CardTitle>Monorepo Structure</CardTitle>
            </div>
            <CardDescription>
              See the complete folder structure and organization of our monorepo, 
              including apps, packages, tools, and configuration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary" className="w-full">
              <Link href="/structure">
                View Structure
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Features Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>✨</span>
            <span>Features Demonstrated</span>
          </CardTitle>
          <CardDescription>
            Everything working together in our modern monorepo setup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              'pnpm workspace configuration',
              'Turbo build orchestration', 
              'Shared TypeScript configurations',
              'ESLint and Prettier setup',
              'Vitest testing infrastructure',
              'Cross-package dependencies'
            ].map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 