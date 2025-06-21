/**
 * Common TypeScript Types and Interfaces
 * 
 * Shared type definitions used throughout the SaaS Kit application.
 * Includes utility types, API response types, and common data structures.
 * 
 * @fileoverview Common types for the SaaS Kit application
 */

/**
 * Generic API response wrapper
 * 
 * Standardized response format for all API endpoints
 * 
 * @template T - The type of data returned on success
 */
export interface ApiResponse<T = unknown> {
  /** Whether the operation was successful */
  success: boolean;
  
  /** The response data (null on error) */
  data: T | null;
  
  /** Error message (null on success) */
  error: string | null;
  
  /** Optional additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Paginated response wrapper
 * 
 * Used for endpoints that return paginated data
 * 
 * @template T - The type of items in the data array
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  /** Pagination metadata */
  pagination: {
    /** Current page number (1-based) */
    page: number;
    
    /** Number of items per page */
    limit: number;
    
    /** Total number of items */
    total: number;
    
    /** Total number of pages */
    totalPages: number;
    
    /** Whether there are more pages */
    hasNext: boolean;
    
    /** Whether there are previous pages */
    hasPrev: boolean;
  };
}

/**
 * User subscription status
 * 
 * Represents the current state of a user's subscription
 */
export type SubscriptionStatus = 
  | 'active'        // Subscription is active and paid
  | 'trialing'      // In free trial period
  | 'past_due'      // Payment failed, grace period
  | 'canceled'      // Subscription canceled
  | 'unpaid'        // Payment failed, no access
  | 'incomplete'    // Initial payment incomplete
  | 'incomplete_expired'; // Initial payment expired

/**
 * User subscription plan types
 * 
 * Available subscription tiers
 */
export type PlanType = 'free' | 'starter' | 'pro' | 'enterprise';

/**
 * User profile information
 * 
 * Extended user data beyond authentication
 */
export interface UserProfile {
  /** Unique profile identifier */
  id: string;
  
  /** Associated user ID from auth system */
  userId: string;
  
  /** User's display name */
  fullName: string | null;
  
  /** User's email address */
  email: string;
  
  /** Profile avatar URL */
  avatarUrl: string | null;
  
  /** User's company/organization */
  company: string | null;
  
  /** User's job title */
  jobTitle: string | null;
  
  /** User's timezone */
  timezone: string | null;
  
  /** User's preferred language */
  language: string;
  
  /** Profile creation timestamp */
  createdAt: string;
  
  /** Last profile update timestamp */
  updatedAt: string;
}

/**
 * Subscription information
 * 
 * User's current subscription details
 */
export interface Subscription {
  /** Unique subscription identifier */
  id: string;
  
  /** Associated user ID */
  userId: string;
  
  /** Stripe subscription ID */
  stripeSubscriptionId: string;
  
  /** Stripe customer ID */
  stripeCustomerId: string;
  
  /** Current subscription status */
  status: SubscriptionStatus;
  
  /** Current plan type */
  planType: PlanType;
  
  /** Stripe price ID */
  stripePriceId: string;
  
  /** Current period start date */
  currentPeriodStart: string;
  
  /** Current period end date */
  currentPeriodEnd: string;
  
  /** Whether subscription will cancel at period end */
  cancelAtPeriodEnd: boolean;
  
  /** Subscription creation timestamp */
  createdAt: string;
  
  /** Last subscription update timestamp */
  updatedAt: string;
}

/**
 * Feature flag configuration
 * 
 * Controls application feature availability
 */
export interface FeatureFlags {
  /** Analytics integration enabled */
  analytics: boolean;
  
  /** Social authentication enabled */
  socialAuth: boolean;
  
  /** Subscription system enabled */
  subscriptions: boolean;
  
  /** Team/organization features enabled */
  teams: boolean;
  
  /** API access features enabled */
  apiAccess: boolean;
  
  /** Development tools enabled */
  devTools: boolean;
}

/**
 * Service availability status
 * 
 * Indicates which external services are configured
 */
export interface ServiceStatus {
  /** Email service configured and available */
  hasEmail: boolean;
  
  /** Google OAuth configured */
  hasGoogleAuth: boolean;
  
  /** GitHub OAuth configured */
  hasGitHubAuth: boolean;
  
  /** Stripe payment processing configured */
  hasStripe: boolean;
  
  /** Analytics service configured */
  hasAnalytics: boolean;
  
  /** Error monitoring configured */
  hasErrorMonitoring: boolean;
}

/**
 * Loading state for async operations
 * 
 * Provides consistent loading state management
 */
export interface LoadingState {
  /** Whether operation is in progress */
  isLoading: boolean;
  
  /** Error message if operation failed */
  error: string | null;
  
  /** Success message if operation completed */
  success: string | null;
}

/**
 * Form field error information
 * 
 * Used for form validation and error display
 */
export interface FieldError {
  /** Error message to display */
  message: string;
  
  /** Error type/code for programmatic handling */
  type?: string;
  
  /** Additional error metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Form validation result
 * 
 * Result of form validation with field-specific errors
 */
export interface ValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  
  /** Field-specific errors */
  errors: Record<string, FieldError>;
  
  /** General form-level errors */
  formErrors: string[];
}

/**
 * Search and filter parameters
 * 
 * Common parameters for search and filtering operations
 */
export interface SearchParams {
  /** Search query string */
  query?: string;
  
  /** Page number for pagination */
  page?: number;
  
  /** Number of items per page */
  limit?: number;
  
  /** Sort field */
  sortBy?: string;
  
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
  
  /** Additional filters */
  filters?: Record<string, unknown>;
}

/**
 * Date range specification
 * 
 * Used for filtering by date ranges
 */
export interface DateRange {
  /** Start date (ISO string) */
  from: string;
  
  /** End date (ISO string) */
  to: string;
}

/**
 * Utility type for making all properties optional
 * 
 * @template T - The type to make optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Utility type for making specific properties required
 * 
 * @template T - The base type
 * @template K - Keys to make required
 */
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Utility type for nullable fields
 * 
 * @template T - The type to make nullable
 */
export type Nullable<T> = T | null;

/**
 * Utility type for optional fields
 * 
 * @template T - The type to make optional
 */
export type Optional<T> = T | undefined;

/**
 * Environment-specific configuration
 * 
 * Configuration that varies by environment
 */
export interface EnvironmentConfig {
  /** Environment name */
  environment: 'development' | 'staging' | 'production' | 'test';
  
  /** Whether debug mode is enabled */
  debug: boolean;
  
  /** API base URL */
  apiUrl: string;
  
  /** Application URL */
  appUrl: string;
  
  /** Whether this is a production environment */
  isProduction: boolean;
  
  /** Whether this is a development environment */
  isDevelopment: boolean;
}

/**
 * Webhook event data
 * 
 * Structure for webhook event payloads
 */
export interface WebhookEvent<T = unknown> {
  /** Event identifier */
  id: string;
  
  /** Event type */
  type: string;
  
  /** Event data payload */
  data: T;
  
  /** Event timestamp */
  timestamp: string;
  
  /** Event source */
  source: string;
  
  /** Event version */
  version: string;
} 