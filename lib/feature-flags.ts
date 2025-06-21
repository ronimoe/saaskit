import crypto from 'crypto';
import { 
  FeatureFlagsConfig, 
  FeatureFlagRule,
  FeatureFlagValue,
  UserContext,
  EnvironmentContext,
  PercentageRule,
  RoleRule,
  UserRule,
  EnvironmentRule,
  DateRule,
  GroupRule,
  loadFeatureFlags
} from '@/config/features';

// ===== EVALUATION CONTEXT =====

export interface EvaluationContext {
  user?: UserContext;
  environment: EnvironmentContext;
  timestamp?: Date;
}

// ===== RULE EVALUATION FUNCTIONS =====

function evaluatePercentageRule(rule: PercentageRule, context: EvaluationContext): boolean {
  // Create a deterministic hash based on user ID or a fallback
  const seed = rule.seed || 'default';
  const identifier = context.user?.id || context.user?.email || 'anonymous';
  const hashInput = `${identifier}:${seed}`;
  
  // Generate hash and convert to percentage
  const hash = crypto.createHash('sha256').update(hashInput).digest('hex');
  const hashNumber = parseInt(hash.substring(0, 8), 16);
  const percentage = (hashNumber % 100) + 1; // 1-100
  
  return percentage <= rule.percentage;
}

function evaluateRoleRule(rule: RoleRule, context: EvaluationContext): boolean {
  if (!context.user?.role) {
    return rule.operator === 'not_in';
  }
  
  const hasRole = rule.roles.includes(context.user.role);
  return rule.operator === 'in' ? hasRole : !hasRole;
}

function evaluateUserRule(rule: UserRule, context: EvaluationContext): boolean {
  if (!context.user?.id) {
    return rule.operator === 'not_in';
  }
  
  const isTargetUser = rule.userIds.includes(context.user.id);
  return rule.operator === 'in' ? isTargetUser : !isTargetUser;
}

function evaluateEnvironmentRule(rule: EnvironmentRule, context: EvaluationContext): boolean {
  const isTargetEnv = rule.environments.includes(context.environment.environment);
  return rule.operator === 'in' ? isTargetEnv : !isTargetEnv;
}

function evaluateDateRule(rule: DateRule, context: EvaluationContext): boolean {
  const now = context.timestamp || new Date();
  const currentTime = now.getTime();
  
  if (rule.start) {
    const startTime = new Date(rule.start).getTime();
    if (currentTime < startTime) {
      return false;
    }
  }
  
  if (rule.end) {
    const endTime = new Date(rule.end).getTime();
    if (currentTime > endTime) {
      return false;
    }
  }
  
  return true;
}

function evaluateGroupRule(rule: GroupRule, context: EvaluationContext): boolean {
  if (!context.user?.groups || context.user.groups.length === 0) {
    return rule.operator === 'not_in';
  }
  
  const hasGroup = rule.groups.some(group => context.user!.groups!.includes(group));
  return rule.operator === 'in' ? hasGroup : !hasGroup;
}

function evaluateRule(rule: FeatureFlagRule, context: EvaluationContext): boolean {
  switch (rule.type) {
    case 'percentage':
      return evaluatePercentageRule(rule, context);
    case 'role':
      return evaluateRoleRule(rule, context);
    case 'user':
      return evaluateUserRule(rule, context);
    case 'environment':
      return evaluateEnvironmentRule(rule, context);
    case 'date':
      return evaluateDateRule(rule, context);
    case 'group':
      return evaluateGroupRule(rule, context);
    default:
      return false;
  }
}

// ===== FEATURE FLAG EVALUATION =====

export function evaluateFeatureFlag(
  flagKey: string, 
  context: EvaluationContext,
  config?: FeatureFlagsConfig
): FeatureFlagValue {
  const featureFlags = config || loadFeatureFlags();
  const flag = featureFlags.flags.find(f => f.key === flagKey);
  
  if (!flag) {
    console.warn(`Feature flag "${flagKey}" not found`);
    return false;
  }
  
  // Check for environment overrides first (these should take precedence)
  const environment = context.environment.environment;
  const envOverrides = featureFlags.environments[environment]?.overrides;
  if (envOverrides && envOverrides[flagKey] !== undefined) {
    return envOverrides[flagKey];
  }
  
  // If flag is disabled, return default value
  if (!flag.enabled) {
    return flag.defaultValue;
  }
  
  // If flag is deprecated, log warning and return default value
  if (flag.deprecated) {
    console.warn(`Feature flag "${flagKey}" is deprecated`);
    return flag.defaultValue;
  }
  
  // Check if all rules pass (AND logic)
  const allRulesPass = flag.rules.length === 0 || flag.rules.every(rule => evaluateRule(rule, context));
  
  if (allRulesPass) {
    return flag.rolloutValue ?? flag.defaultValue;
  }
  
  return flag.defaultValue;
}

export function evaluateMultipleFeatureFlags(
  flagKeys: string[],
  context: EvaluationContext,
  config?: FeatureFlagsConfig
): Record<string, FeatureFlagValue> {
  const results: Record<string, FeatureFlagValue> = {};
  
  for (const key of flagKeys) {
    results[key] = evaluateFeatureFlag(key, context, config);
  }
  
  return results;
}

export function evaluateAllFeatureFlags(
  context: EvaluationContext,
  config?: FeatureFlagsConfig
): Record<string, FeatureFlagValue> {
  const featureFlags = config || loadFeatureFlags();
  const flagKeys = featureFlags.flags.map(flag => flag.key);
  
  return evaluateMultipleFeatureFlags(flagKeys, context, config);
}

// ===== UTILITY FUNCTIONS =====

export function isFeatureEnabled(
  flagKey: string,
  context: EvaluationContext,
  config?: FeatureFlagsConfig
): boolean {
  const value = evaluateFeatureFlag(flagKey, context, config);
  return Boolean(value);
}

export function getFeatureFlagValue<T extends FeatureFlagValue = FeatureFlagValue>(
  flagKey: string,
  context: EvaluationContext,
  config?: FeatureFlagsConfig
): T {
  return evaluateFeatureFlag(flagKey, context, config) as T;
}

// ===== SERVER-SIDE EVALUATION =====

export function createServerEvaluationContext(
  userContext?: UserContext,
  environmentOverride?: EnvironmentContext['environment']
): EvaluationContext {
  return {
    user: userContext,
    environment: {
      environment: environmentOverride || (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development',
      version: process.env.npm_package_version,
      buildId: process.env.BUILD_ID,
    },
    timestamp: new Date(),
  };
}

// ===== BATCH EVALUATION FOR PERFORMANCE =====

export class FeatureFlagsEvaluator {
  private config: FeatureFlagsConfig;
  private context: EvaluationContext;
  private cache: Map<string, FeatureFlagValue> = new Map();

  constructor(context: EvaluationContext, config?: FeatureFlagsConfig) {
    this.context = context;
    this.config = config || loadFeatureFlags();
  }

  evaluate(flagKey: string): FeatureFlagValue {
    if (this.cache.has(flagKey)) {
      return this.cache.get(flagKey)!;
    }

    const value = evaluateFeatureFlag(flagKey, this.context, this.config);
    this.cache.set(flagKey, value);
    return value;
  }

  isEnabled(flagKey: string): boolean {
    return Boolean(this.evaluate(flagKey));
  }

  getValue<T extends FeatureFlagValue = FeatureFlagValue>(flagKey: string): T {
    return this.evaluate(flagKey) as T;
  }

  evaluateAll(): Record<string, FeatureFlagValue> {
    const results: Record<string, FeatureFlagValue> = {};
    
    for (const flag of this.config.flags) {
      results[flag.key] = this.evaluate(flag.key);
    }
    
    return results;
  }

  clearCache(): void {
    this.cache.clear();
  }

  updateContext(context: Partial<EvaluationContext>): void {
    this.context = { ...this.context, ...context };
    this.clearCache(); // Clear cache when context changes
  }
} 