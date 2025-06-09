/**
 * Database Types - Auto-Generated from Supabase
 * 
 * This file contains TypeScript types for the Supabase database schema.
 * Generated automatically using Supabase MCP tools.
 * 
 * Last updated: 2025-06-09
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
      [_ in never]: never
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
// CONVENIENCE TYPES FOR APPLICATION USE
// ==================================================

// Core table row types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert']
export type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update']

// ==================================================
// SUBSCRIPTION STATUS TYPES
// ==================================================

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

// ==================================================
// BILLING ADDRESS TYPE
// ==================================================

export interface BillingAddress {
  line1: string
  line2?: string
  city: string
  state?: string
  postal_code: string
  country: string
}

// ==================================================
// UTILITY TYPES FOR FORM HANDLING
// ==================================================

// Profile form data (subset of Profile for user editing)
export type ProfileFormData = {
  full_name: string | null
  phone: string | null
  company_name: string | null
  website_url: string | null
  timezone: string | null
  email_notifications: boolean | null
  marketing_emails: boolean | null
  billing_address?: BillingAddress
}

// Profile creation data (required fields only)
export type ProfileCreateData = Pick<ProfileInsert, 'user_id' | 'email'> & {
  full_name?: string
  timezone?: string
}

// ==================================================
// SUBSCRIPTION UTILITIES
// ==================================================

// Active subscription check
export type ActiveSubscription = Subscription & {
  status: 'active' | 'trialing'
}

// Subscription with profile relationship
export type SubscriptionWithProfile = Subscription & {
  profile: Profile
}

// ==================================================
// QUERY FILTER TYPES
// ==================================================

export interface ProfileFilters {
  email?: string
  company_name?: string
  created_after?: string
  created_before?: string
}

export interface SubscriptionFilters {
  status?: SubscriptionStatus | SubscriptionStatus[]
  interval?: SubscriptionInterval
  currency?: SupportedCurrency
  active_only?: boolean
  expiring_soon?: boolean // within 7 days
}

// ==================================================
// REPOSITORY RETURN TYPES
// ==================================================

export interface ProfileWithUser {
  profile: Profile
  auth_user_id: string
}

export interface SubscriptionSummary {
  id: string
  plan_name: string
  status: SubscriptionStatus
  current_period_end: string
  unit_amount: number
  currency: SupportedCurrency
}

// ==================================================
// STRIPE INTEGRATION TYPES
// ==================================================

export interface StripeSubscriptionData {
  stripe_customer_id: string
  stripe_subscription_id: string
  stripe_price_id: string
  status: SubscriptionStatus
  current_period_start: string
  current_period_end: string
  trial_start?: string
  trial_end?: string
  cancel_at_period_end: boolean
  canceled_at?: string
  cancel_at?: string
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