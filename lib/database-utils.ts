/**
 * Database Utility Functions
 * 
 * Comprehensive utility functions for working with Supabase database tables.
 * Provides type-safe helpers for common database operations, data validation,
 * and transformation utilities.
 * 
 * Last updated: 2025-06-09
 */

import type {
  Profile,
  ProfileInsert,
  ProfileUpdate,
  ProfileFormData,
  Subscription,
  SubscriptionInsert,
  SubscriptionStatus,
  SubscriptionInterval,
  SupportedCurrency,
  BillingAddress,
  ActiveSubscription,
  SubscriptionWithProfile,
  ProfileFilters,
  SubscriptionFilters,

  SubscriptionDisplay,
  StripeSubscriptionData,
} from '@/types/database'

// ==================================================
// PROFILE UTILITIES
// ==================================================

/**
 * Creates a new profile data object for database insertion
 */
export function createProfileData(
  userId: string,
  email: string,
  additional?: Partial<ProfileFormData>
): ProfileInsert {
  return {
    user_id: userId,
    email,
    full_name: additional?.full_name || null,
    phone: additional?.phone || null,
    company_name: additional?.company_name || null,
    website_url: additional?.website_url || null,
    timezone: additional?.timezone || 'UTC',
    email_notifications: additional?.email_notifications ?? true,
    marketing_emails: additional?.marketing_emails ?? false,
    billing_address: additional?.billing_address ? JSON.stringify(additional.billing_address) : null,
  }
}

/**
 * Transforms profile form data for database update
 */
export function transformProfileFormData(formData: Partial<ProfileFormData>): ProfileUpdate {
  return {
    full_name: formData.full_name,
    phone: formData.phone,
    company_name: formData.company_name,
    website_url: formData.website_url,
    timezone: formData.timezone || 'UTC',
    email_notifications: formData.email_notifications,
    marketing_emails: formData.marketing_emails,
    billing_address: formData.billing_address ? JSON.stringify(formData.billing_address) : null,
  }
}

/**
 * Parses billing address from JSONB field
 */
export function parseBillingAddress(billingAddress: unknown): BillingAddress | null {
  if (!billingAddress) return null
  
  try {
    const parsed = typeof billingAddress === 'string' 
      ? JSON.parse(billingAddress) 
      : billingAddress
    
    // Validate required fields
    if (!parsed.line1 || !parsed.city || !parsed.postal_code || !parsed.country) {
      return null
    }
    
    return {
      line1: parsed.line1,
      line2: parsed.line2 || undefined,
      city: parsed.city,
      state: parsed.state || undefined,
      postal_code: parsed.postal_code,
      country: parsed.country,
    }
  } catch {
    return null
  }
}

/**
 * Gets display name for a profile (fallback chain)
 */
export function getProfileDisplayName(profile: Profile): string {
  return profile.full_name || profile.email.split('@')[0] || 'User'
}

/**
 * Validates profile form data
 */
export function validateProfileData(data: Partial<ProfileFormData>): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (data.website_url && !isValidUrl(data.website_url)) {
    errors.push('Website URL must be a valid HTTP/HTTPS URL')
  }
  
  if (data.phone && !isValidPhone(data.phone)) {
    errors.push('Phone number format is invalid')
  }
  
  if (data.billing_address && !isValidBillingAddress(data.billing_address)) {
    errors.push('Billing address is incomplete')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

// ==================================================
// SUBSCRIPTION UTILITIES
// ==================================================

/**
 * Creates subscription data from Stripe webhook data
 */
export function createSubscriptionFromStripe(
  userId: string,
  profileId: string,
  stripeData: StripeSubscriptionData,
  planName: string,
  planDescription?: string
): SubscriptionInsert {
  return {
    user_id: userId,
    profile_id: profileId,
    stripe_customer_id: stripeData.stripe_customer_id,
    stripe_subscription_id: stripeData.stripe_subscription_id,
    stripe_price_id: stripeData.stripe_price_id,
    status: stripeData.status,
    plan_name: planName,
    plan_description: planDescription || null,
    interval: 'month', // Default, should be updated based on Stripe price
    current_period_start: stripeData.current_period_start,
    current_period_end: stripeData.current_period_end,
    trial_start: stripeData.trial_start || null,
    trial_end: stripeData.trial_end || null,
    cancel_at_period_end: stripeData.cancel_at_period_end,
    canceled_at: stripeData.canceled_at || null,
    cancel_at: stripeData.cancel_at || null,
    unit_amount: 0, // Should be populated from Stripe price data
    currency: 'usd', // Default, should be updated from Stripe
  }
}

/**
 * Checks if a subscription is active
 */
export function isActiveSubscription(subscription: Subscription): subscription is ActiveSubscription {
  return subscription.status === 'active' || subscription.status === 'trialing'
}

/**
 * Checks if a subscription is canceled but still active until period end
 */
export function isCanceledButActive(subscription: Subscription): boolean {
  return subscription.cancel_at_period_end === true && 
         isActiveSubscription(subscription) &&
         new Date(subscription.current_period_end) > new Date()
}

/**
 * Checks if a subscription is expired
 */
export function isExpiredSubscription(subscription: Subscription): boolean {
  if (!isActiveSubscription(subscription)) return true
  return new Date(subscription.current_period_end) < new Date()
}

/**
 * Gets days until subscription expires
 */
export function getDaysUntilExpiry(subscription: Subscription): number {
  const now = new Date()
  const expiryDate = new Date(subscription.current_period_end)
  const diffTime = expiryDate.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Formats subscription price for display
 */
export function formatSubscriptionPrice(
  amount: number, 
  currency: SupportedCurrency, 
  interval: SubscriptionInterval
): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  })
  
  const price = formatter.format(amount / 100) // Convert from cents
  const period = interval === 'month' ? 'mo' : 'yr'
  
  return `${price}/${period}`
}

/**
 * Creates a subscription display object for UI rendering
 */
export function createSubscriptionSummary(subscription: Subscription): SubscriptionDisplay {
  return {
    id: subscription.id,
    plan_name: subscription.plan_name,
    status: subscription.status as SubscriptionStatus,
    current_period_end: subscription.current_period_end,
    unit_amount: subscription.unit_amount,
    currency: subscription.currency as SupportedCurrency,
  }
}

/**
 * Filters subscriptions based on criteria
 */
export function filterSubscriptions(
  subscriptions: Subscription[],
  filters: SubscriptionFilters
): Subscription[] {
  return subscriptions.filter(sub => {
    // Status filter
    if (filters.status) {
      const statusArray = Array.isArray(filters.status) ? filters.status : [filters.status]
      if (!statusArray.includes(sub.status as SubscriptionStatus)) return false
    }
    
    // Active only filter
    if (filters.active_only && !isActiveSubscription(sub)) return false
    
    // Interval filter
    if (filters.interval && sub.interval !== filters.interval) return false
    
    // Currency filter
    if (filters.currency && sub.currency !== filters.currency) return false
    
    // Expiring soon filter (within 7 days)
    if (filters.expiring_soon) {
      const daysUntilExpiry = getDaysUntilExpiry(sub)
      if (daysUntilExpiry > 7 || daysUntilExpiry < 0) return false
    }
    
    return true
  })
}

// ==================================================
// VALIDATION HELPERS
// ==================================================

/**
 * Validates URL format
 */
function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Validates phone number (basic validation)
 */
function isValidPhone(phone: string): boolean {
  // Basic phone validation - accepts various formats
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '')
  return phoneRegex.test(cleanPhone) && cleanPhone.length >= 7
}

/**
 * Validates billing address completeness
 */
function isValidBillingAddress(address: BillingAddress): boolean {
  return !!(
    address.line1?.trim() &&
    address.city?.trim() &&
    address.postal_code?.trim() &&
    address.country?.trim()
  )
}

// ==================================================
// DATABASE QUERY HELPERS
// ==================================================

/**
 * Builds profile query filters for Supabase
 */
export function buildProfileFilters(filters: ProfileFilters) {
  const queryFilters: Record<string, string> = {}
  
  if (filters.email) {
    queryFilters.email = `ilike.%${filters.email}%`
  }
  
  if (filters.company_name) {
    queryFilters.company_name = `ilike.%${filters.company_name}%`
  }
  
  if (filters.created_after) {
    queryFilters.created_at = `gte.${filters.created_after}`
  }
  
  if (filters.created_before) {
    queryFilters.created_at = `lte.${filters.created_before}`
  }
  
  return queryFilters
}

/**
 * Builds subscription query filters for Supabase
 */
export function buildSubscriptionFilters(filters: SubscriptionFilters) {
  const queryFilters: Record<string, string> = {}
  
  if (filters.status) {
    if (Array.isArray(filters.status)) {
      queryFilters.status = `in.(${filters.status.join(',')})`
    } else {
      queryFilters.status = `eq.${filters.status}`
    }
  }
  
  if (filters.interval) {
    queryFilters.interval = `eq.${filters.interval}`
  }
  
  if (filters.currency) {
    queryFilters.currency = `eq.${filters.currency}`
  }
  
  if (filters.expiring_soon) {
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
    queryFilters.current_period_end = `lte.${sevenDaysFromNow.toISOString()}`
  }
  
  return queryFilters
}

// ==================================================
// TYPE GUARDS
// ==================================================

/**
 * Type guard for active subscriptions
 */
export function isSubscriptionActive(
  subscription: Subscription
): subscription is ActiveSubscription {
  return isActiveSubscription(subscription)
}

/**
 * Type guard for subscription with profile
 */
export function hasProfile(
  subscription: unknown
): subscription is SubscriptionWithProfile {
  return !!(subscription && 
           typeof subscription === 'object' && 
           subscription !== null &&
           'profile' in subscription && 
           subscription.profile && 
           typeof subscription.profile === 'object')
}

// ==================================================
// CONSTANTS
// ==================================================

export const SUBSCRIPTION_STATUSES: SubscriptionStatus[] = [
  'incomplete',
  'incomplete_expired',
  'trialing',
  'active',
  'past_due',
  'canceled',
  'unpaid',
  'paused',
]

export const SUBSCRIPTION_INTERVALS: SubscriptionInterval[] = ['month', 'year']

export const SUPPORTED_CURRENCIES: SupportedCurrency[] = ['usd', 'eur', 'gbp', 'cad']

export const DEFAULT_TIMEZONE = 'UTC'

export const ACTIVE_SUBSCRIPTION_STATUSES: SubscriptionStatus[] = ['active', 'trialing'] 