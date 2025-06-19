/**
 * Subscription Synchronization Service
 * 
 * Handles synchronizing Stripe subscription data with the local Supabase database.
 * This service processes Stripe webhook events and ensures data consistency.
 * 
 * Updated to handle Stripe API 2025-03-31 changes where current_period_start 
 * and current_period_end are now on subscription items instead of subscription level.
 */

import { createServerComponentClient } from './supabase';
import { stripe } from './stripe';
import type { Subscription, SubscriptionInsert } from '../types/database';
import type { Stripe } from 'stripe';



export async function syncSubscriptionWithStripe(userId: string) {
  const supabase = await createServerComponentClient();
  
  try {
    // Get the user's profile
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError || !userProfile) {
      console.error('Error fetching user profile:', profileError);
      return { success: false, error: 'User profile not found' };
    }

    // If no Stripe customer ID, nothing to sync
    if (!userProfile.stripe_customer_id) {
      return { success: true, message: 'No Stripe customer ID found' };
    }

    // Get all subscriptions for this customer from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: userProfile.stripe_customer_id,
      status: 'all',
    });

    // Find the most recent active or trialing subscription
    const activeSubscription = subscriptions.data.find((sub: Stripe.Subscription) => 
      sub.status === 'active' || sub.status === 'trialing'
    );

    if (activeSubscription) {
      // Get the primary subscription item (first item)
      const primaryItem = activeSubscription.items.data[0];
      
      if (!primaryItem) {
        console.error('No subscription items found for subscription:', activeSubscription.id);
        return { success: false, error: 'No subscription items found' };
      }

      // Prepare subscription data for upsert
      const subscriptionData: SubscriptionInsert = {
        user_id: userId,
        profile_id: userProfile.id,
        stripe_subscription_id: activeSubscription.id,
        stripe_customer_id: userProfile.stripe_customer_id,
        status: activeSubscription.status,
        // Use period dates from the subscription item (new Stripe API structure)
        current_period_start: new Date(primaryItem.current_period_start * 1000).toISOString(),
        current_period_end: new Date(primaryItem.current_period_end * 1000).toISOString(),
        trial_start: activeSubscription.trial_start ? 
          new Date(activeSubscription.trial_start * 1000).toISOString() : null,
        trial_end: activeSubscription.trial_end ? 
          new Date(activeSubscription.trial_end * 1000).toISOString() : null,
        cancel_at_period_end: activeSubscription.cancel_at_period_end || false,
        canceled_at: activeSubscription.canceled_at ? 
          new Date(activeSubscription.canceled_at * 1000).toISOString() : null,
        cancel_at: activeSubscription.cancel_at ? 
          new Date(activeSubscription.cancel_at * 1000).toISOString() : null,
        // Get subscription item details
        stripe_price_id: primaryItem.price.id,
        plan_name: primaryItem.price.nickname || 'Unknown Plan',
        unit_amount: primaryItem.price.unit_amount || 0,
        currency: primaryItem.price.currency,
        interval: primaryItem.price.recurring?.interval || 'month',
        interval_count: primaryItem.price.recurring?.interval_count || 1,
        metadata: activeSubscription.metadata || null,
      };

      // Upsert the subscription
      const { data: upsertedSubscription, error: upsertError } = await supabase
        .from('subscriptions')
        .upsert(subscriptionData, { 
          onConflict: 'stripe_subscription_id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (upsertError) {
        console.error('Error upserting subscription:', upsertError);
        return { success: false, error: 'Failed to update subscription' };
      }

      return { success: true, data: upsertedSubscription };
    } else {
      // No active subscription found - remove any existing subscription records
      const { error: deleteError } = await supabase
        .from('subscriptions')
        .delete()
        .eq('user_id', userId)
        .eq('stripe_customer_id', userProfile.stripe_customer_id);

      if (deleteError) {
        console.error('Error removing subscription:', deleteError);
        return { success: false, error: 'Failed to remove subscription' };
      }

      return { success: true, message: 'No active subscription found - removed existing records' };
    }
  } catch (error) {
    console.error('Error syncing subscription:', error);
    return { success: false, error: 'Failed to sync subscription' };
  }
}

export async function syncAllSubscriptions() {
  const supabase = await createServerComponentClient();
  
  try {
    // Get all profiles with Stripe customer IDs
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, user_id, stripe_customer_id')
      .not('stripe_customer_id', 'is', null);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return { success: false, error: 'Failed to fetch profiles' };
    }

    const results = [];
    
    for (const profile of profiles) {
      const result = await syncSubscriptionWithStripe(profile.user_id);
      results.push({ userId: profile.user_id, ...result });
    }

    return { success: true, results };
  } catch (error) {
    console.error('Error syncing all subscriptions:', error);
    return { success: false, error: 'Failed to sync subscriptions' };
  }
}

export async function handleSubscriptionUpdate(subscriptionData: Stripe.Subscription) {
  try {
    const customerId = subscriptionData.customer as string;
    if (!customerId) {
      throw new Error('No customer ID in subscription data');
    }

    const supabase = await createServerComponentClient();
    
    // Find the profile with this customer ID
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('stripe_customer_id', customerId)
      .single();

    if (profileError || !userProfile) {
      console.error('Error finding profile for customer:', customerId, profileError);
      return { success: false, error: 'Profile not found' };
    }

    // Get the primary subscription item (first item)
    const primaryItem = subscriptionData.items.data[0];
    
    if (!primaryItem) {
      console.error('No subscription items found for subscription:', subscriptionData.id);
      return { success: false, error: 'No subscription items found' };
    }

    // Prepare subscription data for upsert
    const subscriptionUpdateData: SubscriptionInsert = {
      user_id: userProfile.user_id,
      profile_id: userProfile.id,
      stripe_subscription_id: subscriptionData.id,
      stripe_customer_id: customerId,
      status: subscriptionData.status,
      // Use period dates from the subscription item (new Stripe API structure)
      current_period_start: new Date(primaryItem.current_period_start * 1000).toISOString(),
      current_period_end: new Date(primaryItem.current_period_end * 1000).toISOString(),
      trial_start: subscriptionData.trial_start ? 
        new Date(subscriptionData.trial_start * 1000).toISOString() : null,
      trial_end: subscriptionData.trial_end ? 
        new Date(subscriptionData.trial_end * 1000).toISOString() : null,
      cancel_at_period_end: subscriptionData.cancel_at_period_end || false,
      canceled_at: subscriptionData.canceled_at ? 
        new Date(subscriptionData.canceled_at * 1000).toISOString() : null,
      cancel_at: subscriptionData.cancel_at ? 
        new Date(subscriptionData.cancel_at * 1000).toISOString() : null,
      // Get subscription item details
      stripe_price_id: primaryItem.price.id,
      plan_name: primaryItem.price.nickname || 'Unknown Plan',
      unit_amount: primaryItem.price.unit_amount || 0,
      currency: primaryItem.price.currency,
      interval: primaryItem.price.recurring?.interval || 'month',
      interval_count: primaryItem.price.recurring?.interval_count || 1,
      metadata: subscriptionData.metadata || null,
    };

    // Upsert the subscription
    const { data: upsertedSubscription, error: upsertError } = await supabase
      .from('subscriptions')
      .upsert(subscriptionUpdateData, { 
        onConflict: 'stripe_subscription_id',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (upsertError) {
      console.error('Error upserting subscription:', upsertError);
      return { success: false, error: 'Failed to update subscription' };
    }

    return { success: true, data: upsertedSubscription };
  } catch (error) {
    console.error('Error handling subscription update:', error);
    return { success: false, error: 'Failed to handle subscription update' };
  }
}

/**
 * Utility function to get user profile by Stripe customer ID
 */
export async function getProfileByStripeCustomerId(customerId: string) {
  const supabase = await createServerComponentClient();
  
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('stripe_customer_id', customerId)
      .single();

    if (error) {
      console.error('Error fetching profile by customer ID:', error);
      return null;
    }

    return profile;
  } catch (error) {
    console.error('Error in getProfileByStripeCustomerId:', error);
    return null;
  }
}

/**
 * Utility function to get subscription by Stripe subscription ID
 */
export async function getSubscriptionByStripeId(subscriptionId: string) {
  const supabase = await createServerComponentClient();
  
  try {
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', subscriptionId)
      .single();

    if (error) {
      console.error('Error fetching subscription by Stripe ID:', error);
      return null;
    }

    return subscription;
  } catch (error) {
    console.error('Error in getSubscriptionByStripeId:', error);
    return null;
  }
}

/**
 * Utility function to get active subscription for a user
 */
export async function getActiveSubscriptionForUser(userId: string): Promise<Subscription | null> {
  const supabase = await createServerComponentClient();
  
  try {
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .single();

    if (error) {
      // Don't log error for no subscription found (common case)
      if (error.code !== 'PGRST116') {
        console.error('Error fetching active subscription:', error);
      }
      return null;
    }

    return subscription;
  } catch (error) {
    console.error('Error in getActiveSubscriptionForUser:', error);
    return null;
  }
}

/**
 * Utility function to cancel subscription in the database
 */
export async function cancelSubscriptionInDatabase(subscriptionId: string) {
  const supabase = await createServerComponentClient();
  
  try {
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .update({ 
        status: 'canceled',
        canceled_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscriptionId)
      .select()
      .single();

    if (error) {
      console.error('Error canceling subscription in database:', error);
      return { success: false, error: 'Failed to cancel subscription' };
    }

    return { success: true, data: subscription };
  } catch (error) {
    console.error('Error in cancelSubscriptionInDatabase:', error);
    return { success: false, error: 'Failed to cancel subscription' };
  }
} 