import { createClient } from '@saas/supabase'

// Lazy initialization to avoid build-time errors
let _supabase: ReturnType<typeof createClient> | null = null

// Create a singleton browser client for the web app
export const getSupabase = () => {
  if (!_supabase) {
    _supabase = createClient()
  }
  return _supabase
}

// Export types for convenience
export type { Database } from '@saas/supabase' 