/**
 * Subscription Synchronization Service
 * 
 * Handles synchronizing Stripe subscription data with the local Supabase database.
 * This service processes Stripe webhook events and ensures data consistency.
 */

import { createSupabaseServerClient } from './supabase';
import { stripe } from './stripe';
import type { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

export async function syncSubscriptionWithStripe(userId: string) {
  const supabase = createSupabaseServerClient();
  
  try {
    // Get the user's profile
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
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
    const activeSubscription = subscriptions.data.find((sub: unknown) => {
      if (typeof sub === 'object' && sub !== null) {
        const subscription = sub as { status: string };
        return subscription.status === 'active' || subscription.status === 'trialing';
      }
      return false;
    });

    let updateData: Partial<Profile> = {};

    if (activeSubscription && typeof activeSubscription === 'object') {
      const sub = activeSubscription as {
        id: string;
        status: string;
        current_period_start: number;
        current_period_end: number;
        items?: { data?: Array<{ price?: { id?: string } }> };
      };

      updateData = {
        subscription_status: sub.status,
        subscription_period_start: new Date(sub.current_period_start * 1000).toISOString(),
        subscription_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        stripe_subscription_id: sub.id,
      };

      // Get the price ID from the subscription
      if (sub.items?.data?.[0]?.price?.id) {
        updateData.stripe_price_id = sub.items.data[0].price.id;
      }
    } else {
      // No active subscription found
      updateData = {
        subscription_status: null,
        subscription_period_start: null,
        subscription_period_end: null,
        stripe_subscription_id: null,
        stripe_price_id: null,
      };
    }

    // Update the profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return { success: false, error: 'Failed to update profile' };
    }

    return { success: true, data: updateData };
  } catch (error) {
    console.error('Error syncing subscription:', error);
    return { success: false, error: 'Failed to sync subscription' };
  }
}

export async function syncAllSubscriptions() {
  const supabase = createSupabaseServerClient();
  
  try {
    // Get all profiles with Stripe customer IDs
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, stripe_customer_id')
      .not('stripe_customer_id', 'is', null);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return { success: false, error: 'Failed to fetch profiles' };
    }

    const results = [];
    
    for (const profile of profiles) {
      const result = await syncSubscriptionWithStripe(profile.id);
      results.push({ userId: profile.id, ...result });
    }

    return { success: true, results };
  } catch (error) {
    console.error('Error syncing all subscriptions:', error);
    return { success: false, error: 'Failed to sync subscriptions' };
  }
}

export async function handleSubscriptionUpdate(subscriptionData: unknown) {
  try {
    if (!subscriptionData || typeof subscriptionData !== 'object') {
      throw new Error('Invalid subscription data');
    }

    const data = subscriptionData as {
      customer?: string;
      id?: string;
      status?: string;
      current_period_start?: number;
      current_period_end?: number;
      items?: { data?: Array<{ price?: { id?: string } }> };
    };

    const customerId = data.customer;
    if (!customerId) {
      throw new Error('No customer ID in subscription data');
    }

    const supabase = createSupabaseServerClient();
    
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

    // Update the profile with the new subscription data
    const updateData: Partial<Profile> = {
      subscription_status: data.status || null,
      stripe_subscription_id: data.id || null,
    };

    if (data.current_period_start) {
      updateData.subscription_period_start = new Date(data.current_period_start * 1000).toISOString();
    }

    if (data.current_period_end) {
      updateData.subscription_period_end = new Date(data.current_period_end * 1000).toISOString();
    }

    if (data.items?.data?.[0]?.price?.id) {
      updateData.stripe_price_id = data.items.data[0].price.id;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userProfile.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return { success: false, error: 'Failed to update profile' };
    }

    return { success: true, data: updateData };
  } catch (error) {
    console.error('Error handling subscription update:', error);
    return { success: false, error: 'Failed to handle subscription update' };
  }
}

/**
 * Utility function to get user profile by Stripe customer ID
 */
export async function getProfileByStripeCustomerId(customerId: string) {
  const supabase = createSupabaseServerClient();
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
  const supabase = createSupabaseServerClient();
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