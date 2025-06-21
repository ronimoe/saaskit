import type {
  ApiResponse,
  PaginatedResponse,
  UserProfile,
  Subscription,
  SubscriptionStatus,
  PlanType,
  FeatureFlags,
  ServiceStatus,
  LoadingState,
  FieldError,
  ValidationResult,
  SearchParams,
  DateRange,
  PartialBy,
  RequiredBy,
  Nullable,
  Optional,
  EnvironmentConfig,
  WebhookEvent
} from '../types/common';

describe('Common Types', () => {
  describe('ApiResponse', () => {
    it('should accept success response structure', () => {
      const successResponse: ApiResponse<string> = {
        success: true,
        data: 'test data',
        error: null,
        metadata: { operation: 'test' }
      };

      expect(successResponse.success).toBe(true);
      expect(successResponse.data).toBe('test data');
      expect(successResponse.error).toBeNull();
      expect(successResponse.metadata?.operation).toBe('test');
    });

    it('should accept error response structure', () => {
      const errorResponse: ApiResponse<never> = {
        success: false,
        data: null,
        error: 'Validation failed'
      };

      expect(errorResponse.success).toBe(false);
      expect(errorResponse.data).toBeNull();
      expect(errorResponse.error).toBe('Validation failed');
    });
  });

  describe('PaginatedResponse', () => {
    it('should structure paginated data correctly', () => {
      const paginatedUsers: PaginatedResponse<UserProfile> = {
        success: true,
        data: [
          {
            id: '1',
            userId: 'auth-user-1',
            email: 'user1@example.com',
            fullName: 'User One',
            avatarUrl: 'https://example.com/avatar1.jpg',
            company: 'Test Company',
            jobTitle: 'Developer',
            timezone: 'UTC',
            language: 'en',
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z'
          }
        ],
        error: null,
        pagination: {
          page: 1,
          limit: 10,
          total: 100,
          totalPages: 10,
          hasNext: true,
          hasPrev: false
        }
      };

      expect(paginatedUsers.data).toHaveLength(1);
      expect(paginatedUsers.pagination.page).toBe(1);
      expect(paginatedUsers.pagination.hasNext).toBe(true);
    });
  });

  describe('UserProfile', () => {
    it('should define user profile structure', () => {
      const user: UserProfile = {
        id: 'user-123',
        userId: 'auth-user-123',
        email: 'test@example.com',
        fullName: 'Test User',
        avatarUrl: 'https://example.com/avatar.jpg',
        company: 'Test Company',
        jobTitle: 'Developer',
        timezone: 'UTC',
        language: 'en',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      };

      expect(user.id).toBe('user-123');
      expect(user.email).toBe('test@example.com');
      expect(user.fullName).toBe('Test User');
    });

    it('should allow optional fields', () => {
      const user: UserProfile = {
        id: 'user-123',
        userId: 'auth-user-123',
        email: 'test@example.com',
        fullName: null,
        avatarUrl: null,
        company: null,
        jobTitle: null,
        timezone: null,
        language: 'en',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      };

      expect(user.avatarUrl).toBeNull();
      expect(user.fullName).toBeNull();
    });
  });

  describe('Subscription', () => {
    it('should define subscription structure', () => {
      const subscription: Subscription = {
        id: 'sub-123',
        userId: 'user-123',
        stripeSubscriptionId: 'sub_stripe_123',
        stripeCustomerId: 'cus_stripe_123',
        status: 'active',
        planType: 'pro',
        stripePriceId: 'price_123',
        currentPeriodStart: '2023-01-01T00:00:00Z',
        currentPeriodEnd: '2023-02-01T00:00:00Z',
        cancelAtPeriodEnd: false,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      };

      expect(subscription.id).toBe('sub-123');
      expect(subscription.status).toBe('active');
      expect(subscription.planType).toBe('pro');
    });
  });

  describe('LoadingState', () => {
    it('should define loading state structure', () => {
      const loadingState: LoadingState = {
        isLoading: true,
        error: null,
        success: null
      };

      expect(loadingState.isLoading).toBe(true);
      expect(loadingState.error).toBeNull();
      expect(loadingState.success).toBeNull();
    });

    it('should handle error state', () => {
      const errorState: LoadingState = {
        isLoading: false,
        error: 'Something went wrong',
        success: null
      };

      expect(errorState.isLoading).toBe(false);
      expect(errorState.error).toBe('Something went wrong');
    });

    it('should handle success state', () => {
      const successState: LoadingState = {
        isLoading: false,
        error: null,
        success: 'Operation completed successfully'
      };

      expect(successState.isLoading).toBe(false);
      expect(successState.success).toBe('Operation completed successfully');
    });
  });

  describe('Utility Types', () => {
    it('should make values optional with Optional', () => {
      const optionalValue: Optional<string> = undefined;
      const definedValue: Optional<string> = 'test';

      expect(optionalValue).toBeUndefined();
      expect(definedValue).toBe('test');
    });

    it('should make values nullable with Nullable', () => {
      const nullValue: Nullable<string> = null;
      const definedValue: Nullable<string> = 'test';

      expect(nullValue).toBeNull();
      expect(definedValue).toBe('test');
    });

    it('should make properties optional with PartialBy', () => {
      interface TestInterface {
        required: string;
        optional: number;
      }

      const partialTest: PartialBy<TestInterface, 'optional'> = {
        required: 'test'
        // optional is now optional
      };

      expect(partialTest.required).toBe('test');
      expect(partialTest.optional).toBeUndefined();
    });

    it('should make properties required with RequiredBy', () => {
      interface TestInterface {
        optional?: string;
        alreadyRequired: number;
      }

      const requiredTest: RequiredBy<TestInterface, 'optional'> = {
        optional: 'now required',
        alreadyRequired: 42
      };

      expect(requiredTest.optional).toBe('now required');
      expect(requiredTest.alreadyRequired).toBe(42);
    });
  });

  describe('FeatureFlags', () => {
    it('should define feature flags structure', () => {
      const flags: FeatureFlags = {
        analytics: true,
        socialAuth: false,
        subscriptions: true,
        teams: false,
        apiAccess: true,
        devTools: false
      };

      expect(flags.analytics).toBe(true);
      expect(flags.socialAuth).toBe(false);
      expect(flags.subscriptions).toBe(true);
    });
  });

  describe('ServiceStatus', () => {
    it('should define service status structure', () => {
      const status: ServiceStatus = {
        hasEmail: true,
        hasGoogleAuth: true,
        hasGitHubAuth: false,
        hasStripe: true,
        hasAnalytics: false,
        hasErrorMonitoring: true
      };

      expect(status.hasEmail).toBe(true);
      expect(status.hasStripe).toBe(true);
      expect(status.hasGitHubAuth).toBe(false);
    });
  });
}); 