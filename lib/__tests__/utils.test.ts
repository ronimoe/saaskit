import { cn } from '../utils';

describe('lib/utils', () => {
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

    it('should handle arrays', () => {
      expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3');
    });

    it('should merge conflicting Tailwind classes correctly', () => {
      // Test specific Tailwind merging behavior
      expect(cn('p-2', 'p-4')).toBe('p-4'); // Later padding should win
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500'); // Later color should win
      expect(cn('bg-red-100 bg-opacity-50', 'bg-blue-200')).toBe('bg-blue-200'); // Background merge behavior
    });

    it('should handle empty inputs', () => {
      expect(cn()).toBe('');
      expect(cn('')).toBe('');
      expect(cn(null, undefined)).toBe('');
    });

    it('should handle complex mixed inputs', () => {
      expect(cn(
        'base-class',
        { 'conditional': true, 'hidden': false },
        ['array-class1', 'array-class2'],
        undefined,
        'final-class'
      )).toBe('base-class conditional array-class1 array-class2 final-class');
    });
  });
}); 