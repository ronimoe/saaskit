'use client'

import { useState, useEffect } from 'react'
import { getHealthMetrics, type HealthMetrics } from '../../../lib/supabase/database-helpers'

export function HealthCheck() {
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState<number[]>([])

  const checkHealth = async () => {
    setLoading(true)
    try {
      const result = await getHealthMetrics()
      setMetrics(result)
      
      // Keep last 10 latency measurements for trend
      if (result.connection_status === 'connected') {
        setHistory(prev => [...prev.slice(-9), result.latency_ms])
      }
    } catch (error) {
      console.error('Failed to check health:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkHealth()
  }, [])

  const getLatencyStatus = (latency: number) => {
    if (latency < 100) return { status: 'excellent', color: 'text-green-600', bg: 'bg-green-100' }
    if (latency < 300) return { status: 'good', color: 'text-blue-600', bg: 'bg-blue-100' }
    if (latency < 500) return { status: 'fair', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    return { status: 'poor', color: 'text-red-600', bg: 'bg-red-100' }
  }

  const averageLatency = history.length > 0 
    ? Math.round(history.reduce((a, b) => a + b, 0) / history.length)
    : 0

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Health Check</h2>
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
        <h2 className="text-xl font-semibold">Health Check</h2>
        <button
          onClick={checkHealth}
          disabled={loading}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
          title="Check health"
        >
          🔄 Check
        </button>
      </div>
      
      {metrics && (
        <div className="space-y-4">
          {/* Current Latency */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Current Latency:</span>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg">{metrics.latency_ms}ms</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getLatencyStatus(metrics.latency_ms).color} ${getLatencyStatus(metrics.latency_ms).bg}`}>
                {getLatencyStatus(metrics.latency_ms).status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Average Latency */}
          {history.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Average Latency:</span>
              <span className="font-medium">{averageLatency}ms</span>
            </div>
          )}

          {/* Latency Trend */}
          {history.length > 1 && (
            <div>
              <span className="text-gray-600 text-sm">Latency Trend (last {history.length} checks):</span>
              <div className="mt-2 flex items-end space-x-1 h-16">
                {history.map((latency, index) => {
                  const maxLatency = Math.max(...history)
                  const height = Math.max((latency / maxLatency) * 100, 10)
                  const { color } = getLatencyStatus(latency)
                  
                  return (
                    <div
                      key={index}
                      className={`w-4 ${color.replace('text-', 'bg-').replace('-600', '-200')} rounded-t`}
                      style={{ height: `${height}%` }}
                      title={`${latency}ms`}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* Database Status */}
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Database:</span>
                <span className="ml-2 font-medium">PostgreSQL</span>
              </div>
              <div>
                <span className="text-gray-500">Provider:</span>
                <span className="ml-2 font-medium">Supabase</span>
              </div>
              <div>
                <span className="text-gray-500">Region:</span>
                <span className="ml-2 font-medium">Auto-detected</span>
              </div>
              <div>
                <span className="text-gray-500">Last Updated:</span>
                <span className="ml-2 font-medium">
                  {new Date(metrics.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 