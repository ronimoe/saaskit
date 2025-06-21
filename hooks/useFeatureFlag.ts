import { useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useAuthContext } from '@/components/providers/auth-provider';
import { 
  evaluateFeatureFlag,
  evaluateMultipleFeatureFlags,
  isFeatureEnabled,
  getFeatureFlagValue,
  EvaluationContext,
  FeatureFlagsEvaluator
} from '@/lib/feature-flags';
import { 
  FeatureFlagValue,
  UserContext,
  loadFeatureFlags
} from '@/config/features';

// ===== HOOK: USE EVALUATION CONTEXT =====

export function useEvaluationContext(): EvaluationContext {
  const { user } = useAuthContext();
  
  return useMemo(() => {
    const userContext: UserContext | undefined = user ? {
      id: user.id,
      email: user.email || undefined,
      role: user.user_metadata?.role || 'user',
      groups: user.user_metadata?.groups || [],
      metadata: user.user_metadata || {},
    } : undefined;

    return {
      user: userContext,
      environment: {
        environment: (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development',
        version: process.env.NEXT_PUBLIC_APP_VERSION,
        buildId: process.env.NEXT_PUBLIC_BUILD_ID,
      },
      timestamp: new Date(),
    };
  }, [user]);
}

// ===== HOOK: USE FEATURE FLAG =====

export function useFeatureFlag(flagKey: string): FeatureFlagValue {
  const context = useEvaluationContext();
  
  return useMemo(() => {
    return evaluateFeatureFlag(flagKey, context);
  }, [flagKey, context]);
}

// ===== HOOK: USE FEATURE ENABLED =====

export function useFeatureEnabled(flagKey: string): boolean {
  const context = useEvaluationContext();
  
  return useMemo(() => {
    return isFeatureEnabled(flagKey, context);
  }, [flagKey, context]);
}

// ===== HOOK: USE FEATURE VALUE =====

export function useFeatureValue<T extends FeatureFlagValue = FeatureFlagValue>(
  flagKey: string
): T {
  const context = useEvaluationContext();
  
  return useMemo(() => {
    return getFeatureFlagValue<T>(flagKey, context);
  }, [flagKey, context]);
}

// ===== HOOK: USE MULTIPLE FEATURE FLAGS =====

export function useFeatureFlags(flagKeys: string[]): Record<string, FeatureFlagValue> {
  const context = useEvaluationContext();
  
  return useMemo(() => {
    return evaluateMultipleFeatureFlags(flagKeys, context);
  }, [flagKeys, context]);
}

// ===== HOOK: USE FEATURE FLAGS BY TAG =====

export function useFeatureFlagsByTag(tag: string): Record<string, FeatureFlagValue> {
  const context = useEvaluationContext();
  
  return useMemo(() => {
    const config = loadFeatureFlags();
    const flagKeys = config.flags
      .filter(flag => flag.tags.includes(tag))
      .map(flag => flag.key);
    
    return evaluateMultipleFeatureFlags(flagKeys, context);
  }, [tag, context]);
}

// ===== HOOK: USE FEATURE FLAGS EVALUATOR =====

export function useFeatureFlagsEvaluator(): FeatureFlagsEvaluator {
  const context = useEvaluationContext();
  
  return useMemo(() => {
    return new FeatureFlagsEvaluator(context);
  }, [context]);
}

// ===== UTILITY HOOKS =====

export function useFeatureVariant<T extends FeatureFlagValue = FeatureFlagValue>(
  flagKey: string,
  variants: Record<string, T>,
  defaultVariant: T
): T {
  const value = useFeatureFlag(flagKey);
  
  return useMemo(() => {
    if (typeof value === 'string' && value in variants) {
      return variants[value] as T;
    }
    return defaultVariant;
  }, [value, variants, defaultVariant]);
}

export function useConditionalFeature(
  flagKey: string,
  condition: () => boolean
): boolean {
  const isEnabled = useFeatureEnabled(flagKey);
  
  return useMemo(() => {
    return isEnabled && condition();
  }, [isEnabled, condition]);
}

// ===== HOOK: USE UI FEATURES =====

export function useUIFeatures() {
  const flags = useFeatureFlagsByTag('ui');
  
  return useMemo(() => ({
    glassmorphism: Boolean(flags.glassmorphism),
    animations: Boolean(flags.animations),
    magneticEffects: Boolean(flags.magneticEffects),
    particleAnimations: Boolean(flags.particleAnimations),
    interactiveConnections: Boolean(flags.interactiveConnections),
    nonTraditionalLayouts: Boolean(flags.nonTraditionalLayouts),
  }), [flags]);
}

// ===== HOOK: USE EXPERIMENTAL FEATURES =====

export function useExperimentalFeatures() {
  const flags = useFeatureFlagsByTag('experimental');
  
  return useMemo(() => ({
    personalizedContent: Boolean(flags.personalizedContent),
    voiceNavigation: Boolean(flags.voiceNavigation),
    advancedAnalytics: Boolean(flags.advancedAnalytics),
  }), [flags]);
}

// ===== HOOK: USE FEATURE TOGGLE =====

export function useFeatureToggle(flagKey: string) {
  const isEnabled = useFeatureEnabled(flagKey);
  
  const withFeature = useCallback((
    component: ReactNode,
    fallback?: ReactNode
  ): ReactNode => {
    return isEnabled ? component : fallback;
  }, [isEnabled]);
  
  const ifEnabled = useCallback((callback: () => void): void => {
    if (isEnabled) {
      callback();
    }
  }, [isEnabled]);
  
  const ifDisabled = useCallback((callback: () => void): void => {
    if (!isEnabled) {
      callback();
    }
  }, [isEnabled]);
  
  return {
    isEnabled,
    withFeature,
    ifEnabled,
    ifDisabled,
  };
} 