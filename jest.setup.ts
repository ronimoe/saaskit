import '@testing-library/jest-dom';

// Set up environment variables for tests
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.SUPABASE_JWT_SECRET = 'test-jwt-secret';
process.env.STRIPE_SECRET_KEY = 'sk_test_123';
process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_123';
process.env.NEXT_PUBLIC_APP_URL = 'https://test.com';
process.env.NEXT_PUBLIC_ENABLE_SOCIAL_AUTH = 'true';
process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = 'test-google-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-google-secret';

// Mock fetch globally for Stripe and other HTTP requests
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
) as jest.Mock;

// Suppress console output during tests
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Mock Supabase modules completely to avoid ES module issues
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}));

// Mock Next.js server components
jest.mock('next/server', () => {
  const mockJsonResponse = jest.fn((data, init) => {
    const response = {
      status: init?.status || 200,
      headers: new Map(),
      json: jest.fn().mockResolvedValue(data),
    };
    return response;
  });

  return {
    NextRequest: jest.fn(),
    NextResponse: {
      json: mockJsonResponse,
      redirect: jest.fn(),
      next: jest.fn(),
    },
  };
});

// Mock custom modules for testing
jest.mock('@/lib/stripe', () => ({
  stripe: {
    checkout: {
      sessions: {
        retrieve: jest.fn()
      }
    },
    customers: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn()
    },
    subscriptions: {
      retrieve: jest.fn(),
      update: jest.fn(),
      del: jest.fn()
    }
  }
}));

jest.mock('@/lib/stripe-sync', () => ({
  syncStripeCustomerData: jest.fn().mockResolvedValue({
    planName: 'Mock Plan',
    status: 'active',
    priceId: 'price_mock',
    currentPeriodEnd: 1735689600, // 2025-01-01
    subscriptionId: 'sub_mock'
  })
}));

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    customers: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
      list: jest.fn(),
    },
    subscriptions: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
      cancel: jest.fn(),
      list: jest.fn(),
    },
    checkout: {
      sessions: {
        create: jest.fn(),
        retrieve: jest.fn(),
      },
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
    prices: {
      list: jest.fn(),
      retrieve: jest.fn(),
    },
    products: {
      list: jest.fn(),
      retrieve: jest.fn(),
    },
  }));
});

// Mock Next.js server imports
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

// Mock ResizeObserver for Radix UI components
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock scrollIntoView for Radix UI components (only in jsdom environment)
if (typeof HTMLElement !== 'undefined') {
  HTMLElement.prototype.scrollIntoView = jest.fn();
}

// Skip window.location mocking for now to avoid conflicts
// The OAuth tests handle their own location mocking when needed

// Mock Next.js router
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
};

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => mockRouter),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Global test setup
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Clean up after each test
  jest.useRealTimers();
}); 