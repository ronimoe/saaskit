/**
 * Environment Variables Configuration and Validation
 * 
 * This module provides type-safe access to environment variables and validates
 * that all required variables are present during application startup.
 */

import { z } from 'zod';

// Define the schema for environment variables
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  
  // App Configuration
  NEXT_PUBLIC_APP_URL: z.string().url('Invalid APP_URL format').default('http://localhost:3000'),
  NEXT_PUBLIC_APP_NAME: z.string().default('SaaS Kit'),
  NEXT_PUBLIC_APP_DESCRIPTION: z.string().default('Modern SaaS Platform'),
  NEXT_PUBLIC_COMPANY_NAME: z.string().default('Your Company'),
  
  // Supabase (Required for database and auth)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL format').default('https://placeholder.supabase.co'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required').default('placeholder-anon-key'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required').default('placeholder-service-key'),
  SUPABASE_JWT_SECRET: z.string().min(1, 'Supabase JWT secret is required').default('placeholder-jwt-secret'),
  
  // Stripe (Optional for payments - can be set later)
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_', 'Invalid Stripe publishable key format').default('pk_test_placeholder').optional(),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_', 'Invalid Stripe secret key format').default('sk_test_placeholder').optional(),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_', 'Invalid Stripe webhook secret format').optional(),
  
  // Stripe Price IDs (Optional - can be set later)
  STRIPE_STARTER_PRICE_ID: z.string().optional(),
  STRIPE_PRO_PRICE_ID: z.string().optional(),
  STRIPE_ENTERPRISE_PRICE_ID: z.string().optional(),
  
  // Email Configuration (Optional)
  EMAIL_PROVIDER: z.enum(['smtp', 'sendgrid', 'resend']).default('smtp'),
  EMAIL_FROM: z.string().email('Invalid email format').optional(),
  EMAIL_FROM_NAME: z.string().optional(),
  
  // SMTP Configuration (Optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform((val: string) => Number(val)).optional(),
  SMTP_SECURE: z.string().transform((val: string) => val === 'true').optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  
  // Third-party Email Services (Optional)
  SENDGRID_API_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  
  // Social Auth (Optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  
  // Analytics & Monitoring (Optional)
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  
  // Feature Flags
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.string().transform((val: string) => val === 'true').default('true'),
  NEXT_PUBLIC_ENABLE_SOCIAL_AUTH: z.string().transform((val: string) => val === 'true').default('true'),
  NEXT_PUBLIC_ENABLE_SUBSCRIPTIONS: z.string().transform((val: string) => val === 'true').default('true'),
  NEXT_PUBLIC_ENABLE_TEAMS: z.string().transform((val: string) => val === 'true').default('false'),
  NEXT_PUBLIC_ENABLE_API_ACCESS: z.string().transform((val: string) => val === 'true').default('false'),
  NEXT_PUBLIC_ENABLE_DEV_TOOLS: z.string().transform((val: string) => val === 'true').default('false'),
  
  // Subscription Limits
  STARTER_PLAN_LIMIT_PROJECTS: z.string().transform((val: string) => Number(val)).default('3'),
  PRO_PLAN_LIMIT_PROJECTS: z.string().transform((val: string) => Number(val)).default('10'),
  ENTERPRISE_PLAN_LIMIT_PROJECTS: z.string().default('unlimited'),
  
  // Storage & CDN (Optional)
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().default('us-east-1'),
  AWS_S3_BUCKET: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  
  // Security & Rate Limiting
  RATE_LIMIT_MAX_REQUESTS: z.string().transform((val: string) => Number(val)).default('100'),
  RATE_LIMIT_WINDOW_MS: z.string().transform((val: string) => Number(val)).default('900000'),
  CORS_ALLOWED_ORIGINS: z.string().optional(),
  
  // Development & Debugging
  DEBUG: z.string().transform((val: string) => val === 'true').default('false'),
  DEBUG_SQL: z.string().transform((val: string) => val === 'true').default('false'),
  
  // Webhooks & Integrations (Optional)
  SLACK_WEBHOOK_URL: z.string().url().optional(),
  DISCORD_WEBHOOK_URL: z.string().url().optional(),
  
  // AI Services (Optional)
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  
  // Cron Jobs
  CRON_SECRET: z.string().optional(),
});

// Define the type for validated environment variables
export type Env = z.infer<typeof envSchema>;

// Parse and validate environment variables
function parseEnv(): Env {
  try {
    const parsed = envSchema.parse(process.env);
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => {
        const path = err.path.join('.');
        return `${path}: ${err.message}`;
      });
      
      console.error('❌ Environment validation failed:');
      errorMessages.forEach(msg => console.error(`  - ${msg}`));
      
      throw new Error(`Environment validation failed:\n${errorMessages.join('\n')}`);
    }
    throw error;
  }
}

// Validate environment variables on module load
export const env = parseEnv();

// Helper functions for common environment checks
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isStaging = env.NODE_ENV === 'staging';

// Feature flag helpers
export const features = {
  analytics: env.NEXT_PUBLIC_ENABLE_ANALYTICS,
  socialAuth: env.NEXT_PUBLIC_ENABLE_SOCIAL_AUTH,
  subscriptions: env.NEXT_PUBLIC_ENABLE_SUBSCRIPTIONS,
  teams: env.NEXT_PUBLIC_ENABLE_TEAMS,
  apiAccess: env.NEXT_PUBLIC_ENABLE_API_ACCESS,
  devTools: env.NEXT_PUBLIC_ENABLE_DEV_TOOLS,
} as const;

// Subscription plan limits
export const planLimits = {
  starter: {
    projects: env.STARTER_PLAN_LIMIT_PROJECTS,
  },
  pro: {
    projects: env.PRO_PLAN_LIMIT_PROJECTS,
  },
  enterprise: {
    projects: env.ENTERPRISE_PLAN_LIMIT_PROJECTS,
  },
} as const;

// Service availability checks
export const services = {
  hasEmail: Boolean(
    (env.EMAIL_PROVIDER === 'smtp' && env.SMTP_HOST) ||
    (env.EMAIL_PROVIDER === 'sendgrid' && env.SENDGRID_API_KEY) ||
    (env.EMAIL_PROVIDER === 'resend' && env.RESEND_API_KEY)
  ),
  hasGoogleAuth: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
  hasGitHubAuth: Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),
  hasAnalytics: Boolean(env.NEXT_PUBLIC_GA_MEASUREMENT_ID || env.NEXT_PUBLIC_POSTHOG_KEY),
  hasSentry: Boolean(env.NEXT_PUBLIC_SENTRY_DSN),
  hasS3: Boolean(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY && env.AWS_S3_BUCKET),
  hasCloudinary: Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY),
  hasOpenAI: Boolean(env.OPENAI_API_KEY),
  hasAnthropic: Boolean(env.ANTHROPIC_API_KEY),
} as const;

// Environment info for debugging
export const envInfo = {
  environment: env.NODE_ENV,
  appUrl: env.NEXT_PUBLIC_APP_URL,
  appName: env.NEXT_PUBLIC_APP_NAME,
  features,
  services,
  debug: env.DEBUG,
} as const;

// Log environment info in development
if (isDevelopment && env.DEBUG) {
  console.log('🔧 Environment Configuration:', envInfo);
} 