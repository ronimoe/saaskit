import { describe, it, expect, vi, beforeEach } from 'vitest'

import {
  users,
  products,
  subscriptions,
  userProducts,
  database,
  validateRequired,
  sanitizeEmail,
  createErrorResponse,
  createSuccessResponse,
  type UserInsert,
  type UserUpdate,
  type ProductInsert,
  type ProductUpdate,
  type SubscriptionInsert,
  type SubscriptionUpdate,
  type UserProductInsert,
  type UserProductUpdate,
  type QueryOptions,
} from '../database'
import { createMockSupabaseClient } from '../test/mocks'

describe('Database Module', () => {
  let mockSupabase: any
  let mockQueryBuilder: any

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient()
    
    // Create a mock query builder that can be chained
    mockQueryBuilder = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      like: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      and: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: vi.fn(),
    }
    
    // Set up the from method to return our chainable query builder
    mockSupabase.from.mockReturnValue(mockQueryBuilder)
    vi.clearAllMocks()
  })

  describe('exports', () => {
    it('exports database operation objects', () => {
      expect(typeof users).toBe('object')
      expect(typeof products).toBe('object')
      expect(typeof subscriptions).toBe('object')
      expect(typeof userProducts).toBe('object')
      expect(typeof database).toBe('object')
    })

    it('exports utility functions', () => {
      expect(typeof validateRequired).toBe('function')
      expect(typeof sanitizeEmail).toBe('function')
      expect(typeof createErrorResponse).toBe('function')
      expect(typeof createSuccessResponse).toBe('function')
    })
  })

  describe('users operations', () => {
    describe('getAll', () => {
      it('gets all users with default options', async () => {
        const mockUsers = [
          { id: '1', email: 'user1@example.com', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
          { id: '2', email: 'user2@example.com', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }
        ]
        mockQueryBuilder.select.mockResolvedValue({ data: mockUsers, error: null })

        const result = await users.getAll(mockSupabase)

        expect(mockSupabase.from).toHaveBeenCalledWith('users')
        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockUsers)
        expect(result.error).toBeNull()
      })

      it('gets users with query options', async () => {
        const options: QueryOptions = {
          limit: 10,
          offset: 5,
          orderBy: { column: 'email', ascending: true },
          filters: { email: 'user1@example.com' }
        }
        const mockUsers = [{ id: '1', email: 'user1@example.com', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }]
        
        // Mock the final query result - the range method is the last in the chain
        mockQueryBuilder.range.mockResolvedValue({ data: mockUsers, error: null })

        const result = await users.getAll(mockSupabase, options)

        expect(mockSupabase.from).toHaveBeenCalledWith('users')
        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockUsers)
      })

      it('handles database errors', async () => {
        const error = { message: 'Database error' }
        mockQueryBuilder.select.mockResolvedValue({ data: null, error })

        const result = await users.getAll(mockSupabase)

        expect(result.success).toBe(false)
        expect(result.data).toBeNull()
        expect(result.error).toBe('Database error')
      })

      it('handles exceptions', async () => {
        mockSupabase.from.mockImplementation(() => {
          throw new Error('Connection failed')
        })

        const result = await users.getAll(mockSupabase)

        expect(result.success).toBe(false)
        expect(result.data).toBeNull()
        expect(result.error).toBe('Connection failed')
      })
    })

    describe('getById', () => {
      it('gets user by id successfully', async () => {
        const mockUser = { id: '1', email: 'user1@example.com', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }
        mockQueryBuilder.single.mockResolvedValue({ data: mockUser, error: null })

        const result = await users.getById(mockSupabase, '1')

        expect(mockSupabase.from).toHaveBeenCalledWith('users')
        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockUser)
      })

      it('handles user not found', async () => {
        const error = { message: 'User not found' }
        mockQueryBuilder.single.mockResolvedValue({ data: null, error })

        const result = await users.getById(mockSupabase, 'nonexistent')

        expect(result.success).toBe(false)
        expect(result.error).toBe('User not found')
      })
    })

    describe('getByEmail', () => {
      it('gets user by email successfully', async () => {
        const mockUser = { id: '1', email: 'user1@example.com', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }
        mockQueryBuilder.single.mockResolvedValue({ data: mockUser, error: null })

        const result = await users.getByEmail(mockSupabase, 'user1@example.com')

        expect(mockSupabase.from).toHaveBeenCalledWith('users')
        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockUser)
      })
    })

    describe('create', () => {
      it('creates user successfully', async () => {
        const userData: UserInsert = {
          email: 'newuser@example.com',
          id: '1'
        }
        const mockUser = { ...userData, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }
        mockQueryBuilder.single.mockResolvedValue({ data: mockUser, error: null })

        const result = await users.create(mockSupabase, userData)

        expect(mockSupabase.from).toHaveBeenCalledWith('users')
        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockUser)
      })

      it('handles creation errors', async () => {
        const userData: UserInsert = { email: 'invalid', id: '1' }
        const error = { message: 'Invalid email format' }
        mockQueryBuilder.single.mockResolvedValue({ data: null, error })

        const result = await users.create(mockSupabase, userData)

        expect(result.success).toBe(false)
        expect(result.error).toBe('Invalid email format')
      })
    })

    describe('update', () => {
      it('updates user successfully', async () => {
        const updates: UserUpdate = { email: 'updated@example.com' }
        const mockUser = { id: '1', email: 'updated@example.com', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }
        mockQueryBuilder.single.mockResolvedValue({ data: mockUser, error: null })

        const result = await users.update(mockSupabase, '1', updates)

        expect(mockSupabase.from).toHaveBeenCalledWith('users')
        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockUser)
      })
    })

    describe('delete', () => {
      it('deletes user successfully', async () => {
        mockQueryBuilder.eq.mockResolvedValue({ error: null })

        const result = await users.delete(mockSupabase, '1')

        expect(mockSupabase.from).toHaveBeenCalledWith('users')
        expect(result.success).toBe(true)
        expect(result.data).toBeNull()
      })

      it('handles deletion errors', async () => {
        const error = { message: 'Cannot delete user with active subscriptions' }
        mockQueryBuilder.eq.mockResolvedValue({ error })

        const result = await users.delete(mockSupabase, '1')

        expect(result.success).toBe(false)
        expect(result.error).toBe('Cannot delete user with active subscriptions')
      })
    })
  })

  describe('products operations', () => {
    describe('getAll', () => {
      it('gets all products successfully', async () => {
        const mockProducts = [
          { id: '1', name: 'Product 1', description: 'Description 1', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
          { id: '2', name: 'Product 2', description: 'Description 2', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }
        ]
        mockQueryBuilder.select.mockResolvedValue({ data: mockProducts, error: null })

        const result = await products.getAll(mockSupabase)

        expect(mockSupabase.from).toHaveBeenCalledWith('products')
        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockProducts)
      })

      it('applies query options correctly', async () => {
        const options: QueryOptions = {
          limit: 5,
          orderBy: { column: 'name', ascending: false }
        }
        mockQueryBuilder.order.mockResolvedValue({ data: [], error: null })

        await products.getAll(mockSupabase, options)

        expect(mockSupabase.from).toHaveBeenCalledWith('products')
      })
    })

    describe('getById', () => {
      it('gets product by id successfully', async () => {
        const mockProduct = { id: '1', name: 'Product 1', description: 'Description', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }
        mockQueryBuilder.single.mockResolvedValue({ data: mockProduct, error: null })

        const result = await products.getById(mockSupabase, '1')

        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockProduct)
      })
    })

    describe('create', () => {
      it('creates product successfully', async () => {
        const productData: ProductInsert = {
          name: 'New Product'
        }
        const mockProduct = { id: '1', ...productData, description: null, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }
        mockQueryBuilder.single.mockResolvedValue({ data: mockProduct, error: null })

        const result = await products.create(mockSupabase, productData)

        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockProduct)
      })
    })

    describe('update', () => {
      it('updates product successfully', async () => {
        const updates: ProductUpdate = { description: 'Updated description' }
        const mockProduct = { id: '1', name: 'Product', description: 'Updated description', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }
        mockQueryBuilder.single.mockResolvedValue({ data: mockProduct, error: null })

        const result = await products.update(mockSupabase, '1', updates)

        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockProduct)
      })
    })

    describe('delete', () => {
      it('deletes product successfully', async () => {
        mockQueryBuilder.eq.mockResolvedValue({ error: null })

        const result = await products.delete(mockSupabase, '1')

        expect(result.success).toBe(true)
        expect(result.data).toBeNull()
      })
    })
  })

  describe('subscriptions operations', () => {
    describe('getAll', () => {
      it('gets all subscriptions successfully', async () => {
        const mockSubscriptions = [
          { 
            id: '1', 
            user_id: 'user1', 
            product_id: 'prod1', 
            status: 'active' as const,
            current_period_start: '2024-01-01T00:00:00Z',
            current_period_end: '2024-02-01T00:00:00Z',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        ]
        mockQueryBuilder.select.mockResolvedValue({ data: mockSubscriptions, error: null })

        const result = await subscriptions.getAll(mockSupabase)

        expect(mockSupabase.from).toHaveBeenCalledWith('subscriptions')
        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockSubscriptions)
      })
    })

    describe('getByUserId', () => {
      it('gets subscriptions by user id successfully', async () => {
        const mockSubscriptions = [
          { 
            id: '1', 
            user_id: 'user1', 
            product_id: 'prod1', 
            status: 'active' as const,
            current_period_start: '2024-01-01T00:00:00Z',
            current_period_end: '2024-02-01T00:00:00Z',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        ]
        mockQueryBuilder.eq.mockResolvedValue({ data: mockSubscriptions, error: null })

        const result = await subscriptions.getByUserId(mockSupabase, 'user1')

        expect(mockSupabase.from).toHaveBeenCalledWith('subscriptions')
        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockSubscriptions)
      })

      it('applies query options for user subscriptions', async () => {
        const options: QueryOptions = { limit: 10 }
        mockQueryBuilder.limit.mockResolvedValue({ data: [], error: null })

        await subscriptions.getByUserId(mockSupabase, 'user1', options)

        expect(mockSupabase.from).toHaveBeenCalledWith('subscriptions')
      })
    })

    describe('getById', () => {
      it('gets subscription by id successfully', async () => {
        const mockSubscription = { 
          id: '1', 
          user_id: 'user1', 
          product_id: 'prod1',
          status: 'active' as const,
          current_period_start: '2024-01-01T00:00:00Z',
          current_period_end: '2024-02-01T00:00:00Z',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
        mockQueryBuilder.single.mockResolvedValue({ data: mockSubscription, error: null })

        const result = await subscriptions.getById(mockSupabase, '1')

        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockSubscription)
      })
    })

    describe('create', () => {
      it('creates subscription successfully', async () => {
        const subscriptionData: SubscriptionInsert = {
          user_id: 'user1',
          product_id: 'prod1',
          current_period_start: '2024-01-01T00:00:00Z',
          current_period_end: '2024-02-01T00:00:00Z'
        }
        const mockSubscription = { 
          id: '1', 
          ...subscriptionData,
          status: 'active' as const,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
        mockQueryBuilder.single.mockResolvedValue({ data: mockSubscription, error: null })

        const result = await subscriptions.create(mockSupabase, subscriptionData)

        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockSubscription)
      })
    })

    describe('update', () => {
      it('updates subscription successfully', async () => {
        const updates: SubscriptionUpdate = { status: 'canceled' }
        const mockSubscription = { 
          id: '1', 
          user_id: 'user1', 
          product_id: 'prod1',
          status: 'canceled' as const,
          current_period_start: '2024-01-01T00:00:00Z',
          current_period_end: '2024-02-01T00:00:00Z',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
        mockQueryBuilder.single.mockResolvedValue({ data: mockSubscription, error: null })

        const result = await subscriptions.update(mockSupabase, '1', updates)

        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockSubscription)
      })
    })

    describe('delete', () => {
      it('deletes subscription successfully', async () => {
        mockQueryBuilder.eq.mockResolvedValue({ error: null })

        const result = await subscriptions.delete(mockSupabase, '1')

        expect(result.success).toBe(true)
        expect(result.data).toBeNull()
      })
    })
  })

  describe('userProducts operations', () => {
    describe('getAll', () => {
      it('gets all user products successfully', async () => {
        const mockUserProducts = [
          { 
            id: '1', 
            user_id: 'user1', 
            product_id: 'prod1', 
            role: 'owner' as const,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        ]
        mockQueryBuilder.select.mockResolvedValue({ data: mockUserProducts, error: null })

        const result = await userProducts.getAll(mockSupabase)

        expect(mockSupabase.from).toHaveBeenCalledWith('user_products')
        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockUserProducts)
      })
    })

    describe('getByUserId', () => {
      it('gets user products by user id successfully', async () => {
        const mockUserProducts = [
          { 
            id: '1', 
            user_id: 'user1', 
            product_id: 'prod1', 
            role: 'owner' as const,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        ]
        mockQueryBuilder.eq.mockResolvedValue({ data: mockUserProducts, error: null })

        const result = await userProducts.getByUserId(mockSupabase, 'user1')

        expect(mockSupabase.from).toHaveBeenCalledWith('user_products')
        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockUserProducts)
      })
    })

    describe('getByProductId', () => {
      it('gets user products by product id successfully', async () => {
        const mockUserProducts = [
          { 
            id: '1', 
            user_id: 'user1', 
            product_id: 'prod1', 
            role: 'owner' as const,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        ]
        mockQueryBuilder.eq.mockResolvedValue({ data: mockUserProducts, error: null })

        const result = await userProducts.getByProductId(mockSupabase, 'prod1')

        expect(mockSupabase.from).toHaveBeenCalledWith('user_products')
        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockUserProducts)
      })
    })

    describe('getByUserAndProduct', () => {
      it('gets user product by user and product id successfully', async () => {
        const mockUserProduct = { 
          id: '1', 
          user_id: 'user1', 
          product_id: 'prod1', 
          role: 'owner' as const,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
        mockQueryBuilder.single.mockResolvedValue({ data: mockUserProduct, error: null })

        const result = await userProducts.getByUserAndProduct(mockSupabase, 'user1', 'prod1')

        expect(mockSupabase.from).toHaveBeenCalledWith('user_products')
        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockUserProduct)
      })
    })

    describe('create', () => {
      it('creates user product successfully', async () => {
        const userProductData: UserProductInsert = {
          user_id: 'user1',
          product_id: 'prod1',
          role: 'member'
        }
        const mockUserProduct = { 
          id: '1', 
          ...userProductData,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
        mockQueryBuilder.single.mockResolvedValue({ data: mockUserProduct, error: null })

        const result = await userProducts.create(mockSupabase, userProductData)

        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockUserProduct)
      })
    })

    describe('update', () => {
      it('updates user product successfully', async () => {
        const updates: UserProductUpdate = { role: 'admin' }
        const mockUserProduct = { 
          id: '1', 
          user_id: 'user1', 
          product_id: 'prod1',
          role: 'admin' as const,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
        mockQueryBuilder.single.mockResolvedValue({ data: mockUserProduct, error: null })

        const result = await userProducts.update(mockSupabase, '1', updates)

        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockUserProduct)
      })
    })

    describe('delete', () => {
      it('deletes user product successfully', async () => {
        mockQueryBuilder.eq.mockResolvedValue({ error: null })

        const result = await userProducts.delete(mockSupabase, '1')

        expect(result.success).toBe(true)
        expect(result.data).toBeNull()
      })
    })
  })

  describe('error handling and edge cases', () => {
    describe('exception handling', () => {
      it('handles exceptions in users.getAll', async () => {
        mockSupabase.from.mockImplementation(() => {
          throw new Error('Network connection failed')
        })

        const result = await users.getAll(mockSupabase)

        expect(result.success).toBe(false)
        expect(result.data).toBeNull()
        expect(result.error).toBe('Network connection failed')
      })

      it('handles exceptions in products.create', async () => {
        mockSupabase.from.mockImplementation(() => {
          throw new Error('Database timeout')
        })

        const result = await products.create(mockSupabase, { name: 'Test Product' })

        expect(result.success).toBe(false)
        expect(result.data).toBeNull()
        expect(result.error).toBe('Database timeout')
      })

      it('handles exceptions in subscriptions.update', async () => {
        mockSupabase.from.mockImplementation(() => {
          throw new Error('Connection lost')
        })

        const result = await subscriptions.update(mockSupabase, '1', { status: 'canceled' })

        expect(result.success).toBe(false)
        expect(result.data).toBeNull()
        expect(result.error).toBe('Connection lost')
      })

      it('handles exceptions in userProducts.getByUserAndProduct', async () => {
        mockSupabase.from.mockImplementation(() => {
          throw new Error('Query execution failed')
        })

        const result = await userProducts.getByUserAndProduct(mockSupabase, 'user1', 'prod1')

        expect(result.success).toBe(false)
        expect(result.data).toBeNull()
        expect(result.error).toBe('Query execution failed')
      })

      it('handles non-Error exceptions', async () => {
        mockSupabase.from.mockImplementation(() => {
          throw 'String error'
        })

        const result = await users.getById(mockSupabase, '1')

        expect(result.success).toBe(false)
        expect(result.data).toBeNull()
        expect(result.error).toBe('Unknown error')
      })
    })

    describe('database utility error handling', () => {
      it('handles exceptions in database.healthCheck', async () => {
        mockSupabase.from.mockImplementation(() => {
          throw new Error('Connection refused')
        })

        const result = await database.healthCheck(mockSupabase)

        expect(result.success).toBe(false)
        expect(result.data).toBeNull()
        expect(result.error).toBe('Connection refused')
      })

      it('handles exceptions in database.getTableInfo', async () => {
        mockSupabase.from.mockImplementation(() => {
          throw new Error('Table access denied')
        })

        const result = await database.getTableInfo(mockSupabase, 'users')

        expect(result.success).toBe(false)
        expect(result.data).toBeNull()
        expect(result.error).toBe('Table access denied')
      })
    })
  })

  describe('database utilities', () => {
    describe('healthCheck', () => {
      it('returns healthy status when database is accessible', async () => {
        mockQueryBuilder.limit.mockResolvedValue({ data: [], error: null })

        const result = await database.healthCheck(mockSupabase)

        expect(mockSupabase.from).toHaveBeenCalledWith('users')
        expect(result.success).toBe(true)
        expect(result.data).toEqual({ status: 'healthy' })
      })

      it('returns error when database is not accessible', async () => {
        const error = { message: 'Connection timeout' }
        mockQueryBuilder.limit.mockResolvedValue({ data: null, error })

        const result = await database.healthCheck(mockSupabase)

        expect(result.success).toBe(false)
        expect(result.error).toBe('Database health check failed: Connection timeout')
      })

      it('handles exceptions during health check', async () => {
        mockSupabase.from.mockImplementation(() => {
          throw new Error('Network error')
        })

        const result = await database.healthCheck(mockSupabase)

        expect(result.success).toBe(false)
        expect(result.error).toBe('Network error')
      })
    })

    describe('getTableInfo', () => {
      it('gets table count successfully', async () => {
        mockQueryBuilder.select.mockResolvedValue({ count: 42, error: null })

        const result = await database.getTableInfo(mockSupabase, 'users')

        expect(result.success).toBe(true)
        expect(result.data).toEqual({ count: 42 })
      })

      it('handles table info errors', async () => {
        const error = { message: 'Table not found' }
        mockQueryBuilder.select.mockResolvedValue({ count: null, error })

        const result = await database.getTableInfo(mockSupabase, 'nonexistent')

        expect(result.success).toBe(false)
        expect(result.error).toBe('Table not found')
      })

      it('handles null count', async () => {
        mockQueryBuilder.select.mockResolvedValue({ count: null, error: null })

        const result = await database.getTableInfo(mockSupabase, 'empty_table')

        expect(result.success).toBe(true)
        expect(result.data).toEqual({ count: 0 })
      })
    })

    describe('validateRequired', () => {
      it('validates required fields successfully', () => {
        const data = { email: 'test@example.com', name: 'Test User' }
        const required = ['email', 'name'] as (keyof typeof data)[]

        const result = validateRequired(data, required)

        expect(result.isValid).toBe(true)
        expect(result.missingFields).toEqual([])
      })

      it('identifies missing required fields', () => {
        const data = { email: 'test@example.com' }
        const required = ['email', 'name'] as (keyof typeof data)[]

        const result = validateRequired(data, required)

        expect(result.isValid).toBe(false)
        expect(result.missingFields).toEqual(['name'])
      })

      it('handles empty data object', () => {
        const data = {}
        const required = [] as (keyof typeof data)[]

        const result = validateRequired(data, required)

        expect(result.isValid).toBe(true)
        expect(result.missingFields).toEqual([])
      })

      it('handles empty required array', () => {
        const data = { email: 'test@example.com' }
        const required = [] as (keyof typeof data)[]

        const result = validateRequired(data, required)

        expect(result.isValid).toBe(true)
        expect(result.missingFields).toEqual([])
      })
    })

    describe('sanitizeEmail', () => {
      it('sanitizes email correctly', () => {
        expect(sanitizeEmail('  TEST@EXAMPLE.COM  ')).toBe('test@example.com')
        expect(sanitizeEmail('User@Domain.org')).toBe('user@domain.org')
        expect(sanitizeEmail('')).toBe('')
      })
    })

    describe('createErrorResponse', () => {
      it('creates error response correctly', () => {
        const response = createErrorResponse('Test error')

        expect(response.success).toBe(false)
        expect(response.data).toBeNull()
        expect(response.error).toBe('Test error')
      })
    })

    describe('createSuccessResponse', () => {
      it('creates success response correctly', () => {
        const data = { id: '1', name: 'Test' }
        const response = createSuccessResponse(data)

        expect(response.success).toBe(true)
        expect(response.data).toEqual(data)
        expect(response.error).toBeNull()
      })
    })
  })
}) 