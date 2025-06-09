'use client'

import { Suspense } from 'react'
import { Card, CardContent } from '@saas/ui'
import { Database } from 'lucide-react'
import { 
  ConnectionStatus,
  SchemaViewer,
  TableStats,
  HealthCheck,
  RLSIndicator,
  CRUDDemo
} from './components'

function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-8 bg-muted rounded"></div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DatabaseStatusPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Database className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Database Status Dashboard
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Real-time monitoring of Supabase database connection, schema, performance, 
          and security policies with interactive demonstrations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connection Status */}
        <Suspense fallback={<LoadingSkeleton />}>
          <ConnectionStatus />
        </Suspense>

        {/* Health Check */}
        <Suspense fallback={<LoadingSkeleton />}>
          <HealthCheck />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table Statistics */}
        <Suspense fallback={<LoadingSkeleton className="h-64" />}>
          <TableStats />
        </Suspense>

        {/* RLS Policy Status */}
        <Suspense fallback={<LoadingSkeleton className="h-64" />}>
          <RLSIndicator />
        </Suspense>
      </div>

      {/* Schema Viewer */}
      <Suspense fallback={<LoadingSkeleton className="h-96" />}>
        <SchemaViewer />
      </Suspense>

      {/* CRUD Demonstration */}
      <Suspense fallback={<LoadingSkeleton className="h-96" />}>
        <CRUDDemo />
      </Suspense>
    </div>
  )
} 