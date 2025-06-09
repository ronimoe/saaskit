import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@saas/ui'
import { Folder, File, Zap, Database, TestTube, Settings, FileCode } from 'lucide-react'

export default function StructurePage() {
  const structure = [
    {
      name: 'apps/',
      description: 'Independent Next.js applications',
      icon: Zap,
      children: [
        { name: 'main-app/', description: 'Main SaaS application' },
        { name: 'marketing-site/', description: 'Marketing website' },
        { name: 'web/', description: 'Demo application (this app!)' },
      ],
    },
    {
      name: 'packages/',
      description: 'Shared code libraries',
      icon: Folder,
      children: [
        { name: 'auth/', description: 'Authentication utilities' },
        { name: 'billing/', description: 'Payment processing' },
        { name: 'email/', description: 'Email services' },
        { name: 'lib/', description: 'Utility functions' },
        { name: 'supabase/', description: 'Database client' },
        { name: 'types/', description: 'TypeScript types' },
        { name: 'ui/', description: 'React components' },
      ],
    },
    {
      name: 'tools/',
      description: 'Shared tooling and configurations',
      icon: Settings,
      children: [
        { name: 'eslint-config/', description: 'ESLint configurations' },
        { name: 'tsconfig/', description: 'TypeScript configurations' },
        { name: 'vitest-config/', description: 'Testing configurations' },
      ],
    },
    {
      name: 'supabase/',
      description: 'Database migrations and functions',
      icon: Database,
      children: [
        { name: 'migrations/', description: 'Database schema migrations' },
        { name: 'functions/', description: 'Edge functions' },
      ],
    },
    {
      name: 'tests/',
      description: 'End-to-end testing',
      icon: TestTube,
      children: [
        { name: 'e2e/', description: 'E2E test files' },
        { name: 'fixtures/', description: 'Test data and fixtures' },
      ],
    },
  ]

  const rootFiles = [
    { name: 'package.json', description: 'Root package configuration' },
    { name: 'pnpm-workspace.yaml', description: 'pnpm workspace configuration' },
    { name: 'turbo.json', description: 'Turbo build orchestration' },
    { name: 'vitest.workspace.ts', description: 'Vitest workspace configuration' },
    { name: 'tsconfig.json', description: 'Root TypeScript configuration' },
    { name: '.gitignore', description: 'Git ignore patterns' },
    { name: 'pnpm-lock.yaml', description: 'Dependency lock file' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          🏗️ Monorepo Structure
        </h1>
        <p className="text-xl text-muted-foreground">
          Complete folder structure and organization of the SaaS Kit monorepo.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileCode className="h-5 w-5" />
            <span>Root Configuration Files</span>
          </CardTitle>
          <CardDescription>
            Essential configuration files at the project root
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {rootFiles.map((file) => (
              <div key={file.name} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                <File className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <span className="font-mono text-sm font-medium">{file.name}</span>
                  <p className="text-xs text-muted-foreground">{file.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {structure.map((section) => {
          const IconComponent = section.icon
          return (
            <Card key={section.name} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <IconComponent className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-mono">{section.name}</span>
                </CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {section.children.map((child, index) => (
                    <div key={child.name} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                      <span className="text-muted-foreground text-sm mt-0.5">
                        {index === section.children.length - 1 ? '└─' : '├─'}
                      </span>
                      <Folder className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="space-y-1">
                        <span className="font-mono text-sm font-medium text-primary">{child.name}</span>
                        <p className="text-xs text-muted-foreground">{child.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-primary">
            <Zap className="h-5 w-5" />
            <span>Key Benefits</span>
          </CardTitle>
          <CardDescription>
            Advantages of our monorepo architecture
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              'Shared dependencies and configurations',
              'Consistent tooling across all packages',
              'Efficient build and test orchestration',
              'Cross-package imports and code sharing'
            ].map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 