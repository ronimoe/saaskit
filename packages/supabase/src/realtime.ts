import type { TypedSupabaseClient } from './types'

/**
 * Realtime utility functions for Supabase Realtime
 * Simplified version that works with the current Supabase client
 */

export type DatabaseChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

export interface DatabaseChangePayload {
  schema: string
  table: string
  commit_timestamp: string
  eventType: DatabaseChangeEvent
  new?: Record<string, any>
  old?: Record<string, any>
  errors?: string[]
}

/**
 * Subscribe to database changes for a specific table
 * Returns a channel that can be unsubscribed from
 */
export function subscribeToTable(
  supabase: TypedSupabaseClient,
  table: string,
  event: DatabaseChangeEvent = '*',
  callback: (payload: any) => void,
  options?: {
    schema?: string
    filter?: string
  }
) {
  const channelName = `table-${table}-${Date.now()}`
  
  try {
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as any,
        {
          event,
          schema: options?.schema || 'public',
          table,
          filter: options?.filter,
        } as any,
        callback
      )
      .subscribe()

    return channel
  } catch (_error) {
    return null
  }
}

/**
 * Subscribe to row-level changes for a specific record
 */
export function subscribeToRow(
  supabase: TypedSupabaseClient,
  table: string,
  rowId: string,
  callback: (payload: any) => void,
  options?: {
    schema?: string
    event?: DatabaseChangeEvent
  }
) {
  return subscribeToTable(
    supabase,
    table,
    options?.event || '*',
    callback,
    {
      schema: options?.schema || 'public',
      filter: `id=eq.${rowId}`,
    }
  )
}

/**
 * Subscribe to user-specific changes across multiple tables
 */
export function subscribeToUserChanges(
  supabase: TypedSupabaseClient,
  userId: string,
  tables: string[],
  callback: (payload: any) => void,
  options?: {
    schema?: string
  }
) {
  return tables.map(table => 
    subscribeToTable(
      supabase,
      table,
      '*',
      callback,
      {
        schema: options?.schema || 'public',
        filter: `user_id=eq.${userId}`,
      }
    )
  ).filter(Boolean) // Remove null values from failed subscriptions
}

/**
 * Create a channel for custom realtime operations
 */
export function createChannel(
  supabase: TypedSupabaseClient,
  channelName: string
) {
  return supabase.channel(channelName)
}

/**
 * Unsubscribe from a channel
 */
export async function unsubscribeChannel(
  supabase: TypedSupabaseClient,
  channel: any
) {
  try {
    return await supabase.removeChannel(channel)
  } catch (_error) {
    return 'error'
  }
}

/**
 * Clean up multiple channels
 */
export async function unsubscribeMultipleChannels(
  supabase: TypedSupabaseClient,
  channels: any[]
) {
  await Promise.all(
    channels
      .filter(Boolean)
      .map(channel => unsubscribeChannel(supabase, channel))
  )
}

/**
 * Helper to check if realtime is available
 */
export function isRealtimeAvailable(supabase: TypedSupabaseClient): boolean {
  return !!(supabase as any).realtime
}

/**
 * Get the current realtime connection status
 */
export function getRealtimeStatus(supabase: TypedSupabaseClient): string {
  try {
    const realtime = (supabase as any).realtime
    if (!realtime) {
      return 'unavailable'
    }
    return realtime.connection?.state || 'unknown'
  } catch {
    return 'unavailable'
  }
} 