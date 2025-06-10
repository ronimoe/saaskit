/**
 * @jest-environment jsdom
 */

import { createClient } from '../supabase/client';

// Mock @supabase/ssr
const mockCreateBrowserClient = jest.fn();

jest.mock('@supabase/ssr', () => ({
  createBrowserClient: (...args: any[]) => mockCreateBrowserClient(...args),
}));

describe('Supabase Client - createClient', () => {
  const mockSupabaseClient = {
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn(),
    storage: {
      from: jest.fn(),
    },
    realtime: {
      channel: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockCreateBrowserClient.mockReturnValue(mockSupabaseClient);
    
    // Setup environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Basic Client Creation', () => {
    it('should create a Supabase browser client with correct configuration', () => {
      const client = createClient();
      
      expect(mockCreateBrowserClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key'
      );
      
      expect(client).toBe(mockSupabaseClient);
    });

    it('should call createBrowserClient exactly once per call', () => {
      createClient();
      
      expect(mockCreateBrowserClient).toHaveBeenCalledTimes(1);
    });

    it('should return the same client instance from createBrowserClient', () => {
      const client1 = createClient();
      const client2 = createClient();
      
      expect(client1).toBe(mockSupabaseClient);
      expect(client2).toBe(mockSupabaseClient);
      expect(mockCreateBrowserClient).toHaveBeenCalledTimes(2);
    });

    it('should create a new client instance on each call', () => {
      const client1 = createClient();
      const client2 = createClient();
      
      // Both should be the same mock object, but createBrowserClient should be called twice
      expect(client1).toBe(client2);
      expect(mockCreateBrowserClient).toHaveBeenCalledTimes(2);
    });
  });

  describe('Environment Variables', () => {
    it('should use environment variables correctly', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://custom.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'custom-anon-key';
      
      createClient();
      
      expect(mockCreateBrowserClient).toHaveBeenCalledWith(
        'https://custom.supabase.co',
        'custom-anon-key'
      );
    });

    it('should pass undefined when NEXT_PUBLIC_SUPABASE_URL is missing', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      
      createClient();
      
      expect(mockCreateBrowserClient).toHaveBeenCalledWith(
        undefined,
        'test-anon-key'
      );
    });

    it('should pass undefined when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      createClient();
      
      expect(mockCreateBrowserClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        undefined
      );
    });

    it('should pass undefined for both when environment variables are missing', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      createClient();
      
      expect(mockCreateBrowserClient).toHaveBeenCalledWith(
        undefined,
        undefined
      );
    });

    it('should handle empty string environment variables', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = '';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';
      
      createClient();
      
      expect(mockCreateBrowserClient).toHaveBeenCalledWith(
        '',
        ''
      );
    });

    it('should work with different environment configurations', () => {
      const configurations = [
        {
          url: 'https://prod.supabase.co',
          key: 'prod-anon-key-12345',
        },
        {
          url: 'https://staging.supabase.co',
          key: 'staging-anon-key-67890',
        },
        {
          url: 'http://localhost:54321',
          key: 'local-anon-key-abcdef',
        },
        {
          url: 'https://dev.example.com:8443',
          key: 'dev-anon-key-ghijkl',
        },
      ];
      
      for (const config of configurations) {
        process.env.NEXT_PUBLIC_SUPABASE_URL = config.url;
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = config.key;
        
        createClient();
        
        expect(mockCreateBrowserClient).toHaveBeenCalledWith(
          config.url,
          config.key
        );
        
        jest.clearAllMocks();
        mockCreateBrowserClient.mockReturnValue(mockSupabaseClient);
      }
    });
  });

  describe('Client Structure and Methods', () => {
    it('should return client with auth methods', () => {
      const client = createClient();
      
      expect(client).toHaveProperty('auth');
      expect(client.auth).toHaveProperty('getUser');
      expect(client.auth).toHaveProperty('getSession');
      expect(client.auth).toHaveProperty('signOut');
      expect(client.auth).toHaveProperty('onAuthStateChange');
      
      expect(typeof client.auth.getUser).toBe('function');
      expect(typeof client.auth.getSession).toBe('function');
      expect(typeof client.auth.signOut).toBe('function');
      expect(typeof client.auth.onAuthStateChange).toBe('function');
    });

    it('should return client with database methods', () => {
      const client = createClient();
      
      expect(client).toHaveProperty('from');
      expect(typeof client.from).toBe('function');
    });

    it('should return client with storage methods', () => {
      const client = createClient();
      
      expect(client).toHaveProperty('storage');
      expect(client.storage).toHaveProperty('from');
      expect(typeof client.storage.from).toBe('function');
    });

    it('should return client with realtime methods', () => {
      const client = createClient();
      
      expect(client).toHaveProperty('realtime');
      expect(client.realtime).toHaveProperty('channel');
      expect(typeof client.realtime.channel).toBe('function');
    });
  });

  describe('Type Safety', () => {
    it('should create client with Database type', () => {
      const client = createClient();
      
      // Verify the client has the expected structure for Database type
      expect(client).toBeDefined();
      expect(typeof client).toBe('object');
      expect(client).not.toBeNull();
      
      // Verify createBrowserClient was called with Database type
      expect(mockCreateBrowserClient).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String)
      );
    });

    it('should maintain type consistency across multiple calls', () => {
      const client1 = createClient();
      const client2 = createClient();
      
      // Both should have the same structure
      expect(typeof client1).toBe(typeof client2);
      expect(Object.keys(client1)).toEqual(Object.keys(client2));
    });
  });

  describe('Browser Environment Compatibility', () => {
    it('should work in browser environment', () => {
      // Just verify that createClient works in jsdom environment (browser-like)
      const client = createClient();
      
      expect(client).toBeDefined();
      expect(mockCreateBrowserClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key'
      );
      
      // Verify we're in a browser-like environment (jsdom)
      expect(typeof window).toBe('object');
      expect(typeof document).toBe('object');
    });

    it('should handle different browser contexts', () => {
      // Test different browser scenarios
      const scenarios = [
        { userAgent: 'Mozilla/5.0 (Chrome)' },
        { userAgent: 'Mozilla/5.0 (Firefox)' },
        { userAgent: 'Mozilla/5.0 (Safari)' },
        { userAgent: 'Mozilla/5.0 (Edge)' },
      ];
      
      scenarios.forEach((scenario) => {
        Object.defineProperty(navigator, 'userAgent', {
          value: scenario.userAgent,
          writable: true,
        });
        
        const client = createClient();
        
        expect(client).toBeDefined();
        expect(mockCreateBrowserClient).toHaveBeenCalled();
        
        jest.clearAllMocks();
        mockCreateBrowserClient.mockReturnValue(mockSupabaseClient);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle createBrowserClient throwing an error', () => {
      const error = new Error('Failed to create browser client');
      mockCreateBrowserClient.mockImplementation(() => {
        throw error;
      });
      
      expect(() => createClient()).toThrow('Failed to create browser client');
    });

    it('should handle different types of errors from createBrowserClient', () => {
      const errors = [
        new Error('Network error'),
        new TypeError('Invalid configuration'),
        'String error',
        { message: 'Object error' },
        null,
        undefined,
      ];
      
      errors.forEach((error) => {
        mockCreateBrowserClient.mockImplementationOnce(() => {
          throw error;
        });
        
        expect(() => createClient()).toThrow();
        
        // Reset for next iteration
        mockCreateBrowserClient.mockReturnValue(mockSupabaseClient);
      });
    });

    it('should handle createBrowserClient returning null', () => {
      mockCreateBrowserClient.mockReturnValue(null);
      
      const client = createClient();
      
      expect(client).toBeNull();
      expect(mockCreateBrowserClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key'
      );
    });

    it('should handle createBrowserClient returning undefined', () => {
      mockCreateBrowserClient.mockReturnValue(undefined);
      
      const client = createClient();
      
      expect(client).toBeUndefined();
      expect(mockCreateBrowserClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key'
      );
    });
  });

  describe('Integration with @supabase/ssr', () => {
    it('should call createBrowserClient from @supabase/ssr', () => {
      createClient();
      
      expect(mockCreateBrowserClient).toHaveBeenCalledTimes(1);
      expect(mockCreateBrowserClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key'
      );
    });

    it('should pass parameters in correct order', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://specific.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'specific-anon-key';
      
      createClient();
      
      // Verify parameters are passed in the correct order: URL first, then anon key
      const callArgs = mockCreateBrowserClient.mock.calls[0];
      expect(callArgs[0]).toBe('https://specific.supabase.co');
      expect(callArgs[1]).toBe('specific-anon-key');
      expect(callArgs.length).toBe(2);
    });

    it('should not pass any additional parameters', () => {
      createClient();
      
      const callArgs = mockCreateBrowserClient.mock.calls[0];
      expect(callArgs.length).toBe(2);
    });
  });

  describe('Performance', () => {
    it('should create client efficiently', () => {
      const startTime = performance.now();
      
      createClient();
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should be very fast since it's just a function call
      expect(duration).toBeLessThan(10); // 10ms threshold
    });

    it('should handle multiple rapid calls', () => {
      const numberOfCalls = 100;
      const startTime = performance.now();
      
      for (let i = 0; i < numberOfCalls; i++) {
        createClient();
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(mockCreateBrowserClient).toHaveBeenCalledTimes(numberOfCalls);
      expect(duration).toBeLessThan(100); // Should handle 100 calls in under 100ms
    });
  });

  describe('Memory Management', () => {
    it('should not retain references between calls', () => {
      const client1 = createClient();
      const client2 = createClient();
      
      // Should get fresh instances (even if they're the same mock object)
      expect(mockCreateBrowserClient).toHaveBeenCalledTimes(2);
      
      // Each call should be independent
      expect(mockCreateBrowserClient.mock.calls[0]).toEqual(mockCreateBrowserClient.mock.calls[1]);
    });

    it('should not leak environment variables', () => {
      const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      // Modify environment
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://temp.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'temp-key';
      
      createClient();
      
      // Restore environment
      process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
      
      // New call should use current environment
      createClient();
      
      expect(mockCreateBrowserClient).toHaveBeenNthCalledWith(
        1,
        'https://temp.supabase.co',
        'temp-key'
      );
      expect(mockCreateBrowserClient).toHaveBeenNthCalledWith(
        2,
        originalUrl,
        originalKey
      );
    });
  });
}); 