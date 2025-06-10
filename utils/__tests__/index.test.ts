/**
 * @jest-environment jsdom
 */
import {
  cn,
  formatDate,
  formatPrice,
  capitalize,
  truncate,
  isValidEmail,
  generateRandomString,
  sleep,
  debounce,
  slugify,
  copyToClipboard,
  absoluteUrl,
  safeJsonParse,
  isClient,
  isServer,
  createKey,
} from '../index';

// Mock navigator.clipboard for clipboard tests
const mockWriteText = jest.fn();
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockWriteText,
  },
  writable: true,
});

describe('utils/index', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWriteText.mockClear();
  });

  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4'); // Tailwind merge should work
    });

    it('should handle conditional classes', () => {
      expect(cn('base', true && 'conditional', false && 'hidden')).toBe('base conditional');
    });

    it('should handle undefined and null values', () => {
      expect(cn('base', undefined, null, 'valid')).toBe('base valid');
    });

    it('should work with objects', () => {
      expect(cn({ 'class1': true, 'class2': false, 'class3': true })).toBe('class1 class3');
    });
  });

  describe('formatDate', () => {
    it('should format date string correctly', () => {
      const date = '2023-12-25';
      const formatted = formatDate(date);
      expect(formatted).toBe('December 25, 2023');
    });

    it('should format Date object correctly', () => {
      const date = new Date('2023-12-25');
      const formatted = formatDate(date);
      expect(formatted).toBe('December 25, 2023');
    });

    it('should accept custom options', () => {
      const date = '2023-12-25';
      const formatted = formatDate(date, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
      expect(formatted).toBe('Dec 25, 2023');
    });

    it('should override default options with custom ones', () => {
      const date = '2023-12-25';
      const formatted = formatDate(date, { 
        month: 'numeric',
        day: '2-digit'
      });
      expect(formatted).toBe('12/25/2023');
    });
  });

  describe('formatPrice', () => {
    it('should format price in cents to USD by default', () => {
      expect(formatPrice(1999)).toBe('$19.99');
      expect(formatPrice(50)).toBe('$0.50');
      expect(formatPrice(0)).toBe('$0.00');
    });

    it('should handle different currencies', () => {
      expect(formatPrice(1999, 'EUR')).toBe('€19.99');
      expect(formatPrice(1999, 'GBP')).toBe('£19.99');
    });

    it('should handle large amounts', () => {
      expect(formatPrice(100000)).toBe('$1,000.00');
      expect(formatPrice(123456789)).toBe('$1,234,567.89');
    });

    it('should handle negative amounts', () => {
      expect(formatPrice(-1999)).toBe('-$19.99');
    });
  });

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('HELLO')).toBe('HELLO');
      expect(capitalize('hELLO')).toBe('HELLO');
    });

    it('should handle single character', () => {
      expect(capitalize('a')).toBe('A');
      expect(capitalize('A')).toBe('A');
    });

    it('should handle empty string', () => {
      expect(capitalize('')).toBe('');
    });

    it('should handle strings with spaces', () => {
      expect(capitalize('hello world')).toBe('Hello world');
    });
  });

  describe('truncate', () => {
    it('should truncate long strings', () => {
      expect(truncate('This is a long string', 10)).toBe('This is a ...');
      expect(truncate('Hello world', 5)).toBe('Hello...');
    });

    it('should not truncate short strings', () => {
      expect(truncate('Short', 10)).toBe('Short');
      expect(truncate('Exact', 5)).toBe('Exact');
    });

    it('should handle edge cases', () => {
      expect(truncate('', 5)).toBe('');
      expect(truncate('Test', 0)).toBe('...');
      expect(truncate('A', 1)).toBe('A');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email formats', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('test+tag@example.org')).toBe(true);
      expect(isValidEmail('123@456.com')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@invalid.com')).toBe(false);
      expect(isValidEmail('invalid@.com')).toBe(false);
      expect(isValidEmail('invalid.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('test @example.com')).toBe(false);
    });
  });

  describe('generateRandomString', () => {
    it('should generate string of correct length', () => {
      expect(generateRandomString(5)).toHaveLength(5);
      expect(generateRandomString(10)).toHaveLength(10);
      expect(generateRandomString(0)).toHaveLength(0);
    });

    it('should generate different strings on multiple calls', () => {
      const str1 = generateRandomString(10);
      const str2 = generateRandomString(10);
      expect(str1).not.toBe(str2);
    });

    it('should only contain valid characters', () => {
      const str = generateRandomString(100);
      const validChars = /^[A-Za-z0-9]+$/;
      expect(str).toMatch(validChars);
    });
  });

  describe('sleep', () => {
    it('should resolve after specified time', async () => {
      const start = Date.now();
      await sleep(100);
      const end = Date.now();
      const elapsed = end - start;
      
      // Allow for some variance in timing
      expect(elapsed).toBeGreaterThanOrEqual(90);
      expect(elapsed).toBeLessThan(150);
    });

    it('should return a Promise', () => {
      const result = sleep(1);
      expect(result).toBeInstanceOf(Promise);
      return result; // Clean up the promise
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
      jest.clearAllTimers();
    });

    it('should delay function execution', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('test');
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledWith('test');
    });

    it('should cancel previous calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('first');
      debouncedFn('second');
      debouncedFn('third');

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('third');
    });

    it('should handle multiple arguments', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('arg1', 'arg2', 'arg3');
      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
    });
  });

  describe('slugify', () => {
    it('should create URL-friendly slugs', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('This is a Test!')).toBe('this-is-a-test');
      expect(slugify('Multiple   Spaces')).toBe('multiple-spaces');
    });

    it('should handle special characters', () => {
      expect(slugify('Hello@World#123')).toBe('helloworld123');
      expect(slugify('Test & Development')).toBe('test-development');
      expect(slugify('Price: $19.99')).toBe('price-1999');
    });

    it('should trim leading and trailing dashes', () => {
      expect(slugify('-Hello World-')).toBe('hello-world');
      expect(slugify('___Test___')).toBe('test');
      expect(slugify('   Spaced   ')).toBe('spaced');
    });

    it('should handle edge cases', () => {
      expect(slugify('')).toBe('');
      expect(slugify('---')).toBe('');
      expect(slugify('   ')).toBe('');
      expect(slugify('123')).toBe('123');
    });

    it('should replace underscores with dashes', () => {
      expect(slugify('hello_world_test')).toBe('hello-world-test');
      expect(slugify('test__multiple__underscores')).toBe('test-multiple-underscores');
    });
  });

  describe('copyToClipboard', () => {
    it('should copy text successfully', async () => {
      mockWriteText.mockResolvedValue(undefined);
      
      const result = await copyToClipboard('test text');
      
      expect(result).toBe(true);
      expect(mockWriteText).toHaveBeenCalledWith('test text');
    });

    it('should handle clipboard API failure', async () => {
      mockWriteText.mockRejectedValue(new Error('Clipboard access denied'));
      
      // Mock console.error to avoid test output noise
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const result = await copyToClipboard('test text');
      
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to copy to clipboard:',
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('absoluteUrl', () => {
    it('should construct absolute URLs with given paths', () => {
      // Test that it returns some absolute URL (the exact base depends on environment)
      const result = absoluteUrl('/test');
      expect(result).toMatch(/^https?:\/\/.*\/test$/);
      expect(result).toContain('/test');
    });

    it('should handle paths with different formats', () => {
      const paths = ['/api/users', '/dashboard', '/'];
      paths.forEach(path => {
        const result = absoluteUrl(path);
        expect(result).toMatch(/^https?:\/\//);
        expect(result).toContain(path);
      });
    });
  });

  describe('safeJsonParse', () => {
    it('should parse valid JSON', () => {
      const obj = { name: 'test', value: 123 };
      const jsonStr = JSON.stringify(obj);
      
      expect(safeJsonParse(jsonStr, {})).toEqual(obj);
    });

    it('should return fallback for invalid JSON', () => {
      const fallback = { error: true };
      
      expect(safeJsonParse('invalid json', fallback)).toEqual(fallback);
      expect(safeJsonParse('{invalid}', fallback)).toEqual(fallback);
      expect(safeJsonParse('', fallback)).toEqual(fallback);
    });

    it('should handle different fallback types', () => {
      expect(safeJsonParse('invalid', null)).toBe(null);
      expect(safeJsonParse('invalid', [])).toEqual([]);
      expect(safeJsonParse('invalid', 'default')).toBe('default');
      expect(safeJsonParse('invalid', 42)).toBe(42);
    });

    it('should parse complex objects', () => {
      const complex = {
        arr: [1, 2, 3],
        nested: { key: 'value' },
        bool: true,
        num: 123.45
      };
      
      expect(safeJsonParse(JSON.stringify(complex), {})).toEqual(complex);
    });
  });

  describe('isClient', () => {
    it('should detect client environment correctly', () => {
      // In jsdom environment, window exists so this should be true
      expect(typeof isClient()).toBe('boolean');
      expect(isClient()).toBe(true);
    });
  });

  describe('isServer', () => {
    it('should detect server environment correctly', () => {
      // In jsdom environment, window exists so isServer should be false
      expect(typeof isServer()).toBe('boolean');
      expect(isServer()).toBe(false);
    });

    it('should be opposite of isClient', () => {
      expect(isClient()).toBe(!isServer());
    });
  });

  describe('createKey', () => {
    it('should create keys from multiple parts', () => {
      expect(createKey('user', 123, 'profile')).toBe('user-123-profile');
      expect(createKey('item', 'abc')).toBe('item-abc');
    });


    it('should filter out falsy values', () => {
      // Testing runtime behavior with type assertions for edge cases
      expect(createKey('user', '', 'profile', null as any, undefined as any, 'edit')).toBe('user-profile-edit');
      expect(createKey('test', 0, 'item')).toBe('test-item'); // 0 is falsy
      expect(createKey('test', false as any, 'item')).toBe('test-item');
    });

    it('should handle edge cases', () => {
      expect(createKey()).toBe('');
      expect(createKey('')).toBe('');
      expect(createKey(null as any, undefined as any, false as any)).toBe('');
      expect(createKey('single')).toBe('single');
    });

    it('should convert numbers to strings', () => {
      expect(createKey(1, 2, 3)).toBe('1-2-3');
      expect(createKey('prefix', 42, 'suffix')).toBe('prefix-42-suffix');
    });
  });
}); 