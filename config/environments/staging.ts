/**
 * Staging Environment Configuration
 * 
 * Environment-specific configuration for staging environment.
 * These settings mirror production but with staging-specific adjustments
 * for testing and validation.
 */

import { z } from 'zod';
import type { ServerEnv, ClientEnv } from '../../lib/env';

// Staging-specific validation overrides
export const stagingClientEnvOverrides = z.object({
  // App Configuration - staging specific
  NEXT_PUBLIC_APP_NAME: z.string().default('SaaS Kit (Staging)'),
  
  // Supabase - require production-like URLs
  NEXT_PUBLIC_SUPABASE_URL: z.string()
    .url('Invalid Supabase URL')
    .refine(url => url.includes('supabase.co'), {
      message: 'Staging: Should use Supabase hosted instance'
    }),
  
  // Feature Flags - selective enabling for testing
  NEXT_PUBLIC_ENABLE_DEV_TOOLS: z.string().transform(val => val === 'true').default('false'),
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.string().transform(val => val !== 'false').default('true'),
  
  // Stripe - allow both test and live keys for testing
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string()
    .startsWith('pk_', 'Invalid Stripe publishable key format')
    .optional(),
});

export const stagingServerEnvOverrides = z.object({
  // Development & Debugging - limited debugging
  DEBUG: z.string().transform(val => val === 'true').default('false'),
  DEBUG_SQL: z.string().transform(val => val === 'true').default('false'),
  
  // Stripe - allow both test and live keys for staging
  STRIPE_SECRET_KEY: z.string()
    .startsWith('sk_', 'Invalid Stripe secret key format')
    .optional(),
  STRIPE_WEBHOOK_SECRET: z.string()
    .startsWith('whsec_', 'Invalid webhook secret format')
    .optional(),
  
  // Email - require real email configuration
  EMAIL_PROVIDER: z.enum(['smtp', 'sendgrid', 'resend']).default('sendgrid'),
  SENDGRID_API_KEY: z.string().min(1, 'SendGrid API key required in staging').optional(),
  EMAIL_FROM: z.string().email('Valid email address required').optional(),
  
  // Rate Limiting - production-like but more lenient
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(val => Number(val)).default('500'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(val => Number(val)).default('300000'), // 5 minutes
  
  // CORS - specific allowed origins
  CORS_ALLOWED_ORIGINS: z.string().optional(),
  
  // Security - require proper secrets
  NEXTAUTH_SECRET: z.string().min(32, 'NextAuth secret must be at least 32 characters').optional(),
  SUPABASE_JWT_SECRET: z.string().min(1, 'Supabase JWT secret required'),
});

// Staging environment configuration
export const stagingConfig = {
  name: 'staging',
  displayName: 'Staging',
  
  // Feature flags specific to staging
  features: {
    enableHotReload: false,
    enableDebugger: false,
    enableTestData: true, // Keep test data for QA
    enableMockServices: false,
    strictValidation: true, // Production-like validation
    requireHTTPS: true,
  },
  
  // Service configurations
  services: {
    database: {
      poolSize: 10,
      maxConnections: 20,
      enableLogging: false, // Reduce noise
    },
    email: {
      provider: 'sendgrid' as const,
      enableSending: true, // Send real emails for testing
      useMailhog: false,
    },
    payment: {
      provider: 'stripe' as const,
      useTestMode: true, // Still use test mode for safety
      requireWebhooks: true,
    },
    storage: {
      provider: 's3' as const,
      enableCloudStorage: true,
    },
  },
  
  // Security settings
  security: {
    requireHTTPS: true,
    enableCSRF: true,
    sessionTimeout: 8 * 60 * 60 * 1000, // 8 hours
    enableRateLimit: true,
  },
  
  // Performance settings
  performance: {
    enableCaching: true,
    enableCompression: true,
    enableCDN: true,
  },
  
  // Logging configuration
  logging: {
    level: 'info' as const,
    enableConsole: true,
    enableFile: true,
    enableRemote: true, // Send logs to monitoring
  },
  
  // Validation rules
  validation: {
    strictMode: true,
    allowMissingSecrets: false,
    requireAllServices: true,
    skipOptionalChecks: false,
  },
} as const;

// Environment-specific validation function
export function validateStagingEnv(env: Record<string, any>) {
  const errors: string[] = [];
  
  // Check for staging requirements
  if (env.NODE_ENV !== 'staging') {
    errors.push('NODE_ENV should be "staging" for staging environment');
  }
  
  // Require HTTPS
  if (env.NEXT_PUBLIC_APP_URL && !env.NEXT_PUBLIC_APP_URL.startsWith('https://')) {
    errors.push('Staging environment requires HTTPS');
  }
  
  // Validate critical services
  if (!env.NEXT_PUBLIC_SUPABASE_URL) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is required in staging');
  }
  
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY is required in staging');
  }
  
  if (!env.SUPABASE_JWT_SECRET) {
    errors.push('SUPABASE_JWT_SECRET is required in staging');
  }
  
  // Email service validation
  if (!env.EMAIL_FROM && env.EMAIL_PROVIDER !== 'smtp') {
    errors.push('EMAIL_FROM is required for staging email service');
  }
  
  if (env.EMAIL_PROVIDER === 'sendgrid' && !env.SENDGRID_API_KEY) {
    errors.push('SENDGRID_API_KEY is required when using SendGrid');
  }
  
  if (env.EMAIL_PROVIDER === 'resend' && !env.RESEND_API_KEY) {
    errors.push('RESEND_API_KEY is required when using Resend');
  }
  
  // Stripe validation (if subscriptions enabled)
  if (env.NEXT_PUBLIC_ENABLE_SUBSCRIPTIONS !== 'false') {
    if (!env.STRIPE_SECRET_KEY) {
      errors.push('STRIPE_SECRET_KEY is required when subscriptions are enabled');
    }
    
    if (!env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      errors.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required when subscriptions are enabled');
    }
  }
  
  // Security validation
  if (!env.NEXTAUTH_SECRET || env.NEXTAUTH_SECRET.length < 32) {
    errors.push('NEXTAUTH_SECRET must be at least 32 characters in staging');
  }
  
  // Warn about potential issues
  const warnings: string[] = [];
  
  if (env.STRIPE_SECRET_KEY && env.STRIPE_SECRET_KEY.startsWith('sk_live_')) {
    warnings.push('Using live Stripe keys in staging - ensure this is intentional');
  }
  
  if (!env.SENTRY_DSN) {
    warnings.push('SENTRY_DSN not set - error monitoring will not work');
  }
  
  if (warnings.length > 0) {
    console.warn('⚠️  Staging Environment Warnings:');
    warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export type StagingConfig = typeof stagingConfig;
export type StagingClientEnvOverrides = z.infer<typeof stagingClientEnvOverrides>;
export type StagingServerEnvOverrides = z.infer<typeof stagingServerEnvOverrides>; 