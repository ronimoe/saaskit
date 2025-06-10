import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export async function createClient() {
  const cookieStore = await import('next/headers').then((mod) => mod.cookies())
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          const cookie = cookieStore.get(name)
          return cookie?.value
        },
        set(name, value, options) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Cookie cannot be set - this happens on Static Site Generation
            // or when the page doesn't re-render immediately
            console.warn(`Error setting cookie "${name}":`, error)
          }
        },
        remove(name, options) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Cookie cannot be deleted - this happens on Static Site Generation
            // or when the page doesn't re-render immediately
            console.warn(`Error removing cookie "${name}":`, error)
          }
        },
      },
    }
  )
} 