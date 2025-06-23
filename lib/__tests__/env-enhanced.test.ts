// Mock all dependencies first before any imports
jest.mock('@/lib/env', () => ({
  env: {
    NODE_ENV: 'test',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
  },
}))

jest.mock('@/config/environments', () => ({
  getCurrentEnvironment: jest.fn(() => 'development'),
  getEnvironmentConfig: jest.fn(() => ({
    name: 'development',
    features: {
      analytics: true,
      socialAuth: true,
      subscriptions: true,
      teams: false,
      devTools: true,
    },
    services: {
      email: {
        provider: 'smtp',
        from: 'test@example.com',
      },
      storage: {
        provider: 'local',
        maxFileSize: 10 * 1024 * 1024,
      },
    },
    database: {
      maxConnections: 10,
      enableLogging: true,
    },
    monitoring: {
      enableMetrics: true,
      enableTracing: false,
    },
  })),
  validateEnvironment: jest.fn(() => ({
    isValid: true,
    errors: [],
    warnings: [],
    environment: 'development',
    config: {},
  })),
  checkEnvironmentHealth: jest.fn(() => ({
    overall: 'healthy',
    services: [
      {
        name: 'Database (Supabase)',
        status: 'available',
      },
      {
        name: 'Email Service',
        status: 'available',
      },
    ],
  })),
  environmentUtils: {
    generateEnvironmentTemplate: jest.fn(() => '# Template content'),
  },
}))

// Mock window object to control client/server detection
;(global as any).window = undefined

// Now import the module after mocks are set up
import {
  getEnhancedClientEnv,
  getEnhancedServerEnv,
  withEnvironmentValidation,
  isFeatureEnabled,
  isServiceAvailable,
  devUtils,
  type EnhancedClientEnv,
  type EnhancedServerEnv,
} from '@/lib/env-enhanced'

// Set up mocks with proper typing
import { getCurrentEnvironment, getEnvironmentConfig, validateEnvironment, checkEnvironmentHealth, environmentUtils } from '@/config/environments'

const mockGetCurrentEnvironment = getCurrentEnvironment as jest.MockedFunction<typeof getCurrentEnvironment>
const mockGetEnvironmentConfig = getEnvironmentConfig as jest.MockedFunction<typeof getEnvironmentConfig>
const mockValidateEnvironment = validateEnvironment as jest.MockedFunction<typeof validateEnvironment>
const mockCheckEnvironmentHealth = checkEnvironmentHealth as jest.MockedFunction<typeof checkEnvironmentHealth>
const mockEnvironmentUtils = environmentUtils as jest.Mocked<typeof environmentUtils>

// Mock console methods to test logging
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation()
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation()
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation()

// Mock Date.now for cache testing
const mockDateNow = jest.spyOn(Date, 'now')

describe('Enhanced Environment Configuration', () => {
  // Mock data matching actual EnvironmentConfig structure
  const mockConfig = {
    name: 'development',
    displayName: 'Development',
    features: {
      enableHotReload: true,
      enableDebugger: true,
      enableTestData: true,
      enableMockServices: true,
      strictValidation: false,
      requireHTTPS: false,
    },
    services: {
      database: {
        poolSize: 5,
        maxConnections: 10,
        enableLogging: true,
      },
      email: {
        provider: 'smtp' as const,
        enableSending: false,
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
    security: {
      requireHTTPS: false,
      enableCSRF: false,
      sessionTimeout: 24 * 60 * 60 * 1000,
      enableRateLimit: false,
    },
    performance: {
      enableCaching: false,
      enableCompression: false,
      enableCDN: false,
    },
    logging: {
      level: 'debug' as const,
      enableConsole: true,
      enableFile: false,
      enableRemote: false,
    },
    validation: {
      strictMode: false,
      allowMissingSecrets: true,
      requireAllServices: false,
      skipOptionalChecks: true,
    },
  } as const

  const mockValidation = {
    isValid: true,
    errors: [],
    warnings: [],
    environment: 'development' as const,
    config: mockConfig,
  }

  const mockHealth = {
    environment: 'development' as const,
    config: mockConfig,
    validation: mockValidation,
    services: [
      {
        name: 'Database (Supabase)',
        status: 'available' as const,
      },
      {
        name: 'Email Service',
        status: 'available' as const,
      },
    ],
    overall: 'healthy' as const,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Clear the validation cache between tests
    const { devUtils } = require('@/lib/env-enhanced')
    if (typeof devUtils.reloadEnvironment === 'function') {
      devUtils.reloadEnvironment()
    }
    
    // Set up default mocks
    mockGetCurrentEnvironment.mockReturnValue('development')
    mockGetEnvironmentConfig.mockReturnValue(mockConfig)
    mockValidateEnvironment.mockReturnValue(mockValidation)
    mockCheckEnvironmentHealth.mockReturnValue(mockHealth)
    mockDateNow.mockReturnValue(1000000) // Fixed timestamp for testing
  })

  afterEach(() => {
    mockConsoleLog.mockClear()
    mockConsoleWarn.mockClear()
    mockConsoleError.mockClear()
  })

  describe('getEnhancedClientEnv', () => {
    it('should return enhanced client environment with validation', () => {
      const result = getEnhancedClientEnv()

      expect(result).toEqual(
        expect.objectContaining({
          NODE_ENV: 'test',
          NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
          _environment: 'development',
          _config: mockConfig,
          _validated: true,
        })
      )
      
      expect(mockGetCurrentEnvironment).toHaveBeenCalled()
      expect(mockGetEnvironmentConfig).toHaveBeenCalledWith('development')
      expect(mockValidateEnvironment).toHaveBeenCalledWith(process.env, 'development')
    })

    it('should use cached validation when cache is fresh', () => {
      // First call to populate cache
      getEnhancedClientEnv()
      
      // Reset mock call count
      mockValidateEnvironment.mockClear()
      
      // Second call should use cache
      const result = getEnhancedClientEnv()
      
      expect(result._validated).toBe(true)
      expect(mockValidateEnvironment).not.toHaveBeenCalled() // Should use cache
    })

    it('should refresh cache when TTL expires', () => {
      // First call
      mockDateNow.mockReturnValue(1000000)
      getEnhancedClientEnv()
      
      // Move time forward beyond cache TTL (30 seconds)
      mockDateNow.mockReturnValue(1000000 + 35000)
      
      // Reset mock to count only subsequent calls
      mockValidateEnvironment.mockClear()
      getEnhancedClientEnv()
      
      expect(mockValidateEnvironment).toHaveBeenCalledTimes(1)
    })

    it('should log validation errors in development', () => {
      mockValidateEnvironment.mockReturnValue({
        ...mockValidation,
        isValid: false,
        errors: ['Missing required env var'],
        warnings: ['Deprecated config used'],
      })

      getEnhancedClientEnv()

      expect(mockConsoleError).toHaveBeenCalledWith(
        '🚨 Environment validation errors:',
        ['Missing required env var']
      )
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '⚠️ Environment validation warnings:',
        ['Deprecated config used']
      )
    })

    it('should not log in non-development environments', () => {
      mockGetCurrentEnvironment.mockReturnValue('production')
      mockValidateEnvironment.mockReturnValue({
        ...mockValidation,
        isValid: false,
        errors: ['Missing required env var'],
      })

      getEnhancedClientEnv()

      expect(mockConsoleError).not.toHaveBeenCalled()
    })
  })

  describe('getEnhancedServerEnv', () => {
    it('should return enhanced server environment with health checks', () => {
      const result = getEnhancedServerEnv()

      expect(result).toEqual(
        expect.objectContaining({
          NODE_ENV: 'test',
          _environment: 'development',
          _config: mockConfig,
          _validated: true,
          _health: {
            overall: 'healthy',
            services: mockHealth.services,
          },
        })
      )
      
      expect(mockCheckEnvironmentHealth).toHaveBeenCalledWith('development')
    })

    it('should always run health checks even with cache', () => {
      // First call
      getEnhancedServerEnv()
      
      // Second call should still run health checks
      getEnhancedServerEnv()
      
      expect(mockCheckEnvironmentHealth).toHaveBeenCalledTimes(2)
    })

    it('should log critical validation errors in all environments', () => {
      mockValidateEnvironment.mockReturnValue({
        ...mockValidation,
        isValid: false,
        errors: ['Critical error'],
      })

      getEnhancedServerEnv()

      expect(mockConsoleError).toHaveBeenCalledWith(
        '🚨 Critical environment validation errors in development:',
        ['Critical error']
      )
    })

    it('should log critical service issues', () => {
      mockCheckEnvironmentHealth.mockReturnValue({
        environment: 'development',
        config: mockConfig,
        validation: mockValidation,
        overall: 'error',
        services: [
          {
            name: 'Database',
            status: 'missing',
          },
          {
            name: 'Email',
            status: 'available',
          },
        ],
      })

      getEnhancedServerEnv()

      expect(mockConsoleError).toHaveBeenCalledWith(
        '🚨 Critical service issues detected in development:',
        [{ name: 'Database', status: 'missing' }]
      )
    })
  })

  describe('withEnvironmentValidation', () => {
    it('should execute handler with valid environment', () => {
      const mockHandler = jest.fn().mockReturnValue({ success: true })
      
      const result = withEnvironmentValidation(mockHandler)
      
      expect(result).toEqual({ success: true })
      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          _environment: 'development',
          _validated: true,
        })
      )
    })

    it('should throw error in production with invalid environment', () => {
      mockGetCurrentEnvironment.mockReturnValue('production')
      mockValidateEnvironment.mockReturnValue({
        ...mockValidation,
        isValid: false,
        errors: ['Critical error'],
      })
      
      const mockHandler = jest.fn()
      
      expect(() => withEnvironmentValidation(mockHandler)).toThrow(
        'Critical environment validation failed in production. Cannot proceed.'
      )
      expect(mockHandler).not.toHaveBeenCalled()
    })

    it('should warn but continue in non-production with invalid environment', () => {
      mockValidateEnvironment.mockReturnValue({
        ...mockValidation,
        isValid: false,
        errors: ['Non-critical error'],
      })
      
      const mockHandler = jest.fn().mockReturnValue({ success: true })
      
      const result = withEnvironmentValidation(mockHandler)
      
      expect(result).toEqual({ success: true })
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '⚠️ Environment validation failed in development. Some features may not work correctly.'
      )
    })
  })

  describe('isFeatureEnabled', () => {
    it('should return feature flag status from config', () => {
      const result = isFeatureEnabled('enableDebugger')
      
      expect(result).toBe(true)
    })

    it('should return false for missing features', () => {
      const result = isFeatureEnabled('requireHTTPS')
      
      expect(result).toBe(false)
    })

    it('should use provided environment', () => {
      const customEnv = {
        _config: {
          features: {
            enableDebugger: false,
          },
        },
      } as unknown as EnhancedClientEnv
      
      const result = isFeatureEnabled('enableDebugger', customEnv)
      
      expect(result).toBe(false)
    })

    it('should return false for undefined features', () => {
      const result = isFeatureEnabled('nonexistentFeature' as any)
      
      expect(result).toBe(false)
    })
  })

  describe('isServiceAvailable', () => {
    it('should return true for available services', () => {
      const result = isServiceAvailable('Database')
      
      expect(result).toBe(true)
    })

    it('should return false for missing services', () => {
      mockCheckEnvironmentHealth.mockReturnValue({
        environment: 'development',
        config: mockConfig,
        validation: mockValidation,
        overall: 'warning',
        services: [
          {
            name: 'Database',
            status: 'missing',
          },
        ],
      })
      
      const result = isServiceAvailable('Database')
      
      expect(result).toBe(false)
    })

    it('should handle partial service name matching', () => {
      const result = isServiceAvailable('supabase') // Should match "Database (Supabase)"
      
      expect(result).toBe(true)
    })

    it('should return false for non-existent services', () => {
      const result = isServiceAvailable('NonExistentService')
      
      expect(result).toBe(false)
    })

    it('should use provided environment', () => {
      const customEnv = {
        _health: {
          services: [
            {
              name: 'Test Service',
              status: 'available' as const,
            },
          ],
        },
      } as EnhancedServerEnv
      
      const result = isServiceAvailable('Test', customEnv)
      
      expect(result).toBe(true)
    })
  })

  describe('devUtils', () => {
    beforeEach(() => {
      mockGetCurrentEnvironment.mockReturnValue('development')
    })

    describe('reloadEnvironment', () => {
      it('should clear cache and log message in development', () => {
        devUtils.reloadEnvironment()
        
        expect(mockConsoleLog).toHaveBeenCalledWith('🔄 Environment configuration reloaded')
      })

      it('should warn when not in development', () => {
        mockGetCurrentEnvironment.mockReturnValue('production')
        
        // Clear previous calls since beforeEach may have called reloadEnvironment in development mode
        mockConsoleLog.mockClear()
        mockConsoleWarn.mockClear()
        
        devUtils.reloadEnvironment()
        
        expect(mockConsoleWarn).toHaveBeenCalledWith('Environment reload is only available in development')
        expect(mockConsoleLog).not.toHaveBeenCalled()
      })
    })

    describe('getEnvironmentStatus', () => {
      it('should return detailed status in development', () => {
        const status = devUtils.getEnvironmentStatus()
        
        expect(status).toEqual({
          environment: 'development',
          client: {
            validated: true,
            config: mockConfig,
          },
          server: {
            validated: true,
            health: {
              overall: 'healthy',
              services: mockHealth.services,
            },
            config: mockConfig,
          },
          cache: {
            entries: expect.any(Number),
            keys: expect.any(Array),
          },
        })
      })

      it('should return empty object when not in development', () => {
        mockGetCurrentEnvironment.mockReturnValue('production')
        
        const status = devUtils.getEnvironmentStatus()
        
        expect(status).toEqual({})
        expect(mockConsoleWarn).toHaveBeenCalledWith('Environment status is only available in development')
      })
    })

    describe('generateEnvTemplate', () => {
      it('should generate template in development', () => {
        const template = devUtils.generateEnvTemplate('staging')
        
        expect(template).toBe('# Template content')
        expect(mockEnvironmentUtils.generateEnvironmentTemplate).toHaveBeenCalledWith('staging')
      })

      it('should return empty string when not in development', () => {
        mockGetCurrentEnvironment.mockReturnValue('production')
        
        const template = devUtils.generateEnvTemplate('staging')
        
        expect(template).toBe('')
        expect(mockConsoleWarn).toHaveBeenCalledWith('Environment template generation is only available in development')
      })
    })

    describe('validateManually', () => {
      it('should validate environment in development', () => {
        const envVars = { TEST_VAR: 'value' }
        
        const result = devUtils.validateManually(envVars, 'staging')
        
        expect(result).toEqual(mockValidation)
        expect(mockValidateEnvironment).toHaveBeenCalledWith(envVars, 'staging')
      })

      it('should return empty object when not in development', () => {
        mockGetCurrentEnvironment.mockReturnValue('production')
        
        const result = devUtils.validateManually({ TEST_VAR: 'value' })
        
        expect(result).toEqual({})
        expect(mockConsoleWarn).toHaveBeenCalledWith('Manual validation is only available in development')
      })
    })
  })

  describe('Error handling', () => {
    it('should handle validation function errors gracefully', () => {
      mockValidateEnvironment.mockImplementation(() => {
        throw new Error('Validation failed')
      })
      
      expect(() => getEnhancedClientEnv()).toThrow('Validation failed')
    })

    it('should handle health check errors gracefully', () => {
      mockCheckEnvironmentHealth.mockImplementation(() => {
        throw new Error('Health check failed')
      })
      
      expect(() => getEnhancedServerEnv()).toThrow('Health check failed')
    })

    it('should handle missing config gracefully', () => {
      mockGetEnvironmentConfig.mockReturnValue(null as any)
      
      // Should still function with null config
      expect(() => getEnhancedClientEnv()).not.toThrow()
    })
  })

  describe('Cache TTL behavior', () => {
    it('should respect cache TTL for client environment', () => {
      // Initial call
      mockDateNow.mockReturnValue(1000000)
      getEnhancedClientEnv()
      
      // Within TTL - should use cache
      mockDateNow.mockReturnValue(1000000 + 15000) // 15 seconds later
      mockValidateEnvironment.mockClear()
      getEnhancedClientEnv()
      expect(mockValidateEnvironment).not.toHaveBeenCalled()
      
      // Beyond TTL - should refresh
      mockDateNow.mockReturnValue(1000000 + 35000) // 35 seconds later
      getEnhancedClientEnv()
      expect(mockValidateEnvironment).toHaveBeenCalledTimes(1)
    })

    it('should respect cache TTL for server environment', () => {
      // Initial call
      mockDateNow.mockReturnValue(1000000)
      getEnhancedServerEnv()
      
      // Within TTL - should use cache for validation but always check health
      mockDateNow.mockReturnValue(1000000 + 15000)
      mockValidateEnvironment.mockClear()
      mockCheckEnvironmentHealth.mockClear()
      getEnhancedServerEnv()
      
      expect(mockValidateEnvironment).not.toHaveBeenCalled() // Cached
      expect(mockCheckEnvironmentHealth).toHaveBeenCalledTimes(1) // Always called
    })
  })

  describe('Environment-specific behavior', () => {
    it('should handle staging environment', () => {
      mockGetCurrentEnvironment.mockReturnValue('staging')
      
      const result = getEnhancedClientEnv()
      
      expect(result._environment).toBe('staging')
      expect(mockGetEnvironmentConfig).toHaveBeenCalledWith('staging')
    })

    it('should handle production environment', () => {
      mockGetCurrentEnvironment.mockReturnValue('production')
      
      const result = getEnhancedServerEnv()
      
      expect(result._environment).toBe('production')
      expect(mockCheckEnvironmentHealth).toHaveBeenCalledWith('production')
    })
  })
})