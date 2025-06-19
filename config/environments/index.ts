/**
 * Environment Manager
 * 
 * Central system for managing environment-specific configurations,
 * validation, and runtime environment switching.
 */

import { z } from 'zod';

// Import environment-specific configurations
import {
  developmentConfig,
  developmentClientEnvOverrides,
  developmentServerEnvOverrides,
  validateDevelopmentEnv,
  type DevelopmentConfig,
} from './development';

import {
  stagingConfig,
  stagingClientEnvOverrides,
  stagingServerEnvOverrides,
  validateStagingEnv,
  type StagingConfig,
} from './staging';

import {
  productionConfig,
  productionClientEnvOverrides,
  productionServerEnvOverrides,
  validateProductionEnv,
  type ProductionConfig,
} from './production';

// Environment types
export type Environment = 'development' | 'staging' | 'production';
export type EnvironmentConfig = DevelopmentConfig | StagingConfig | ProductionConfig;

// Environment configuration registry
export const environmentConfigs = {
  development: developmentConfig,
  staging: stagingConfig,
  production: productionConfig,
} as const;

// Environment validation functions
export const environmentValidators = {
  development: validateDevelopmentEnv,
  staging: validateStagingEnv,
  production: validateProductionEnv,
} as const;

// Environment schema overrides
export const environmentClientOverrides = {
  development: developmentClientEnvOverrides,
  staging: stagingClientEnvOverrides,
  production: productionClientEnvOverrides,
} as const;

export const environmentServerOverrides = {
  development: developmentServerEnvOverrides,
  staging: stagingServerEnvOverrides,
  production: productionServerEnvOverrides,
} as const;

// Core utility functions
export function getCurrentEnvironment(): Environment {
  const nodeEnv = process.env.NODE_ENV as string;
  
  if (nodeEnv === 'production') return 'production';
  if (nodeEnv === 'staging') return 'staging';
  return 'development'; // Default to development
}

export function getEnvironmentConfig(env?: Environment): EnvironmentConfig {
  const currentEnv = env || getCurrentEnvironment();
  return environmentConfigs[currentEnv];
}

export function validateEnvironment(env: Record<string, any>, environment?: Environment): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  environment: Environment;
  config: EnvironmentConfig;
} {
  const currentEnv = environment || getCurrentEnvironment();
  const config = getEnvironmentConfig(currentEnv);
  const validator = environmentValidators[currentEnv];
  
  // Run environment-specific validation
  const result = validator(env);
  
  return {
    ...result,
    environment: currentEnv,
    config,
  };
}

// Create environment-aware Zod schemas
export function getEnvironmentClientSchema(environment?: Environment) {
  const currentEnv = environment || getCurrentEnvironment();
  const baseSchema = z.object({
    NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
    NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
    NEXT_PUBLIC_APP_NAME: z.string().default('SaaS Kit'),
    NEXT_PUBLIC_APP_DESCRIPTION: z.string().default('Modern SaaS Platform'),
    NEXT_PUBLIC_COMPANY_NAME: z.string().default('Your Company'),
    NEXT_PUBLIC_SUPABASE_URL: z.string(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().optional(),
    NEXT_PUBLIC_GITHUB_CLIENT_ID: z.string().optional(),
    NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
    NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
    NEXT_PUBLIC_ENABLE_ANALYTICS: z.string().transform(val => val !== 'false').default('true'),
    NEXT_PUBLIC_ENABLE_SOCIAL_AUTH: z.string().transform(val => val !== 'false').default('true'),
    NEXT_PUBLIC_ENABLE_SUBSCRIPTIONS: z.string().transform(val => val !== 'false').default('true'),
    NEXT_PUBLIC_ENABLE_TEAMS: z.string().transform(val => val === 'true').default('false'),
    NEXT_PUBLIC_ENABLE_API_ACCESS: z.string().transform(val => val === 'true').default('false'),
    NEXT_PUBLIC_ENABLE_DEV_TOOLS: z.string().transform(val => val === 'true').default('false'),
  });
  
  // Merge with environment-specific overrides
  const envOverrides = environmentClientOverrides[currentEnv];
  return baseSchema.merge(envOverrides.partial()); // Use partial to allow overrides
}

export function getEnvironmentServerSchema(environment?: Environment) {
  const currentEnv = environment || getCurrentEnvironment();
  const clientSchema = getEnvironmentClientSchema(currentEnv);
  
  const serverExtensions = z.object({
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    SUPABASE_JWT_SECRET: z.string().min(1),
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    EMAIL_PROVIDER: z.enum(['smtp', 'sendgrid', 'resend']).default('smtp'),
    EMAIL_FROM: z.string().email().optional(),
    EMAIL_FROM_NAME: z.string().optional(),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.string().transform(val => Number(val)).optional(),
    SMTP_SECURE: z.string().transform(val => val === 'true').optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    SENDGRID_API_KEY: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    AWS_REGION: z.string().default('us-east-1'),
    AWS_S3_BUCKET: z.string().optional(),
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
    RATE_LIMIT_MAX_REQUESTS: z.string().transform(val => Number(val)).default('100'),
    RATE_LIMIT_WINDOW_MS: z.string().transform(val => Number(val)).default('900000'),
    CORS_ALLOWED_ORIGINS: z.string().optional(),
    DEBUG: z.string().transform(val => val === 'true').default('false'),
    DEBUG_SQL: z.string().transform(val => val === 'true').default('false'),
    NEXTAUTH_SECRET: z.string().optional(),
  });
  
  // Merge client schema with server extensions and environment overrides
  const envOverrides = environmentServerOverrides[currentEnv];
  return clientSchema.extend(serverExtensions.shape).merge(envOverrides.partial());
}

// Environment health check
export function checkEnvironmentHealth(environment?: Environment) {
  const currentEnv = environment || getCurrentEnvironment();
  const config = getEnvironmentConfig(currentEnv);
  const validation = validateEnvironment(process.env, currentEnv);
  
  // Check service availability
  const services = [
    {
      name: 'Database (Supabase)',
      status: (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY 
        ? 'available' 
        : 'missing') as 'available' | 'missing' | 'misconfigured',
      message: !process.env.NEXT_PUBLIC_SUPABASE_URL 
        ? 'NEXT_PUBLIC_SUPABASE_URL not configured'
        : !process.env.SUPABASE_SERVICE_ROLE_KEY 
        ? 'SUPABASE_SERVICE_ROLE_KEY not configured'
        : undefined,
    },
    {
      name: 'Email Service',
      status: (() => {
        if (config.services.email.provider === 'smtp' && process.env.SMTP_HOST) return 'available';
        if (config.services.email.provider === 'sendgrid' && process.env.SENDGRID_API_KEY) return 'available';
        if (process.env.RESEND_API_KEY) return 'available'; // Check for resend separately
        return 'missing';
      })() as 'available' | 'missing' | 'misconfigured',
    },
    {
      name: 'Payment Processing (Stripe)',
      status: (process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
        ? 'available'
        : process.env.NEXT_PUBLIC_ENABLE_SUBSCRIPTIONS === 'false'
        ? 'available' // Not required if subscriptions disabled
        : 'missing') as 'available' | 'missing' | 'misconfigured',
    },
    {
      name: 'File Storage',
      status: (() => {
        const hasS3 = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_S3_BUCKET;
        const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY;
        return hasS3 || hasCloudinary ? 'available' : 'missing';
      })() as 'available' | 'missing' | 'misconfigured',
    },
  ];
  
  // Determine overall health
  const hasErrors = !validation.isValid;
  const hasMissingServices = services.some(service => 
    service.status === 'missing' && config.validation.requireAllServices
  );
  
  let overall: 'healthy' | 'warning' | 'error';
  if (hasErrors || (hasMissingServices && currentEnv === 'production')) {
    overall = 'error';
  } else if (hasMissingServices || validation.warnings.length > 0) {
    overall = 'warning';
  } else {
    overall = 'healthy';
  }
  
  return {
    environment: currentEnv,
    config,
    validation,
    services,
    overall,
  };
}

// Environment configuration utilities
export const environmentUtils = {
  loadEnvironmentFiles(environment?: Environment): string[] {
    const currentEnv = environment || getCurrentEnvironment();
    
    // Define load order (most specific to least specific)
    return [
      `.env.${currentEnv}.local`,    // Most specific
      `.env.local`,                  // Local overrides
      `.env.${currentEnv}`,          // Environment specific
      `.env`,                        // Base environment
    ];
  },

  generateEnvironmentTemplate(environment: Environment): string {
    const config = getEnvironmentConfig(environment);
    
    let template = `# Environment Configuration for ${config.displayName}\n`;
    template += `NODE_ENV=${environment}\n\n`;
    
    // Add environment-specific variables based on config
    template += '# Required variables\n';
    template += 'NEXT_PUBLIC_SUPABASE_URL=\n';
    template += 'SUPABASE_SERVICE_ROLE_KEY=\n';
    
    if (environment === 'production') {
      template += '\n# Production-specific\n';
      template += 'NEXTAUTH_SECRET=\n';
      template += 'CORS_ALLOWED_ORIGINS=\n';
    }
    
    return template;
  }
}; 