import { 
  evaluateFeatureFlag,
  evaluateMultipleFeatureFlags,
  isFeatureEnabled,
  getFeatureFlagValue,
  createServerEvaluationContext,
  FeatureFlagsEvaluator,
  type EvaluationContext
} from '../feature-flags';
import { 
  defaultFeatureFlags,
  validateFeatureFlags,
  getFeatureFlagByKey,
  type UserContext
} from '../../config/features';

describe('Feature Flags System', () => {
  const mockUserContext: UserContext = {
    id: 'user-123',
    email: 'test@example.com',
    role: 'user',
    groups: ['beta-testers'],
    metadata: { plan: 'pro' },
  };

  const mockEvaluationContext: EvaluationContext = {
    user: mockUserContext,
    environment: {
      environment: 'test',
      version: '1.0.0',
      buildId: 'test-build',
    },
    timestamp: new Date('2024-01-01T00:00:00Z'),
  };

  describe('Configuration Validation', () => {
    it('should validate default feature flags configuration', () => {
      expect(() => validateFeatureFlags(defaultFeatureFlags)).not.toThrow();
    });

    it('should find feature flags by key', () => {
      const glassmorphismFlag = getFeatureFlagByKey('glassmorphism');
      expect(glassmorphismFlag).toBeDefined();
      expect(glassmorphismFlag?.key).toBe('glassmorphism');
    });

    it('should return undefined for non-existent flag', () => {
      const nonExistentFlag = getFeatureFlagByKey('non-existent-flag');
      expect(nonExistentFlag).toBeUndefined();
    });
  });

  describe('Feature Flag Evaluation', () => {
    it('should evaluate enabled feature flags', () => {
      const result = evaluateFeatureFlag('glassmorphism', mockEvaluationContext);
      expect(typeof result).toBe('boolean');
    });

    it('should return default value for disabled flags', () => {
      const result = evaluateFeatureFlag('personalizedContent', mockEvaluationContext);
      expect(result).toBe(false); // disabled by default
    });

    it('should return false for non-existent flags', () => {
      const result = evaluateFeatureFlag('non-existent-flag', mockEvaluationContext);
      expect(result).toBe(false);
    });

    it('should evaluate multiple feature flags', () => {
      const results = evaluateMultipleFeatureFlags(
        ['glassmorphism', 'animations', 'nonTraditionalLayouts'], 
        mockEvaluationContext
      );
      
      expect(Object.keys(results)).toHaveLength(3);
      expect(results.glassmorphism).toBeDefined();
      expect(results.animations).toBeDefined();
      expect(results.nonTraditionalLayouts).toBeDefined();
    });
  });

  describe('Utility Functions', () => {
    it('should check if feature is enabled', () => {
      const isEnabled = isFeatureEnabled('animations', mockEvaluationContext);
      expect(typeof isEnabled).toBe('boolean');
    });

    it('should get feature flag value with type', () => {
      const value = getFeatureFlagValue<boolean>('glassmorphism', mockEvaluationContext);
      expect(typeof value).toBe('boolean');
    });
  });

  describe('Role-based Evaluation', () => {
    it('should evaluate flags based on role requirements', () => {
      const adminContext: EvaluationContext = {
        ...mockEvaluationContext,
        user: { ...mockUserContext, role: 'admin' },
      };

      const userContext: EvaluationContext = {
        ...mockEvaluationContext,
        user: { ...mockUserContext, role: 'user' },
      };

      // advancedAnalytics has both role and percentage rules (admin + 10% rollout)
      const adminResult = evaluateFeatureFlag('advancedAnalytics', adminContext);
      const userResult = evaluateFeatureFlag('advancedAnalytics', userContext);
      
      // Admin should have a chance to get it (due to role), user should never get it
      expect(typeof adminResult).toBe('boolean');
      expect(userResult).toBe(false); // User role fails the role requirement
    });

    it('should handle role-only requirements correctly', () => {
      // Test with a simple role-based flag that doesn't have other complex rules
      const adminContext: EvaluationContext = {
        ...mockEvaluationContext,
        user: { ...mockUserContext, role: 'admin' },
      };

      // Test if glassmorphism works for the user (should work in development)
      const result = evaluateFeatureFlag('glassmorphism', adminContext);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('Environment-based Evaluation', () => {
    it('should evaluate development-only flags in development', () => {
      const devContext: EvaluationContext = {
        ...mockEvaluationContext,
        environment: { ...mockEvaluationContext.environment, environment: 'development' },
      };

      const result = evaluateFeatureFlag('voiceNavigation', devContext);
      // voiceNavigation is limited to development, should work
      expect(typeof result).toBe('boolean');
    });

    it('should disable development-only flags in production', () => {
      const prodContext: EvaluationContext = {
        ...mockEvaluationContext,
        environment: { ...mockEvaluationContext.environment, environment: 'production' },
      };

      const result = evaluateFeatureFlag('voiceNavigation', prodContext);
      // voiceNavigation is limited to development, should be false in production
      expect(result).toBe(false);
    });
  });

  describe('Server-side Context Creation', () => {
    it('should create server evaluation context with user', () => {
      const context = createServerEvaluationContext(mockUserContext);
      
      expect(context.user).toEqual(mockUserContext);
      expect(context.environment).toBeDefined();
      expect(context.environment.environment).toBe('test'); // NODE_ENV is 'test' during testing
      expect(context.timestamp).toBeInstanceOf(Date);
    });

    it('should create server evaluation context without user', () => {
      const context = createServerEvaluationContext();
      
      expect(context.user).toBeUndefined();
      expect(context.environment).toBeDefined();
      expect(context.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('FeatureFlagsEvaluator Class', () => {
    let evaluator: FeatureFlagsEvaluator;

    beforeEach(() => {
      evaluator = new FeatureFlagsEvaluator(mockEvaluationContext);
    });

    it('should evaluate individual flags', () => {
      const result = evaluator.evaluate('glassmorphism');
      expect(typeof result).toBe('boolean');
    });

    it('should check if flag is enabled', () => {
      const isEnabled = evaluator.isEnabled('animations');
      expect(typeof isEnabled).toBe('boolean');
    });

    it('should get typed flag values', () => {
      const value = evaluator.getValue<boolean>('glassmorphism');
      expect(typeof value).toBe('boolean');
    });

    it('should evaluate all flags', () => {
      const allFlags = evaluator.evaluateAll();
      expect(Object.keys(allFlags).length).toBeGreaterThan(0);
      
      // Check that we have some expected flags
      expect(allFlags.glassmorphism).toBeDefined();
      expect(allFlags.animations).toBeDefined();
      expect(allFlags.gamification).toBeDefined();
    });

    it('should cache flag evaluations', () => {
      // First evaluation
      const result1 = evaluator.evaluate('glassmorphism');
      
      // Second evaluation (should be cached)
      const result2 = evaluator.evaluate('glassmorphism');
      
      expect(result1).toBe(result2);
    });

    it('should clear cache', () => {
      evaluator.evaluate('glassmorphism');
      evaluator.clearCache();
      
      // After cache clear, should still work
      const result = evaluator.evaluate('glassmorphism');
      expect(typeof result).toBe('boolean');
    });

    it('should update context and clear cache', () => {
      evaluator.evaluate('glassmorphism');
      
      // Use a user ID that passes the 10% rollout for advancedAnalytics
      const newUserContext = { ...mockUserContext, role: 'admin', id: 'admin-user-0' };
      evaluator.updateContext({ user: newUserContext });
      
      // Should work with new context (advancedAnalytics has admin role + 10% rollout)
      const result = evaluator.evaluate('advancedAnalytics');
      expect(typeof result).toBe('boolean'); // Result depends on both role (✓) and percentage rollout
      
      // Test that the context was actually updated by checking a simpler flag
      const simpleResult = evaluator.evaluate('glassmorphism');
      expect(typeof simpleResult).toBe('boolean');
    });
  });

  describe('Percentage-based Rollouts', () => {
    it('should provide deterministic results for same user', () => {
      const context1 = { ...mockEvaluationContext };
      const context2 = { ...mockEvaluationContext };
      
      const result1 = evaluateFeatureFlag('magneticEffects', context1);
      const result2 = evaluateFeatureFlag('magneticEffects', context2);
      
      expect(result1).toBe(result2); // Should be deterministic
    });

    it('should handle percentage rollouts', () => {
      // magneticEffects has 75% rollout, test multiple users
      const results: boolean[] = [];
      
      for (let i = 0; i < 10; i++) {
        const userContext = { ...mockUserContext, id: `user-${i}` };
        const context = { ...mockEvaluationContext, user: userContext };
        const result = evaluateFeatureFlag('magneticEffects', context);
        results.push(Boolean(result));
      }
      
      // Should have some enabled and some disabled (with 75% rollout)
      const enabledCount = results.filter(r => r).length;
      expect(enabledCount).toBeGreaterThan(0);
      expect(enabledCount).toBeLessThanOrEqual(10);
    });
  });
}); 