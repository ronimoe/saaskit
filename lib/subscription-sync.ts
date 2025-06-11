/**
 * Subscription Synchronization Service
 * 
 * Handles synchronizing Stripe subscription data with the local Supabase database.
 * This service processes Stripe webhook events and ensures data consistency.
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { getPlanByPriceId, SUBSCRIPTION_PLANS } from '@/lib/stripe-plans';
import { createSubscriptionFromStripe } from '@/lib/database-utils';
import type { Database, SubscriptionInsert, SubscriptionUpdate } from '@/types/database';

// Initialize Supabase client for server-side operations
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type WebhookEventType = 
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted';

/**
 * Main function to sync a Stripe subscription with local database
 */
export async function syncSubscriptionWithStripe(
  stripeSubscription: Stripe.Subscription,
  eventType: WebhookEventType
): Promise<void> {
  console.log(`Syncing subscription ${stripeSubscription.id} for event ${eventType}`);

  try {
    // Find the user profile by Stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('stripe_customer_id', stripeSubscription.customer as string)
      .single();

    if (profileError || !profile) {
      console.error(`Could not find profile for Stripe customer ${stripeSubscription.customer}:`, profileError);
      throw new Error(`Profile not found for customer ${stripeSubscription.customer}`);
    }

    switch (eventType) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(stripeSubscription, profile);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(stripeSubscription, profile);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(stripeSubscription, profile);
        break;
      
      default:
        console.warn(`Unhandled event type: ${eventType}`);
    }

    console.log(`Successfully synced subscription ${stripeSubscription.id}`);
  } catch (error) {
    console.error(`Failed to sync subscription ${stripeSubscription.id}:`, error);
    throw error; // Re-throw to ensure webhook returns 500 for retry
  }
}

/**
 * Handle new subscription creation
 */
async function handleSubscriptionCreated(
  stripeSubscription: Stripe.Subscription,
  profile: any
): Promise<void> {
  console.log(`Creating new subscription record for ${stripeSubscription.id}`);

  // Check if subscription already exists (idempotency)
  const { data: existingSubscription } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('stripe_subscription_id', stripeSubscription.id)
    .single();

  if (existingSubscription) {
    console.log(`Subscription ${stripeSubscription.id} already exists, skipping creation`);
    return;
  }

  // Get the first subscription item and price
  const firstItem = stripeSubscription.items.data[0];
  if (!firstItem || !firstItem.price) {
    throw new Error(`Subscription ${stripeSubscription.id} has no valid items or pricing`);
  }

  // Get plan information from price ID
  const planKey = getPlanByPriceId(firstItem.price.id);
  const planData = planKey ? SUBSCRIPTION_PLANS[planKey] : null;

  if (!planData) {
    console.warn(`Unknown price ID: ${firstItem.price.id}`);
  }

  // Create subscription data
  const subscriptionData: SubscriptionInsert = {
    user_id: profile.user_id,
    profile_id: profile.id,
    stripe_customer_id: stripeSubscription.customer as string,
    stripe_subscription_id: stripeSubscription.id,
    stripe_price_id: firstItem.price.id,
    status: stripeSubscription.status,
    plan_name: planData?.name || 'Unknown Plan',
    plan_description: planData?.description || null,
    interval: firstItem.price.recurring?.interval === 'year' ? 'year' : 'month',
    interval_count: firstItem.price.recurring?.interval_count || 1,
    unit_amount: firstItem.price.unit_amount || 0,
    currency: firstItem.price.currency,
    current_period_start: new Date((stripeSubscription as any).current_period_start * 1000).toISOString(),
    current_period_end: new Date((stripeSubscription as any).current_period_end * 1000).toISOString(),
    trial_start: stripeSubscription.trial_start 
      ? new Date(stripeSubscription.trial_start * 1000).toISOString() 
      : null,
    trial_end: stripeSubscription.trial_end 
      ? new Date(stripeSubscription.trial_end * 1000).toISOString() 
      : null,
    cancel_at_period_end: stripeSubscription.cancel_at_period_end,
    canceled_at: stripeSubscription.canceled_at 
      ? new Date(stripeSubscription.canceled_at * 1000).toISOString() 
      : null,
    cancel_at: stripeSubscription.cancel_at 
      ? new Date(stripeSubscription.cancel_at * 1000).toISOString() 
      : null,
    metadata: stripeSubscription.metadata || {},
  };

  const { error } = await supabase
    .from('subscriptions')
    .insert(subscriptionData)
    .select();

  if (error) {
    throw error;
  }

  console.log(`Successfully created subscription ${stripeSubscription.id}`);
}

/**
 * Handle subscription updates
 */
async function handleSubscriptionUpdated(
  stripeSubscription: Stripe.Subscription,
  profile: any
): Promise<void> {
  console.log(`Updating subscription record for ${stripeSubscription.id}`);

  // Get the first subscription item and price
  const firstItem = stripeSubscription.items.data[0];
  if (!firstItem || !firstItem.price) {
    throw new Error(`Subscription ${stripeSubscription.id} has no valid items or pricing`);
  }

  // Get plan information from price ID
  const planKey = getPlanByPriceId(firstItem.price.id);
  const planData = planKey ? SUBSCRIPTION_PLANS[planKey] : null;

  // Prepare update data
  const updateData: SubscriptionUpdate = {
    status: stripeSubscription.status,
    stripe_price_id: firstItem.price.id,
    plan_name: planData?.name || 'Unknown Plan',
    plan_description: planData?.description || null,
    interval: firstItem.price.recurring?.interval === 'year' ? 'year' : 'month',
    interval_count: firstItem.price.recurring?.interval_count || 1,
    unit_amount: firstItem.price.unit_amount || 0,
    currency: firstItem.price.currency,
    current_period_start: new Date((stripeSubscription as any).current_period_start * 1000).toISOString(),
    current_period_end: new Date((stripeSubscription as any).current_period_end * 1000).toISOString(),
    trial_start: stripeSubscription.trial_start 
      ? new Date(stripeSubscription.trial_start * 1000).toISOString() 
      : null,
    trial_end: stripeSubscription.trial_end 
      ? new Date(stripeSubscription.trial_end * 1000).toISOString() 
      : null,
    cancel_at_period_end: stripeSubscription.cancel_at_period_end,
    canceled_at: stripeSubscription.canceled_at 
      ? new Date(stripeSubscription.canceled_at * 1000).toISOString() 
      : null,
    cancel_at: stripeSubscription.cancel_at 
      ? new Date(stripeSubscription.cancel_at * 1000).toISOString() 
      : null,
    metadata: stripeSubscription.metadata || {},
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('subscriptions')
    .update(updateData)
    .eq('stripe_subscription_id', stripeSubscription.id)
    .select();

  if (error) {
    throw error;
  }

  console.log(`Successfully updated subscription ${stripeSubscription.id}`);
}

/**
 * Handle subscription cancellation/deletion
 */
async function handleSubscriptionDeleted(
  stripeSubscription: Stripe.Subscription,
  profile: any
): Promise<void> {
  console.log(`Marking subscription as deleted for ${stripeSubscription.id}`);

  // Update the subscription status to canceled
  const updateData: SubscriptionUpdate = {
    status: 'canceled',
    canceled_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('subscriptions')
    .update(updateData)
    .eq('stripe_subscription_id', stripeSubscription.id)
    .select();

  if (error) {
    throw error;
  }

  console.log(`Successfully marked subscription ${stripeSubscription.id} as canceled`);
}

/**
 * Utility function to get user profile by Stripe customer ID
 */
export async function getProfileByStripeCustomerId(customerId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('stripe_customer_id', customerId)
    .single();

  if (error) {
    console.error(`Failed to find profile for customer ${customerId}:`, error);
    return null;
  }

  return data;
}

/**
 * Utility function to get subscription by Stripe subscription ID
 */
export async function getSubscriptionByStripeId(subscriptionId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (error) {
    console.error(`Failed to find subscription ${subscriptionId}:`, error);
    return null;
  }

  return data;
} 