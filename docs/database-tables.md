# Database Tables Reference

This document provides detailed information about the database tables used in the SaaS Kit application, with a focus on subscription and customer-related tables.

## Overview

The application uses a PostgreSQL database managed by Supabase. The database schema includes several key tables that store user profiles, subscription information, and customer data.

## Core Tables

### `profiles`

Stores user profile information, including basic details and the link to their Stripe customer.

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT NOT NULL,
  avatar_url TEXT,
  company_name TEXT NULL,
  website_url TEXT NULL,
  phone TEXT NULL,
  billing_address JSONB NULL,
  stripe_customer_id TEXT,  -- Links to Stripe customer
  email_notifications BOOLEAN DEFAULT TRUE,
  marketing_emails BOOLEAN DEFAULT TRUE,
  timezone TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);
```

**Key Fields:**
- `id` - Unique identifier for the profile
- `user_id` - Foreign key reference to the auth.users table
- `email` - User's email address (used for communications)
- `stripe_customer_id` - The Stripe customer ID associated with this user
- `billing_address` - JSON object containing billing address information

**Usage:**
- Created when a user signs up
- Updated when user changes profile information
- Referenced when creating subscriptions
- Used to find a user's Stripe customer ID

### `stripe_customers`

Provides a dedicated mapping between users and Stripe customers, especially useful when handling guest checkouts and account linking.

```sql
CREATE TABLE public.stripe_customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT stripe_customers_user_id_unique UNIQUE (user_id),
  CONSTRAINT stripe_customers_stripe_customer_id_unique UNIQUE (stripe_customer_id)
);

-- Indexes
CREATE INDEX idx_stripe_customers_user_id ON stripe_customers(user_id);
CREATE INDEX idx_stripe_customers_stripe_customer_id ON stripe_customers(stripe_customer_id);
```

**Key Fields:**
- `id` - Unique identifier for the record
- `user_id` - Foreign key reference to the auth.users table
- `stripe_customer_id` - The Stripe customer ID for this user
- `email` - Email associated with the Stripe customer

**Usage:**
- Primary lookup table for finding a user's Stripe customer ID
- Critical for handling guest checkout reconciliation
- Used when processing webhook events from Stripe
- Maintained alongside the profiles table for robust customer tracking

### `subscriptions`

Stores detailed subscription information for each user.

```sql
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Stripe IDs
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  
  -- Plan details
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  plan_amount BIGINT NOT NULL,
  plan_currency TEXT NOT NULL,
  
  -- Subscription status
  status TEXT NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Billing cycle
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  
  -- Trial period
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_period CHECK (current_period_end > current_period_start)
);

-- Indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_profile_id ON subscriptions(profile_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

**Key Fields:**
- `id` - Unique identifier for the subscription record
- `user_id` - Foreign key reference to the auth.users table
- `profile_id` - Foreign key reference to the profiles table
- `stripe_customer_id` - The Stripe customer ID for this subscription
- `stripe_subscription_id` - Unique ID from Stripe for this subscription
- `plan_id` - Stripe price ID for the subscription plan
- `plan_name` - Human-readable name of the subscription plan
- `plan_amount` - Cost of the plan in smallest currency unit (cents)
- `status` - Current state of the subscription (active, canceled, past_due, etc.)
- `current_period_start/end` - The current billing cycle period
- `cancel_at_period_end` - Indicates if subscription will cancel at the end of the current period

**Usage:**
- Created when a user subscribes to a plan
- Updated when subscription details change (webhook events)
- Queried to determine user's subscription status
- Referenced when displaying billing information
- Used to track subscription lifecycle

### `guest_sessions`

Tracks guest checkout sessions and their reconciliation status.

```sql
CREATE TABLE public.guest_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  email TEXT NOT NULL,
  consumed BOOLEAN DEFAULT FALSE,
  consumed_by_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_guest_sessions_session_id ON guest_sessions(session_id);
CREATE INDEX idx_guest_sessions_stripe_customer_id ON guest_sessions(stripe_customer_id);
CREATE INDEX idx_guest_sessions_consumed ON guest_sessions(consumed);
```

**Key Fields:**
- `id` - Unique identifier for the guest session
- `session_id` - Stripe checkout session ID
- `stripe_customer_id` - The Stripe customer ID created for this guest
- `email` - Email address used by the guest
- `consumed` - Whether this session has been linked to a user account
- `consumed_by_user_id` - User ID that claimed this guest session

**Usage:**
- Created when a guest completes checkout
- Updated when a guest session is linked to a user account
- Used in the account reconciliation process
- Prevents duplicate processing of guest sessions

## Database Functions

The application includes several database functions to maintain data integrity:

### `create_customer_and_profile_atomic`

Atomically creates both a profile and links a Stripe customer ID to avoid race conditions.

```sql
CREATE OR REPLACE FUNCTION public.create_customer_and_profile_atomic(
  p_user_id UUID,
  p_email TEXT,
  p_stripe_customer_id TEXT,
  p_full_name TEXT DEFAULT NULL
) RETURNS TABLE(profile_id UUID, created_customer BOOLEAN, created_profile BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile_id UUID;
  v_created_customer BOOLEAN := FALSE;
  v_created_profile BOOLEAN := FALSE;
BEGIN
  -- First, try to find existing profile
  SELECT id INTO v_profile_id
  FROM public.profiles
  WHERE user_id = p_user_id;

  -- If profile doesn't exist, create it
  IF v_profile_id IS NULL THEN
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
    )
    RETURNING id INTO v_profile_id;
    
    v_created_profile := TRUE;
    v_created_customer := TRUE;
  ELSE
    -- Profile exists, update if stripe_customer_id is NULL
    UPDATE public.profiles
    SET 
      stripe_customer_id = p_stripe_customer_id,
      updated_at = NOW()
    WHERE 
      id = v_profile_id AND 
      (stripe_customer_id IS NULL OR stripe_customer_id = '');
    
    IF FOUND THEN
      v_created_customer := TRUE;
    END IF;
  END IF;

  -- Return results
  profile_id := v_profile_id;
  created_customer := v_created_customer;
  created_profile := v_created_profile;
  
  RETURN NEXT;
END;
$$;
```

**Purpose:**
- Safely creates or updates a user profile with Stripe customer information
- Prevents race conditions when multiple requests try to create/update a profile
- Ensures atomicity for customer creation operations
- Returns information about what was created/updated

### `create_stripe_customer_record`

Safely creates or updates a record in the stripe_customers table.

```sql
CREATE OR REPLACE FUNCTION public.create_stripe_customer_record(
  p_user_id UUID,
  p_stripe_customer_id TEXT,
  p_email TEXT
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Upsert into stripe_customers table
  INSERT INTO public.stripe_customers (
    user_id,
    stripe_customer_id,
    email,
    updated_at
  ) VALUES (
    p_user_id,
    p_stripe_customer_id,
    p_email,
    NOW()
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    stripe_customer_id = p_stripe_customer_id,
    email = p_email,
    updated_at = NOW();
END;
$$;
```

**Purpose:**
- Provides a clean interface for updating the stripe_customers table
- Uses upsert (INSERT ... ON CONFLICT) for idempotent operations
- Simplifies customer record creation/updates from application code
- Security definer function allows safe execution from limited-privilege contexts

## Database Relationships

The database tables are connected through foreign key relationships:

```
auth.users
   │
   ├─── profiles
   │     │
   │     └─── subscriptions
   │
   └─── stripe_customers
         │
         └── (referenced by subscriptions via stripe_customer_id)
```

## Data Flow Patterns

### Customer Creation Flow

1. User signs up → Create entry in `auth.users`
2. Create profile in `profiles` table
3. When subscribing, create Stripe customer and update `profiles.stripe_customer_id`
4. Add entry to `stripe_customers` table for robust lookups

### Subscription Creation Flow

1. User selects a plan → Create Stripe checkout session
2. On successful checkout → Stripe webhook triggers
3. Webhook handler creates entry in `subscriptions` table
4. Updates `profiles` and `stripe_customers` if needed

### Guest Checkout Flow

1. Guest checks out → Create entry in `guest_sessions`
2. When guest later creates account or logs in → Reconciliation process runs
3. Reconciliation links the guest customer to user's account
4. Updates `profiles.stripe_customer_id` and `stripe_customers` table
5. Marks `guest_sessions.consumed` as true and sets `consumed_by_user_id`

## Common Database Queries

### Get User's Active Subscription

```sql
SELECT s.*
FROM subscriptions s
WHERE s.user_id = '[USER_ID]'
AND s.status = 'active'
ORDER BY s.created_at DESC
LIMIT 1;
```

### Find User by Stripe Customer ID

```sql
-- Primary method: Check stripe_customers table
SELECT user_id 
FROM stripe_customers
WHERE stripe_customer_id = '[STRIPE_CUSTOMER_ID]';

-- Fallback method: Check profiles table
SELECT user_id
FROM profiles
WHERE stripe_customer_id = '[STRIPE_CUSTOMER_ID]';
```

### Check Subscription Status

```sql
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM subscriptions 
      WHERE user_id = '[USER_ID]' 
      AND status = 'active'
      AND current_period_end > NOW()
    ) THEN TRUE
    ELSE FALSE
  END as has_active_subscription;
```

## Constraints and Validation

Key constraints ensure data integrity:

1. **Unique Constraints:**
   - `stripe_customers_user_id_unique`: Ensures each user has only one primary customer record
   - `stripe_customers_stripe_customer_id_unique`: Ensures each Stripe customer ID appears only once
   - `subscriptions.stripe_subscription_id`: Ensures each Stripe subscription is tracked only once

2. **Referential Integrity:**
   - Foreign key constraints ensure profile/subscription records link to valid users
   - Cascade deletion protects against orphaned records

3. **Data Validation:**
   - `valid_period` constraint on `subscriptions` ensures that billing periods are valid (end date > start date)

## Maintenance and Troubleshooting

### Common Issues

1. **Missing Customer Records:**
   - Look for inconsistencies between `profiles` and `stripe_customers` tables
   - Ensure the reconciliation process updates both tables properly
   - Use the `create_stripe_customer_record` function to maintain consistency

2. **Invalid Period Constraint Errors:**
   - Check for equal timestamps in `current_period_start` and `current_period_end`
   - Ensure defaults for end dates are properly set in the future

3. **Orphaned Records:**
   - Regularly check for subscription records without matching profiles
   - Verify cascade delete is working as expected

### Recommended Queries for Auditing

```sql
-- Find inconsistencies between profiles and stripe_customers
SELECT p.user_id, p.stripe_customer_id as profile_customer_id, sc.stripe_customer_id as sc_customer_id
FROM profiles p
LEFT JOIN stripe_customers sc ON p.user_id = sc.user_id
WHERE p.stripe_customer_id IS NOT NULL
AND (sc.stripe_customer_id IS NULL OR p.stripe_customer_id != sc.stripe_customer_id);

-- Find subscriptions with period constraint issues
SELECT id, stripe_subscription_id, current_period_start, current_period_end
FROM subscriptions
WHERE current_period_end <= current_period_start;

-- Find unused guest sessions
SELECT *
FROM guest_sessions
WHERE consumed = FALSE
AND created_at < (NOW() - INTERVAL '30 days');
```

## Database Migrations

When making changes to the database schema, follow these guidelines:

1. Create a properly versioned migration file in the `scripts/` directory
2. Include both "up" and "down" migration paths when possible
3. Add appropriate indexes for new fields that will be frequently queried
4. Update the TypeScript type definitions in `types/database.ts`
5. Test migrations thoroughly in a development environment before applying to production

---

**Documentation Version:** 1.0.0  
**Last Updated:** 2025-06-11  
**Status:** Production Ready ✅  
**Maintainer:** SaaS Kit Team 