-- ======================================================================
-- Migration: Add Stripe Customers Table Constraints
-- Description: Adds unique constraints to stripe_customers table
-- Date: 2025-06-11
-- ======================================================================

BEGIN;

-- Step 1: Create stripe_customers table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.stripe_customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Step 2: Add unique constraints
ALTER TABLE public.stripe_customers
ADD CONSTRAINT stripe_customers_user_id_unique UNIQUE (user_id);

ALTER TABLE public.stripe_customers
ADD CONSTRAINT stripe_customers_stripe_customer_id_unique UNIQUE (stripe_customer_id);

-- Step 3: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_stripe_customers_user_id ON public.stripe_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_customers_stripe_customer_id ON public.stripe_customers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_stripe_customers_email ON public.stripe_customers(email);

-- Step 4: Add RLS policies
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;

-- Only allow users to see their own records
CREATE POLICY stripe_customers_select_policy ON public.stripe_customers
  FOR SELECT USING (auth.uid() = user_id);

-- Only allow updates by the user who owns the record
CREATE POLICY stripe_customers_update_policy ON public.stripe_customers
  FOR UPDATE USING (auth.uid() = user_id);

-- Only allow inserts by the user who owns the record
CREATE POLICY stripe_customers_insert_policy ON public.stripe_customers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Only allow deletes by the user who owns the record
CREATE POLICY stripe_customers_delete_policy ON public.stripe_customers
  FOR DELETE USING (auth.uid() = user_id);

-- Allow service role to do anything
CREATE POLICY stripe_customers_service_role_policy ON public.stripe_customers
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stripe_customers TO authenticated;
GRANT ALL ON public.stripe_customers TO service_role;

COMMIT; 