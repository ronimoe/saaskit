/**
 * Environment Variables Configuration and Validation
 * 
 * This module provides type-safe access to environment variables and validates
 * that all required variables are present during application startup.
 * Separates client-side and server-side validation to prevent server secrets
 * from being accessed on the client.
 */

import { z } from 'zod';

// Client-side environment variables (NEXT_PUBLIC_* and safe defaults)
const clientEnvSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  
  // App Configuration (client-safe)
  NEXT_PUBLIC_APP_URL: z.string().url('Invalid APP_URL format').default('http://localhost:3000'),
  NEXT_PUBLIC_APP_NAME: z.string().default('SaaS Kit'),
  NEXT_PUBLIC_APP_DESCRIPTION: z.string().default('Modern SaaS Platform'),
  NEXT_PUBLIC_COMPANY_NAME: z.string().default('Your Company'),
  
  // Supabase (client-safe only)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL format'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  
  // Stripe (client-safe only)
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_', 'Invalid Stripe publishable key format').default('pk_test_placeholder').optional(),
  
  // Social Auth (client-safe IDs only - secrets are server-only)
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().optional(),
  NEXT_PUBLIC_GITHUB_CLIENT_ID: z.string().optional(),
  
  // Analytics & Monitoring (client-safe only)
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  
  // Feature Flags (client-safe)
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.string().transform((val: string) => val === 'true').default('true'),
  NEXT_PUBLIC_ENABLE_SOCIAL_AUTH: z.string().transform((val: string) => val === 'true').default('true'),
  NEXT_PUBLIC_ENABLE_SUBSCRIPTIONS: z.string().transform((val: string) => val === 'true').default('true'),
  NEXT_PUBLIC_ENABLE_TEAMS: z.string().transform((val: string) => val === 'true').default('false'),
  NEXT_PUBLIC_ENABLE_API_ACCESS: z.string().transform((val: string) => val === 'true').default('false'),
  NEXT_PUBLIC_ENABLE_DEV_TOOLS: z.string().transform((val: string) => val === 'true').default('false'),
});

// Server-side environment variables (includes all client vars + server secrets)
const serverEnvSchema = clientEnvSchema.extend({
  // Supabase (server-only secrets)
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required'),
  SUPABASE_JWT_SECRET: z.string().min(1, 'Supabase JWT secret is required'),
  
  // Stripe (server-only secrets)
  STRIPE_SECRET_KEY: z.string().startsWith('sk_', 'Invalid Stripe secret key format').default('sk_test_placeholder').optional(),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_', 'Invalid Stripe webhook secret format').optional(),
  
  // Stripe Price IDs (server-only)
  STRIPE_STARTER_PRICE_ID: z.string().optional(),
  STRIPE_PRO_PRICE_ID: z.string().optional(),
  STRIPE_ENTERPRISE_PRICE_ID: z.string().optional(),
  
  // Email Configuration (server-only)
  EMAIL_PROVIDER: z.enum(['smtp', 'sendgrid', 'resend']).default('smtp'),
  EMAIL_FROM: z.string().email('Invalid email format').optional(),
  EMAIL_FROM_NAME: z.string().optional(),
  
  // SMTP Configuration (server-only)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform((val: string) => Number(val)).optional(),
  SMTP_SECURE: z.string().transform((val: string) => val === 'true').optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  
  // Third-party Email Services (server-only)
  SENDGRID_API_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  
  // Social Auth (server-only secrets - client IDs are inherited from clientEnvSchema)
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  
  // Analytics & Monitoring (server-only)
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  
  // Subscription Limits (server-only)
  STARTER_PLAN_LIMIT_PROJECTS: z.string().transform((val: string) => Number(val)).default('3'),
  PRO_PLAN_LIMIT_PROJECTS: z.string().transform((val: string) => Number(val)).default('10'),
  ENTERPRISE_PLAN_LIMIT_PROJECTS: z.string().default('unlimited'),
  
  // Storage & CDN (server-only)
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().default('us-east-1'),
  AWS_S3_BUCKET: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  
  // Security & Rate Limiting (server-only)
  RATE_LIMIT_MAX_REQUESTS: z.string().transform((val: string) => Number(val)).default('100'),
  RATE_LIMIT_WINDOW_MS: z.string().transform((val: string) => Number(val)).default('900000'),
  CORS_ALLOWED_ORIGINS: z.string().optional(),
  
  // Development & Debugging (server-only)
  DEBUG: z.string().transform((val: string) => val === 'true').default('false'),
  DEBUG_SQL: z.string().transform((val: string) => val === 'true').default('false'),
  
  // Webhooks & Integrations (server-only)
  SLACK_WEBHOOK_URL: z.string().url().optional(),
  DISCORD_WEBHOOK_URL: z.string().url().optional(),
  
  // AI Services (server-only)
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  
  // Cron Jobs (server-only)
  CRON_SECRET: z.string().optional(),
});

// Define types
export type ClientEnv = z.infer<typeof clientEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

// Determine if we're on the client side
const isClient = typeof window !== 'undefined';

// Parse and validate environment variables based on context
function parseEnv(): ClientEnv | ServerEnv {
  try {
    // Use appropriate schema based on environment
    const schema = isClient ? clientEnvSchema : serverEnvSchema;
    const parsed = schema.parse(process.env);
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => {
        const path = err.path.join('.');
        return `${path}: ${err.message}`;
      });
      
      // Only log errors on server side or during development
      if (!isClient || process.env.NODE_ENV === 'development') {
        console.error('❌ Environment validation failed:');
        errorMessages.forEach(msg => console.error(`  - ${msg}`));
      }
      
      throw new Error(`Environment validation failed:\n${errorMessages.join('\n')}`);
    }
    throw error;
  }
}

// Safe environment access that won't throw on client for server-only vars
let cachedEnv: ClientEnv | ServerEnv | null = null;

function getEnv(): ClientEnv | ServerEnv {
  if (cachedEnv === null) {
    cachedEnv = parseEnv();
  }
  return cachedEnv;
}

// Create a safe environment object that returns undefined for missing client vars
function createSafeEnv(): any {
  if (isClient) {
    // On client, only parse client schema and provide safe defaults
    try {
      return clientEnvSchema.parse(process.env);
    } catch (error) {
      // On client, if parsing fails, return safe defaults but preserve actual env values
      console.warn('Using environment defaults on client side');
      return {
        NODE_ENV: process.env.NODE_ENV || 'development',
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'SaaS Kit',
        NEXT_PUBLIC_APP_DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Modern SaaS Platform',
        NEXT_PUBLIC_COMPANY_NAME: process.env.NEXT_PUBLIC_COMPANY_NAME || 'Your Company',
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        // These should be available on client side for OAuth to work
        NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        NEXT_PUBLIC_GITHUB_CLIENT_ID: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
        NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
        NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
        NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
        NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== 'false',
        NEXT_PUBLIC_ENABLE_SOCIAL_AUTH: process.env.NEXT_PUBLIC_ENABLE_SOCIAL_AUTH !== 'false',
        NEXT_PUBLIC_ENABLE_SUBSCRIPTIONS: process.env.NEXT_PUBLIC_ENABLE_SUBSCRIPTIONS !== 'false',
        NEXT_PUBLIC_ENABLE_TEAMS: process.env.NEXT_PUBLIC_ENABLE_TEAMS === 'true',
        NEXT_PUBLIC_ENABLE_API_ACCESS: process.env.NEXT_PUBLIC_ENABLE_API_ACCESS === 'true',
        NEXT_PUBLIC_ENABLE_DEV_TOOLS: process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === 'true',
      };
    }
  } else {
    // On server, parse full schema
    return getEnv();
  }
}

// Export environment variables
export const env = createSafeEnv();

// Helper functions for common environment checks
export const isDevelopment = () => env.NODE_ENV === 'development';
export const isProduction = () => env.NODE_ENV === 'production';
export const isStaging = () => env.NODE_ENV === 'staging';

// Feature flag helpers (safe for both client and server)
export const features = {
  analytics: env.NEXT_PUBLIC_ENABLE_ANALYTICS,
  socialAuth: env.NEXT_PUBLIC_ENABLE_SOCIAL_AUTH,
  subscriptions: env.NEXT_PUBLIC_ENABLE_SUBSCRIPTIONS,
  teams: env.NEXT_PUBLIC_ENABLE_TEAMS,
  apiAccess: env.NEXT_PUBLIC_ENABLE_API_ACCESS,
  devTools: env.NEXT_PUBLIC_ENABLE_DEV_TOOLS,
} as const;

// Subscription plan limits (server-side only, with fallbacks for client)
export const planLimits = {
  starter: {
    projects: isClient ? 3 : (env as ServerEnv).STARTER_PLAN_LIMIT_PROJECTS,
  },
  pro: {
    projects: isClient ? 10 : (env as ServerEnv).PRO_PLAN_LIMIT_PROJECTS,
  },
  enterprise: {
    projects: isClient ? 'unlimited' : (env as ServerEnv).ENTERPRISE_PLAN_LIMIT_PROJECTS,
  },
} as const;

// Service availability checks (with safe fallbacks for client-side)
export const services = {
  hasEmail: isClient ? false : Boolean(
    ((env as ServerEnv).EMAIL_PROVIDER === 'smtp' && (env as ServerEnv).SMTP_HOST) ||
    ((env as ServerEnv).EMAIL_PROVIDER === 'sendgrid' && (env as ServerEnv).SENDGRID_API_KEY) ||
    ((env as ServerEnv).EMAIL_PROVIDER === 'resend' && (env as ServerEnv).RESEND_API_KEY)
  ),
  hasGoogleAuth: Boolean(env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (isClient ? true : (env as ServerEnv).GOOGLE_CLIENT_SECRET)),
  hasGitHubAuth: Boolean(env.NEXT_PUBLIC_GITHUB_CLIENT_ID && (isClient ? true : (env as ServerEnv).GITHUB_CLIENT_SECRET)),
  hasAnalytics: Boolean(env.NEXT_PUBLIC_GA_MEASUREMENT_ID || env.NEXT_PUBLIC_POSTHOG_KEY),
  hasSentry: Boolean(env.NEXT_PUBLIC_SENTRY_DSN),
  hasS3: isClient ? false : Boolean((env as ServerEnv).AWS_ACCESS_KEY_ID && (env as ServerEnv).AWS_SECRET_ACCESS_KEY && (env as ServerEnv).AWS_S3_BUCKET),
  hasCloudinary: isClient ? false : Boolean((env as ServerEnv).CLOUDINARY_CLOUD_NAME && (env as ServerEnv).CLOUDINARY_API_KEY),
  hasOpenAI: isClient ? false : Boolean((env as ServerEnv).OPENAI_API_KEY),
  hasAnthropic: isClient ? false : Boolean((env as ServerEnv).ANTHROPIC_API_KEY),
} as const;

// Environment info for debugging (safe for both client and server)
export const envInfo = {
  environment: env.NODE_ENV,
  appUrl: env.NEXT_PUBLIC_APP_URL,
  appName: env.NEXT_PUBLIC_APP_NAME,
  features,
  services,
  debug: isClient ? false : (env as ServerEnv).DEBUG,
  isClient,
} as const;

// Log environment info in development (server-side only)
if (!isClient && env.NODE_ENV === 'development' && (env as ServerEnv).DEBUG) {
  console.log('🔧 Environment Configuration:', envInfo);
} 