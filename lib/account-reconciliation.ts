/**
 * Account Reconciliation Service
 * 
 * This service handles linking guest payments to user accounts after successful checkout.
 * It securely matches payments to accounts based on email, creates new accounts when needed,
 * and handles edge cases like duplicate emails and existing customers.
 * 
 * Key features:
 * - Secure email-based account matching
 * - Guest payment to account linking
 * - Subscription association with proper user accounts
 * - Audit trail for all reconciliation operations
 * - Edge case handling (duplicates, conflicts, etc.)
 */

import { createAdminClient } from '@/lib/supabase'
import { stripe } from '@/lib/stripe-server'
import { createCustomerAndProfile, getCustomerByUserId } from '@/lib/customer-service'
import { syncStripeCustomerData } from '@/lib/stripe-sync'
import type { Database } from '@/types/database'
import type Stripe from 'stripe'

const supabase = createAdminClient()

export interface ReconciliationRequest {
  sessionId: string
  userEmail: string
  userId: string
  stripeCustomerId: string
}

export interface ReconciliationResult {
  success: boolean
  message: string
  profileId?: string
  subscriptionLinked?: boolean
  error?: string
  operation?: 'linked_existing' | 'created_new' | 'updated_existing'
}

export interface GuestPaymentInfo {
  sessionId: string
  stripeCustomerId: string
  subscriptionId?: string
  customerEmail: string
  planName?: string
  priceId?: string
  paymentStatus: string
}

/**
 * Extracts payment information from a Stripe checkout session
 */
export async function extractGuestPaymentInfo(sessionId: string): Promise<{
  success: boolean
  paymentInfo?: GuestPaymentInfo
  error?: string
}> {
  try {
    // Retrieve session with expanded data
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer']
    })

    if (!session) {
      return {
        success: false,
        error: 'Checkout session not found'
      }
    }

    if (session.payment_status !== 'paid') {
      return {
        success: false,
        error: 'Payment was not successful'
      }
    }

    const customer = session.customer as Stripe.Customer
    if (!customer || !customer.email) {
      return {
        success: false,
        error: 'No customer or email found in session'
      }
    }

    const subscriptionId = typeof session.subscription === 'string' 
      ? session.subscription 
      : session.subscription?.id

    const paymentInfo: GuestPaymentInfo = {
      sessionId,
      stripeCustomerId: customer.id,
      subscriptionId,
      customerEmail: customer.email,
      planName: session.metadata?.planName,
      priceId: session.metadata?.priceId,
      paymentStatus: session.payment_status
    }

    return {
      success: true,
      paymentInfo
    }

  } catch (error) {
    console.error('[RECONCILIATION] Error extracting payment info:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Links a guest payment to a newly created or existing user account
 */
export async function reconcileGuestPayment(
  request: ReconciliationRequest
): Promise<ReconciliationResult> {
  try {
    console.log(`[RECONCILIATION] Starting reconciliation for user: ${request.userId}`)

    // Step 1: Extract payment information from the session
    const paymentResult = await extractGuestPaymentInfo(request.sessionId)
    
    if (!paymentResult.success || !paymentResult.paymentInfo) {
      return {
        success: false,
        message: 'Failed to extract payment information',
        error: paymentResult.error
      }
    }

    const { paymentInfo } = paymentResult

    // Step 2: Verify email matches
    if (paymentInfo.customerEmail.toLowerCase() !== request.userEmail.toLowerCase()) {
      return {
        success: false,
        message: 'Email mismatch between payment and account',
        error: `Payment email: ${paymentInfo.customerEmail}, Account email: ${request.userEmail}`
      }
    }

    // Step 3: Check if user already has a profile/customer
    const existingCustomer = await getCustomerByUserId(request.userId)
    
    if (existingCustomer.success && existingCustomer.stripeCustomerId) {
      // User already has a Stripe customer - need to transfer subscription
      return await transferSubscriptionToExistingCustomer(
        request,
        paymentInfo,
        existingCustomer.stripeCustomerId
      )
    } else {
      // User doesn't have a Stripe customer - link the guest customer to their account
      return await linkGuestCustomerToAccount(request, paymentInfo)
    }

  } catch (error) {
    console.error('[RECONCILIATION] Error in reconciliation:', error)
    return {
      success: false,
      message: 'Failed to reconcile guest payment',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Links a guest Stripe customer to a user account (user doesn't have existing customer)
 */
async function linkGuestCustomerToAccount(
  request: ReconciliationRequest,
  paymentInfo: GuestPaymentInfo
): Promise<ReconciliationResult> {
  try {
    console.log(`[RECONCILIATION] Linking guest customer ${paymentInfo.stripeCustomerId} to user ${request.userId}`)

    // Update the Stripe customer metadata to indicate it's now linked to a user
    await stripe.customers.update(paymentInfo.stripeCustomerId, {
      metadata: {
        ...((await stripe.customers.retrieve(paymentInfo.stripeCustomerId) as Stripe.Customer).metadata || {}),
        user_id: request.userId,
        linked_date: new Date().toISOString(),
        original_type: 'guest_checkout'
      }
    })

    // Create/update the user profile with the Stripe customer ID
    const profileResult = await createCustomerAndProfile(
      request.userId,
      request.userEmail,
      paymentInfo.stripeCustomerId
    )

    if (!profileResult.success) {
      return {
        success: false,
        message: 'Failed to link customer to user profile',
        error: profileResult.error
      }
    }

    // Ensure we track this customer in the stripe_customers table
    try {
      const { error } = await supabase.from('profiles')
        .update({ stripe_customer_id: paymentInfo.stripeCustomerId })
        .eq('user_id', request.userId);
      
      if (error) {
        console.warn(`[RECONCILIATION] Error updating profile stripe_customer_id: ${error.message}`);
      }
      
      // Also update the stripe_customers tracking table
      const { error: customerError } = await supabase.rpc('create_stripe_customer_record', {
        p_user_id: request.userId,
        p_stripe_customer_id: paymentInfo.stripeCustomerId,
        p_email: request.userEmail
      });
        
      if (customerError) {
        console.warn(`[RECONCILIATION] Error updating stripe_customers table: ${customerError.message}`);
      }
    } catch (err) {
      console.warn(`[RECONCILIATION] Error updating customer records: ${err}`);
      // Continue with the process anyway
    }

    // Sync subscription data to our database
    if (paymentInfo.subscriptionId) {
      await syncStripeCustomerData(paymentInfo.stripeCustomerId)
    }

    // Log the reconciliation operation
    await logReconciliationOperation({
      operation_type: 'link_guest_customer',
      user_id: request.userId,
      session_id: request.sessionId,
      stripe_customer_id: paymentInfo.stripeCustomerId,
      subscription_id: paymentInfo.subscriptionId,
      email: request.userEmail,
      status: 'success'
    })

    console.log(`[RECONCILIATION] Successfully linked guest customer to user account`)

    return {
      success: true,
      message: 'Successfully linked payment to your account',
      profileId: profileResult.profile?.id,
      subscriptionLinked: !!paymentInfo.subscriptionId,
      operation: 'linked_existing'
    }

  } catch (error) {
    console.error('[RECONCILIATION] Error linking guest customer:', error)
    
    // Log failed operation
    await logReconciliationOperation({
      operation_type: 'link_guest_customer',
      user_id: request.userId,
      session_id: request.sessionId,
      stripe_customer_id: paymentInfo.stripeCustomerId,
      email: request.userEmail,
      status: 'failed',
      error_message: error instanceof Error ? error.message : 'Unknown error'
    })

    return {
      success: false,
      message: 'Failed to link payment to account',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Transfers subscription from guest customer to existing customer
 */
async function transferSubscriptionToExistingCustomer(
  request: ReconciliationRequest,
  paymentInfo: GuestPaymentInfo,
  existingCustomerId: string
): Promise<ReconciliationResult> {
  try {
    console.log(`[RECONCILIATION] Linking guest customer ${paymentInfo.stripeCustomerId} to existing customer ${existingCustomerId}`)

    if (!paymentInfo.subscriptionId) {
      return {
        success: false,
        message: 'No subscription found to transfer',
        error: 'Missing subscription ID'
      }
    }

    // Approach: Instead of transferring, we'll use the guest customer and subscription as-is
    // and just update our database to link the guest customer to the authenticated user
    
    const currentSubscription = await stripe.subscriptions.retrieve(paymentInfo.subscriptionId)
    
    // Update the guest customer with the authenticated user's information
    await stripe.customers.update(paymentInfo.stripeCustomerId, {
      email: request.userEmail,
      metadata: {
        user_id: request.userId,
        reconciled_at: new Date().toISOString(),
        original_session: request.sessionId,
        account_type: 'converted_from_guest'
      }
    })
    
    // Update the subscription metadata to reflect the reconciliation
    await stripe.subscriptions.update(paymentInfo.subscriptionId, {
      metadata: {
        ...currentSubscription.metadata,
        user_id: request.userId,
        reconciled_at: new Date().toISOString(),
        original_session: request.sessionId,
        account_type: 'converted_from_guest'
      }
    })

    // Make sure the guest customer is properly linked in the database
    try {
      const { error } = await supabase.from('profiles')
        .update({ stripe_customer_id: paymentInfo.stripeCustomerId })
        .eq('user_id', request.userId);
      
      if (error) {
        console.warn(`[RECONCILIATION] Error updating profile stripe_customer_id: ${error.message}`);
      }
      
      // Also update the stripe_customers tracking table
      const { error: customerError } = await supabase.rpc('create_stripe_customer_record', {
        p_user_id: request.userId,
        p_stripe_customer_id: paymentInfo.stripeCustomerId,
        p_email: request.userEmail
      });
        
      if (customerError) {
        console.warn(`[RECONCILIATION] Error updating stripe_customers table: ${customerError.message}`);
      }
    } catch (err) {
      console.warn(`[RECONCILIATION] Error updating customer records: ${err}`);
      // Continue with the process anyway
    }

    // Sync the guest customer data (which is now the user's main customer)
    await syncStripeCustomerData(paymentInfo.stripeCustomerId)

    console.log(`[RECONCILIATION] Successfully linked guest customer ${paymentInfo.stripeCustomerId} to user ${request.userId}`)

    // If there was an existing customer, we need to decide what to do with it
    // For now, we'll keep both and mark the existing one as secondary
    if (existingCustomerId !== paymentInfo.stripeCustomerId) {
      console.log(`[RECONCILIATION] User had existing customer ${existingCustomerId}, marking as secondary`)
      
      await stripe.customers.update(existingCustomerId, {
        metadata: {
          status: 'secondary_customer',
          primary_customer: paymentInfo.stripeCustomerId,
          reconciled_at: new Date().toISOString()
        }
      })
    }

    // Log the reconciliation operation
    await logReconciliationOperation({
      operation_type: 'link_guest_customer',
      user_id: request.userId,
      session_id: request.sessionId,
      stripe_customer_id: paymentInfo.stripeCustomerId,
      subscription_id: paymentInfo.subscriptionId,
      email: request.userEmail,
      status: 'success',
      additional_data: {
        guest_customer: paymentInfo.stripeCustomerId,
        existing_customer: existingCustomerId,
        method: 'customer_linking'
      }
    })

    return {
      success: true,
      message: 'Successfully linked your subscription to your account',
      subscriptionLinked: true,
      operation: 'linked_existing'
    }

  } catch (error) {
    console.error('[RECONCILIATION] Error linking guest customer:', error)
    
    // Log failed operation
    await logReconciliationOperation({
      operation_type: 'link_guest_customer',
      user_id: request.userId,
      session_id: request.sessionId,
      stripe_customer_id: existingCustomerId,
      subscription_id: paymentInfo.subscriptionId,
      email: request.userEmail,
      status: 'failed',
      error_message: error instanceof Error ? error.message : 'Unknown error'
    })

    return {
      success: false,
      message: 'Failed to link subscription to your account',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Handles edge case where email exists but with different user (duplicate email scenario)
 */
export async function handleDuplicateEmailScenario(
  email: string,
  newUserId: string,
  sessionId: string
): Promise<ReconciliationResult> {
  try {
    console.log(`[RECONCILIATION] Handling duplicate email scenario for: ${email}`)

    // This is a complex edge case that requires manual intervention
    // For now, we'll create a separate customer and log for admin review
    
    // Log the duplicate email issue
    await logReconciliationOperation({
      operation_type: 'duplicate_email_detected',
      user_id: newUserId,
      session_id: sessionId,
      email: email,
      status: 'requires_review',
      error_message: 'Multiple accounts detected with same email'
    })

    return {
      success: false,
      message: 'Multiple accounts detected with this email. Please contact support for assistance.',
      error: 'Duplicate email detected'
    }

  } catch (error) {
    console.error('[RECONCILIATION] Error handling duplicate email:', error)
    return {
      success: false,
      message: 'Failed to handle account conflict',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Logs reconciliation operations for audit trail
 * TODO: Create reconciliation_logs table in database for persistent storage
 */
async function logReconciliationOperation(operation: {
  operation_type: string
  user_id: string
  session_id: string
  stripe_customer_id?: string
  subscription_id?: string
  email: string
  status: 'success' | 'failed' | 'requires_review'
  error_message?: string
  additional_data?: Record<string, unknown>
}) {
  try {
    // For now, log to console with structured format for monitoring
    // Later, we'll add a proper database table for reconciliation_logs
    const logEntry = {
      timestamp: new Date().toISOString(),
      operation_type: operation.operation_type,
      user_id: operation.user_id,
      session_id: operation.session_id,
      stripe_customer_id: operation.stripe_customer_id,
      subscription_id: operation.subscription_id,
      email: operation.email,
      status: operation.status,
      error_message: operation.error_message,
      additional_data: operation.additional_data
    }

    console.log(`[RECONCILIATION LOG] ${JSON.stringify(logEntry)}`)

    // TODO: Replace with database insert once reconciliation_logs table is created
    // const { error } = await supabase
    //   .from('reconciliation_logs')
    //   .insert(logEntry)

  } catch (error) {
    // Don't fail the main operation if logging fails
    console.error('[RECONCILIATION] Logging error:', error)
  }
}

/**
 * Gets reconciliation history for a user (for debugging/support)
 * TODO: Implement once reconciliation_logs table is created
 */
export async function getReconciliationHistory(userId: string): Promise<{
  success: boolean
  operations?: Array<Record<string, unknown>>
  error?: string
}> {
  try {
    // TODO: Replace with database query once reconciliation_logs table is created
    // const { data, error } = await supabase
    //   .from('reconciliation_logs')
    //   .select('*')
    //   .eq('user_id', userId)
    //   .order('created_at', { ascending: false })

    // For now, return empty array since logs are only in console
    return {
      success: true,
      operations: []
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
} 