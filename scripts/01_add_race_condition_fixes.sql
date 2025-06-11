-- ======================================================================
-- Migration: Add Race Condition Fixes
-- Description: Adds proper constraints, indexes, and stripe_customer_id 
--              to prevent race conditions in customer/profile creation
-- Date: 2025-01-21
-- ======================================================================

BEGIN;

-- Step 1: Add stripe_customer_id to profiles table
-- This allows us to track Stripe customers independently of subscriptions
ALTER TABLE public.profiles ADD COLUMN stripe_customer_id TEXT;

-- Step 2: Add unique constraints to prevent duplicates
-- Prevent duplicate profiles for the same user_id (should already exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_id_unique') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);
    END IF;
END $$;

-- Prevent duplicate stripe customers (only one profile per customer)
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_stripe_customer_id_unique 
ON public.profiles(stripe_customer_id) 
WHERE stripe_customer_id IS NOT NULL;

-- Step 3: Add unique constraints to subscriptions table
-- Prevent duplicate customers in subscriptions
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_stripe_customer_id_unique') THEN
        ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_stripe_customer_id_unique UNIQUE (stripe_customer_id);
    END IF;
END $$;

-- Prevent duplicate subscription IDs
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_stripe_subscription_id_unique') THEN
        ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_stripe_subscription_id_unique UNIQUE (stripe_subscription_id);
    END IF;
END $$;

-- Step 4: Add performance indexes for race condition queries
-- Index for fast customer lookup by user_id in profiles
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_user_id_customer_lookup 
ON public.profiles(user_id, stripe_customer_id);

-- Index for fast customer lookup by user_id in subscriptions  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_user_id_customer_lookup 
ON public.subscriptions(user_id, stripe_customer_id);

-- Index for profile/customer joins
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_stripe_customer_id 
ON public.profiles(stripe_customer_id) 
WHERE stripe_customer_id IS NOT NULL;

-- Step 5: Create atomic customer creation function
-- This function handles customer creation with proper locking
CREATE OR REPLACE FUNCTION public.create_customer_and_profile_atomic(
    p_user_id UUID,
    p_email TEXT,
    p_stripe_customer_id TEXT,
    p_full_name TEXT DEFAULT NULL
) RETURNS TABLE(
    profile_id UUID,
    created_customer BOOLEAN,
    created_profile BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_profile_id UUID;
    v_existing_profile RECORD;
    v_created_customer BOOLEAN := FALSE;
    v_created_profile BOOLEAN := FALSE;
BEGIN
    -- Lock the user row to prevent concurrent operations
    PERFORM 1 FROM auth.users WHERE id = p_user_id FOR UPDATE;
    
    -- Check if profile already exists
    SELECT id, stripe_customer_id INTO v_existing_profile
    FROM public.profiles 
    WHERE user_id = p_user_id;
    
    IF v_existing_profile.id IS NOT NULL THEN
        -- Profile exists, update stripe_customer_id if needed
        v_profile_id := v_existing_profile.id;
        
        IF v_existing_profile.stripe_customer_id IS NULL AND p_stripe_customer_id IS NOT NULL THEN
            UPDATE public.profiles 
            SET stripe_customer_id = p_stripe_customer_id,
                updated_at = NOW()
            WHERE id = v_profile_id;
            v_created_customer := TRUE;
        END IF;
    ELSE
        -- Create new profile
        INSERT INTO public.profiles (
            user_id, 
            email, 
            full_name, 
            stripe_customer_id
        ) VALUES (
            p_user_id, 
            p_email, 
            p_full_name, 
            p_stripe_customer_id
        ) RETURNING id INTO v_profile_id;
        
        v_created_profile := TRUE;
        v_created_customer := p_stripe_customer_id IS NOT NULL;
    END IF;
    
    RETURN QUERY SELECT v_profile_id, v_created_customer, v_created_profile;
END;
$$;

-- Step 6: Create function to safely ensure customer ID
-- This function handles customer lookup/creation with proper race condition handling
CREATE OR REPLACE FUNCTION public.ensure_stripe_customer_atomic(
    p_user_id UUID,
    p_email TEXT
) RETURNS TABLE(
    stripe_customer_id TEXT,
    profile_id UUID,
    was_created BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_customer_id TEXT;
    v_profile_id UUID;
    v_was_created BOOLEAN := FALSE;
    v_existing_customer TEXT;
BEGIN
    -- Lock the user row to prevent concurrent operations
    PERFORM 1 FROM auth.users WHERE id = p_user_id FOR UPDATE;
    
    -- First check profiles table for existing customer
    SELECT p.stripe_customer_id, p.id INTO v_existing_customer, v_profile_id
    FROM public.profiles p
    WHERE p.user_id = p_user_id;
    
    IF v_existing_customer IS NOT NULL THEN
        -- Customer already exists in profiles
        RETURN QUERY SELECT v_existing_customer, v_profile_id, FALSE;
        RETURN;
    END IF;
    
    -- Check subscriptions table for existing customer
    SELECT s.stripe_customer_id INTO v_existing_customer
    FROM public.subscriptions s
    WHERE s.user_id = p_user_id
    LIMIT 1;
    
    IF v_existing_customer IS NOT NULL THEN
        -- Customer exists in subscriptions, update profile
        IF v_profile_id IS NOT NULL THEN
            UPDATE public.profiles 
            SET stripe_customer_id = v_existing_customer,
                updated_at = NOW()
            WHERE id = v_profile_id;
        END IF;
        
        RETURN QUERY SELECT v_existing_customer, v_profile_id, FALSE;
        RETURN;
    END IF;
    
    -- No existing customer found - this will be handled by application layer
    -- Return NULL to indicate customer needs to be created in Stripe
    RETURN QUERY SELECT NULL::TEXT, v_profile_id, TRUE;
END;
$$;

-- Step 7: Add comments for documentation
COMMENT ON COLUMN public.profiles.stripe_customer_id IS 'Stripe customer ID for this user profile. Allows tracking customers independently of subscriptions.';
COMMENT ON FUNCTION public.create_customer_and_profile_atomic IS 'Atomically creates or updates user profile with Stripe customer ID. Prevents race conditions.';
COMMENT ON FUNCTION public.ensure_stripe_customer_atomic IS 'Safely looks up existing Stripe customer or indicates one needs to be created. Prevents race conditions.';

-- Step 8: Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.create_customer_and_profile_atomic TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.ensure_stripe_customer_atomic TO authenticated, service_role;

COMMIT; 