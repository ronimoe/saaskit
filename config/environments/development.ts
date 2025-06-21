/**
 * Development Environment Configuration
 * 
 * Environment-specific configuration for development environment.
 * These settings are optimized for local development and debugging.
 */

import { z } from 'zod';
import type { ServerEnv, ClientEnv } from '../../lib/env';

// Development-specific validation overrides
export const developmentClientEnvOverrides = z.object({
  // App Configuration - development defaults
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_NAME: z.string().default('SaaS Kit (Dev)'),
  
  // Supabase - allow localhost URLs in development
  NEXT_PUBLIC_SUPABASE_URL: z.string()
    .refine(url => url.includes('supabase.co') || url.includes('localhost'), {
      message: 'Development: Supabase URL should be supabase.co or localhost'
    }),
  
  // Feature Flags - enable dev tools by default
  NEXT_PUBLIC_ENABLE_DEV_TOOLS: z.string().transform(val => val !== 'false').default('true'),
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.string().transform(val => val !== 'false').default('false'), // Disable analytics in dev
  
  // Stripe - allow test keys only
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string()
    .startsWith('pk_test_', 'Development: Only test Stripe keys allowed')
    .optional(),
});

export const developmentServerEnvOverrides = z.object({
  // Development & Debugging - enabled by default
  DEBUG: z.string().transform(val => val !== 'false').default('true'),
  DEBUG_SQL: z.string().transform(val => val !== 'false').default('false'),
  
  // Stripe - enforce test keys only
  STRIPE_SECRET_KEY: z.string()
    .startsWith('sk_test_', 'Development: Only test Stripe keys allowed')
    .optional(),
  STRIPE_WEBHOOK_SECRET: z.string()
    .startsWith('whsec_', 'Invalid webhook secret format')
    .optional(),
  
  // Email - allow fake SMTP for testing
  EMAIL_PROVIDER: z.enum(['smtp', 'sendgrid', 'resend']).default('smtp'),
  SMTP_HOST: z.string().default('localhost').optional(),
  SMTP_PORT: z.string().transform(val => Number(val)).default('1025').optional(), // Mailhog default
  SMTP_SECURE: z.string().transform(val => val === 'true').default('false').optional(),
  
  // Rate Limiting - more lenient for development
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(val => Number(val)).default('1000'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(val => Number(val)).default('60000'), // 1 minute
  
  // CORS - allow all origins in development
  CORS_ALLOWED_ORIGINS: z.string().default('*').optional(),
  
  // Security - relaxed for development
  NEXTAUTH_SECRET: z.string().default('development-secret-change-in-production').optional(),
});

// Development environment configuration
export const developmentConfig = {
  name: 'development',
  displayName: 'Development',
  
  // Feature flags specific to development
  features: {
    enableHotReload: true,
    enableDebugger: true,
    enableTestData: true,
    enableMockServices: true,
    strictValidation: false, // More lenient validation
    requireHTTPS: false,
  },
  
  // Service configurations
  services: {
    database: {
      poolSize: 5,
      maxConnections: 10,
      enableLogging: true,
    },
    email: {
      provider: 'smtp' as const,
      enableSending: false, // Don't send real emails in dev
      useMailhog: true,
    },
    payment: {
      provider: 'stripe' as const,
      useTestMode: true,
      requireWebhooks: false,
    },
    storage: {
      provider: 'local' as const,
      enableCloudStorage: false,
    },
  },
  
  // Security settings
  security: {
    requireHTTPS: false,
    enableCSRF: false, // Simplified for development
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    enableRateLimit: false, // Disabled for easier testing
  },
  
  // Performance settings
  performance: {
    enableCaching: false, // Disable caching for development
    enableCompression: false,
    enableCDN: false,
  },
  
  // Logging configuration
  logging: {
    level: 'debug' as const,
    enableConsole: true,
    enableFile: false,
    enableRemote: false,
  },
  
  // Validation rules
  validation: {
    strictMode: false,
    allowMissingSecrets: true,
    requireAllServices: false,
    skipOptionalChecks: true,
  },
} as const;

// Environment-specific validation function
export function validateDevelopmentEnv(env: Record<string, any>) {
  const errors: string[] = [];
  
  // Check for common development issues
  if (env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_URL.includes('127.0.0.1')) {
    console.warn('⚠️  Using 127.0.0.1 for Supabase URL. Consider using localhost for consistency.');
  }
  
  if (env.STRIPE_SECRET_KEY && !env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
    errors.push('Development environment should use Stripe test keys only');
  }
  
  if (env.NODE_ENV !== 'development') {
    errors.push('NODE_ENV should be "development" for development environment');
  }
  
  // Warn about missing but optional development tools
  const devToolWarnings: string[] = [];
  
  if (!env.NEXT_PUBLIC_SUPABASE_URL) {
    devToolWarnings.push('NEXT_PUBLIC_SUPABASE_URL not set - database features will not work');
  }
  
  if (!env.STRIPE_SECRET_KEY && env.NEXT_PUBLIC_ENABLE_SUBSCRIPTIONS !== 'false') {
    devToolWarnings.push('STRIPE_SECRET_KEY not set - payment features will not work');
  }
  
  // Log warnings but don't fail validation
  if (devToolWarnings.length > 0) {
    console.warn('🔧 Development Environment Warnings:');
    devToolWarnings.forEach(warning => console.warn(`  - ${warning}`));
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings: devToolWarnings,
  };
}

export type DevelopmentConfig = typeof developmentConfig;
export type DevelopmentClientEnvOverrides = z.infer<typeof developmentClientEnvOverrides>;
export type DevelopmentServerEnvOverrides = z.infer<typeof developmentServerEnvOverrides>; 