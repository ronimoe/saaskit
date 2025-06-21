import { z } from 'zod';

// ===== FEATURE FLAG TYPES =====

export type FeatureFlagValue = boolean | number | string;

export type UserContext = {
  id?: string;
  email?: string;
  role?: 'admin' | 'user' | 'guest' | string;
  groups?: string[];
  metadata?: Record<string, unknown>;
};

export type EnvironmentContext = {
  environment: 'development' | 'staging' | 'production';
  version?: string;
  buildId?: string;
};

// ===== FEATURE FLAG RULES =====

const PercentageRuleSchema = z.object({
  type: z.literal('percentage'),
  percentage: z.number().min(0).max(100),
  seed: z.string().optional(),
});

const RoleRuleSchema = z.object({
  type: z.literal('role'),
  roles: z.array(z.string()),
  operator: z.enum(['in', 'not_in']).default('in'),
});

const UserRuleSchema = z.object({
  type: z.literal('user'),
  userIds: z.array(z.string()),
  operator: z.enum(['in', 'not_in']).default('in'),
});

const EnvironmentRuleSchema = z.object({
  type: z.literal('environment'),
  environments: z.array(z.enum(['development', 'staging', 'production'])),
  operator: z.enum(['in', 'not_in']).default('in'),
});

const DateRuleSchema = z.object({
  type: z.literal('date'),
  start: z.string().datetime().optional(),
  end: z.string().datetime().optional(),
});

const GroupRuleSchema = z.object({
  type: z.literal('group'),
  groups: z.array(z.string()),
  operator: z.enum(['in', 'not_in']).default('in'),
});

const FeatureFlagRuleSchema = z.union([
  PercentageRuleSchema,
  RoleRuleSchema,
  UserRuleSchema,
  EnvironmentRuleSchema,
  DateRuleSchema,
  GroupRuleSchema,
]);

// ===== FEATURE FLAG CONFIGURATION =====

const FeatureFlagConfigSchema = z.object({
  key: z.string(),
  name: z.string(),
  description: z.string().optional(),
  enabled: z.boolean().default(false),
  defaultValue: z.union([z.boolean(), z.number(), z.string()]),
  rules: z.array(FeatureFlagRuleSchema).default([]),
  rolloutValue: z.union([z.boolean(), z.number(), z.string()]).optional(),
  tags: z.array(z.string()).default([]),
  deprecated: z.boolean().default(false),
  deprecationDate: z.string().datetime().optional(),
  owner: z.string().optional(),
  createdAt: z.string().datetime().default(() => new Date().toISOString()),
  updatedAt: z.string().datetime().default(() => new Date().toISOString()),
});

const FeatureFlagsConfigSchema = z.object({
  flags: z.array(FeatureFlagConfigSchema),
  globalRules: z.array(FeatureFlagRuleSchema).default([]),
  environments: z.object({
    development: z.object({
      overrides: z.record(z.string(), z.union([z.boolean(), z.number(), z.string()])),
    }).optional(),
    test: z.object({
      overrides: z.record(z.string(), z.union([z.boolean(), z.number(), z.string()])),
    }).optional(),
    staging: z.object({
      overrides: z.record(z.string(), z.union([z.boolean(), z.number(), z.string()])),
    }).optional(),
    production: z.object({
      overrides: z.record(z.string(), z.union([z.boolean(), z.number(), z.string()])),
    }).optional(),
  }).default({}),
  metadata: z.object({
    version: z.string().default('1.0.0'),
    lastUpdated: z.string().datetime().default(() => new Date().toISOString()),
    updatedBy: z.string().optional(),
  }).default({}),
});

// ===== TYPESCRIPT TYPES =====

export type PercentageRule = z.infer<typeof PercentageRuleSchema>;
export type RoleRule = z.infer<typeof RoleRuleSchema>;
export type UserRule = z.infer<typeof UserRuleSchema>;
export type EnvironmentRule = z.infer<typeof EnvironmentRuleSchema>;
export type DateRule = z.infer<typeof DateRuleSchema>;
export type GroupRule = z.infer<typeof GroupRuleSchema>;
export type FeatureFlagRule = z.infer<typeof FeatureFlagRuleSchema>;
export type FeatureFlagConfig = z.infer<typeof FeatureFlagConfigSchema>;
export type FeatureFlagsConfig = z.infer<typeof FeatureFlagsConfigSchema>;

// ===== DEFAULT FEATURE FLAGS CONFIGURATION =====

const currentTimestamp = new Date().toISOString();

export const defaultFeatureFlags: FeatureFlagsConfig = {
  flags: [
    // UI/UX Features
    {
      key: 'glassmorphism',
      name: 'Glassmorphism Effects',
      description: 'Enable glass morphism visual effects throughout the UI',
      enabled: true,
      defaultValue: true,
      rolloutValue: true,
      tags: ['ui', 'visual', 'theme'],
      deprecated: false,
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp,
      rules: [
        {
          type: 'environment',
          environments: ['development', 'staging'],
          operator: 'in',
        },
        {
          type: 'percentage',
          percentage: 90,
        },
      ],
    },
    {
      key: 'animations',
      name: 'UI Animations',
      description: 'Enable smooth animations and transitions',
      enabled: true,
      defaultValue: true,
      rolloutValue: true,
      tags: ['ui', 'animation', 'performance'],
      deprecated: false,
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp,
      rules: [
        {
          type: 'environment',
          environments: ['development', 'staging'],
          operator: 'in',
        },
        {
          type: 'percentage',
          percentage: 100,
        },
      ],
    },
    {
      key: 'magneticEffects',
      name: 'Magnetic Effects',
      description: 'Enable magnetic hover effects on interactive elements',
      enabled: true,
      defaultValue: true,
      rolloutValue: true,
      tags: ['ui', 'interaction', 'animation'],
      deprecated: false,
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp,
      rules: [
        {
          type: 'percentage',
          percentage: 75,
        },
      ],
    },
    {
      key: 'particleAnimations',
      name: 'Particle Animations',
      description: 'Enable particle background animations',
      enabled: true,
      defaultValue: false,
      rolloutValue: true,
      tags: ['ui', 'animation', 'performance'],
      deprecated: false,
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp,
      rules: [
        {
          type: 'environment',
          environments: ['development'],
          operator: 'in',
        },
        {
          type: 'role',
          roles: ['admin'],
          operator: 'in',
        },
        {
          type: 'percentage',
          percentage: 25,
        },
      ],
    },
    {
      key: 'interactiveConnections',
      name: 'Interactive Connections',
      description: 'Enable interactive connection lines between elements',
      enabled: true,
      defaultValue: true,
      rolloutValue: true,
      tags: ['ui', 'interaction'],
      deprecated: false,
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp,
      rules: [
        {
          type: 'percentage',
          percentage: 80,
        },
      ],
    },
    {
      key: 'nonTraditionalLayouts',
      name: 'Non-Traditional Layouts',
      description: 'Enable asymmetrical and creative layout options',
      enabled: true,
      defaultValue: true,
      rolloutValue: true,
      tags: ['ui', 'layout'],
      deprecated: false,
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp,
      rules: [
        {
          type: 'percentage',
          percentage: 100,
        },
      ],
    },
    
    // Functional Features
    {
      key: 'gamification',
      name: 'Gamification System',
      description: 'Enable gamification features like progress tracking and achievements',
      enabled: true,
      defaultValue: false,
      rolloutValue: true,
      tags: ['feature', 'engagement'],
      deprecated: false,
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp,
      rules: [
        {
          type: 'environment',
          environments: ['development', 'staging'],
          operator: 'in',
        },
        {
          type: 'percentage',
          percentage: 50,
        },
      ],
    },
    {
      key: 'dynamicTheming',
      name: 'Dynamic Theming',
      description: 'Enable dynamic theme customization and brand integration',
      enabled: true,
      defaultValue: true,
      rolloutValue: true,
      tags: ['theme', 'branding'],
      deprecated: false,
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp,
      rules: [
        {
          type: 'percentage',
          percentage: 100,
        },
      ],
    },
    {
      key: 'accessibilityEnhancements',
      name: 'Accessibility Enhancements',
      description: 'Enable advanced accessibility features',
      enabled: true,
      defaultValue: true,
      rolloutValue: true,
      tags: ['accessibility', 'a11y'],
      deprecated: false,
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp,
      rules: [
        {
          type: 'percentage',
          percentage: 100,
        },
      ],
    },
    
    // Experimental Features
    {
      key: 'personalizedContent',
      name: 'Personalized Content',
      description: 'Enable AI-driven content personalization',
      enabled: false,
      defaultValue: false,
      rolloutValue: true,
      tags: ['experimental', 'ai', 'personalization'],
      deprecated: false,
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp,
      rules: [
        {
          type: 'environment',
          environments: ['development'],
          operator: 'in',
        },
        {
          type: 'role',
          roles: ['admin'],
          operator: 'in',
        },
      ],
    },
    {
      key: 'voiceNavigation',
      name: 'Voice Navigation',
      description: 'Enable voice-controlled navigation',
      enabled: false,
      defaultValue: false,
      rolloutValue: false,
      tags: ['experimental', 'accessibility', 'voice'],
      deprecated: false,
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp,
      rules: [
        {
          type: 'environment',
          environments: ['development'],
          operator: 'in',
        },
        {
          type: 'role',
          roles: ['admin'],
          operator: 'in',
        },
      ],
    },
    {
      key: 'advancedAnalytics',
      name: 'Advanced Analytics',
      description: 'Enable detailed user behavior analytics',
      enabled: false,
      defaultValue: false,
      rolloutValue: true,
      tags: ['analytics', 'tracking'],
      deprecated: false,
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp,
      rules: [
        {
          type: 'role',
          roles: ['admin'],
          operator: 'in',
        },
        {
          type: 'percentage',
          percentage: 10,
        },
      ],
    },
  ],
  globalRules: [],
  environments: {
    development: {
      overrides: {
        particleAnimations: true,
        personalizedContent: true,
        voiceNavigation: true,
        advancedAnalytics: true,
      },
    },
    test: {
      overrides: {
        // Only override flags that are specifically needed for testing
        // Don't override flags that tests expect to behave according to their rules
        voiceNavigation: true, // Needed for development environment tests
      },
    },
    staging: {
      overrides: {
        particleAnimations: false,
        personalizedContent: false,
        voiceNavigation: false,
      },
    },
    production: {
      overrides: {
        personalizedContent: false,
        voiceNavigation: false,
      },
    },
  },
  metadata: {
    version: '1.0.0',
    lastUpdated: currentTimestamp,
    updatedBy: 'system',
  },
};

// ===== VALIDATION FUNCTIONS =====

export function validateFeatureFlags(config: unknown): FeatureFlagsConfig {
  try {
    return FeatureFlagsConfigSchema.parse(config);
  } catch (error) {
    console.error('Invalid feature flags configuration:', error);
    throw new Error('Feature flags configuration validation failed');
  }
}

export function validateFeatureFlag(config: unknown): FeatureFlagConfig {
  try {
    return FeatureFlagConfigSchema.parse(config);
  } catch (error) {
    console.error('Invalid feature flag configuration:', error);
    throw new Error('Feature flag configuration validation failed');
  }
}

// ===== UTILITY FUNCTIONS =====

export function getFeatureFlagByKey(key: string, config: FeatureFlagsConfig = defaultFeatureFlags): FeatureFlagConfig | undefined {
  return config.flags.find(flag => flag.key === key);
}

export function getFeatureFlagsByTag(tag: string, config: FeatureFlagsConfig = defaultFeatureFlags): FeatureFlagConfig[] {
  return config.flags.filter(flag => flag.tags.includes(tag));
}

export function getActiveFeatureFlags(config: FeatureFlagsConfig = defaultFeatureFlags): FeatureFlagConfig[] {
  return config.flags.filter(flag => flag.enabled && !flag.deprecated);
}

export function getDeprecatedFeatureFlags(config: FeatureFlagsConfig = defaultFeatureFlags): FeatureFlagConfig[] {
  return config.flags.filter(flag => flag.deprecated);
}

export function addFeatureFlag(flag: FeatureFlagConfig, config: FeatureFlagsConfig = defaultFeatureFlags): FeatureFlagsConfig {
  const validatedFlag = validateFeatureFlag(flag);
  
  return {
    ...config,
    flags: [...config.flags, validatedFlag],
    metadata: {
      ...config.metadata,
      lastUpdated: new Date().toISOString(),
    },
  };
}

export function updateFeatureFlag(key: string, updates: Partial<FeatureFlagConfig>, config: FeatureFlagsConfig = defaultFeatureFlags): FeatureFlagsConfig {
  const flagIndex = config.flags.findIndex(flag => flag.key === key);
  
  if (flagIndex === -1) {
    throw new Error(`Feature flag with key "${key}" not found`);
  }
  
  const updatedFlag = {
    ...config.flags[flagIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  const validatedFlag = validateFeatureFlag(updatedFlag);
  
  const updatedFlags = [...config.flags];
  updatedFlags[flagIndex] = validatedFlag;
  
  return {
    ...config,
    flags: updatedFlags,
    metadata: {
      ...config.metadata,
      lastUpdated: new Date().toISOString(),
    },
  };
}

export function removeFeatureFlag(key: string, config: FeatureFlagsConfig = defaultFeatureFlags): FeatureFlagsConfig {
  return {
    ...config,
    flags: config.flags.filter(flag => flag.key !== key),
    metadata: {
      ...config.metadata,
      lastUpdated: new Date().toISOString(),
    },
  };
}

// ===== CONFIGURATION LOADER =====

export function loadFeatureFlags(): FeatureFlagsConfig {
  // In a real application, this might load from environment variables,
  // a remote service, or a database
  const environment = process.env.NODE_ENV as 'development' | 'test' | 'staging' | 'production' || 'development';
  
  let config = { ...defaultFeatureFlags };
  
  // Apply environment-specific overrides
  const envOverrides = config.environments[environment]?.overrides;
  if (envOverrides) {
    config.flags = config.flags.map(flag => {
      const overrideValue = envOverrides[flag.key];
      if (overrideValue !== undefined) {
        return {
          ...flag,
          defaultValue: overrideValue,
          updatedAt: new Date().toISOString(),
        };
      }
      return flag;
    });
  }
  
  return validateFeatureFlags(config);
} 