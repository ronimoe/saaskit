import type { 
  TypedSupabaseClient,
  Tables, 
  TablesInsert, 
  TablesUpdate
} from './types'

/**
 * Database operation utilities for Supabase
 */

// Type helpers for better developer experience
export type UserRow = Tables<'users'>
export type ProductRow = Tables<'products'>
export type SubscriptionRow = Tables<'subscriptions'>
export type UserProductRow = Tables<'user_products'>

export type UserInsert = TablesInsert<'users'>
export type ProductInsert = TablesInsert<'products'>
export type SubscriptionInsert = TablesInsert<'subscriptions'>
export type UserProductInsert = TablesInsert<'user_products'>

export type UserUpdate = TablesUpdate<'users'>
export type ProductUpdate = TablesUpdate<'products'>
export type SubscriptionUpdate = TablesUpdate<'subscriptions'>
export type UserProductUpdate = TablesUpdate<'user_products'>

/**
 * Database operation result type
 */
export interface DatabaseResult<T = any> {
  data: T | null
  error: string | null
  success: boolean
}

/**
 * Database query options
 */
export interface QueryOptions {
  limit?: number
  offset?: number
  orderBy?: {
    column: string
    ascending?: boolean
  }
  filters?: Record<string, any>
}

/**
 * Users table operations
 */
export const users = {
  /**
   * Get all users with optional filtering and pagination
   */
  async getAll(
    supabase: TypedSupabaseClient,
    options: QueryOptions = {}
  ): Promise<DatabaseResult<UserRow[]>> {
    try {
      let query = supabase.from('users').select('*')

      // Apply filters
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy.column, { 
          ascending: options.orderBy.ascending ?? true 
        })
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit)
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit ?? 10) - 1)
      }

      const { data, error } = await query

      return {
        data,
        error: error?.message || null,
        success: !error
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        success: false
      }
    }
  },

  /**
   * Get a user by ID
   */
  async getById(
    supabase: TypedSupabaseClient,
    id: string
  ): Promise<DatabaseResult<UserRow>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()

      return {
        data,
        error: error?.message || null,
        success: !error
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        success: false
      }
    }
  },

  /**
   * Get a user by email
   */
  async getByEmail(
    supabase: TypedSupabaseClient,
    email: string
  ): Promise<DatabaseResult<UserRow>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      return {
        data,
        error: error?.message || null,
        success: !error
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        success: false
      }
    }
  },

  /**
   * Create a new user
   */
  async create(
    supabase: TypedSupabaseClient,
    userData: UserInsert
  ): Promise<DatabaseResult<UserRow>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single()

      return {
        data,
        error: error?.message || null,
        success: !error
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        success: false
      }
    }
  },

  /**
   * Update a user
   */
  async update(
    supabase: TypedSupabaseClient,
    id: string,
    updates: UserUpdate
  ): Promise<DatabaseResult<UserRow>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      return {
        data,
        error: error?.message || null,
        success: !error
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        success: false
      }
    }
  },

  /**
   * Delete a user
   */
  async delete(
    supabase: TypedSupabaseClient,
    id: string
  ): Promise<DatabaseResult<void>> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)

      return {
        data: null,
        error: error?.message || null,
        success: !error
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        success: false
      }
    }
  }
}

/**
 * Products table operations
 */
export const products = {
  /**
   * Get all products with optional filtering and pagination
   */
  async getAll(
    supabase: TypedSupabaseClient,
    options: QueryOptions = {}
  ): Promise<DatabaseResult<ProductRow[]>> {
    try {
      let query = supabase.from('products').select('*')

      // Apply filters
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy.column, { 
          ascending: options.orderBy.ascending ?? true 
        })
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit)
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit ?? 10) - 1)
      }

      const { data, error } = await query

      return {
        data,
        error: error?.message || null,
        success: !error
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        success: false
      }
    }
  },

  /**
   * Get a product by ID
   */
  async getById(
    supabase: TypedSupabaseClient,
    id: string
  ): Promise<DatabaseResult<ProductRow>> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      return {
        data,
        error: error?.message || null,
        success: !error
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        success: false
      }
    }
  },

  /**
   * Create a new product
   */
  async create(
    supabase: TypedSupabaseClient,
    productData: ProductInsert
  ): Promise<DatabaseResult<ProductRow>> {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single()

      return {
        data,
        error: error?.message || null,
        success: !error
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        success: false
      }
    }
  },

  /**
   * Update a product
   */
  async update(
    supabase: TypedSupabaseClient,
    id: string,
    updates: ProductUpdate
  ): Promise<DatabaseResult<ProductRow>> {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      return {
        data,
        error: error?.message || null,
        success: !error
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        success: false
      }
    }
  },

  /**
   * Delete a product
   */
  async delete(
    supabase: TypedSupabaseClient,
    id: string
  ): Promise<DatabaseResult<void>> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      return {
        data: null,
        error: error?.message || null,
        success: !error
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        success: false
      }
    }
  }
}

/**
 * Subscriptions table operations
 */
export const subscriptions = {
  /**
   * Get all subscriptions with optional filtering and pagination
   */
  async getAll(
    supabase: TypedSupabaseClient,
    options: QueryOptions = {}
  ): Promise<DatabaseResult<SubscriptionRow[]>> {
    try {
      let query = supabase.from('subscriptions').select(`
        *,
        users(*),
        products(*)
      `)

      // Apply filters
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy.column, { 
          ascending: options.orderBy.ascending ?? true 
        })
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit)
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit ?? 10) - 1)
      }

      const { data, error } = await query

      return {
        data,
        error: error?.message || null,
        success: !error
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        success: false
      }
    }
  },

  /**
   * Get subscriptions by user ID
   */
  async getByUserId(
    supabase: TypedSupabaseClient,
    userId: string,
    options: QueryOptions = {}
  ): Promise<DatabaseResult<SubscriptionRow[]>> {
    try {
      let query = supabase
        .from('subscriptions')
        .select(`
          *,
          users(*),
          products(*)
        `)
        .eq('user_id', userId)

      // Apply additional filters
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy.column, { 
          ascending: options.orderBy.ascending ?? true 
        })
      }

      const { data, error } = await query

      return {
        data,
        error: error?.message || null,
        success: !error
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        success: false
      }
    }
  },

  /**
   * Get a subscription by ID
   */
  async getById(
    supabase: TypedSupabaseClient,
    id: string
  ): Promise<DatabaseResult<SubscriptionRow>> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          users(*),
          products(*)
        `)
        .eq('id', id)
        .single()

      return {
        data,
        error: error?.message || null,
        success: !error
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        success: false
      }
    }
  },

  /**
   * Create a new subscription
   */
  async create(
    supabase: TypedSupabaseClient,
    subscriptionData: SubscriptionInsert
  ): Promise<DatabaseResult<SubscriptionRow>> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert(subscriptionData)
        .select(`
          *,
          users(*),
          products(*)
        `)
        .single()

      return {
        data,
        error: error?.message || null,
        success: !error
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        success: false
      }
    }
  },

  /**
   * Update a subscription
   */
  async update(
    supabase: TypedSupabaseClient,
    id: string,
    updates: SubscriptionUpdate
  ): Promise<DatabaseResult<SubscriptionRow>> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          users(*),
          products(*)
        `)
        .single()

      return {
        data,
        error: error?.message || null,
        success: !error
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        success: false
      }
    }
  },

  /**
   * Delete a subscription
   */
  async delete(
    supabase: TypedSupabaseClient,
    id: string
  ): Promise<DatabaseResult<void>> {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id)

      return {
        data: null,
        error: error?.message || null,
        success: !error
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        success: false
      }
    }
  }
}

/**
 * User Products table operations (for multi-tenant functionality)
 */
export const userProducts = {
  /**
   * Get all user-product relationships with optional filtering
   */
  async getAll(
    supabase: TypedSupabaseClient,
    options: QueryOptions = {}
  ): Promise<DatabaseResult<UserProductRow[]>> {
    try {
      let query = supabase.from('user_products').select(`
        *,
        users(*),
        products(*)
      `)

      // Apply filters
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy.column, { 
          ascending: options.orderBy.ascending ?? true 
        })
      }

      const { data, error } = await query

      return {
        data,
        error: error?.message || null,
        success: !error
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        success: false
      }
    }
  },

  /**
   * Get user-product relationships by user ID
   */
  async getByUserId(
    supabase: TypedSupabaseClient,
    userId: string
  ): Promise<DatabaseResult<UserProductRow[]>> {
    try {
      const { data, error } = await supabase
        .from('user_products')
        .select(`
          *,
          users(*),
          products(*)
        `)
        .eq('user_id', userId)

      return {
        data,
        error: error?.message || null,
        success: !error
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        success: false
      }
    }
  },

  /**
   * Get user-product relationships by product ID
   */
  async getByProductId(
    supabase: TypedSupabaseClient,
    productId: string
  ): Promise<DatabaseResult<UserProductRow[]>> {
    try {
      const { data, error } = await supabase
        .from('user_products')
        .select(`
          *,
          users(*),
          products(*)
        `)
        .eq('product_id', productId)

      return {
        data,
        error: error?.message || null,
        success: !error
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        success: false
      }
    }
  },

  /**
   * Get a specific user-product relationship
   */
  async getByUserAndProduct(
    supabase: TypedSupabaseClient,
    userId: string,
    productId: string
  ): Promise<DatabaseResult<UserProductRow>> {
    try {
      const { data, error } = await supabase
        .from('user_products')
        .select(`
          *,
          users(*),
          products(*)
        `)
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single()

      return {
        data,
        error: error?.message || null,
        success: !error
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        success: false
      }
    }
  },

  /**
   * Create a new user-product relationship
   */
  async create(
    supabase: TypedSupabaseClient,
    userProductData: UserProductInsert
  ): Promise<DatabaseResult<UserProductRow>> {
    try {
      const { data, error } = await supabase
        .from('user_products')
        .insert(userProductData)
        .select(`
          *,
          users(*),
          products(*)
        `)
        .single()

      return {
        data,
        error: error?.message || null,
        success: !error
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        success: false
      }
    }
  },

  /**
   * Update a user-product relationship
   */
  async update(
    supabase: TypedSupabaseClient,
    id: string,
    updates: UserProductUpdate
  ): Promise<DatabaseResult<UserProductRow>> {
    try {
      const { data, error } = await supabase
        .from('user_products')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          users(*),
          products(*)
        `)
        .single()

      return {
        data,
        error: error?.message || null,
        success: !error
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        success: false
      }
    }
  },

  /**
   * Delete a user-product relationship
   */
  async delete(
    supabase: TypedSupabaseClient,
    id: string
  ): Promise<DatabaseResult<void>> {
    try {
      const { error } = await supabase
        .from('user_products')
        .delete()
        .eq('id', id)

      return {
        data: null,
        error: error?.message || null,
        success: !error
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        success: false
      }
    }
  }
}

/**
 * Database health check and utility functions
 */
export const database = {
  /**
   * Check database connection health
   */
  async healthCheck(supabase: TypedSupabaseClient): Promise<DatabaseResult<{ status: string }>> {
    try {
      // Simple query to test connection
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1)

      if (error) {
        return {
          data: null,
          error: `Database health check failed: ${error.message}`,
          success: false
        }
      }

      return {
        data: { status: 'healthy' },
        error: null,
        success: true
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Database connection failed',
        success: false
      }
    }
  },

  /**
   * Get table information
   */
  async getTableInfo(
    supabase: TypedSupabaseClient,
    tableName: string
  ): Promise<DatabaseResult<{ count: number }>> {
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false
        }
      }

      return {
        data: { count: count || 0 },
        error: null,
        success: true
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        success: false
      }
    }
  }
}

/**
 * Utility function to validate required fields
 */
export function validateRequired<T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[]
): { isValid: boolean; missingFields: string[] } {
  const missingFields: string[] = []

  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      missingFields.push(String(field))
    }
  })

  return {
    isValid: missingFields.length === 0,
    missingFields
  }
}

/**
 * Utility function to sanitize email addresses
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

/**
 * Utility function to generate database error responses
 */
export function createErrorResponse<T = any>(
  error: string,
  data: T | null = null
): DatabaseResult<T> {
  return {
    data,
    error,
    success: false
  }
}

/**
 * Utility function to generate successful database responses
 */
export function createSuccessResponse<T = any>(data: T): DatabaseResult<T> {
  return {
    data,
    error: null,
    success: true
  }
} 