/**
 * Enhanced Environment Configuration System
 * 
 * Extends the existing env.ts with environment-specific configurations,
 * validation, and runtime environment switching capabilities.
 */

import { env, type ClientEnv, type ServerEnv } from './env';
import { 
  getCurrentEnvironment, 
  getEnvironmentConfig, 
  validateEnvironment,
  checkEnvironmentHealth,
  environmentUtils,
  type Environment,
  type EnvironmentConfig
} from '../config/environments';

// Enhanced environment types that include environment-specific metadata
export interface EnhancedClientEnv extends ClientEnv {
  _environment: Environment;
  _config: EnvironmentConfig;
  _validated: boolean;
}

export interface EnhancedServerEnv extends ServerEnv {
  _environment: Environment;
  _config: EnvironmentConfig;
  _validated: boolean;
  _health: {
    overall: 'healthy' | 'warning' | 'error';
    services: Array<{
      name: string;
      status: 'available' | 'missing' | 'misconfigured';
      message?: string;
    }>;
  };
}

// Environment-aware validation cache
const validationCache = new Map<string, {
  environment: Environment;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  timestamp: number;
}>();

const CACHE_TTL = 30 * 1000; // 30 seconds

/**
 * Get environment-specific client configuration with validation
 */
export function getEnhancedClientEnv(): EnhancedClientEnv {
  const environment = getCurrentEnvironment();
  const config = getEnvironmentConfig(environment);
  
  // Check cache first
  const cacheKey = `client-${environment}`;
  const cached = validationCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return {
    ...env,
    _environment: environment,
    _config: config,
    _validated: cached.isValid,
  } as EnhancedClientEnv;
  }
  
  // Validate with environment-specific schema
  const validation = validateEnvironment(process.env, environment);
  
  // Cache the result
  validationCache.set(cacheKey, {
    environment,
    isValid: validation.isValid,
    errors: validation.errors,
    warnings: validation.warnings,
    timestamp: Date.now(),
  });
  
  // Log validation issues in development
  if (environment === 'development' && (!validation.isValid || validation.warnings.length > 0)) {
    if (validation.errors.length > 0) {
      console.error('🚨 Environment validation errors:', validation.errors);
    }
    if (validation.warnings.length > 0) {
      console.warn('⚠️ Environment validation warnings:', validation.warnings);
    }
  }
  
  return {
    ...env,
    _environment: environment,
    _config: config,
    _validated: validation.isValid,
  } as EnhancedClientEnv;
}

/**
 * Get environment-specific server configuration with validation and health checks
 */
export function getEnhancedServerEnv(): EnhancedServerEnv {
  const environment = getCurrentEnvironment();
  const config = getEnvironmentConfig(environment);
  
  // Check cache first
  const cacheKey = `server-${environment}`;
  const cached = validationCache.get(cacheKey);
  
  // Always run health checks for server environment (more critical)
  const health = checkEnvironmentHealth(environment);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return {
      ...env,
      _environment: environment,
      _config: config,
      _validated: cached.isValid,
      _health: {
        overall: health.overall,
        services: health.services,
      },
    } as EnhancedServerEnv;
  }
  
  // Validate with environment-specific schema
  const validation = validateEnvironment(process.env, environment);
  
  // Cache the result
  validationCache.set(cacheKey, {
    environment,
    isValid: validation.isValid,
    errors: validation.errors,
    warnings: validation.warnings,
    timestamp: Date.now(),
  });
  
  // Log critical issues in all environments
  if (!validation.isValid) {
    console.error(`🚨 Critical environment validation errors in ${environment}:`, validation.errors);
  }
  
  if (health.overall === 'error') {
    console.error(`🚨 Critical service issues detected in ${environment}:`, 
      health.services.filter(s => s.status === 'missing' || s.status === 'misconfigured')
    );
  }
  
  return {
    ...env,
    _environment: environment,
    _config: config,
    _validated: validation.isValid,
    _health: {
      overall: health.overall,
      services: health.services,
    },
  } as EnhancedServerEnv;
}

/**
 * Environment configuration middleware for Next.js API routes
 */
export function withEnvironmentValidation<T extends object>(
  handler: (env: EnhancedServerEnv) => T
): T {
  const env = getEnhancedServerEnv();
  
  // Block execution if critical validation fails in production
  if (env._environment === 'production' && !env._validated) {
    throw new Error('Critical environment validation failed in production. Cannot proceed.');
  }
  
  // Warn about issues in other environments
  if (!env._validated && env._environment !== 'production') {
    console.warn(`⚠️ Environment validation failed in ${env._environment}. Some features may not work correctly.`);
  }
  
  return handler(env);
}

/**
 * Environment-aware feature flag helper
 */
export function isFeatureEnabled(feature: keyof EnvironmentConfig['features'], env?: EnhancedClientEnv | EnhancedServerEnv): boolean {
  const environment = env || getEnhancedClientEnv();
  return environment._config.features[feature] || false;
}

/**
 * Environment-specific service availability checker
 */
export function isServiceAvailable(serviceName: string, env?: EnhancedServerEnv): boolean {
  const environment = env || getEnhancedServerEnv();
  const service = environment._health.services.find(s => s.name.toLowerCase().includes(serviceName.toLowerCase()));
  return service?.status === 'available';
}

/**
 * Development-only utilities
 */
export const devUtils = {
  /**
   * Force reload environment configuration (development only)
   */
  reloadEnvironment(): void {
    if (getCurrentEnvironment() !== 'development') {
      console.warn('Environment reload is only available in development');
      return;
    }
    
    validationCache.clear();
    console.log('🔄 Environment configuration reloaded');
  },

  /**
   * Get detailed environment status (development only)
   */
  getEnvironmentStatus(): object {
    if (getCurrentEnvironment() !== 'development') {
      console.warn('Environment status is only available in development');
      return {};
    }
    
    const clientEnv = getEnhancedClientEnv();
    const serverEnv = getEnhancedServerEnv();
    
    return {
      environment: clientEnv._environment,
      client: {
        validated: clientEnv._validated,
        config: clientEnv._config,
      },
      server: {
        validated: serverEnv._validated,
        health: serverEnv._health,
        config: serverEnv._config,
      },
      cache: {
        entries: validationCache.size,
        keys: Array.from(validationCache.keys()),
      },
    };
  },

  /**
   * Generate environment file templates (development only)
   */
  generateEnvTemplate(environment: Environment): string {
    if (getCurrentEnvironment() !== 'development') {
      console.warn('Environment template generation is only available in development');
      return '';
    }
    
    return environmentUtils.generateEnvironmentTemplate(environment);
  },

  /**
   * Validate environment configuration manually (development only)
   */
  validateManually(envVars: Record<string, unknown>, targetEnvironment?: Environment): object {
    if (getCurrentEnvironment() !== 'development') {
      console.warn('Manual validation is only available in development');
      return {};
    }
    
    return validateEnvironment(envVars, targetEnvironment);
  },
};

// Export enhanced environment variables
export const enhancedClientEnv = getEnhancedClientEnv();
export const enhancedServerEnv = typeof window === 'undefined' ? getEnhancedServerEnv() : null;

// Re-export types and utilities
export type { Environment, EnvironmentConfig };
export { 
  getCurrentEnvironment, 
  getEnvironmentConfig, 
  checkEnvironmentHealth,
  environmentUtils,
}; 