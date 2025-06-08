'use client'

import { useState, useEffect } from 'react'
import { getRLSStatus, type RLSStatus } from '../../../lib/supabase/database-helpers'

export function RLSIndicator() {
  const [rlsStatus, setRlsStatus] = useState<RLSStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  const fetchRLSStatus = async () => {
    setLoading(true)
    try {
      const result = await getRLSStatus()
      setRlsStatus(result)
      setLastUpdated(new Date().toISOString())
    } catch (error) {
      console.error('Failed to fetch RLS status:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRLSStatus()
  }, [])

  const getSecurityLevel = (policiesCount: number) => {
    if (policiesCount >= 4) return { level: 'High', color: 'text-green-600', bg: 'bg-green-100', icon: '🛡️' }
    if (policiesCount >= 2) return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: '⚠️' }
    if (policiesCount >= 1) return { level: 'Low', color: 'text-orange-600', bg: 'bg-orange-100', icon: '🔓' }
    return { level: 'None', color: 'text-red-600', bg: 'bg-red-100', icon: '❌' }
  }

  const getTotalPolicies = () => {
    return rlsStatus.reduce((total, table) => total + table.policies_count, 0)
  }

  const getEnabledTables = () => {
    return rlsStatus.filter(table => table.rls_enabled).length
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">RLS Policy Status</h2>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">RLS Policy Status</h2>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-500">
            Row Level Security
          </div>
          <button
            onClick={fetchRLSStatus}
            disabled={loading}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
            title="Refresh RLS status"
          >
            🔄 Refresh
          </button>
        </div>
      </div>
      
      {/* Security Overview */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{getEnabledTables()}/{rlsStatus.length}</div>
            <div className="text-sm text-gray-600">Tables Protected</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{getTotalPolicies()}</div>
            <div className="text-sm text-gray-600">Total Policies</div>
          </div>
        </div>
      </div>

      {/* Table RLS Status */}
      <div className="space-y-3">
        {rlsStatus.map((table) => {
          const security = getSecurityLevel(table.policies_count)
          
          return (
            <div key={table.table_name} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{security.icon}</span>
                  <div>
                    <h3 className="font-medium text-gray-900">{table.table_name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${table.rls_enabled ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                        {table.rls_enabled ? 'RLS ENABLED' : 'RLS DISABLED'}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${security.color} ${security.bg}`}>
                        {security.level} Security
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {table.policies_count}
                  </div>
                  <div className="text-sm text-gray-500">policies</div>
                </div>
              </div>
              
              {/* Policy breakdown */}
              <div className="mt-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Expected policies (CRUD):</span>
                  <span className="font-medium">4</span>
                </div>
                <div className="flex justify-between">
                  <span>Actual policies:</span>
                  <span className={`font-medium ${table.policies_count >= 4 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {table.policies_count}
                  </span>
                </div>
              </div>
              
              {/* Security recommendations */}
              {!table.rls_enabled && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  ⚠️ RLS is disabled. Enable Row Level Security for this table.
                </div>
              )}
              {table.rls_enabled && table.policies_count < 4 && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
                  💡 Consider adding more policies for complete CRUD protection.
                </div>
              )}
              {table.rls_enabled && table.policies_count >= 4 && (
                <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                  ✅ Table is properly secured with RLS and comprehensive policies.
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Security Summary */}
      <div className="mt-6 p-4 border-t border-gray-200">
        <div className="text-center">
          {getEnabledTables() === rlsStatus.length ? (
            <div className="text-green-600 font-medium">
              🛡️ All tables are protected with Row Level Security
            </div>
          ) : (
            <div className="text-yellow-600 font-medium">
              ⚠️ {rlsStatus.length - getEnabledTables()} table(s) need RLS protection
            </div>
          )}
        </div>
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