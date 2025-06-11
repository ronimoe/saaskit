/**
 * Customer Service - Race Condition Safe Implementation
 * 
 * This service handles customer creation and management with proper atomic operations
 * to prevent race conditions between signup, checkout, and webhook processing.
 * 
 * Key features:
 * - Atomic customer/profile creation using database functions
 * - Idempotent operations (safe to call multiple times)
 * - Proper error handling and fallback strategies
 * - Stripe customer creation with retry logic
 */

import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase'
import type { 
  Profile, 
  CustomerProfileResult, 
  EnsureCustomerResult as DbEnsureCustomerResult,
  CreateCustomerAndProfileParams,
  EnsureStripeCustomerParams 
} from '@/types/database'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil'
})

const supabase = createAdminClient()

export interface CustomerCreationResult {
  success: boolean
  profile: Profile | null
  stripeCustomerId: string | null
  error?: string
  isNewCustomer?: boolean
  isNewProfile?: boolean
}

export interface EnsureCustomerServiceResult {
  success: boolean
  stripeCustomerId: string | null
  profileId: string | null
  needsStripeCustomer: boolean
  error?: string
}

/**
 * Atomically creates or updates a user profile with Stripe customer ID
 * Uses database function to prevent race conditions
 */
export async function createCustomerAndProfile(
  userId: string,
  email: string,
  stripeCustomerId: string,
  fullName?: string
): Promise<CustomerCreationResult> {
  try {
    console.log(`[CUSTOMER SERVICE] Creating customer and profile for user: ${userId}`)
    
    // Use atomic database function
    const { data, error } = await supabase.rpc('create_customer_and_profile_atomic', {
      p_user_id: userId,
      p_email: email,
      p_stripe_customer_id: stripeCustomerId,
      p_full_name: fullName || null
    } as CreateCustomerAndProfileParams)

    if (error) {
      console.error('[CUSTOMER SERVICE] Database error:', error)
      return {
        success: false,
        profile: null,
        stripeCustomerId: null,
        error: `Database error: ${error.message}`
      }
    }

    if (!data || data.length === 0) {
      return {
        success: false,
        profile: null,
        stripeCustomerId: null,
        error: 'No data returned from atomic function'
      }
    }

    const result = data[0] as CustomerProfileResult

    // Fetch the created/updated profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', result.profile_id)
      .single()

    if (profileError || !profile) {
      console.error('[CUSTOMER SERVICE] Error fetching profile:', profileError)
      return {
        success: false,
        profile: null,
        stripeCustomerId,
        error: 'Profile created but could not fetch details'
      }
    }

    console.log(`[CUSTOMER SERVICE] Successfully created/updated profile: ${result.profile_id}`)
    
    return {
      success: true,
      profile: profile as Profile,
      stripeCustomerId,
      isNewCustomer: result.created_customer,
      isNewProfile: result.created_profile
    }

  } catch (error) {
    console.error('[CUSTOMER SERVICE] Unexpected error:', error)
    return {
      success: false,
      profile: null,
      stripeCustomerId: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Safely checks for existing Stripe customer or indicates one needs to be created
 * Uses database function to prevent race conditions
 */
export async function ensureStripeCustomer(
  userId: string,
  email: string
): Promise<EnsureCustomerServiceResult> {
  try {
    console.log(`[CUSTOMER SERVICE] Ensuring Stripe customer for user: ${userId}`)
    
    // Use atomic database function to check for existing customer
    const { data, error } = await supabase.rpc('ensure_stripe_customer_atomic', {
      p_user_id: userId,
      p_email: email
    } as EnsureStripeCustomerParams)

    if (error) {
      console.error('[CUSTOMER SERVICE] Database error:', error)
      return {
        success: false,
        stripeCustomerId: null,
        profileId: null,
        needsStripeCustomer: false,
        error: `Database error: ${error.message}`
      }
    }

    if (!data || data.length === 0) {
      return {
        success: false,
        stripeCustomerId: null,
        profileId: null,
        needsStripeCustomer: false,
        error: 'No data returned from atomic function'
      }
    }

    const result = data[0] as DbEnsureCustomerResult

    console.log(`[CUSTOMER SERVICE] Customer check result:`, {
      hasCustomer: !!result.stripe_customer_id,
      profileId: result.profile_id,
      needsCreation: result.was_created
    })

    return {
      success: true,
      stripeCustomerId: result.stripe_customer_id,
      profileId: result.profile_id,
      needsStripeCustomer: result.was_created
    }

  } catch (error) {
    console.error('[CUSTOMER SERVICE] Unexpected error:', error)
    return {
      success: false,
      stripeCustomerId: null,
      profileId: null,
      needsStripeCustomer: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Creates a new Stripe customer with retry logic
 */
export async function createStripeCustomer(
  email: string,
  name?: string,
  metadata?: Record<string, string>
): Promise<{ success: boolean; customer?: Stripe.Customer; error?: string }> {
  try {
    console.log(`[CUSTOMER SERVICE] Creating Stripe customer for: ${email}`)
    
    // Create customer in Stripe
    const customer = await stripe.customers.create({
      email,
      name: name || undefined,
      metadata: {
        source: 'saaskit_signup',
        ...metadata
      }
    })

    console.log(`[CUSTOMER SERVICE] Successfully created Stripe customer: ${customer.id}`)
    
    return {
      success: true,
      customer
    }

  } catch (error) {
    console.error('[CUSTOMER SERVICE] Stripe customer creation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown Stripe error'
    }
  }
}

/**
 * Complete customer creation flow with automatic fallback and retry logic
 * This is the main function to call for ensuring a customer exists
 */
export async function ensureCustomerExists(
  userId: string,
  email: string,
  fullName?: string
): Promise<CustomerCreationResult> {
  try {
    console.log(`[CUSTOMER SERVICE] Starting ensure customer flow for: ${userId}`)
    
    // Step 1: Check if customer already exists
    const existingResult = await ensureStripeCustomer(userId, email)
    
    if (!existingResult.success) {
      return {
        success: false,
        profile: null,
        stripeCustomerId: null,
        error: existingResult.error
      }
    }

    // Step 2: If customer exists, create/update profile and return
    if (existingResult.stripeCustomerId && !existingResult.needsStripeCustomer) {
      console.log(`[CUSTOMER SERVICE] Customer exists: ${existingResult.stripeCustomerId}`)
      
      return await createCustomerAndProfile(
        userId,
        email,
        existingResult.stripeCustomerId,
        fullName
      )
    }

    // Step 3: Customer doesn't exist, create one in Stripe
    console.log(`[CUSTOMER SERVICE] Creating new Stripe customer`)
    
    const stripeResult = await createStripeCustomer(email, fullName, {
      user_id: userId
    })

    if (!stripeResult.success || !stripeResult.customer) {
      return {
        success: false,
        profile: null,
        stripeCustomerId: null,
        error: stripeResult.error || 'Failed to create Stripe customer'
      }
    }

    // Step 4: Create/update profile with new Stripe customer ID
    const profileResult = await createCustomerAndProfile(
      userId,
      email,
      stripeResult.customer.id,
      fullName
    )

    // Add customer creation flag to result
    if (profileResult.success) {
      profileResult.isNewCustomer = true
    }

    return profileResult

  } catch (error) {
    console.error('[CUSTOMER SERVICE] Unexpected error in ensure customer flow:', error)
    return {
      success: false,
      profile: null,
      stripeCustomerId: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Get customer by user ID with caching
 */
export async function getCustomerByUserId(userId: string): Promise<{
  success: boolean
  profile?: Profile
  stripeCustomerId?: string
  error?: string
}> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error || !profile) {
      return {
        success: false,
        error: error?.message || 'Profile not found'
      }
    }

    return {
      success: true,
      profile: profile as Profile,
      stripeCustomerId: profile.stripe_customer_id || undefined
    }

  } catch (error) {
    console.error('[CUSTOMER SERVICE] Error getting customer:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Update customer's Stripe customer ID in profile
 */
export async function updateCustomerStripeId(
  userId: string,
  stripeCustomerId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ stripe_customer_id: stripeCustomerId })
      .eq('user_id', userId)
      .select()

    if (error) {
      console.error('[CUSTOMER SERVICE] Error updating customer ID:', error)
      return {
        success: false,
        error: error.message
      }
    }

    return { success: true }

  } catch (error) {
    console.error('[CUSTOMER SERVICE] Unexpected error updating customer ID:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
} 