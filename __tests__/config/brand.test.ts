import { 
  validateBrandConfig, 
  mergeBrandConfig, 
  generateBrandCSS, 
  generateMetadata,
  getLogoProps,
  defaultBrandConfig,
  BrandConfig 
} from '@/config/brand';

describe('Brand Configuration System', () => {
  describe('validateBrandConfig', () => {
    it('should validate a complete valid configuration', () => {
      expect(() => validateBrandConfig(defaultBrandConfig)).not.toThrow();
    });

    it('should throw error for invalid color format', () => {
      const invalidConfig = {
        ...defaultBrandConfig,
        colors: {
          ...defaultBrandConfig.colors,
          primary: 'invalid-color'
        }
      };
      
      expect(() => validateBrandConfig(invalidConfig)).toThrow();
    });

    it('should throw error for missing required fields', () => {
      const invalidConfig = {
        ...defaultBrandConfig,
        company: {
          // name is required but missing
          tagline: 'Test tagline'
        }
      };
      
      expect(() => validateBrandConfig(invalidConfig)).toThrow();
    });
  });

  describe('mergeBrandConfig', () => {
    it('should merge custom config with defaults', () => {
      const customConfig = {
        company: {
          name: 'Custom Company'
        },
        colors: {
          primary: 'oklch(0.5 0.1 180)'
        }
      };

      const merged = mergeBrandConfig(customConfig);
      
      expect(merged.company.name).toBe('Custom Company');
      expect(merged.company.tagline).toBe(defaultBrandConfig.company.tagline); // From default
      expect(merged.colors.primary).toBe('oklch(0.5 0.1 180)');
      expect(merged.colors.secondary).toBe(defaultBrandConfig.colors.secondary); // From default
    });

    it('should handle theme options correctly', () => {
      const customConfig = {
        theme: {
          enableGlassmorphism: false
        }
      };

      const merged = mergeBrandConfig(customConfig);
      
      expect(merged.theme.enableGlassmorphism).toBe(false);
      expect(merged.theme.enableAnimations).toBe(true); // From default
      expect(merged.theme.borderRadius).toBe(10); // From default
    });
  });

  describe('generateBrandCSS', () => {
    it('should generate valid CSS with brand colors', () => {
      const css = generateBrandCSS(defaultBrandConfig);
      
      expect(css).toContain('--brand-primary: oklch(0.21 0.006 285.885)');
      expect(css).toContain('--brand-secondary: oklch(0.967 0.001 286.375)');
      expect(css).toContain('--glassmorphism-enabled: 1');
      expect(css).toContain('--animations-enabled: 1');
      expect(css).toContain('--radius: 10px');
    });

    it('should include custom CSS when provided', () => {
      const configWithCustomCSS = {
        ...defaultBrandConfig,
        customCss: '.custom-class { color: red; }'
      };
      
      const css = generateBrandCSS(configWithCustomCSS);
      expect(css).toContain('.custom-class { color: red; }');
    });
  });

  describe('getLogoProps', () => {
    it('should return primary logo props by default', () => {
      const logoProps = getLogoProps(defaultBrandConfig);
      
      expect(logoProps.src).toBe('/logo.svg');
      expect(logoProps.alt).toBe('SaaS Kit Logo');
      expect(logoProps.width).toBe(120);
      expect(logoProps.height).toBe(40);
    });

    it('should return secondary logo props when specified', () => {
      const logoProps = getLogoProps(defaultBrandConfig, 'secondary');
      
      expect(logoProps.src).toBe('/logo-mark.svg');
      expect(logoProps.alt).toBe('SaaS Kit Mark');
    });

    it('should throw error for missing logo type', () => {
      const configWithoutSecondary = {
        ...defaultBrandConfig,
        logos: {
          primary: defaultBrandConfig.logos.primary
        }
      };
      
      expect(() => getLogoProps(configWithoutSecondary, 'secondary')).toThrow();
    });
  });

  describe('generateMetadata', () => {
    it('should generate Next.js metadata object', () => {
      const metadata = generateMetadata(defaultBrandConfig);
      
      expect(metadata.title).toBe('SaaS Kit - Modern SaaS Platform');
      expect(metadata.description).toBe(defaultBrandConfig.metadata.description);
      expect(metadata.keywords).toBe('saas, nextjs, typescript, tailwindcss, shadcn, supabase');
    });

    it('should include OpenGraph metadata', () => {
      const metadata = generateMetadata(defaultBrandConfig);
      
      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph.title).toBe('SaaS Kit - Modern SaaS Platform');
      expect(metadata.openGraph.siteName).toBe('SaaS Kit');
    });

    it('should include Twitter metadata', () => {
      const metadata = generateMetadata(defaultBrandConfig);
      
      expect(metadata.twitter).toBeDefined();
      expect(metadata.twitter.card).toBe('summary_large_image');
    });

    it('should include favicon configuration', () => {
      const metadata = generateMetadata(defaultBrandConfig);
      
      expect(metadata.icons).toBeDefined();
      expect(metadata.icons.icon).toEqual(expect.arrayContaining([
        expect.objectContaining({ url: '/favicon.ico' }),
        expect.objectContaining({ url: '/favicon.svg' })
      ]));
    });
  });

  describe('Color format validation', () => {
    it('should accept OKLCH format', () => {
      const config = {
        ...defaultBrandConfig,
        colors: {
          ...defaultBrandConfig.colors,
          primary: 'oklch(0.5 0.2 180)'
        }
      };
      
      expect(() => validateBrandConfig(config)).not.toThrow();
    });

    it('should accept hex format', () => {
      const config = {
        ...defaultBrandConfig,
        colors: {
          ...defaultBrandConfig.colors,
          primary: '#ff0000'
        }
      };
      
      expect(() => validateBrandConfig(config)).not.toThrow();
    });

    it('should accept RGB format', () => {
      const config = {
        ...defaultBrandConfig,
        colors: {
          ...defaultBrandConfig.colors,
          primary: 'rgb(255, 0, 0)'
        }
      };
      
      expect(() => validateBrandConfig(config)).not.toThrow();
    });

    it('should reject invalid color formats', () => {
      const config = {
        ...defaultBrandConfig,
        colors: {
          ...defaultBrandConfig.colors,
          primary: 'invalid-color-format'
        }
      };
      
      expect(() => validateBrandConfig(config)).toThrow();
    });
  });
}); 