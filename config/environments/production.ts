/**
 * Production Environment Configuration
 * 
 * Environment-specific configuration for production environment.
 * These settings prioritize security, performance, and reliability.
 */

import { z } from 'zod';
import type { ServerEnv, ClientEnv } from '../../lib/env';

// Production-specific validation overrides
export const productionClientEnvOverrides = z.object({
  // App Configuration - production branding
  NEXT_PUBLIC_APP_NAME: z.string().min(1, 'App name is required in production'),
  
  // Supabase - require production URLs
  NEXT_PUBLIC_SUPABASE_URL: z.string()
    .url('Invalid Supabase URL')
    .refine(url => url.includes('supabase.co') && !url.includes('localhost'), {
      message: 'Production: Must use Supabase hosted instance'
    }),
  
  // Feature Flags - production defaults
  NEXT_PUBLIC_ENABLE_DEV_TOOLS: z.string().transform(val => val === 'true').default('false'),
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.string().transform(val => val !== 'false').default('true'),
  
  // Stripe - require live keys
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string()
    .startsWith('pk_live_', 'Production: Must use live Stripe keys')
    .optional(),
});

export const productionServerEnvOverrides = z.object({
  // Development & Debugging - disabled in production
  DEBUG: z.string().transform(val => val === 'true').default('false'),
  DEBUG_SQL: z.string().transform(val => val === 'true').default('false'),
  
  // Stripe - require live keys and webhooks
  STRIPE_SECRET_KEY: z.string()
    .startsWith('sk_live_', 'Production: Must use live Stripe keys')
    .optional(),
  STRIPE_WEBHOOK_SECRET: z.string()
    .startsWith('whsec_', 'Invalid webhook secret format')
    .min(1, 'Webhook secret required in production')
    .optional(),
  
  // Email - require real email service
  EMAIL_PROVIDER: z.enum(['sendgrid', 'resend']), // No SMTP in production
  EMAIL_FROM: z.string().email('Valid email address required'),
  EMAIL_FROM_NAME: z.string().min(1, 'Email from name required'),
  
  // Email services - at least one must be configured
  SENDGRID_API_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  
  // Rate Limiting - strict limits
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(val => Number(val)).default('100'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(val => Number(val)).default('900000'), // 15 minutes
  
  // CORS - specific allowed origins only
  CORS_ALLOWED_ORIGINS: z.string().min(1, 'CORS origins must be specified in production'),
  
  // Security - require strong secrets
  NEXTAUTH_SECRET: z.string().min(32, 'NextAuth secret must be at least 32 characters'),
  SUPABASE_JWT_SECRET: z.string().min(1, 'Supabase JWT secret required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key required'),
  
  // Monitoring - required in production
  NEXT_PUBLIC_SENTRY_DSN: z.string().url('Sentry DSN required for production error tracking').optional(),
  
  // Storage - require cloud storage
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
});

// Production environment configuration
export const productionConfig = {
  name: 'production',
  displayName: 'Production',
  
  // Feature flags specific to production
  features: {
    enableHotReload: false,
    enableDebugger: false,
    enableTestData: false,
    enableMockServices: false,
    strictValidation: true,
    requireHTTPS: true,
  },
  
  // Service configurations
  services: {
    database: {
      poolSize: 20,
      maxConnections: 50,
      enableLogging: false, // Disable detailed logging for performance
    },
    email: {
      provider: 'sendgrid' as const,
      enableSending: true,
      useMailhog: false,
    },
    payment: {
      provider: 'stripe' as const,
      useTestMode: false, // Live mode
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
    sessionTimeout: 4 * 60 * 60 * 1000, // 4 hours
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
    level: 'warn' as const, // Only warnings and errors
    enableConsole: false, // No console logs in production
    enableFile: true,
    enableRemote: true,
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
export function validateProductionEnv(env: Record<string, any>) {
  const errors: string[] = [];
  
  // Check for production requirements
  if (env.NODE_ENV !== 'production') {
    errors.push('NODE_ENV must be "production" for production environment');
  }
  
  // Require HTTPS
  if (!env.NEXT_PUBLIC_APP_URL?.startsWith('https://')) {
    errors.push('Production environment requires HTTPS');
  }
  
  // Validate critical services
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_JWT_SECRET',
    'NEXTAUTH_SECRET',
  ];
  
  requiredVars.forEach(varName => {
    if (!env[varName]) {
      errors.push(`${varName} is required in production`);
    }
  });
  
  // Email service validation
  if (!env.EMAIL_FROM) {
    errors.push('EMAIL_FROM is required in production');
  }
  
  if (!env.EMAIL_FROM_NAME) {
    errors.push('EMAIL_FROM_NAME is required in production');
  }
  
  const hasEmailProvider = env.SENDGRID_API_KEY || env.RESEND_API_KEY;
  if (!hasEmailProvider) {
    errors.push('At least one email service (SendGrid or Resend) must be configured');
  }
  
  // Stripe validation (if subscriptions enabled)
  if (env.NEXT_PUBLIC_ENABLE_SUBSCRIPTIONS !== 'false') {
    if (!env.STRIPE_SECRET_KEY) {
      errors.push('STRIPE_SECRET_KEY is required when subscriptions are enabled');
    } else if (!env.STRIPE_SECRET_KEY.startsWith('sk_live_')) {
      errors.push('Production must use live Stripe keys');
    }
    
    if (!env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      errors.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required when subscriptions are enabled');
    } else if (!env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith('pk_live_')) {
      errors.push('Production must use live Stripe publishable keys');
    }
    
    if (!env.STRIPE_WEBHOOK_SECRET) {
      errors.push('STRIPE_WEBHOOK_SECRET is required for production webhooks');
    }
  }
  
  // Security validation
  if (!env.NEXTAUTH_SECRET || env.NEXTAUTH_SECRET.length < 32) {
    errors.push('NEXTAUTH_SECRET must be at least 32 characters');
  }
  
  if (env.NEXTAUTH_SECRET === 'development-secret-change-in-production') {
    errors.push('NEXTAUTH_SECRET must be changed from default development value');
  }
  
  // CORS validation
  if (!env.CORS_ALLOWED_ORIGINS) {
    errors.push('CORS_ALLOWED_ORIGINS must be specified in production');
  } else if (env.CORS_ALLOWED_ORIGINS === '*') {
    errors.push('CORS_ALLOWED_ORIGINS cannot be "*" in production');
  }
  
  // Storage validation
  const hasStorage = (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY && env.AWS_S3_BUCKET) ||
                    (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
  
  if (!hasStorage) {
    errors.push('At least one storage service (AWS S3 or Cloudinary) must be configured');
  }
  
  // Monitoring validation
  if (!env.NEXT_PUBLIC_SENTRY_DSN) {
    errors.push('NEXT_PUBLIC_SENTRY_DSN is required for production error tracking');
  }
  
  // Check for development artifacts
  const devArtifacts = [];
  
  if (env.DEBUG === 'true') {
    devArtifacts.push('DEBUG should be false in production');
  }
  
  if (env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === 'true') {
    devArtifacts.push('DEV_TOOLS should be disabled in production');
  }
  
  if (env.SMTP_HOST === 'localhost' || env.SMTP_HOST === '127.0.0.1') {
    devArtifacts.push('SMTP_HOST should not be localhost in production');
  }
  
  errors.push(...devArtifacts);
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings: [], // No warnings in production - everything must be correct
  };
}

export type ProductionConfig = typeof productionConfig;
export type ProductionClientEnvOverrides = z.infer<typeof productionClientEnvOverrides>;
export type ProductionServerEnvOverrides = z.infer<typeof productionServerEnvOverrides>; 