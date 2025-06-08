// Supabase integration for the SaaS platform

// Client configurations
export { createClient, createServerClient, createAdminClient } from './client'

// TypeScript types
export type { 
  Database, 
  TypedSupabaseClient,
  UserRole,
  SubscriptionStatus,
  Tables,
  TableInserts,
  TableUpdates,
  TableRows,
  TablesInsert,
  TablesUpdate,
  Enums,
  CompositeTypes,
  Json
} from './types'

// Export type constants
export { Constants } from './types'

// Authentication utilities
export * from './auth-helpers'

// Storage utilities
export * from './storage'

// Realtime utilities
export * from './realtime'

// Database operations
export * from './database'

// Version
export const SUPABASE_VERSION = '0.1.0'
