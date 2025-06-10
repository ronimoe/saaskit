/**
 * @jest-environment node
 */

import { createClient } from '../supabase/server';

// Mock @supabase/ssr
const mockCreateServerClient = jest.fn();

jest.mock('@supabase/ssr', () => ({
  createServerClient: (...args: any[]) => mockCreateServerClient(...args),
}));

// Mock next/headers
const mockCookieStore = {
  get: jest.fn(),
  set: jest.fn(),
};

jest.mock('next/headers', () => ({
  cookies: jest.fn(() => mockCookieStore),
}));

describe('Supabase Server - createClient', () => {
  const mockSupabaseClient = {
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn(),
    },
    from: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockCreateServerClient.mockReturnValue(mockSupabaseClient);
    
    // Setup environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
    
    // Clear console warnings for clean test output
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Basic Client Creation', () => {
    it('should create a Supabase client with correct configuration', async () => {
      const client = await createClient();
      
      expect(mockCreateServerClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key',
        expect.objectContaining({
          cookies: expect.objectContaining({
            get: expect.any(Function),
            set: expect.any(Function),
            remove: expect.any(Function),
          }),
        })
      );
      
      expect(client).toBe(mockSupabaseClient);
    });

    it('should use environment variables correctly', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://custom.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'custom-anon-key';
      
      await createClient();
      
      expect(mockCreateServerClient).toHaveBeenCalledWith(
        'https://custom.supabase.co',
        'custom-anon-key',
        expect.any(Object)
      );
    });

    it('should return the same client instance from createServerClient', async () => {
      const client1 = await createClient();
      const client2 = await createClient();
      
      expect(client1).toBe(mockSupabaseClient);
      expect(client2).toBe(mockSupabaseClient);
    });
  });

  describe('Cookie Management - get', () => {
    it('should get cookie value when cookie exists', async () => {
      const mockCookie = { value: 'test-cookie-value' };
      mockCookieStore.get.mockReturnValue(mockCookie);
      
      await createClient();
      
      // Get the cookies configuration passed to createServerClient
      const cookiesConfig = mockCreateServerClient.mock.calls[0][2].cookies;
      
      const result = cookiesConfig.get('test-cookie');
      
      expect(mockCookieStore.get).toHaveBeenCalledWith('test-cookie');
      expect(result).toBe('test-cookie-value');
    });

    it('should return undefined when cookie does not exist', async () => {
      mockCookieStore.get.mockReturnValue(undefined);
      
      await createClient();
      
      const cookiesConfig = mockCreateServerClient.mock.calls[0][2].cookies;
      const result = cookiesConfig.get('non-existent-cookie');
      
      expect(mockCookieStore.get).toHaveBeenCalledWith('non-existent-cookie');
      expect(result).toBeUndefined();
    });

    it('should handle null cookie value', async () => {
      mockCookieStore.get.mockReturnValue(null);
      
      await createClient();
      
      const cookiesConfig = mockCreateServerClient.mock.calls[0][2].cookies;
      const result = cookiesConfig.get('null-cookie');
      
      expect(result).toBeUndefined();
    });

    it('should handle cookie with empty value', async () => {
      const mockCookie = { value: '' };
      mockCookieStore.get.mockReturnValue(mockCookie);
      
      await createClient();
      
      const cookiesConfig = mockCreateServerClient.mock.calls[0][2].cookies;
      const result = cookiesConfig.get('empty-cookie');
      
      expect(result).toBe('');
    });
  });

  describe('Cookie Management - set', () => {
    it('should set cookie with basic options', async () => {
      await createClient();
      
      const cookiesConfig = mockCreateServerClient.mock.calls[0][2].cookies;
      cookiesConfig.set('test-cookie', 'test-value', { httpOnly: true });
      
      expect(mockCookieStore.set).toHaveBeenCalledWith({
        name: 'test-cookie',
        value: 'test-value',
        httpOnly: true,
      });
    });

    it('should set cookie with complex options', async () => {
      await createClient();
      
      const cookiesConfig = mockCreateServerClient.mock.calls[0][2].cookies;
      const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'strict' as const,
        maxAge: 3600,
        path: '/admin',
      };
      
      cookiesConfig.set('admin-token', 'admin-value', options);
      
      expect(mockCookieStore.set).toHaveBeenCalledWith({
        name: 'admin-token',
        value: 'admin-value',
        ...options,
      });
    });

    it('should set cookie without options', async () => {
      await createClient();
      
      const cookiesConfig = mockCreateServerClient.mock.calls[0][2].cookies;
      cookiesConfig.set('simple-cookie', 'simple-value');
      
      expect(mockCookieStore.set).toHaveBeenCalledWith({
        name: 'simple-cookie',
        value: 'simple-value',
      });
    });

    it('should handle cookie set error gracefully', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const setError = new Error('Cannot set cookie during SSG');
      mockCookieStore.set.mockImplementation(() => {
        throw setError;
      });
      
      await createClient();
      
      const cookiesConfig = mockCreateServerClient.mock.calls[0][2].cookies;
      
      // Should not throw
      expect(() => {
        cookiesConfig.set('failing-cookie', 'value', { httpOnly: true });
      }).not.toThrow();
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Error setting cookie "failing-cookie":',
        setError
      );
    });

    it('should handle different types of set errors', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Test with different error types
      const errors = [
        new Error('SSG error'),
        new TypeError('Invalid cookie'),
        'String error',
        { message: 'Object error' },
      ];
      
      for (const error of errors) {
        mockCookieStore.set.mockImplementationOnce(() => {
          throw error;
        });
        
        await createClient();
        
        const cookiesConfig = mockCreateServerClient.mock.calls[mockCreateServerClient.mock.calls.length - 1][2].cookies;
        
        expect(() => {
          cookiesConfig.set('test-cookie', 'value');
        }).not.toThrow();
        
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Error setting cookie "test-cookie":',
          error
        );
        
        jest.clearAllMocks();
        mockCreateServerClient.mockReturnValue(mockSupabaseClient);
        consoleWarnSpy.mockClear();
      }
    });
  });

  describe('Cookie Management - remove', () => {
    it('should remove cookie with basic options', async () => {
      await createClient();
      
      const cookiesConfig = mockCreateServerClient.mock.calls[0][2].cookies;
      cookiesConfig.remove('test-cookie', { path: '/' });
      
      expect(mockCookieStore.set).toHaveBeenCalledWith({
        name: 'test-cookie',
        value: '',
        path: '/',
      });
    });

    it('should remove cookie with complex options', async () => {
      await createClient();
      
      const cookiesConfig = mockCreateServerClient.mock.calls[0][2].cookies;
      const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'strict' as const,
        path: '/admin',
        domain: '.example.com',
      };
      
      cookiesConfig.remove('admin-cookie', options);
      
      expect(mockCookieStore.set).toHaveBeenCalledWith({
        name: 'admin-cookie',
        value: '',
        ...options,
      });
    });

    it('should remove cookie without options', async () => {
      await createClient();
      
      const cookiesConfig = mockCreateServerClient.mock.calls[0][2].cookies;
      cookiesConfig.remove('simple-cookie');
      
      expect(mockCookieStore.set).toHaveBeenCalledWith({
        name: 'simple-cookie',
        value: '',
      });
    });

    it('should handle cookie remove error gracefully', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const removeError = new Error('Cannot remove cookie during SSG');
      mockCookieStore.set.mockImplementation(() => {
        throw removeError;
      });
      
      await createClient();
      
      const cookiesConfig = mockCreateServerClient.mock.calls[0][2].cookies;
      
      // Should not throw
      expect(() => {
        cookiesConfig.remove('failing-cookie', { path: '/' });
      }).not.toThrow();
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Error removing cookie "failing-cookie":',
        removeError
      );
    });

    it('should handle different types of remove errors', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Test with different error types
      const errors = [
        new Error('SSG error'),
        new TypeError('Invalid cookie removal'),
        'String error',
        { message: 'Object error' },
      ];
      
      for (const error of errors) {
        mockCookieStore.set.mockImplementationOnce(() => {
          throw error;
        });
        
        await createClient();
        
        const cookiesConfig = mockCreateServerClient.mock.calls[mockCreateServerClient.mock.calls.length - 1][2].cookies;
        
        expect(() => {
          cookiesConfig.remove('test-cookie');
        }).not.toThrow();
        
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Error removing cookie "test-cookie":',
          error
        );
        
        jest.clearAllMocks();
        mockCreateServerClient.mockReturnValue(mockSupabaseClient);
        consoleWarnSpy.mockClear();
      }
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete cookie lifecycle', async () => {
      // Mock cookie that exists initially
      mockCookieStore.get.mockReturnValue({ value: 'initial-value' });
      
      await createClient();
      
      const cookiesConfig = mockCreateServerClient.mock.calls[0][2].cookies;
      
      // Get existing cookie
      const initialValue = cookiesConfig.get('session-cookie');
      expect(initialValue).toBe('initial-value');
      
      // Update cookie
      cookiesConfig.set('session-cookie', 'updated-value', { httpOnly: true });
      expect(mockCookieStore.set).toHaveBeenCalledWith({
        name: 'session-cookie',
        value: 'updated-value',
        httpOnly: true,
      });
      
      // Remove cookie
      cookiesConfig.remove('session-cookie', { path: '/' });
      expect(mockCookieStore.set).toHaveBeenCalledWith({
        name: 'session-cookie',
        value: '',
        path: '/',
      });
    });

    it('should handle multiple cookies operations', async () => {
      await createClient();
      
      const cookiesConfig = mockCreateServerClient.mock.calls[0][2].cookies;
      
      // Set multiple cookies
      cookiesConfig.set('cookie1', 'value1', { httpOnly: true });
      cookiesConfig.set('cookie2', 'value2', { secure: true });
      cookiesConfig.set('cookie3', 'value3');
      
      expect(mockCookieStore.set).toHaveBeenCalledTimes(3);
      expect(mockCookieStore.set).toHaveBeenNthCalledWith(1, {
        name: 'cookie1',
        value: 'value1',
        httpOnly: true,
      });
      expect(mockCookieStore.set).toHaveBeenNthCalledWith(2, {
        name: 'cookie2',
        value: 'value2',
        secure: true,
      });
      expect(mockCookieStore.set).toHaveBeenNthCalledWith(3, {
        name: 'cookie3',
        value: 'value3',
      });
    });

    it('should handle mixed success and error operations', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      // First call succeeds, second fails, third succeeds
      mockCookieStore.set
        .mockImplementationOnce(() => {}) // Success
        .mockImplementationOnce(() => { throw new Error('SSG error'); }) // Fail
        .mockImplementationOnce(() => {}); // Success
      
      await createClient();
      
      const cookiesConfig = mockCreateServerClient.mock.calls[0][2].cookies;
      
      cookiesConfig.set('success1', 'value1');
      cookiesConfig.set('failing', 'value2');
      cookiesConfig.set('success2', 'value3');
      
      expect(mockCookieStore.set).toHaveBeenCalledTimes(3);
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Error setting cookie "failing":',
        expect.any(Error)
      );
    });
  });

  describe('Environment Variables', () => {
    it('should pass undefined when NEXT_PUBLIC_SUPABASE_URL is missing', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      
      await createClient();
      
      expect(mockCreateServerClient).toHaveBeenCalledWith(
        undefined,
        'test-anon-key',
        expect.any(Object)
      );
    });

    it('should pass undefined when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      await createClient();
      
      expect(mockCreateServerClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        undefined,
        expect.any(Object)
      );
    });

    it('should work with different environment configurations', async () => {
      const configurations = [
        {
          url: 'https://prod.supabase.co',
          key: 'prod-anon-key',
        },
        {
          url: 'https://staging.supabase.co',
          key: 'staging-anon-key',
        },
        {
          url: 'http://localhost:54321',
          key: 'local-anon-key',
        },
      ];
      
      for (const config of configurations) {
        process.env.NEXT_PUBLIC_SUPABASE_URL = config.url;
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = config.key;
        
        await createClient();
        
        expect(mockCreateServerClient).toHaveBeenCalledWith(
          config.url,
          config.key,
          expect.any(Object)
        );
        
        jest.clearAllMocks();
        mockCreateServerClient.mockReturnValue(mockSupabaseClient);
      }
    });
  });

  describe('Next.js Integration', () => {
    it('should properly import and use next/headers cookies', async () => {
      // The mock should be called during createClient
      await createClient();
      
      // Verify that the cookies function was imported and called
      // (This is implicitly tested by the fact that mockCookieStore methods are called)
      expect(mockCreateServerClient).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          cookies: expect.objectContaining({
            get: expect.any(Function),
            set: expect.any(Function),
            remove: expect.any(Function),
          }),
        })
      );
    });

    it('should handle Server Components context', async () => {
      // This test ensures the function works in Server Components context
      // where cookies() is available
      const client = await createClient();
      
      expect(client).toBeDefined();
      expect(client).toBe(mockSupabaseClient);
    });
  });

  describe('Type Safety', () => {
    it('should create client with Database type', async () => {
      // This test ensures TypeScript types are working correctly
      const client = await createClient();
      
      // Verify the client has the expected structure
      expect(client).toHaveProperty('auth');
      expect(client).toHaveProperty('from');
      expect(typeof client.auth.getUser).toBe('function');
      expect(typeof client.auth.getSession).toBe('function');
      expect(typeof client.from).toBe('function');
    });
  });
}); 