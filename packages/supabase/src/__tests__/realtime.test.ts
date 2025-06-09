import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

import {
  subscribeToTable,
  subscribeToRow,
  subscribeToUserChanges,
  createChannel,
  unsubscribeChannel,
  unsubscribeMultipleChannels,
  isRealtimeAvailable,
  getRealtimeStatus,
  type DatabaseChangeEvent,
} from '../realtime'
import { createMockSupabaseClient } from '../test/mocks'


describe('Realtime Utilities', () => {
  let mockSupabase: any
  let mockChannel: any
  let mockDateNow: any

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient()
    mockChannel = {
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
      unsubscribe: vi.fn(),
    }
    mockSupabase.channel = vi.fn(() => mockChannel)
    // Set realtime to null to test unavailable status
    mockSupabase.realtime = null
    
    // Mock Date.now to return incrementing values for unique channel names
    let counter = 1000000
    mockDateNow = vi.spyOn(Date, 'now').mockImplementation(() => ++counter)
    
    vi.clearAllMocks()
  })

  afterEach(() => {
    mockDateNow?.mockRestore()
    vi.restoreAllMocks()
  })

  describe('subscribeToTable', () => {
    it('subscribes to table changes with default parameters', () => {
      const callback = vi.fn()
      const result = subscribeToTable(mockSupabase, 'users', '*', callback)

      expect(mockSupabase.channel).toHaveBeenCalledWith(expect.stringMatching(/^table-users-\d+$/))
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: undefined,
        },
        callback
      )
      expect(mockChannel.subscribe).toHaveBeenCalledOnce()
      expect(result).toBe(mockChannel)
    })

    it('subscribes to specific event type', () => {
      const callback = vi.fn()
      const result = subscribeToTable(mockSupabase, 'products', 'INSERT', callback)

      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'products',
          filter: undefined,
        },
        callback
      )
      expect(result).toBe(mockChannel)
    })

    it('subscribes with custom schema and filter', () => {
      const callback = vi.fn()
      const options = {
        schema: 'custom_schema',
        filter: 'status=eq.active',
      }

      const result = subscribeToTable(mockSupabase, 'orders', 'UPDATE', callback, options)

      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'custom_schema',
          table: 'orders',
          filter: 'status=eq.active',
        },
        callback
      )
      expect(result).toBe(mockChannel)
    })

    it('handles subscription errors gracefully', () => {
      const callback = vi.fn()
      mockSupabase.channel.mockImplementation(() => {
        throw new Error('Connection failed')
      })

      const result = subscribeToTable(mockSupabase, 'users', '*', callback)

      expect(result).toBeNull()
    })

    it('generates unique channel names for concurrent subscriptions', () => {
      const callback = vi.fn()
      
      subscribeToTable(mockSupabase, 'users', '*', callback)
      subscribeToTable(mockSupabase, 'users', '*', callback)

      expect(mockSupabase.channel).toHaveBeenCalledTimes(2)
      const firstCall = mockSupabase.channel.mock.calls[0][0]
      const secondCall = mockSupabase.channel.mock.calls[1][0]
      expect(firstCall).not.toBe(secondCall)
      expect(firstCall).toMatch(/^table-users-\d+$/)
      expect(secondCall).toMatch(/^table-users-\d+$/)
    })
  })

  describe('subscribeToRow', () => {
    it('subscribes to specific row changes', () => {
      const callback = vi.fn()
      const result = subscribeToRow(mockSupabase, 'users', 'user-123', callback)

      expect(mockSupabase.channel).toHaveBeenCalledWith(expect.stringMatching(/^table-users-\d+$/))
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: 'id=eq.user-123',
        },
        callback
      )
      expect(result).toBe(mockChannel)
    })

    it('subscribes to specific row with custom options', () => {
      const callback = vi.fn()
      const options = {
        schema: 'auth',
        event: 'UPDATE' as DatabaseChangeEvent,
      }

      const result = subscribeToRow(mockSupabase, 'profiles', 'profile-456', callback, options)

      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'auth',
          table: 'profiles',
          filter: 'id=eq.profile-456',
        },
        callback
      )
      expect(result).toBe(mockChannel)
    })

    it('handles subscription errors gracefully', () => {
      const callback = vi.fn()
      mockSupabase.channel.mockImplementation(() => {
        throw new Error('Connection failed')
      })

      const result = subscribeToRow(mockSupabase, 'users', 'user-123', callback)

      expect(result).toBeNull()
    })
  })

  describe('subscribeToUserChanges', () => {
    it('subscribes to multiple tables for a user', () => {
      const callback = vi.fn()
      const tables = ['orders', 'subscriptions', 'profiles']
      
      const result = subscribeToUserChanges(mockSupabase, 'user-123', tables, callback)

      expect(mockSupabase.channel).toHaveBeenCalledTimes(3)
      expect(mockChannel.on).toHaveBeenCalledTimes(3)
      
      // Check each table subscription
      tables.forEach((table, index) => {
        expect(mockChannel.on).toHaveBeenNthCalledWith(
          index + 1,
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table,
            filter: 'user_id=eq.user-123',
          },
          callback
        )
      })

      expect(result).toHaveLength(3)
      expect(result.every(channel => channel === mockChannel)).toBe(true)
    })

    it('subscribes with custom schema', () => {
      const callback = vi.fn()
      const tables = ['user_data']
      const options = { schema: 'private' }
      
      const result = subscribeToUserChanges(mockSupabase, 'user-456', tables, callback, options)

      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        {
          event: '*',
          schema: 'private',
          table: 'user_data',
          filter: 'user_id=eq.user-456',
        },
        callback
      )
      expect(result).toHaveLength(1)
    })

    it('filters out failed subscriptions', () => {
      const callback = vi.fn()
      const tables = ['orders', 'subscriptions']
      
      // Mock one successful and one failed subscription
      mockSupabase.channel
        .mockReturnValueOnce(mockChannel) // First call succeeds
        .mockImplementationOnce(() => { throw new Error('Failed') }) // Second call fails

      const result = subscribeToUserChanges(mockSupabase, 'user-123', tables, callback)

      expect(result).toHaveLength(1)
      expect(result[0]).toBe(mockChannel)
    })

    it('returns empty array when all subscriptions fail', () => {
      const callback = vi.fn()
      const tables = ['orders', 'subscriptions']
      
      mockSupabase.channel.mockImplementation(() => {
        throw new Error('Connection failed')
      })

      const result = subscribeToUserChanges(mockSupabase, 'user-123', tables, callback)

      expect(result).toHaveLength(0)
    })
  })

  describe('createChannel', () => {
    it('creates a channel with the specified name', () => {
      const result = createChannel(mockSupabase, 'custom-channel')

      expect(mockSupabase.channel).toHaveBeenCalledWith('custom-channel')
      expect(result).toBe(mockChannel)
    })

    it('creates channels with different names', () => {
      createChannel(mockSupabase, 'channel-1')
      createChannel(mockSupabase, 'channel-2')

      expect(mockSupabase.channel).toHaveBeenCalledTimes(2)
      expect(mockSupabase.channel).toHaveBeenNthCalledWith(1, 'channel-1')
      expect(mockSupabase.channel).toHaveBeenNthCalledWith(2, 'channel-2')
    })
  })

  describe('unsubscribeChannel', () => {
    it('successfully unsubscribes from a channel', async () => {
      mockSupabase.removeChannel.mockResolvedValue('ok')

      const result = await unsubscribeChannel(mockSupabase, mockChannel)

      expect(mockSupabase.removeChannel).toHaveBeenCalledWith(mockChannel)
      expect(result).toBe('ok')
    })

    it('handles unsubscribe errors', async () => {
      mockSupabase.removeChannel.mockRejectedValue(new Error('Unsubscribe failed'))

      const result = await unsubscribeChannel(mockSupabase, mockChannel)

      expect(result).toBe('error')
    })

    it('handles removeChannel returning error status', async () => {
      mockSupabase.removeChannel.mockResolvedValue('timed out')

      const result = await unsubscribeChannel(mockSupabase, mockChannel)

      expect(result).toBe('timed out')
    })
  })

  describe('unsubscribeMultipleChannels', () => {
    it('unsubscribes from multiple channels', async () => {
      const channels = [mockChannel, { ...mockChannel }, { ...mockChannel }]
      mockSupabase.removeChannel.mockResolvedValue('ok')

      await unsubscribeMultipleChannels(mockSupabase, channels)

      expect(mockSupabase.removeChannel).toHaveBeenCalledTimes(3)
      channels.forEach(channel => {
        expect(mockSupabase.removeChannel).toHaveBeenCalledWith(channel)
      })
    })

    it('filters out null/undefined channels', async () => {
      const channels = [mockChannel, null, undefined, { ...mockChannel }]
      mockSupabase.removeChannel.mockResolvedValue('ok')

      await unsubscribeMultipleChannels(mockSupabase, channels)

      expect(mockSupabase.removeChannel).toHaveBeenCalledTimes(2)
    })

    it('handles mixed success and failure scenarios', async () => {
      const channels = [mockChannel, { ...mockChannel }]
      mockSupabase.removeChannel
        .mockResolvedValueOnce('ok')
        .mockRejectedValueOnce(new Error('Failed'))

      // Should not throw even if some unsubscriptions fail
      await expect(unsubscribeMultipleChannels(mockSupabase, channels)).resolves.toBeUndefined()
      expect(mockSupabase.removeChannel).toHaveBeenCalledTimes(2)
    })

    it('handles empty channel array', async () => {
      await unsubscribeMultipleChannels(mockSupabase, [])

      expect(mockSupabase.removeChannel).not.toHaveBeenCalled()
    })
  })

  describe('isRealtimeAvailable', () => {
    it('returns true when realtime is available', () => {
      const mockSupabaseWithRealtime = {
        ...mockSupabase,
        realtime: { connection: { state: 'open' } },
      }

      const result = isRealtimeAvailable(mockSupabaseWithRealtime as any)

      expect(result).toBe(true)
    })

    it('returns false when realtime is not available', () => {
      const result = isRealtimeAvailable(mockSupabase)

      expect(result).toBe(false)
    })

    it('returns false when realtime property is null', () => {
      const mockSupabaseWithNullRealtime = {
        ...mockSupabase,
        realtime: null,
      }

      const result = isRealtimeAvailable(mockSupabaseWithNullRealtime as any)

      expect(result).toBe(false)
    })

    it('returns false when realtime property is undefined', () => {
      const mockSupabaseWithUndefinedRealtime = {
        ...mockSupabase,
        realtime: undefined,
      }

      const result = isRealtimeAvailable(mockSupabaseWithUndefinedRealtime as any)

      expect(result).toBe(false)
    })
  })

  describe('getRealtimeStatus', () => {
    it('returns connection state when realtime is available', () => {
      const mockSupabaseWithRealtime = {
        ...mockSupabase,
        realtime: { 
          connection: { 
            state: 'open' 
          } 
        },
      }

      const result = getRealtimeStatus(mockSupabaseWithRealtime as any)

      expect(result).toBe('open')
    })

    it('returns "unknown" when realtime exists but no connection state', () => {
      const mockSupabaseWithRealtime = {
        ...mockSupabase,
        realtime: {},
      }

      const result = getRealtimeStatus(mockSupabaseWithRealtime as any)

      expect(result).toBe('unknown')
    })

    it('returns "unavailable" when realtime is not available', () => {
      const result = getRealtimeStatus(mockSupabase)

      expect(result).toBe('unavailable')
    })

    it('returns "unavailable" when accessing realtime throws an error', () => {
      const mockSupabaseWithError = {
        ...mockSupabase,
        get realtime() {
          throw new Error('Access denied')
        },
      }

      const result = getRealtimeStatus(mockSupabaseWithError as any)

      expect(result).toBe('unavailable')
    })

    it('handles various connection states', () => {
      const states = ['connecting', 'open', 'closing', 'closed']
      
      states.forEach(state => {
        const mockSupabaseWithState = {
          ...mockSupabase,
          realtime: { 
            connection: { 
              state 
            } 
          },
        }

        const result = getRealtimeStatus(mockSupabaseWithState as any)
        expect(result).toBe(state)
      })
    })
  })

  describe('Integration scenarios', () => {
    it('handles complete subscription lifecycle', async () => {
      const callback = vi.fn()
      
      // Subscribe to table
      const channel = subscribeToTable(mockSupabase, 'users', 'INSERT', callback)
      expect(channel).toBe(mockChannel)
      
      // Verify subscription was set up
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: 'INSERT',
          table: 'users',
        }),
        callback
      )
      expect(mockChannel.subscribe).toHaveBeenCalledOnce()
      
      // Unsubscribe
      mockSupabase.removeChannel.mockResolvedValue('ok')
      const unsubscribeResult = await unsubscribeChannel(mockSupabase, channel)
      expect(unsubscribeResult).toBe('ok')
    })

    it('handles user-specific multi-table subscription lifecycle', async () => {
      const callback = vi.fn()
      const tables = ['orders', 'subscriptions']
      
      // Subscribe to user changes across multiple tables
      const channels = subscribeToUserChanges(mockSupabase, 'user-123', tables, callback)
      expect(channels).toHaveLength(2)
      
      // Verify all subscriptions were set up
      expect(mockChannel.on).toHaveBeenCalledTimes(2)
      expect(mockChannel.subscribe).toHaveBeenCalledTimes(2)
      
      // Unsubscribe from all channels
      mockSupabase.removeChannel.mockResolvedValue('ok')
      await unsubscribeMultipleChannels(mockSupabase, channels)
      expect(mockSupabase.removeChannel).toHaveBeenCalledTimes(2)
    })

    it('handles realtime availability checks before subscription', () => {
      const callback = vi.fn()
      
      // Check if realtime is available
      expect(isRealtimeAvailable(mockSupabase)).toBe(false)
      expect(getRealtimeStatus(mockSupabase)).toBe('unavailable')
      
      // Still allow subscription attempt (graceful degradation)
      const channel = subscribeToTable(mockSupabase, 'users', '*', callback)
      expect(channel).toBe(mockChannel)
    })
  })
}) 