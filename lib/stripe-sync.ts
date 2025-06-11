/**
 * Stripe Synchronization Service (2025 Best Practices)
 * 
 * Following T3's "single source of truth" pattern to avoid split-brain states.
 * All Stripe customer data is synced through one central function to maintain consistency.
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil'
});

// Initialize Supabase for server-side operations
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Type for subscription data we store in our database
export type SubscriptionData = {
  subscriptionId: string | null;
  status: Stripe.Subscription.Status | 'none';
  priceId: string | null;
  planName: string | null;
  currentPeriodStart: number | null;
  currentPeriodEnd: number | null;
  cancelAtPeriodEnd: boolean;
  trialEnd: number | null;
  currency: string | null;
  unitAmount: number | null;
  interval: string | null;
  paymentMethod: {
    brand: string | null;
    last4: string | null;
  } | null;
};

/**
 * THE SINGLE SYNC FUNCTION
 * 
 * This is the heart of our Stripe integration. It syncs all customer data
 * from Stripe to our Supabase database. Called from:
 * 1. Success page after checkout
 * 2. Webhook events 
 * 3. Any other time we need fresh data
 */
export async function syncStripeCustomerData(stripeCustomerId: string): Promise<SubscriptionData> {
  try {
    console.log(`[STRIPE SYNC] Syncing data for customer: ${stripeCustomerId}`);

    // Fetch latest subscription data from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      limit: 1,
      status: 'all',
      expand: ['data.default_payment_method', 'data.items.data.price.product']
    });

    let subscriptionData: SubscriptionData;

    if (subscriptions.data.length === 0) {
      // No subscription found
      subscriptionData = {
        subscriptionId: null,
        status: 'none',
        priceId: null,
        planName: null,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        trialEnd: null,
        currency: null,
        unitAmount: null,
        interval: null,
        paymentMethod: null
      };
    } else {
      // Extract subscription data
      const subscription = subscriptions.data[0]!;
      const priceData = subscription.items.data[0]?.price;
      const product = priceData?.product;

      subscriptionData = {
        subscriptionId: subscription.id,
        status: subscription.status,
        priceId: priceData?.id || null,
        planName: typeof product === 'object' && 'name' in product ? product.name : null,
        currentPeriodStart: (subscription as any).current_period_start || null,
        currentPeriodEnd: (subscription as any).current_period_end || null,
        cancelAtPeriodEnd: (subscription as any).cancel_at_period_end || false,
        trialEnd: (subscription as any).trial_end || null,
        currency: priceData?.currency || null,
        unitAmount: priceData?.unit_amount || null,
        interval: priceData?.recurring?.interval || null,
        paymentMethod: subscription.default_payment_method &&
          typeof subscription.default_payment_method === 'object' &&
          subscription.default_payment_method.card
          ? {
              brand: subscription.default_payment_method.card.brand || null,
              last4: subscription.default_payment_method.card.last4 || null
            }
          : null
      };
    }

    // Update our database with the subscription data
    await updateDatabaseSubscription(stripeCustomerId, subscriptionData);

    console.log(`[STRIPE SYNC] Successfully synced customer: ${stripeCustomerId}`);
    return subscriptionData;

  } catch (error) {
    console.error(`[STRIPE SYNC] Error syncing customer ${stripeCustomerId}:`, error);
    throw error;
  }
}

/**
 * Update our database with the latest subscription data
 */
async function updateDatabaseSubscription(
  stripeCustomerId: string, 
  data: SubscriptionData
): Promise<void> {
  try {
    // First try to find user from existing subscription
    let userId: string | null = null;
    let profileId: string | null = null;

    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('user_id, profile_id')
      .eq('stripe_customer_id', stripeCustomerId)
      .single();

    if (existingSubscription) {
      userId = existingSubscription.user_id;
      profileId = existingSubscription.profile_id;
    } else {
      // If no subscription exists, try to find user by stripe_customer_id in profiles
      const { data: profileData } = await supabase
        .from('profiles')
        .select('user_id, id')
        .eq('stripe_customer_id', stripeCustomerId)
        .single();

      if (profileData) {
        userId = profileData.user_id;
        profileId = profileData.id;
      }
    }

    if (!userId || !profileId) {
      console.warn(`[STRIPE SYNC] No user found for customer: ${stripeCustomerId}`);
      return;
    }

    if (data.status === 'none' || !data.subscriptionId) {
      // No active subscription - delete existing subscription record if any
      const { error: deleteError } = await supabase
        .from('subscriptions')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.error('[STRIPE SYNC] Error deleting subscription:', deleteError);
      }
      return;
    }

    // Upsert subscription data
    const subscriptionPayload = {
      user_id: userId,
      profile_id: profileId,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: data.subscriptionId,
      stripe_price_id: data.priceId || '',
      status: data.status,
      plan_name: data.planName || 'Unknown Plan',
      plan_description: null,
      interval: (data.interval as 'month' | 'year') || 'month',
      interval_count: 1,
      unit_amount: data.unitAmount || 0,
      currency: (data.currency as 'usd' | 'eur' | 'gbp' | 'cad') || 'usd',
      current_period_start: data.currentPeriodStart ? new Date(data.currentPeriodStart * 1000).toISOString() : new Date().toISOString(),
      current_period_end: data.currentPeriodEnd ? new Date(data.currentPeriodEnd * 1000).toISOString() : new Date().toISOString(),
      trial_start: null,
      trial_end: data.trialEnd ? new Date(data.trialEnd * 1000).toISOString() : null,
      cancel_at_period_end: data.cancelAtPeriodEnd,
      canceled_at: null,
      cancel_at: null,
      metadata: {
        payment_method: data.paymentMethod
      },
      updated_at: new Date().toISOString()
    };

    const { error: upsertError } = await supabase
      .from('subscriptions')
      .upsert(subscriptionPayload, {
        onConflict: 'stripe_subscription_id'
      })
      .select();

    if (upsertError) {
      console.error('[STRIPE SYNC] Error upserting subscription:', upsertError);
      throw upsertError;
    }

  } catch (error) {
    console.error('[STRIPE SYNC] Database update error:', error);
    throw error;
  }
}

/**
 * Create or get Stripe customer for a user
 * This ensures we always have a customer before checkout (best practice)
 */
export async function ensureStripeCustomer(userId: string, email: string): Promise<string> {
  try {
    // Check if customer already exists in our subscriptions table
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (existingSubscription?.stripe_customer_id) {
      return existingSubscription.stripe_customer_id;
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email,
      metadata: {
        userId
      }
    });

    console.log(`[STRIPE SYNC] Created new customer: ${customer.id} for user: ${userId}`);
    return customer.id;

  } catch (error) {
    console.error('[STRIPE SYNC] Error ensuring customer:', error);
    throw error;
  }
}

/**
 * Get user's stripe customer ID from our database
 */
export async function getStripeCustomerId(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single();

  return data?.stripe_customer_id || null;
} 