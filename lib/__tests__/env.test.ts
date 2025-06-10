/**
 * @jest-environment node
 */
import { z } from 'zod';

// Mock process.env before importing the module
const originalEnv = process.env;

describe('env.ts', () => {
  beforeEach(() => {
    jest.resetModules();
    // Clear process.env but keep important Node.js variables
    const nodeVars = ['NODE_ENV', 'PATH', 'HOME', 'USER'];
    process.env = nodeVars.reduce((acc, key) => {
      if (originalEnv[key]) acc[key] = originalEnv[key];
      return acc;
    }, {} as any);
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Environment Validation', () => {
    it('should validate required environment variables', () => {
      // Set up valid environment
      process.env = {
        NODE_ENV: 'development',
        NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
        NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
        SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
        SUPABASE_JWT_SECRET: 'test-jwt-secret',
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
        STRIPE_SECRET_KEY: 'sk_test_123',
      };

      const { env } = require('../env');

      expect(env.NODE_ENV).toBe('development');
      expect(env.NEXT_PUBLIC_APP_URL).toBe('http://localhost:3000');
      expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe('https://test.supabase.co');
      expect(env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe('test-anon-key');
      expect(env.SUPABASE_SERVICE_ROLE_KEY).toBe('test-service-role-key');
      expect(env.SUPABASE_JWT_SECRET).toBe('test-jwt-secret');
      expect(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY).toBe('pk_test_123');
      expect(env.STRIPE_SECRET_KEY).toBe('sk_test_123');
    });

    it('should apply default values for optional variables', () => {
      // Set up minimal required environment
      process.env = {
        NODE_ENV: 'development',
        NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
        NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
        SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
        SUPABASE_JWT_SECRET: 'test-jwt-secret',
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
        STRIPE_SECRET_KEY: 'sk_test_123',
      };

      const { env } = require('../env');

      expect(env.NODE_ENV).toBe('development');
      expect(env.NEXT_PUBLIC_APP_NAME).toBe('SaaS Kit');
      expect(env.NEXT_PUBLIC_APP_DESCRIPTION).toBe('Modern SaaS Platform');
      expect(env.NEXT_PUBLIC_COMPANY_NAME).toBe('Your Company');
      expect(env.EMAIL_PROVIDER).toBe('smtp');
      expect(env.NEXT_PUBLIC_ENABLE_ANALYTICS).toBe(true);
      expect(env.NEXT_PUBLIC_ENABLE_SOCIAL_AUTH).toBe(true);
      expect(env.NEXT_PUBLIC_ENABLE_SUBSCRIPTIONS).toBe(true);
      expect(env.NEXT_PUBLIC_ENABLE_TEAMS).toBe(false);
      expect(env.DEBUG).toBe(false);
    });

    it('should throw error for missing required variables', () => {
      // Missing required Supabase URL - set it to empty string to avoid defaults
      process.env = {
        NODE_ENV: 'development',
        NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
        NEXT_PUBLIC_SUPABASE_URL: '', // Empty string should fail URL validation
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
        SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
        SUPABASE_JWT_SECRET: 'test-jwt-secret',
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
        STRIPE_SECRET_KEY: 'sk_test_123',
      };

      expect(() => {
        require('../env');
      }).toThrow('Environment validation failed');
    });

    it('should validate URL formats', () => {
      process.env = {
        NODE_ENV: 'development',
        NEXT_PUBLIC_APP_URL: 'invalid-url',
        NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
        SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
        SUPABASE_JWT_SECRET: 'test-jwt-secret',
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
        STRIPE_SECRET_KEY: 'sk_test_123',
      };

      expect(() => {
        require('../env');
      }).toThrow('Invalid APP_URL format');
    });

    it('should validate Stripe key formats', () => {
      process.env = {
        NODE_ENV: 'development',
        NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
        NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
        SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
        SUPABASE_JWT_SECRET: 'test-jwt-secret',
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'invalid-key',
        STRIPE_SECRET_KEY: 'sk_test_123',
      };

      expect(() => {
        require('../env');
      }).toThrow('Invalid Stripe publishable key format');
    });

    it('should validate email formats', () => {
      process.env = {
        NODE_ENV: 'development',
        NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
        NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
        SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
        SUPABASE_JWT_SECRET: 'test-jwt-secret',
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
        STRIPE_SECRET_KEY: 'sk_test_123',
        EMAIL_FROM: 'invalid-email',
      };

      expect(() => {
        require('../env');
      }).toThrow('Invalid email format');
    });
  });

  describe('Type Transformations', () => {
    beforeEach(() => {
      // Set up valid base environment
      process.env = {
        NODE_ENV: 'development',
        NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
        NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
        SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
        SUPABASE_JWT_SECRET: 'test-jwt-secret',
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
        STRIPE_SECRET_KEY: 'sk_test_123',
      };
    });

    it('should transform string to boolean for feature flags', () => {
      process.env.NEXT_PUBLIC_ENABLE_ANALYTICS = 'false';
      process.env.DEBUG = 'true';

      const { env } = require('../env');

      expect(env.NEXT_PUBLIC_ENABLE_ANALYTICS).toBe(false);
      expect(env.DEBUG).toBe(true);
    });

    it('should transform string to number for numeric values', () => {
      process.env.SMTP_PORT = '587';
      process.env.RATE_LIMIT_MAX_REQUESTS = '200';
      process.env.STARTER_PLAN_LIMIT_PROJECTS = '5';

      const { env } = require('../env');

      expect(env.SMTP_PORT).toBe(587);
      expect(env.RATE_LIMIT_MAX_REQUESTS).toBe(200);
      expect(env.STARTER_PLAN_LIMIT_PROJECTS).toBe(5);
    });

    it('should handle SMTP_SECURE transformation', () => {
      process.env.SMTP_SECURE = 'true';

      const { env } = require('../env');

      expect(env.SMTP_SECURE).toBe(true);
    });
  });

  describe('Helper Functions', () => {
    beforeEach(() => {
      // Set up valid base environment
      process.env = {
        NODE_ENV: 'development',
        NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
        NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
        SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
        SUPABASE_JWT_SECRET: 'test-jwt-secret',
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
        STRIPE_SECRET_KEY: 'sk_test_123',
      };
    });

    it('should provide environment detection helpers', () => {
      const { isDevelopment, isProduction, isStaging } = require('../env');

      expect(isDevelopment).toBe(true);
      expect(isProduction).toBe(false);
      expect(isStaging).toBe(false);
    });

    it('should provide feature flags object', () => {
      process.env.NEXT_PUBLIC_ENABLE_TEAMS = 'true';
      process.env.NEXT_PUBLIC_ENABLE_API_ACCESS = 'true';

      const { features } = require('../env');

      expect(features.analytics).toBe(true);
      expect(features.socialAuth).toBe(true);
      expect(features.subscriptions).toBe(true);
      expect(features.teams).toBe(true);
      expect(features.apiAccess).toBe(true);
      expect(features.devTools).toBe(false);
    });

    it('should provide plan limits object', () => {
      process.env.STARTER_PLAN_LIMIT_PROJECTS = '3';
      process.env.PRO_PLAN_LIMIT_PROJECTS = '10';
      process.env.ENTERPRISE_PLAN_LIMIT_PROJECTS = 'unlimited';

      const { planLimits } = require('../env');

      expect(planLimits.starter.projects).toBe(3);
      expect(planLimits.pro.projects).toBe(10);
      expect(planLimits.enterprise.projects).toBe('unlimited');
    });
  });

  describe('Service Availability Checks', () => {
    beforeEach(() => {
      // Set up valid base environment
      process.env = {
        NODE_ENV: 'development',
        NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
        NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
        SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
        SUPABASE_JWT_SECRET: 'test-jwt-secret',
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
        STRIPE_SECRET_KEY: 'sk_test_123',
      };
    });

    it('should detect email service availability', () => {
      // Test SMTP
      process.env.EMAIL_PROVIDER = 'smtp';
      process.env.SMTP_HOST = 'smtp.gmail.com';

      let { services } = require('../env');
      expect(services.hasEmail).toBe(true);

      jest.resetModules();

      // Reset environment and test SendGrid
      process.env = {
        NODE_ENV: 'development',
        NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
        NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
        SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
        SUPABASE_JWT_SECRET: 'test-jwt-secret',
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
        STRIPE_SECRET_KEY: 'sk_test_123',
        EMAIL_PROVIDER: 'sendgrid',
        SENDGRID_API_KEY: 'sg-test-key',
      };

      services = require('../env').services;
      expect(services.hasEmail).toBe(true);

      jest.resetModules();

      // Reset environment and test Resend
      process.env = {
        NODE_ENV: 'development',
        NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
        NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
        SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
        SUPABASE_JWT_SECRET: 'test-jwt-secret',
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
        STRIPE_SECRET_KEY: 'sk_test_123',
        EMAIL_PROVIDER: 'resend',
        RESEND_API_KEY: 're-test-key',
      };

      services = require('../env').services;
      expect(services.hasEmail).toBe(true);
    });

    it('should detect social auth availability', () => {
      process.env.GOOGLE_CLIENT_ID = 'google-client-id';
      process.env.GOOGLE_CLIENT_SECRET = 'google-client-secret';
      process.env.GITHUB_CLIENT_ID = 'github-client-id';
      process.env.GITHUB_CLIENT_SECRET = 'github-client-secret';

      const { services } = require('../env');

      expect(services.hasGoogleAuth).toBe(true);
      expect(services.hasGitHubAuth).toBe(true);
    });

    it('should detect analytics availability', () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'GA-12345';

      let { services } = require('../env');
      expect(services.hasAnalytics).toBe(true);

      jest.resetModules();

      // Reset environment and test PostHog
      process.env = {
        NODE_ENV: 'development',
        NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
        NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
        SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
        SUPABASE_JWT_SECRET: 'test-jwt-secret',
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
        STRIPE_SECRET_KEY: 'sk_test_123',
        NEXT_PUBLIC_POSTHOG_KEY: 'ph-key',
      };

      services = require('../env').services;
      expect(services.hasAnalytics).toBe(true);
    });

    it('should detect cloud storage availability', () => {
      process.env.AWS_ACCESS_KEY_ID = 'aws-key';
      process.env.AWS_SECRET_ACCESS_KEY = 'aws-secret';
      process.env.AWS_S3_BUCKET = 'test-bucket';

      let { services } = require('../env');
      expect(services.hasS3).toBe(true);

      jest.resetModules();

      // Reset environment and test Cloudinary
      process.env = {
        NODE_ENV: 'development',
        NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
        NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
        SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
        SUPABASE_JWT_SECRET: 'test-jwt-secret',
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
        STRIPE_SECRET_KEY: 'sk_test_123',
        CLOUDINARY_CLOUD_NAME: 'test-cloud',
        CLOUDINARY_API_KEY: 'cloud-key',
      };

      services = require('../env').services;
      expect(services.hasCloudinary).toBe(true);
    });

    it('should detect AI service availability', () => {
      process.env.OPENAI_API_KEY = 'openai-key';
      process.env.ANTHROPIC_API_KEY = 'anthropic-key';

      const { services } = require('../env');

      expect(services.hasOpenAI).toBe(true);
      expect(services.hasAnthropic).toBe(true);
    });

    it('should detect monitoring service availability', () => {
      process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://sentry.io/test';

      const { services } = require('../env');

      expect(services.hasSentry).toBe(true);
    });
  });

  describe('Environment Info', () => {
    beforeEach(() => {
      // Set up valid base environment
      process.env = {
        NODE_ENV: 'production',
        NEXT_PUBLIC_APP_URL: 'https://myapp.com',
        NEXT_PUBLIC_APP_NAME: 'My SaaS App',
        NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
        SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
        SUPABASE_JWT_SECRET: 'test-jwt-secret',
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
        STRIPE_SECRET_KEY: 'sk_test_123',
        DEBUG: 'false',
      };
    });

    it('should provide environment info object', () => {
      const { envInfo } = require('../env');

      expect(envInfo.environment).toBe('production');
      expect(envInfo.appUrl).toBe('https://myapp.com');
      expect(envInfo.appName).toBe('My SaaS App');
      expect(envInfo.debug).toBe(false);
      expect(envInfo.features).toBeDefined();
      expect(envInfo.services).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should provide detailed error messages for validation failures', () => {
      // Set up environment with multiple validation errors
      process.env = {
        NODE_ENV: 'development',
        NEXT_PUBLIC_APP_URL: 'invalid-url',
        NEXT_PUBLIC_SUPABASE_URL: 'invalid-url',
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'invalid-key',
        EMAIL_FROM: 'invalid-email',
      };

      let errorMessage = '';
      try {
        require('../env');
      } catch (error) {
        errorMessage = error.message;
      }

      expect(errorMessage).toContain('Environment validation failed');
      expect(errorMessage).toContain('NEXT_PUBLIC_APP_URL');
      expect(errorMessage).toContain('NEXT_PUBLIC_SUPABASE_URL');
      expect(errorMessage).toContain('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      // Set up valid base environment
      process.env = {
        NODE_ENV: 'development',
        NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
        NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
        SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
        SUPABASE_JWT_SECRET: 'test-jwt-secret',
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
        STRIPE_SECRET_KEY: 'sk_test_123',
      };
    });

    it('should handle empty string environment variables', () => {
      process.env.GOOGLE_CLIENT_ID = '';
      process.env.SMTP_HOST = '';

      const { services } = require('../env');

      expect(services.hasGoogleAuth).toBe(false);
      expect(services.hasEmail).toBe(false);
    });

    it('should handle optional webhook secret for Stripe', () => {
      // Without webhook secret
      const { env: envWithoutWebhook } = require('../env');
      expect(envWithoutWebhook.STRIPE_WEBHOOK_SECRET).toBeUndefined();

      jest.resetModules();

      // With webhook secret
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test123';
      const { env: envWithWebhook } = require('../env');
      expect(envWithWebhook.STRIPE_WEBHOOK_SECRET).toBe('whsec_test123');
    });

    it('should validate webhook secret format when provided', () => {
      process.env.STRIPE_WEBHOOK_SECRET = 'invalid-webhook-secret';

      expect(() => {
        require('../env');
      }).toThrow('Invalid Stripe webhook secret format');
    });

    it('should handle NODE_ENV validation', () => {
      process.env.NODE_ENV = 'invalid';

      expect(() => {
        require('../env');
      }).toThrow();
    });
  });
}); 