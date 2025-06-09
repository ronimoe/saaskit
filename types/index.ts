// Global type definitions for the application

// Database related types (will be auto-generated from Supabase later)
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string;
          stripe_subscription_id: string;
          status: 'active' | 'canceled' | 'incomplete' | 'past_due' | 'trialing';
          plan_id: string;
          current_period_start: string;
          current_period_end: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_customer_id: string;
          stripe_subscription_id: string;
          status: 'active' | 'canceled' | 'incomplete' | 'past_due' | 'trialing';
          plan_id: string;
          current_period_start: string;
          current_period_end: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_customer_id?: string;
          stripe_subscription_id?: string;
          status?: 'active' | 'canceled' | 'incomplete' | 'past_due' | 'trialing';
          plan_id?: string;
          current_period_start?: string;
          current_period_end?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

// Authentication types
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// API Response types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName?: string;
}

export interface ProfileFormData {
  full_name: string;
  avatar_url?: string;
}

// Subscription types
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId: string;
}

export interface BillingInfo {
  subscription: Database['public']['Tables']['subscriptions']['Row'] | null;
  plan: SubscriptionPlan | null;
  invoices: StripeInvoice[];
}

export interface StripeInvoice {
  id: string;
  amount_paid: number;
  created: number;
  currency: string;
  status: string;
  hosted_invoice_url: string;
  invoice_pdf: string;
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Navigation types
export interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  disabled?: boolean;
}

// Configuration types
export interface AppConfig {
  name: string;
  description: string;
  url: string;
  links: {
    github?: string;
    twitter?: string;
    docs?: string;
  };
  features: {
    auth: boolean;
    billing: boolean;
    analytics: boolean;
  };
}

// Error types
export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>; 