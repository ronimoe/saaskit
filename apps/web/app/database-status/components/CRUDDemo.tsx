'use client'

import { useState } from 'react'
import { testCRUDOperations } from '../../../lib/supabase/database-helpers'

export function CRUDDemo() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const runCRUDTest = async () => {
    setIsRunning(true)
    setResults(null)
    setError(null)

    try {
      const result = await testCRUDOperations()
      setResults(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsRunning(false)
    }
  }

  const formatJSON = (obj: any) => {
    return JSON.stringify(obj, null, 2)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">CRUD Operations Demo</h2>
          <p className="text-sm text-gray-600 mt-1">
            Test Create, Read, Update, Delete operations on the products table
          </p>
        </div>
        <button
          onClick={runCRUDTest}
          disabled={isRunning}
          className={`px-4 py-2 rounded-md text-white font-medium ${
            isRunning 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isRunning ? 'Running Test...' : 'Run CRUD Test'}
        </button>
      </div>

      {isRunning && (
        <div className="flex items-center space-x-3 text-blue-600 mb-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span>Executing CRUD operations...</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center space-x-2">
            <span className="text-red-600 text-xl">❌</span>
            <div>
              <h3 className="font-medium text-red-800">CRUD Test Failed</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {results && (
        <div className="space-y-4">
          {results.success ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-green-600 text-xl">✅</span>
                <h3 className="font-medium text-green-800">CRUD Test Successful</h3>
              </div>
              
              <div className="space-y-4">
                {/* CREATE Operation */}
                <div className="bg-white rounded-md p-3 border">
                  <h4 className="font-medium text-gray-900 mb-2">1. CREATE Operation</h4>
                  <div className="bg-gray-50 rounded p-2 text-xs font-mono overflow-x-auto">
                    <pre>{formatJSON(results.operations.create)}</pre>
                  </div>
                </div>

                {/* READ Operation */}
                <div className="bg-white rounded-md p-3 border">
                  <h4 className="font-medium text-gray-900 mb-2">2. READ Operation</h4>
                  <div className="bg-gray-50 rounded p-2 text-xs font-mono overflow-x-auto">
                    <pre>{formatJSON(results.operations.read)}</pre>
                  </div>
                </div>

                {/* UPDATE Operation */}
                <div className="bg-white rounded-md p-3 border">
                  <h4 className="font-medium text-gray-900 mb-2">3. UPDATE Operation</h4>
                  <div className="bg-gray-50 rounded p-2 text-xs font-mono overflow-x-auto">
                    <pre>{formatJSON(results.operations.update)}</pre>
                  </div>
                </div>

                {/* DELETE Operation */}
                <div className="bg-white rounded-md p-3 border">
                  <h4 className="font-medium text-gray-900 mb-2">4. DELETE Operation</h4>
                  <div className="bg-gray-50 rounded p-2 text-xs font-mono overflow-x-auto">
                    <pre>{formatJSON(results.operations.delete)}</pre>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-sm text-green-700">
                <strong>Test Summary:</strong> All CRUD operations completed successfully. 
                A test product was created, read, updated, and then deleted from the database.
              </div>
            </div>
          ) : (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center space-x-2">
                <span className="text-red-600 text-xl">❌</span>
                <div>
                  <h3 className="font-medium text-red-800">CRUD Test Failed</h3>
                  <p className="text-red-700 text-sm mt-1">{results.error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!results && !isRunning && !error && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🧪</div>
          <p>Click "Run CRUD Test" to demonstrate database operations</p>
          <p className="text-sm mt-2">
            This will create a temporary product, read it, update it, and then delete it
          </p>
        </div>
      )}

      {/* Information Section */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="font-medium text-blue-900 mb-2">About this Demo</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Tests all four basic database operations (Create, Read, Update, Delete)</li>
          <li>• Uses the products table for demonstration</li>
          <li>• Creates temporary data that is automatically cleaned up</li>
          <li>• Validates RLS policies and database connectivity</li>
          <li>• Shows real-time response data from Supabase</li>
        </ul>
      </div>
    </div>
  )
} 