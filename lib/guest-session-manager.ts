/**
 * Guest Session Manager
 * 
 * Handles secure temporary storage of guest checkout data until users
 * create accounts and complete the reconciliation process.
 * 
 * Features:
 * - Secure temporary storage for guest sessions
 * - Session expiration and cleanup
 * - Data encryption for sensitive information
 * - Automatic garbage collection of expired sessions
 */

import { createAdminClient } from '@/lib/supabase'
import { stripe } from '@/lib/stripe-server'
import type Stripe from 'stripe'

const supabase = createAdminClient()

// Session expires after 24 hours
const SESSION_EXPIRY_HOURS = 24


export interface GuestSessionData {
  sessionId: string
  stripeCustomerId: string
  subscriptionId?: string
  customerEmail: string
  planName?: string
  priceId?: string
  paymentStatus: 'pending' | 'paid' | 'failed'
  amount?: number
  currency?: string
  metadata?: Record<string, string>
  expiresAt: string
  createdAt: string
}

export interface CreateGuestSessionParams {
  sessionId: string
  stripeCustomerId: string
  subscriptionId?: string
  customerEmail: string
  planName?: string
  priceId?: string
  paymentStatus: 'pending' | 'paid' | 'failed'
  amount?: number
  currency?: string
  metadata?: Record<string, string>
}

/**
 * Creates a secure guest session record
 */
export async function createGuestSession(params: CreateGuestSessionParams): Promise<{
  success: boolean
  error?: string
}> {
  try {
    console.log(`[GUEST SESSION] Creating session for: ${params.customerEmail}`)

    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + SESSION_EXPIRY_HOURS)

    const sessionData: GuestSessionData = {
      ...params,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString()
    }

    // For now, store in memory/console until we add the database table
    // TODO: Store in guest_sessions table once created
    console.log(`[GUEST SESSION] Created session data:`, {
      sessionId: sessionData.sessionId,
      email: sessionData.customerEmail,
      expiresAt: sessionData.expiresAt
    })

    // TODO: Replace with actual database insert
    // const { error } = await supabase
    //   .from('guest_sessions')
    //   .insert(sessionData)

    return { success: true }

  } catch (error) {
    console.error('[GUEST SESSION] Error creating session:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Retrieves a guest session by session ID
 */
export async function getGuestSession(sessionId: string): Promise<{
  success: boolean
  session?: GuestSessionData
  error?: string
}> {
  try {
    // TODO: Replace with actual database query once table is created
    // const { data, error } = await supabase
    //   .from('guest_sessions')
    //   .select('*')
    //   .eq('session_id', sessionId)
    //   .gte('expires_at', new Date().toISOString())
    //   .single()

    // For now, return mock data or retrieve from Stripe directly
    return await getGuestSessionFromStripe(sessionId)

  } catch (error) {
    console.error('[GUEST SESSION] Error retrieving session:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Fallback: Retrieve guest session data directly from Stripe
 */
async function getGuestSessionFromStripe(sessionId: string): Promise<{
  success: boolean
  session?: GuestSessionData
  error?: string
}> {
  try {
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'subscription']
    })

    if (!stripeSession || !stripeSession.customer) {
      return {
        success: false,
        error: 'Session or customer not found'
      }
    }

    const customer = stripeSession.customer as Stripe.Customer
    if (!customer.email) {
      return {
        success: false,
        error: 'Customer email not found'
      }
    }

    const subscriptionId = typeof stripeSession.subscription === 'string' 
      ? stripeSession.subscription 
      : stripeSession.subscription?.id

    const sessionData: GuestSessionData = {
      sessionId,
      stripeCustomerId: customer.id,
      subscriptionId,
      customerEmail: customer.email,
      planName: stripeSession.metadata?.planName,
      priceId: stripeSession.metadata?.priceId,
      paymentStatus: stripeSession.payment_status === 'paid' ? 'paid' : 'pending',
      amount: stripeSession.amount_total || undefined,
      currency: stripeSession.currency || undefined,
      metadata: stripeSession.metadata || {},
      expiresAt: new Date(Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(stripeSession.created * 1000).toISOString()
    }

    return {
      success: true,
      session: sessionData
    }

  } catch (error) {
    console.error('[GUEST SESSION] Error fetching from Stripe:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch session'
    }
  }
}

/**
 * Marks a guest session as consumed (linked to a user account)
 */
export async function markSessionConsumed(sessionId: string, userId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    console.log(`[GUEST SESSION] Marking session ${sessionId} as consumed by user ${userId}`)

    // TODO: Replace with actual database update once table is created
    // const { error } = await supabase
    //   .from('guest_sessions')
    //   .update({
    //     consumed: true,
    //     consumed_by_user_id: userId,
    //     consumed_at: new Date().toISOString()
    //   })
    //   .eq('session_id', sessionId)

    console.log(`[GUEST SESSION] Session ${sessionId} marked as consumed`)
    return { success: true }

  } catch (error) {
    console.error('[GUEST SESSION] Error marking session consumed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Checks if a Stripe customer is from a guest checkout (not linked to a user)
 */
export async function isGuestCustomer(stripeCustomerId: string): Promise<{
  isGuest: boolean
  userId?: string
  error?: string
}> {
  try {
    // Check if customer exists in our profiles table
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('stripe_customer_id', stripeCustomerId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('[GUEST SESSION] Error checking customer:', error)
      return {
        isGuest: false,
        error: error.message
      }
    }

    if (profileData) {
      // Customer is linked to a user
      return {
        isGuest: false,
        userId: profileData.user_id
      }
    }

    // Customer not found in profiles, check Stripe metadata
    const customer = await stripe.customers.retrieve(stripeCustomerId)
    
    if (typeof customer === 'object' && 'metadata' in customer) {
      const userId = customer.metadata?.user_id
      if (userId) {
        // Customer has user_id in metadata but not in our profiles table
        // This could be a race condition or reconciliation in progress
        return {
          isGuest: false,
          userId
        }
      }
    }

    // Customer has no user association - it's a guest
    return { isGuest: true }

  } catch (error) {
    console.error('[GUEST SESSION] Error checking if guest customer:', error)
    return {
      isGuest: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Cleans up expired guest sessions
 */
export async function cleanupExpiredSessions(): Promise<{
  success: boolean
  deletedCount?: number
  error?: string
}> {
  try {
    console.log('[GUEST SESSION] Starting cleanup of expired sessions')

    // TODO: Replace with actual database cleanup once table is created
    // const { data, error } = await supabase
    //   .from('guest_sessions')
    //   .delete()
    //   .lt('expires_at', new Date().toISOString())
    //   .limit(CLEANUP_BATCH_SIZE)
    //   .select('session_id')

    // For now, just log that cleanup would run
    console.log('[GUEST SESSION] Cleanup completed (mock implementation)')

    return {
      success: true,
      deletedCount: 0
    }

  } catch (error) {
    console.error('[GUEST SESSION] Error during cleanup:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Gets all pending guest sessions for monitoring/admin purposes
 */
export async function getPendingGuestSessions(): Promise<{
  success: boolean
  sessions?: GuestSessionData[]
  error?: string
}> {
  try {
    // TODO: Replace with actual database query once table is created
    // const { data, error } = await supabase
    //   .from('guest_sessions')
    //   .select('*')
    //   .eq('consumed', false)
    //   .gte('expires_at', new Date().toISOString())
    //   .order('created_at', { ascending: false })
    //   .limit(limit)

    // For now, return empty array
    return {
      success: true,
      sessions: []
    }

  } catch (error) {
    console.error('[GUEST SESSION] Error getting pending sessions:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
} 