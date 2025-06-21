'use client';

import React, { createContext, useContext, useMemo, useEffect, useState } from 'react';
import { useAuthContext } from '@/components/providers/auth-provider';
import { 
  FeatureFlagsConfig,
  FeatureFlagValue,
  UserContext,
} from '@/config/features';
import { 
  EvaluationContext,
  FeatureFlagsEvaluator,
  evaluateAllFeatureFlags,
  createServerEvaluationContext
} from '@/lib/feature-flags';

// ===== CONTEXT TYPES =====

interface FeatureFlagsContextValue {
  flags: Record<string, FeatureFlagValue>;
  evaluator: FeatureFlagsEvaluator;
  isLoading: boolean;
  error: string | null;
  isEnabled: (flagKey: string) => boolean;
  getValue: <T extends FeatureFlagValue = FeatureFlagValue>(flagKey: string) => T;
  refresh: () => void;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextValue | undefined>(undefined);

// ===== PROVIDER PROPS =====

interface FeatureFlagsProviderProps {
  children: React.ReactNode;
  config?: FeatureFlagsConfig;
  serverFlags?: Record<string, FeatureFlagValue>; // For SSR hydration
  fallbackFlags?: Record<string, FeatureFlagValue>; // Fallback during loading
}

// ===== PROVIDER COMPONENT =====

export function FeatureFlagsProvider({ 
  children, 
  config,
  serverFlags = {},
  fallbackFlags = {}
}: FeatureFlagsProviderProps) {
  const { user, isInitialized: authInitialized } = useAuthContext();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flags, setFlags] = useState<Record<string, FeatureFlagValue>>(serverFlags);

  // Create evaluation context
  const context = useMemo((): EvaluationContext => {
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

  // Create evaluator
  const evaluator = useMemo(() => {
    try {
      return new FeatureFlagsEvaluator(context, config);
    } catch (err) {
      console.error('Failed to create feature flags evaluator:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return new FeatureFlagsEvaluator(context); // Fallback to default config
    }
  }, [context, config]);

  // Evaluate all flags when context changes
  const refresh = useMemo(() => {
    return () => {
      if (!authInitialized) {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const evaluatedFlags = evaluateAllFeatureFlags(context, config);
        setFlags(evaluatedFlags);
      } catch (err) {
        console.error('Failed to evaluate feature flags:', err);
        setError(err instanceof Error ? err.message : 'Failed to evaluate feature flags');
        // Fallback to existing flags or fallback flags
        if (Object.keys(flags).length === 0) {
          setFlags(fallbackFlags);
        }
      } finally {
        setIsLoading(false);
      }
    };
  }, [context, config, authInitialized, fallbackFlags, flags]);

  // Refresh flags when auth or context changes
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Utility functions
  const isEnabled = useMemo(() => {
    return (flagKey: string): boolean => {
      const value = flags[flagKey];
      return Boolean(value);
    };
  }, [flags]);

  const getValue = useMemo(() => {
    return <T extends FeatureFlagValue = FeatureFlagValue>(flagKey: string): T => {
      const value = flags[flagKey];
      return (value ?? false) as T;
    };
  }, [flags]);

  // Context value
  const contextValue: FeatureFlagsContextValue = useMemo(() => ({
    flags,
    evaluator,
    isLoading,
    error,
    isEnabled,
    getValue,
    refresh,
  }), [flags, evaluator, isLoading, error, isEnabled, getValue, refresh]);

  return (
    <FeatureFlagsContext.Provider value={contextValue}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

// ===== HOOKS =====

export function useFeatureFlagsContext(): FeatureFlagsContextValue {
  const context = useContext(FeatureFlagsContext);
  
  if (context === undefined) {
    throw new Error('useFeatureFlagsContext must be used within a FeatureFlagsProvider');
  }
  
  return context;
}

export function useFeatureFlag(flagKey: string): FeatureFlagValue {
  const { getValue } = useFeatureFlagsContext();
  return getValue(flagKey);
}

export function useFeatureEnabled(flagKey: string): boolean {
  const { isEnabled } = useFeatureFlagsContext();
  return isEnabled(flagKey);
}

export function useFeatureValue<T extends FeatureFlagValue = FeatureFlagValue>(
  flagKey: string
): T {
  const { getValue } = useFeatureFlagsContext();
  return getValue<T>(flagKey);
}

// ===== SERVER-SIDE UTILITIES =====

export async function getServerFeatureFlags(userContext?: UserContext): Promise<Record<string, FeatureFlagValue>> {
  try {
    const context = createServerEvaluationContext(userContext);
    return evaluateAllFeatureFlags(context);
  } catch (error) {
    console.error('Failed to evaluate server-side feature flags:', error);
    return {};
  }
}

// ===== HOC FOR FEATURE-GATED COMPONENTS =====

export function withFeatureFlag<P extends object>(
  flagKey: string,
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<P> | React.ReactNode
): React.ComponentType<P> {
  const FeatureGatedComponent = (props: P) => {
    const isEnabled = useFeatureEnabled(flagKey);
    
    if (!isEnabled) {
      if (fallback) {
        if (React.isValidElement(fallback)) {
          return fallback as React.ReactElement;
        }
        const FallbackComponent = fallback as React.ComponentType<P>;
        return <FallbackComponent {...props} />;
      }
      return null;
    }
    
    return <Component {...props} />;
  };
  
  FeatureGatedComponent.displayName = `withFeatureFlag(${Component.displayName || Component.name})`;
  
  return FeatureGatedComponent;
}

// ===== CONDITIONAL RENDERING COMPONENT =====

interface FeatureToggleProps {
  flagKey: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  invert?: boolean;
}

export function FeatureToggle({ 
  flagKey, 
  children, 
  fallback = null, 
  invert = false 
}: FeatureToggleProps) {
  const isEnabled = useFeatureEnabled(flagKey);
  const shouldShow = invert ? !isEnabled : isEnabled;
  
  return shouldShow ? <>{children}</> : <>{fallback}</>;
}

// ===== BATCH FEATURE CHECK COMPONENT =====

interface FeatureBatchProps {
  flags: string[];
  mode?: 'all' | 'any'; // 'all' = all flags must be enabled, 'any' = any flag can be enabled
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureBatch({ 
  flags, 
  mode = 'all', 
  children, 
  fallback = null 
}: FeatureBatchProps) {
  const { isEnabled } = useFeatureFlagsContext();
  
  const shouldShow = useMemo(() => {
    if (mode === 'all') {
      return flags.every(flag => isEnabled(flag));
    } else {
      return flags.some(flag => isEnabled(flag));
    }
  }, [flags, mode, isEnabled]);
  
  return shouldShow ? <>{children}</> : <>{fallback}</>;
} 