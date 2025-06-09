# Database Schema Design

## Overview

This document defines the comprehensive database schema for the SaaS Kit application, designed to support user authentication, profile management, and Stripe subscription billing. The schema is optimized for PostgreSQL with Supabase and includes Row Level Security (RLS) considerations.

## Schema Design Principles

1. **Normalization**: Tables are properly normalized to prevent data duplication
2. **Scalability**: Schema supports growth from MVP to enterprise scale
3. **Security**: All tables designed with RLS policies in mind
4. **Type Safety**: Full TypeScript integration with generated types
5. **Stripe Integration**: Native support for Stripe subscription lifecycle
6. **Auditability**: Comprehensive timestamp tracking for all entities

## Table Definitions

### 1. Profiles Table

The `profiles` table extends Supabase's built-in `auth.users` table with application-specific user data.

```sql
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  billing_address jsonb,
  phone text,
  company_name text,
  website_url text,
  timezone text DEFAULT 'UTC',
  email_notifications boolean DEFAULT true,
  marketing_emails boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT profiles_email_check CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT profiles_website_check CHECK (website_url IS NULL OR website_url ~* '^https?://'),
  CONSTRAINT unique_user_id UNIQUE(user_id),
  CONSTRAINT unique_email UNIQUE(email)
);
```

**Key Design Decisions:**
- **user_id**: Foreign key to `auth.users` ensures data integrity
- **email**: Duplicated from auth.users for query optimization and RLS policies
- **billing_address**: JSONB field for flexible address storage compatible with Stripe
- **Constraints**: Email validation and unique constraints prevent data issues
- **Notifications**: Granular control over communication preferences

### 2. Subscriptions Table

The `subscriptions` table manages Stripe subscription data and billing lifecycle.

```sql
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Stripe Integration Fields
  stripe_customer_id text NOT NULL,
  stripe_subscription_id text NOT NULL,
  stripe_price_id text NOT NULL,
  
  -- Subscription Status and Metadata
  status text NOT NULL CHECK (status IN (
    'incomplete',
    'incomplete_expired', 
    'trialing',
    'active',
    'past_due',
    'canceled',
    'unpaid',
    'paused'
  )),
  
  -- Plan Information
  plan_name text NOT NULL,
  plan_description text,
  interval text NOT NULL CHECK (interval IN ('month', 'year')),
  interval_count integer NOT NULL DEFAULT 1,
  
  -- Pricing
  unit_amount integer NOT NULL, -- Amount in smallest currency unit (cents)
  currency text NOT NULL DEFAULT 'usd',
  
  -- Billing Periods
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  trial_start timestamptz,
  trial_end timestamptz,
  
  -- Cancellation
  cancel_at_period_end boolean DEFAULT false,
  canceled_at timestamptz,
  cancel_at timestamptz,
  
  -- Metadata
  metadata jsonb DEFAULT '{}',
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT unique_stripe_subscription UNIQUE(stripe_subscription_id),
  CONSTRAINT unique_stripe_customer UNIQUE(stripe_customer_id),
  CONSTRAINT valid_currency CHECK (currency IN ('usd', 'eur', 'gbp', 'cad')),
  CONSTRAINT positive_amount CHECK (unit_amount > 0),
  CONSTRAINT valid_interval_count CHECK (interval_count > 0),
  CONSTRAINT valid_period CHECK (current_period_end > current_period_start),
  CONSTRAINT valid_trial CHECK (
    (trial_start IS NULL AND trial_end IS NULL) OR 
    (trial_start IS NOT NULL AND trial_end IS NOT NULL AND trial_end > trial_start)
  )
);
```

**Key Design Decisions:**
- **Dual Foreign Keys**: References both `auth.users` and `profiles` for flexibility
- **Stripe Fields**: Native support for all Stripe subscription properties
- **Status Enum**: Matches Stripe's subscription status values exactly
- **Pricing Storage**: Stores amount in smallest currency unit (cents) following Stripe patterns
- **Comprehensive Periods**: Supports current billing periods and trial periods
- **Cancellation Logic**: Full support for Stripe's cancellation workflows
- **Metadata**: JSONB field for custom subscription attributes

## Indexes

### Performance Optimization Indexes

```sql
-- Profiles table indexes
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at);

-- Subscriptions table indexes  
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_profile_id ON public.subscriptions(profile_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_current_period_end ON public.subscriptions(current_period_end);
CREATE INDEX idx_subscriptions_created_at ON public.subscriptions(created_at);

-- Composite indexes for common queries
CREATE INDEX idx_subscriptions_user_status ON public.subscriptions(user_id, status);
CREATE INDEX idx_subscriptions_status_period ON public.subscriptions(status, current_period_end);
```

## Row Level Security (RLS) Policies

### Profiles Table RLS

```sql
-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can only access their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Service role can access all profiles for admin operations
CREATE POLICY "Service role full access" ON public.profiles
  FOR ALL USING (current_setting('role') = 'service_role');
```

### Subscriptions Table RLS

```sql
-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Service role can access all subscriptions for webhook processing
CREATE POLICY "Service role full access" ON public.subscriptions
  FOR ALL USING (current_setting('role') = 'service_role');
```

## Triggers and Functions

### Automatic Timestamp Updates

```sql
-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to profiles table
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply to subscriptions table  
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Profile Creation Trigger

```sql
-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ language 'plpgsql' security definer;

-- Trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## TypeScript Integration

### Unified Type Definitions

```typescript
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          billing_address: Record<string, any> | null;
          phone: string | null;
          company_name: string | null;
          website_url: string | null;
          timezone: string;
          email_notifications: boolean;
          marketing_emails: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          billing_address?: Record<string, any> | null;
          phone?: string | null;
          company_name?: string | null;
          website_url?: string | null;
          timezone?: string;
          email_notifications?: boolean;
          marketing_emails?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          billing_address?: Record<string, any> | null;
          phone?: string | null;
          company_name?: string | null;
          website_url?: string | null;
          timezone?: string;
          email_notifications?: boolean;
          marketing_emails?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          profile_id: string;
          stripe_customer_id: string;
          stripe_subscription_id: string;
          stripe_price_id: string;
          status: 'incomplete' | 'incomplete_expired' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'paused';
          plan_name: string;
          plan_description: string | null;
          interval: 'month' | 'year';
          interval_count: number;
          unit_amount: number;
          currency: string;
          current_period_start: string;
          current_period_end: string;
          trial_start: string | null;
          trial_end: string | null;
          cancel_at_period_end: boolean;
          canceled_at: string | null;
          cancel_at: string | null;
          metadata: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          profile_id: string;
          stripe_customer_id: string;
          stripe_subscription_id: string;
          stripe_price_id: string;
          status: 'incomplete' | 'incomplete_expired' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'paused';
          plan_name: string;
          plan_description?: string | null;
          interval: 'month' | 'year';
          interval_count?: number;
          unit_amount: number;
          currency?: string;
          current_period_start: string;
          current_period_end: string;
          trial_start?: string | null;
          trial_end?: string | null;
          cancel_at_period_end?: boolean;
          canceled_at?: string | null;
          cancel_at?: string | null;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          profile_id?: string;
          stripe_customer_id?: string;
          stripe_subscription_id?: string;
          stripe_price_id?: string;
          status?: 'incomplete' | 'incomplete_expired' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'paused';
          plan_name?: string;
          plan_description?: string | null;
          interval?: 'month' | 'year';
          interval_count?: number;
          unit_amount?: number;
          currency?: string;
          current_period_start?: string;
          current_period_end?: string;
          trial_start?: string | null;
          trial_end?: string | null;
          cancel_at_period_end?: boolean;
          canceled_at?: string | null;
          cancel_at?: string | null;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
```

## Migration Strategy

### Implementation Order

1. **Create profiles table with indexes and constraints**
2. **Create subscriptions table with indexes and constraints** 
3. **Apply RLS policies to both tables**
4. **Create triggers for automatic timestamps and profile creation**
5. **Generate TypeScript types from schema**
6. **Update existing type definitions to match schema**

### Data Migration Considerations

- **Existing Users**: Any existing auth.users will automatically get profiles via trigger
- **Subscription Data**: Designed to be populated from Stripe webhooks
- **Backward Compatibility**: Schema is designed to be compatible with existing Supabase Auth

## Performance Considerations

### Query Optimization

- **Profile Lookups**: Indexed on user_id and email for fast authentication queries
- **Subscription Queries**: Optimized for status checks and billing period queries
- **Composite Indexes**: Support common query patterns like "active subscriptions"

### Scaling Considerations

- **Partitioning**: Subscriptions table can be partitioned by created_at for large datasets
- **Archival**: Consider moving canceled/expired subscriptions to archive tables
- **Caching**: Profile data is suitable for Redis caching with TTL

## Security Considerations

### Data Protection

- **RLS Policies**: Ensure users can only access their own data
- **Sensitive Data**: Billing addresses stored as JSONB for flexibility while maintaining security
- **Audit Trail**: All tables include comprehensive timestamp tracking

### Compliance

- **GDPR**: Schema supports data export and deletion requirements
- **PCI DSS**: No sensitive payment data stored locally (Stripe handles this)
- **Data Retention**: Timestamps enable automated cleanup policies

## Future Extensions

### Planned Enhancements

- **Teams Table**: For multi-user organizations
- **Usage Metrics**: For usage-based billing
- **Invoices Table**: For detailed billing history
- **Audit Logs**: For security and compliance tracking

### Scalability Path

- **Read Replicas**: Schema designed for read replica scaling
- **Microservices**: Tables can be split across services as needed
- **Analytics**: Designed for data warehouse integration

---

This schema design provides a solid foundation for the SaaS Kit application while maintaining flexibility for future enhancements and ensuring optimal performance and security. 