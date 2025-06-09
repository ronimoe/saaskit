'use client'

import { useState, useEffect } from 'react'
import { getTableSchema, type TableInfo } from '../../../lib/supabase/database-helpers'

export function SchemaViewer() {
  const [schema, setSchema] = useState<TableInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchSchema = async () => {
      setLoading(true)
      try {
        const result = await getTableSchema()
        setSchema(result)
      } catch (_error) {
        // Fallback to hardcoded schema
        setSchema(getHardcodedSchema())
      } finally {
        setLoading(false)
      }
    }

    fetchSchema()
  }, [])

  const getHardcodedSchema = (): TableInfo[] => {
    return [
      { table_name: 'users', column_name: 'id', data_type: 'uuid', is_nullable: 'NO', column_default: 'gen_random_uuid()' },
      { table_name: 'users', column_name: 'email', data_type: 'text', is_nullable: 'NO', column_default: null },
      { table_name: 'users', column_name: 'created_at', data_type: 'timestamp with time zone', is_nullable: 'NO', column_default: 'now()' },
      { table_name: 'products', column_name: 'id', data_type: 'uuid', is_nullable: 'NO', column_default: 'gen_random_uuid()' },
      { table_name: 'products', column_name: 'name', data_type: 'text', is_nullable: 'NO', column_default: null },
      { table_name: 'products', column_name: 'price', data_type: 'numeric', is_nullable: 'YES', column_default: null }
    ]
  }

  const groupedSchema = schema.reduce((acc, column) => {
    if (!acc[column.table_name]) {
      acc[column.table_name] = []
    }
    acc[column.table_name]!.push(column)
    return acc
  }, {} as Record<string, TableInfo[]>)

  const toggleTable = (tableName: string) => {
    const newExpanded = new Set(expandedTables)
    if (newExpanded.has(tableName)) {
      newExpanded.delete(tableName)
    } else {
      newExpanded.add(tableName)
    }
    setExpandedTables(newExpanded)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Database Schema</h2>
        <div className="animate-pulse">Loading schema...</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Database Schema</h2>
      
      <div className="space-y-4">
        {Object.entries(groupedSchema).map(([tableName, columns]) => {
          const isExpanded = expandedTables.has(tableName)
          
          return (
            <div key={tableName} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleTable(tableName)}
                className="w-full p-4 text-left hover:bg-gray-50"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{tableName} ({columns.length} columns)</h3>
                  <span>{isExpanded ? '▼' : '▶'}</span>
                </div>
              </button>
              
              {isExpanded && (
                <div className="border-t p-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Column</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Nullable</th>
                        <th className="text-left p-2">Default</th>
                      </tr>
                    </thead>
                    <tbody>
                      {columns.map((column, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2 font-medium">{column.column_name}</td>
                          <td className="p-2">{column.data_type}</td>
                          <td className="p-2">{column.is_nullable}</td>
                          <td className="p-2">{column.column_default ?? '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}