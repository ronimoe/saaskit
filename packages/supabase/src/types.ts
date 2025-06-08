// Database type definitions
// These types will be generated from the Supabase schema once the database is set up

/**
 * Database tables interface
 * This will be automatically generated from Supabase once schema is created
 */
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
          // Additional user fields will be added after schema creation
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
          // Additional product fields will be added after schema creation
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_products: {
        Row: {
          id: string
          user_id: string
          product_id: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          role: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          product_id: string
          status: string
          current_period_start: string
          current_period_end: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          status: string
          current_period_start: string
          current_period_end: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          status?: string
          current_period_start?: string
          current_period_end?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

/**
 * Supabase client type with Database types
 */
export type TypedSupabaseClient = ReturnType<typeof import('./client').createClient>

/**
 * Common user role types for multi-tenant architecture
 */
export type UserRole = 'owner' | 'admin' | 'member' | 'viewer'

/**
 * Subscription status types
 */
export type SubscriptionStatus = 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid'

/**
 * Utility type for table rows
 */
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']

/**
 * Utility type for table inserts
 */
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']

/**
 * Utility type for table updates
 */
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'] 