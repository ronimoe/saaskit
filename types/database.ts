/**
 * Database Types - Auto-Generated from Supabase
 * 
 * This file contains TypeScript types for the Supabase database schema.
 * Generated automatically using Supabase MCP tools.
 * 
 * Last updated: 2025-01-21
 * Project ID: yuiddiwrqbswtgdyvzsf
 * 
 * To regenerate:
 * Use Supabase MCP tool: mcp_supabase_generate_typescript_types
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null
          billing_address: Json | null
          company_name: string | null
          created_at: string | null
          email: string
          email_notifications: boolean | null
          full_name: string | null
          id: string
          marketing_emails: boolean | null
          phone: string | null
          stripe_customer_id: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          billing_address?: Json | null
          company_name?: string | null
          created_at?: string | null
          email: string
          email_notifications?: boolean | null
          full_name?: string | null
          id?: string
          marketing_emails?: boolean | null
          phone?: string | null
          stripe_customer_id?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          billing_address?: Json | null
          company_name?: string | null
          created_at?: string | null
          email?: string
          email_notifications?: boolean | null
          full_name?: string | null
          id?: string
          marketing_emails?: boolean | null
          phone?: string | null
          stripe_customer_id?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at: string | null
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created_at: string | null
          currency: string
          current_period_end: string
          current_period_start: string
          id: string
          interval: string
          interval_count: number
          metadata: Json | null
          plan_description: string | null
          plan_name: string
          profile_id: string
          status: string
          stripe_customer_id: string
          stripe_price_id: string
          stripe_subscription_id: string
          trial_end: string | null
          trial_start: string | null
          unit_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          currency?: string
          current_period_end: string
          current_period_start: string
          id?: string
          interval: string
          interval_count?: number
          metadata?: Json | null
          plan_description?: string | null
          plan_name: string
          profile_id: string
          status: string
          stripe_customer_id: string
          stripe_price_id: string
          stripe_subscription_id: string
          trial_end?: string | null
          trial_start?: string | null
          unit_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          currency?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          interval?: string
          interval_count?: number
          metadata?: Json | null
          plan_description?: string | null
          plan_name?: string
          profile_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_price_id?: string
          stripe_subscription_id?: string
          trial_end?: string | null
          trial_start?: string | null
          unit_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_customer_and_profile_atomic: {
        Args: {
          p_user_id: string
          p_email: string
          p_stripe_customer_id: string
          p_full_name?: string
        }
        Returns: {
          profile_id: string
          created_customer: boolean
          created_profile: boolean
        }[]
      }
      ensure_stripe_customer_atomic: {
        Args: { p_user_id: string; p_email: string }
        Returns: {
          stripe_customer_id: string
          profile_id: string
          was_created: boolean
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ==================================================
// EXTENDED TYPES FOR APPLICATION USE
// ==================================================

// Core table types
export type Profile = Tables<"profiles">
export type ProfileInsert = TablesInsert<"profiles">
export type ProfileUpdate = TablesUpdate<"profiles">
export type Subscription = Tables<"subscriptions">
export type SubscriptionInsert = TablesInsert<"subscriptions">
export type SubscriptionUpdate = TablesUpdate<"subscriptions">

// Atomic function return types
export type CustomerProfileResult = Database['public']['Functions']['create_customer_and_profile_atomic']['Returns'][0]
export type EnsureCustomerResult = Database['public']['Functions']['ensure_stripe_customer_atomic']['Returns'][0]

// Subscription status types
export type SubscriptionStatus = 
  | 'incomplete'
  | 'incomplete_expired' 
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'paused'

export type SubscriptionInterval = 'month' | 'year'
export type SupportedCurrency = 'usd' | 'eur' | 'gbp' | 'cad'

// Form and API types
export type ProfileFormData = {
  full_name?: string | null
  phone?: string | null
  company_name?: string | null
  website_url?: string | null
  timezone?: string
  email_notifications?: boolean
  marketing_emails?: boolean
  billing_address?: BillingAddress | null
}

export type BillingAddress = {
  line1: string
  line2?: string | null
  city: string
  state?: string | null
  postal_code: string
  country: string
}

// Extended subscription types
export type ActiveSubscription = Subscription & {
  status: 'active' | 'trialing'
}

export type SubscriptionWithProfile = Subscription & {
  profile: Profile
}

export type SubscriptionSummary = {
  total_subscriptions: number
  active_subscriptions: number
  canceled_subscriptions: number
  total_revenue: number
  monthly_recurring_revenue: number
}

export type SubscriptionDisplay = {
  id: string
  plan_name: string
  status: SubscriptionStatus
  current_period_end: string
  unit_amount: number
  currency: SupportedCurrency
}

// Filter types for queries
export type ProfileFilters = {
  user_id?: string
  email?: string
  stripe_customer_id?: string
  has_stripe_customer?: boolean
  company_name?: string
  created_after?: string
  created_before?: string
}

export type SubscriptionFilters = {
  user_id?: string
  profile_id?: string
  status?: SubscriptionStatus | SubscriptionStatus[]
  stripe_customer_id?: string
  plan_name?: string
  interval?: SubscriptionInterval
  active_only?: boolean
  currency?: SupportedCurrency
  expiring_soon?: boolean
}

// Stripe integration types
export type StripeSubscriptionData = {
  stripe_customer_id: string
  stripe_subscription_id: string
  stripe_price_id: string
  status: SubscriptionStatus
  current_period_start: string
  current_period_end: string
  trial_start?: string | null
  trial_end?: string | null
  cancel_at_period_end: boolean
  canceled_at?: string | null
  cancel_at?: string | null
}

// Database function parameter types
export type CreateCustomerAndProfileParams = {
  p_user_id: string
  p_email: string
  p_stripe_customer_id: string
  p_full_name?: string
}

export type EnsureStripeCustomerParams = {
  p_user_id: string
  p_email: string
}

// ==================================================
// UTILITY TYPES FOR FORM HANDLING
// ==================================================

// Profile creation data (required fields only)
export type ProfileCreateData = Pick<ProfileInsert, 'user_id' | 'email'> & {
  full_name?: string
  timezone?: string
}

// ==================================================
// REPOSITORY RETURN TYPES
// ==================================================

export interface ProfileWithUser {
  profile: Profile
  auth_user_id: string
}

// ==================================================
// ERROR HANDLING TYPES
// ==================================================

export interface DatabaseError {
  code: string
  message: string
  details?: string
  hint?: string
}

export type DatabaseResult<T> = {
  data: T
  error: null
} | {
  data: null
  error: DatabaseError
} 