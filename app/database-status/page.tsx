'use client'

import { Suspense } from 'react'
import { 
  ConnectionStatus,
  SchemaViewer,
  TableStats,
  HealthCheck,
  RLSIndicator,
  CRUDDemo
} from './components'

export default function DatabaseStatusPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Database Status Dashboard
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Real-time monitoring of Supabase database connection, schema, performance, 
          and security policies with interactive demonstrations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connection Status */}
        <Suspense fallback={<div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>}>
          <ConnectionStatus />
        </Suspense>

        {/* Health Check */}
        <Suspense fallback={<div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>}>
          <HealthCheck />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table Statistics */}
        <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>}>
          <TableStats />
        </Suspense>

        {/* RLS Policy Status */}
        <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>}>
          <RLSIndicator />
        </Suspense>
      </div>

      {/* Schema Viewer */}
      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>}>
        <SchemaViewer />
      </Suspense>

      {/* CRUD Demonstration */}
      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>}>
        <CRUDDemo />
      </Suspense>
    </div>
  )
} 