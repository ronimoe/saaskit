import { describe, it, expect } from 'vitest'
import {
  users,
  products,
  subscriptions,
  userProducts,
  validateRequired,
  sanitizeEmail,
  createErrorResponse,
  createSuccessResponse,
} from '../database'

describe('Database Module', () => {
  describe('exports', () => {
    it('exports database operation objects', () => {
      expect(typeof users).toBe('object')
      expect(typeof products).toBe('object')
      expect(typeof subscriptions).toBe('object')
      expect(typeof userProducts).toBe('object')
    })

    it('exports utility functions', () => {
      expect(typeof validateRequired).toBe('function')
      expect(typeof sanitizeEmail).toBe('function')
      expect(typeof createErrorResponse).toBe('function')
      expect(typeof createSuccessResponse).toBe('function')
    })
  })

  describe('utility functions', () => {
    describe('validateRequired', () => {
      it('validates required fields successfully', () => {
        const data = { name: 'Test', email: 'test@example.com' }
        const requiredFields = ['name', 'email'] as (keyof typeof data)[]

        const result = validateRequired(data, requiredFields)

        expect(result.isValid).toBe(true)
        expect(result.missingFields).toEqual([])
      })

      it('identifies missing required fields', () => {
        const data = { name: 'Test' }
        const requiredFields = ['name', 'email', 'phone'] as (keyof typeof data)[]

        const result = validateRequired(data, requiredFields)

        expect(result.isValid).toBe(false)
        expect(result.missingFields).toEqual(['email', 'phone'])
      })
    })

    describe('sanitizeEmail', () => {
      it('sanitizes email correctly', () => {
        const email = '  Test@EXAMPLE.COM  '
        const result = sanitizeEmail(email)
        expect(result).toBe('test@example.com')
      })

      it('handles already clean email', () => {
        const email = 'test@example.com'
        const result = sanitizeEmail(email)
        expect(result).toBe('test@example.com')
      })
    })

    describe('createErrorResponse', () => {
      it('creates error response correctly', () => {
        const result = createErrorResponse('Test error', null)
        
        expect(result.data).toBeNull()
        expect(result.error).toBe('Test error')
        expect(result.success).toBe(false)
      })

      it('creates error response with data', () => {
        const result = createErrorResponse('Test error', { partial: 'data' })
        
        expect(result.data).toEqual({ partial: 'data' })
        expect(result.error).toBe('Test error')
        expect(result.success).toBe(false)
      })
    })

    describe('createSuccessResponse', () => {
      it('creates success response correctly', () => {
        const data = { id: 1, name: 'Test' }
        const result = createSuccessResponse(data)
        
        expect(result.data).toEqual(data)
        expect(result.error).toBeNull()
        expect(result.success).toBe(true)
      })
    })
  })
}) 