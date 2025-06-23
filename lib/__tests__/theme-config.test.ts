import {
  ThemeConfig,
  BrandColors,
  predefinedThemes,
  generateColorShades,
  adjustOklchLightness,
  generateComplementaryColor,
  generateAnalogousColors,
  createBrandPalette,
  validateThemeConfig,
  getThemeById,
  getThemesByMode,
} from '@/lib/theme-config'

describe('Theme Config Utilities', () => {
  describe('predefinedThemes', () => {
    it('should contain expected theme configurations', () => {
      expect(predefinedThemes).toBeDefined()
      expect(Array.isArray(predefinedThemes)).toBe(true)
      expect(predefinedThemes.length).toBeGreaterThan(0)
    })

    it('should have valid theme structure for each theme', () => {
      predefinedThemes.forEach(theme => {
        expect(theme).toHaveProperty('id')
        expect(theme).toHaveProperty('name')
        expect(theme).toHaveProperty('displayName')
        expect(theme).toHaveProperty('colors')
        expect(theme).toHaveProperty('mode')
        expect(theme.colors).toHaveProperty('primary')
        expect(['light', 'dark', 'auto']).toContain(theme.mode)
        expect(typeof theme.id).toBe('string')
        expect(typeof theme.name).toBe('string')
        expect(typeof theme.displayName).toBe('string')
      })
    })

    it('should include default light and dark themes', () => {
      const defaultLight = predefinedThemes.find(t => t.id === 'default-light')
      const defaultDark = predefinedThemes.find(t => t.id === 'default-dark')
      
      expect(defaultLight).toBeDefined()
      expect(defaultDark).toBeDefined()
      expect(defaultLight?.mode).toBe('light')
      expect(defaultDark?.mode).toBe('dark')
    })

    it('should include high contrast themes', () => {
      const highContrastLight = predefinedThemes.find(t => t.id === 'high-contrast-light')
      const highContrastDark = predefinedThemes.find(t => t.id === 'high-contrast-dark')
      
      expect(highContrastLight).toBeDefined()
      expect(highContrastDark).toBeDefined()
      expect(highContrastLight?.features?.highContrast).toBe(true)
      expect(highContrastDark?.features?.highContrast).toBe(true)
      expect(highContrastLight?.features?.glassmorphism).toBe(false)
      expect(highContrastDark?.features?.glassmorphism).toBe(false)
    })
  })

  describe('adjustOklchLightness', () => {
    it('should adjust lightness of valid OKLCH color', () => {
      const originalColor = 'oklch(0.5 0.1 280)'
      const adjustedColor = adjustOklchLightness(originalColor, 0.8)
      
      expect(adjustedColor).toBe('oklch(0.8 0.1 280)')
    })

    it('should preserve chroma and hue values', () => {
      const originalColor = 'oklch(0.3 0.15 45)'
      const adjustedColor = adjustOklchLightness(originalColor, 0.7)
      
      expect(adjustedColor).toContain('0.15') // chroma preserved
      expect(adjustedColor).toContain('45') // hue preserved
      expect(adjustedColor).toContain('0.7') // lightness changed
    })

    it('should handle OKLCH color with alpha channel', () => {
      const originalColor = 'oklch(0.5 0.1 280 / 0.8)'
      const adjustedColor = adjustOklchLightness(originalColor, 0.9)
      
      expect(adjustedColor).toBe('oklch(0.9 0.1 280 / 0.8)')
    })

    it('should return original color if format is invalid', () => {
      const invalidColor = 'rgb(255, 0, 0)'
      const result = adjustOklchLightness(invalidColor, 0.5)
      
      expect(result).toBe(invalidColor)
    })

    it('should handle edge case lightness values', () => {
      const originalColor = 'oklch(0.5 0.1 280)'
      
      const minLightness = adjustOklchLightness(originalColor, 0)
      const maxLightness = adjustOklchLightness(originalColor, 1)
      
      expect(minLightness).toBe('oklch(0 0.1 280)')
      expect(maxLightness).toBe('oklch(1 0.1 280)')
    })
  })

  describe('generateColorShades', () => {
    it('should generate color shade object with expected keys', () => {
      const baseColor = 'oklch(0.5 0.1 280)'
      const shades = generateColorShades(baseColor)
      
      const expectedKeys = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']
      expect(Object.keys(shades)).toEqual(expectedKeys)
    })

    it('should use base color as 500 shade', () => {
      const baseColor = 'oklch(0.5 0.1 280)'
      const shades = generateColorShades(baseColor)
      
      expect(shades['500']).toBe(baseColor)
    })

    it('should generate lighter shades for lower numbers', () => {
      const baseColor = 'oklch(0.5 0.1 280)'
      const shades = generateColorShades(baseColor)
      
      // Check that 50 is lighter than 500
      expect(shades['50']).toContain('0.95') // Should have higher lightness
      expect(shades['100']).toContain('0.9') // 0.9, not 0.90
    })

    it('should generate darker shades for higher numbers', () => {
      const baseColor = 'oklch(0.5 0.1 280)'
      const shades = generateColorShades(baseColor)
      
      // Check that 900 is darker than 500
      expect(shades['900']).toContain('0.15') // Should have lower lightness
      expect(shades['950']).toContain('0.1') // 0.1, not 0.10
    })
  })

  describe('generateComplementaryColor', () => {
    it('should generate complementary color by adding 180 to hue', () => {
      const originalColor = 'oklch(0.5 0.1 90)' // 90 degrees hue
      const complementary = generateComplementaryColor(originalColor)
      
      expect(complementary).toBe('oklch(0.5 0.1 270)') // 90 + 180 = 270
    })

    it('should handle hue wraparound correctly', () => {
      const originalColor = 'oklch(0.5 0.1 270)' // 270 degrees
      const complementary = generateComplementaryColor(originalColor)
      
      expect(complementary).toBe('oklch(0.5 0.1 90)') // (270 + 180) % 360 = 90
    })

    it('should preserve lightness and chroma', () => {
      const originalColor = 'oklch(0.7 0.15 45)'
      const complementary = generateComplementaryColor(originalColor)
      
      expect(complementary).toContain('0.7') // lightness preserved
      expect(complementary).toContain('0.15') // chroma preserved
    })

    it('should handle alpha channel correctly', () => {
      const originalColor = 'oklch(0.5 0.1 90 / 0.8)'
      const complementary = generateComplementaryColor(originalColor)
      
      expect(complementary).toBe('oklch(0.5 0.1 270 / 0.8)')
    })

    it('should return original color if format is invalid', () => {
      const invalidColor = 'rgb(255, 0, 0)'
      const result = generateComplementaryColor(invalidColor)
      
      expect(result).toBe(invalidColor)
    })
  })

  describe('generateAnalogousColors', () => {
    it('should generate array of three analogous colors', () => {
      const baseColor = 'oklch(0.5 0.1 90)'
      const analogous = generateAnalogousColors(baseColor)
      
      expect(Array.isArray(analogous)).toBe(true)
      expect(analogous).toHaveLength(3)
    })

    it('should include the original color in the middle', () => {
      const baseColor = 'oklch(0.5 0.1 90)'
      const analogous = generateAnalogousColors(baseColor)
      
      expect(analogous[1]).toBe(baseColor)
    })

    it('should generate colors with ±30 degree hue differences', () => {
      const baseColor = 'oklch(0.5 0.1 90)'
      const analogous = generateAnalogousColors(baseColor)
      
      expect(analogous[0]).toBe('oklch(0.5 0.1 60)') // 90 - 30 = 60
      expect(analogous[1]).toBe('oklch(0.5 0.1 90)') // original
      expect(analogous[2]).toBe('oklch(0.5 0.1 120)') // 90 + 30 = 120
    })

    it('should handle hue wraparound for negative values', () => {
      const baseColor = 'oklch(0.5 0.1 15)' // Close to 0
      const analogous = generateAnalogousColors(baseColor)
      
      expect(analogous[0]).toBe('oklch(0.5 0.1 345)') // (15 - 30 + 360) % 360 = 345
    })

    it('should preserve lightness and chroma in all colors', () => {
      const baseColor = 'oklch(0.7 0.15 90)'
      const analogous = generateAnalogousColors(baseColor)
      
      analogous.forEach(color => {
        expect(color).toContain('0.7') // lightness preserved
        expect(color).toContain('0.15') // chroma preserved
      })
    })

    it('should return original color array if format is invalid', () => {
      const invalidColor = 'rgb(255, 0, 0)'
      const result = generateAnalogousColors(invalidColor)
      
      expect(result).toEqual([invalidColor])
    })
  })

  describe('createBrandPalette', () => {
    it('should create brand palette with all required colors', () => {
      const primaryColor = 'oklch(0.5 0.1 280)'
      const palette = createBrandPalette(primaryColor)
      
      const expectedKeys = ['primary', 'secondary', 'accent', 'success', 'warning', 'error', 'info']
      expectedKeys.forEach(key => {
        expect(palette).toHaveProperty(key)
        expect(typeof palette[key as keyof BrandColors]).toBe('string')
      })
    })

    it('should use provided color as primary', () => {
      const primaryColor = 'oklch(0.5 0.1 280)'
      const palette = createBrandPalette(primaryColor)
      
      expect(palette.primary).toBe(primaryColor)
    })

    it('should generate semantically appropriate colors', () => {
      const primaryColor = 'oklch(0.5 0.1 280)'
      const palette = createBrandPalette(primaryColor)
      
      // Success should be greenish (uses hue 145 based on implementation)
      expect(palette.success).toContain('145')
      
      // Error should be reddish (uses hue 27.325 based on implementation)
      expect(palette.error).toContain('27.325')
      
      // Warning should be orangish (uses hue 70 based on implementation)
      expect(palette.warning).toContain('70')
      
      // Info should be complementary color
      expect(palette.info).toContain('100') // complementary of 280 is 100 (280 + 180 = 460, 460 % 360 = 100)
    })
  })

  describe('validateThemeConfig', () => {
    it('should validate complete valid theme config', () => {
      const validConfig: ThemeConfig = {
        id: 'test-theme',
        name: 'test',
        displayName: 'Test Theme',
        colors: {
          primary: 'oklch(0.5 0.1 280)',
        },
        mode: 'light',
        features: {
          glassmorphism: true,
          animations: true,
          highContrast: false,
        }
      }
      
      expect(validateThemeConfig(validConfig)).toBe(true)
    })

    it('should validate minimal valid theme config', () => {
      const minimalConfig = {
        id: 'minimal',
        name: 'minimal',
        displayName: 'Minimal',
        colors: {
          primary: 'oklch(0.5 0.1 280)',
        },
        mode: 'light' as const,
      }
      
      expect(validateThemeConfig(minimalConfig)).toBe(true)
    })

    it('should reject config missing required properties', () => {
      const incompleteConfig = {
        name: 'incomplete',
        displayName: 'Incomplete',
        // Missing id, colors, mode
      }
      
      expect(validateThemeConfig(incompleteConfig)).toBe(false)
    })

    it('should reject config with invalid mode', () => {
      const invalidModeConfig = {
        id: 'invalid',
        name: 'invalid',
        displayName: 'Invalid',
        colors: {
          primary: 'oklch(0.5 0.1 280)',
        },
        mode: 'invalid' as any,
      }
      
      expect(validateThemeConfig(invalidModeConfig)).toBe(false)
    })

    it('should reject config without primary color', () => {
      const noPrimaryConfig = {
        id: 'no-primary',
        name: 'no-primary',
        displayName: 'No Primary',
        colors: {
          // Missing primary
          secondary: 'oklch(0.5 0.1 280)',
        },
        mode: 'light' as const,
      } as Partial<ThemeConfig>
      
      expect(validateThemeConfig(noPrimaryConfig)).toBe(false)
    })
  })

  describe('getThemeById', () => {
    it('should return theme when ID exists', () => {
      const theme = getThemeById('default-light')
      
      expect(theme).toBeDefined()
      expect(theme?.id).toBe('default-light')
      expect(theme?.mode).toBe('light')
    })

    it('should return undefined when ID does not exist', () => {
      const theme = getThemeById('non-existent-theme')
      
      expect(theme).toBeUndefined()
    })

    it('should return correct theme for all predefined themes', () => {
      predefinedThemes.forEach(expectedTheme => {
        const theme = getThemeById(expectedTheme.id)
        expect(theme).toEqual(expectedTheme)
      })
    })
  })

  describe('getThemesByMode', () => {
    it('should return only light themes when mode is light', () => {
      const lightThemes = getThemesByMode('light')
      
      expect(Array.isArray(lightThemes)).toBe(true)
      expect(lightThemes.length).toBeGreaterThan(0)
      lightThemes.forEach(theme => {
        expect(theme.mode).toBe('light')
      })
    })

    it('should return only dark themes when mode is dark', () => {
      const darkThemes = getThemesByMode('dark')
      
      expect(Array.isArray(darkThemes)).toBe(true)
      expect(darkThemes.length).toBeGreaterThan(0)
      darkThemes.forEach(theme => {
        expect(theme.mode).toBe('dark')
      })
    })

    it('should return correct count of themes by mode', () => {
      const lightThemes = getThemesByMode('light')
      const darkThemes = getThemesByMode('dark')
      const expectedLightCount = predefinedThemes.filter(t => t.mode === 'light').length
      const expectedDarkCount = predefinedThemes.filter(t => t.mode === 'dark').length
      
      expect(lightThemes).toHaveLength(expectedLightCount)
      expect(darkThemes).toHaveLength(expectedDarkCount)
    })
  })

  describe('Integration tests', () => {
    it('should work together to create a complete theme workflow', () => {
      // Start with a base color
      const baseColor = 'oklch(0.6 0.15 200)'
      
      // Generate color shades
      const shades = generateColorShades(baseColor)
      expect(shades['500']).toBe(baseColor)
      
      // Generate complementary color
      const complementary = generateComplementaryColor(baseColor)
      expect(complementary).toContain('20') // 200 + 180 = 380, 380 % 360 = 20
      
      // Generate analogous colors
      const analogous = generateAnalogousColors(baseColor)
      expect(analogous).toHaveLength(3)
      expect(analogous[1]).toBe(baseColor)
      
      // Create brand palette
      const palette = createBrandPalette(baseColor)
      expect(palette.primary).toBe(baseColor)
      
      // Create and validate theme config
      const themeConfig: ThemeConfig = {
        id: 'integration-test',
        name: 'integration',
        displayName: 'Integration Test',
        colors: {
          primary: baseColor,
          secondary: complementary,
          accent: analogous[0],
        },
        mode: 'light',
      }
      
      expect(validateThemeConfig(themeConfig)).toBe(true)
    })
  })
}) 