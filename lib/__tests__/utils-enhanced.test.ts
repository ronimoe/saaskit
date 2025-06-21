import { 
  isDefined, 
  isNonEmptyString, 
  formatCurrency, 
  truncateText, 
  debounce, 
  generateId 
} from '../utils';

describe('Enhanced Utility Functions', () => {
  describe('isDefined', () => {
    it('should return true for defined values', () => {
      expect(isDefined(0)).toBe(true);
      expect(isDefined('')).toBe(true);
      expect(isDefined(false)).toBe(true);
      expect(isDefined([])).toBe(true);
      expect(isDefined({})).toBe(true);
      expect(isDefined('test')).toBe(true);
    });

    it('should return false for undefined and null', () => {
      expect(isDefined(undefined)).toBe(false);
      expect(isDefined(null)).toBe(false);
    });

    it('should work as type guard', () => {
      const value: string | undefined = Math.random() > 0.5 ? 'test' : undefined;
      
      if (isDefined(value)) {
        // TypeScript should infer value as string here
        expect(typeof value).toBe('string');
      }
    });
  });

  describe('isNonEmptyString', () => {
    it('should return true for non-empty strings', () => {
      expect(isNonEmptyString('test')).toBe(true);
      expect(isNonEmptyString('a')).toBe(true);
      expect(isNonEmptyString('   ')).toBe(true); // whitespace is considered non-empty
      expect(isNonEmptyString('0')).toBe(true);
    });

    it('should return false for empty strings', () => {
      expect(isNonEmptyString('')).toBe(false);
    });

    it('should return false for non-string values', () => {
      expect(isNonEmptyString(null)).toBe(false);
      expect(isNonEmptyString(undefined)).toBe(false);
      expect(isNonEmptyString(0)).toBe(false);
      expect(isNonEmptyString(false)).toBe(false);
      expect(isNonEmptyString([])).toBe(false);
      expect(isNonEmptyString({})).toBe(false);
    });

    it('should work as type guard', () => {
      const value: unknown = 'test';
      
      if (isNonEmptyString(value)) {
        // TypeScript should infer value as string here
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
      }
    });
  });

  describe('formatCurrency', () => {
    it('should format USD currency by default', () => {
      expect(formatCurrency(1000)).toBe('$10.00');
      expect(formatCurrency(2500)).toBe('$25.00');
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should handle different currencies', () => {
      expect(formatCurrency(1000, 'EUR')).toBe('€10.00');
      expect(formatCurrency(1000, 'GBP')).toBe('£10.00');
    });

    it('should handle zero and negative amounts', () => {
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(-1000)).toBe('-$10.00');
    });

    it('should handle large amounts', () => {
      expect(formatCurrency(100000000)).toBe('$1,000,000.00');
    });

    it('should handle decimal amounts correctly', () => {
      expect(formatCurrency(1050)).toBe('$10.50');
      expect(formatCurrency(1001)).toBe('$10.01');
      expect(formatCurrency(1099)).toBe('$10.99');
    });
  });

  describe('truncateText', () => {
    const sampleText = 'This is a sample text that is longer than 20 characters';

    it('should truncate text when it exceeds maxLength', () => {
      expect(truncateText(sampleText, 20)).toBe('This is a sample ...');
      expect(truncateText(sampleText, 10)).toBe('This is...');
    });

    it('should return original text when it is shorter than maxLength', () => {
      expect(truncateText('Short text', 20)).toBe('Short text');
      expect(truncateText('', 10)).toBe('');
    });

    it('should handle exact length match', () => {
      const exactText = 'Exactly twenty chars';
      expect(truncateText(exactText, 20)).toBe(exactText);
    });

    it('should handle edge cases', () => {
      expect(truncateText('', 0)).toBe('');
      expect(truncateText('a', 0)).toBe('...');
      expect(truncateText('ab', 1)).toBe('...');
    });

    it('should handle negative maxLength', () => {
      expect(truncateText(sampleText, -1)).toBe('...');
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('should delay function execution', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should cancel previous calls when called multiple times', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments to the debounced function', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('arg1', 'arg2');
      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should handle multiple calls with different arguments', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('first');
      debouncedFn('second');
      debouncedFn('third');

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('third');
    });

    it('should work with different delay values', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 200);

      debouncedFn();
      jest.advanceTimersByTime(100);
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('generateId', () => {
    it('should generate a string', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
    });

    it('should generate different IDs on multiple calls', () => {
      const id1 = generateId();
      const id2 = generateId();
      const id3 = generateId();

      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });

    it('should generate IDs of consistent length', () => {
      const ids = Array.from({ length: 10 }, () => generateId());
      const lengths = ids.map(id => id.length);
      
      // All IDs should have the same length
      expect(new Set(lengths).size).toBe(1);
    });

    it('should generate IDs with only valid characters', () => {
      const id = generateId();
      // Should only contain alphanumeric characters
      expect(id).toMatch(/^[a-zA-Z0-9]+$/);
    });

    it('should generate unique IDs in rapid succession', () => {
      const ids = new Set();
      for (let i = 0; i < 1000; i++) {
        ids.add(generateId());
      }
      
      // Should generate 1000 unique IDs
      expect(ids.size).toBe(1000);
    });
  });
}); 