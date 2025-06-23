import {
  cn,
  responsive,
  composeGlassEffects,
  composeAnimations,
  composeLayout,
  composeTheme,
  composeComplete,
  performanceAwareComposition,
  accessibleComposition
} from '@/lib/design-system/composition';

describe('Design System Composition', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('a', 'b')).toBe('a b');
      expect(cn('a', false, 'b', { c: true, d: false })).toBe('a b c');
      expect(cn('p-4', 'p-2')).toBe('p-2'); // tailwind-merge behavior
    });
  });

  describe('responsive', () => {
    it('should generate responsive classes', () => {
      const classes = {
        base: 'w-full',
        md: 'w-1/2',
        lg: 'w-1/3'
      };
      expect(responsive(classes)).toBe('w-full md:w-1/2 lg:w-1/3');
    });
  });

  describe('composeGlassEffects', () => {
    it('should return default glass effect classes', () => {
      expect(composeGlassEffects({})).toContain('backdrop-blur-sm');
      expect(composeGlassEffects({})).toContain('bg-white/10 dark:bg-black/10');
    });

    it('should apply variant classes', () => {
      expect(composeGlassEffects({ variant: 'floating' })).toContain('shadow-lg');
    });

    it('should apply magnetic classes', () => {
        expect(composeGlassEffects({ magnetic: true })).toContain('magnetic-element');
      });
  });

  describe('composeAnimations', () => {
    it('should return default animation classes', () => {
      expect(composeAnimations({})).toContain('transition-all');
      expect(composeAnimations({})).toContain('hover:scale-105');
    });

    it('should apply particles classes', () => {
      expect(composeAnimations({ particles: true })).toContain('relative overflow-hidden');
    });
  });

  describe('composeLayout', () => {
    it('should return default layout classes', () => {
      expect(composeLayout({})).toBe('relative');
    });

    it('should apply cell type classes', () => {
      expect(composeLayout({ cellType: 3 })).toContain('grid-cell-3');
    });
  });

  describe('composeTheme', () => {
    it('should return empty string by default', () => {
      expect(composeTheme({})).toBe('');
    });

    it('should apply brand classes', () => {
      expect(composeTheme({ brand: true })).toContain('text-brand-primary');
    });
  });

  describe('composeComplete', () => {
    it('should combine all composition functions', () => {
      const result = composeComplete({
        variant: 'floating',
        magnetic: true,
        cellType: 1,
        brand: true
      });
      expect(result).toContain('shadow-lg'); // from composeGlassEffects
      expect(result).toContain('magnetic-element'); // from composeGlassEffects
      expect(result).toContain('grid-cell-1'); // from composeLayout
      expect(result).toContain('text-brand-primary'); // from composeTheme
    });
  });

  describe('performanceAwareComposition', () => {
    it('should add performance-aware classes', () => {
      const result = performanceAwareComposition('base-class', {
        respectReducedMotion: true,
        respectAnimationToggle: true
      });
      expect(result).toContain('motion-safe:transition-all');
      expect(result).toContain('conditional-animation');
    });
  });

  describe('accessibleComposition', () => {
    it('should add accessibility-aware classes', () => {
      const result = accessibleComposition('base-class', {
        focusVisible: true,
        screenReader: true
      });
      expect(result).toContain('focus-visible:ring-2');
      expect(result).toContain('sr-only');
    });
  });
}); 