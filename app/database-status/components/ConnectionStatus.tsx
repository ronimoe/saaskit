'use client'

import { useState, useEffect } from 'react'
import { getHealthMetrics, type HealthMetrics } from '../../../lib/supabase/database-helpers'

export function ConnectionStatus() {
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  const checkConnection = async () => {
    setLoading(true)
    try {
      const result = await getHealthMetrics()
      setMetrics(result)
    } catch (_error) {
      setMetrics({
        connection_status: 'error',
        latency_ms: 0,
        timestamp: new Date().toISOString(),
        error: 'Failed to check connection'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  const getStatusColor = (status: HealthMetrics['connection_status']) => {
    switch (status) {
      case 'connected':
        return 'text-green-600 bg-green-100'
      case 'error':
        return 'text-yellow-600 bg-yellow-100'
      case 'disconnected':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: HealthMetrics['connection_status']) => {
    switch (status) {
      case 'connected':
        return '✅'
      case 'error':
        return '⚠️'
      case 'disconnected':
        return '❌'
      default:
        return '⏳'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Connection Status</h2>
        <button
          onClick={checkConnection}
          disabled={loading}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
          title="Check connection"
        >
          🔄 Check
        </button>
      </div>
      
      {metrics && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getStatusIcon(metrics.connection_status)}</span>
            <div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(metrics.connection_status)}`}>
                {metrics.connection_status.toUpperCase()}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Latency:</span>
              <span className="ml-2 font-medium">{metrics.latency_ms}ms</span>
            </div>
            <div>
              <span className="text-gray-500">Last Check:</span>
              <span className="ml-2 font-medium">
                {new Date(metrics.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
          
          {metrics.error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">
                <strong>Error:</strong> {metrics.error}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 