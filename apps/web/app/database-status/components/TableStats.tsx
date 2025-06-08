'use client'

import { useState, useEffect } from 'react'
import { getTableStats, type TableStats } from '../../../lib/supabase/database-helpers'

export function TableStats() {
  const [stats, setStats] = useState<TableStats[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  const fetchStats = async () => {
    setLoading(true)
    try {
      const result = await getTableStats()
      setStats(result)
      setLastUpdated(new Date().toISOString())
    } catch (error) {
      console.error('Failed to fetch table stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const getTotalRows = () => {
    return stats.reduce((total, table) => total + table.row_count, 0)
  }

  const getTableIcon = (tableName: string) => {
    switch (tableName) {
      case 'users':
        return '👥'
      case 'products':
        return '📦'
      case 'user_products':
        return '🔗'
      case 'subscriptions':
        return '💳'
      default:
        return '📊'
    }
  }

  const getTableDescription = (tableName: string) => {
    switch (tableName) {
      case 'users':
        return 'User profiles and authentication data'
      case 'products':
        return 'Available products and services'
      case 'user_products':
        return 'User-product relationships and roles'
      case 'subscriptions':
        return 'User subscription and billing data'
      default:
        return 'Database table'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Table Statistics</h2>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Table Statistics</h2>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
          title="Refresh data"
        >
          🔄 Refresh
        </button>
      </div>
      
      {/* Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Records:</span>
          <span className="text-2xl font-bold text-blue-600">{getTotalRows().toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-gray-600">Tables:</span>
          <span className="font-medium">{stats.length}</span>
        </div>
      </div>

      {/* Table List */}
      <div className="space-y-3">
        {stats.map((table) => (
          <div key={table.table_name} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getTableIcon(table.table_name)}</span>
                <div>
                  <h3 className="font-medium text-gray-900">{table.table_name}</h3>
                  <p className="text-sm text-gray-500">{getTableDescription(table.table_name)}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  {table.row_count.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">records</div>
              </div>
            </div>
            
            {/* Progress bar showing relative size */}
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${getTotalRows() > 0 ? (table.row_count / getTotalRows()) * 100 : 0}%`
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span>{getTotalRows() > 0 ? `${((table.row_count / getTotalRows()) * 100).toFixed(1)}%` : '0%'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          Last updated: {new Date(lastUpdated).toLocaleString()}
        </div>
      )}
    </div>
  )
} 