-- ======================================================================
-- Migration: Add Stripe Customers Function
-- Description: Adds a function to safely upsert stripe_customers records
-- Date: 2025-06-11
-- ======================================================================

BEGIN;

-- Create the function to handle stripe_customers records
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

-- Add function to the Functions list in the database types
COMMENT ON FUNCTION public.create_stripe_customer_record IS 'Safely creates or updates a stripe_customers record for a user';

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.create_stripe_customer_record TO authenticated, service_role;

COMMIT; 