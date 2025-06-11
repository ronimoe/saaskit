export interface ThemeConfig {
  id: string
  name: string
  displayName: string
  colors: {
    primary: string
    secondary?: string
    accent?: string
  }
  mode: 'light' | 'dark' | 'auto'
  features?: {
    glassmorphism?: boolean
    animations?: boolean
    highContrast?: boolean
  }
}

export interface BrandColors {
  primary: string
  secondary: string
  accent: string
  success: string
  warning: string
  error: string
  info: string
}

export const predefinedThemes: ThemeConfig[] = [
  {
    id: 'default-light',
    name: 'default',
    displayName: 'Default Light',
    colors: {
      primary: 'oklch(0.21 0.006 285.885)', // Current primary
    },
    mode: 'light',
    features: {
      glassmorphism: true,
      animations: true,
      highContrast: false,
    }
  },
  {
    id: 'default-dark',
    name: 'dark',
    displayName: 'Default Dark',
    colors: {
      primary: 'oklch(0.92 0.004 286.32)', // Current dark primary
    },
    mode: 'dark',
    features: {
      glassmorphism: true,
      animations: true,
      highContrast: false,
    }
  },
  {
    id: 'ocean-light',
    name: 'ocean',
    displayName: 'Ocean Blue',
    colors: {
      primary: 'oklch(0.55 0.15 240)', // Deep blue
      secondary: 'oklch(0.65 0.12 200)', // Cyan
      accent: 'oklch(0.75 0.08 180)', // Light blue
    },
    mode: 'light',
    features: {
      glassmorphism: true,
      animations: true,
      highContrast: false,
    }
  },
  {
    id: 'forest-light',
    name: 'forest',
    displayName: 'Forest Green',
    colors: {
      primary: 'oklch(0.45 0.12 145)', // Forest green
      secondary: 'oklch(0.55 0.10 120)', // Emerald
      accent: 'oklch(0.65 0.08 100)', // Light green
    },
    mode: 'light',
    features: {
      glassmorphism: true,
      animations: true,
      highContrast: false,
    }
  },
  {
    id: 'sunset-light',
    name: 'sunset',
    displayName: 'Sunset Orange',
    colors: {
      primary: 'oklch(0.65 0.18 40)', // Warm orange
      secondary: 'oklch(0.70 0.15 60)', // Golden
      accent: 'oklch(0.75 0.12 80)', // Light orange
    },
    mode: 'light',
    features: {
      glassmorphism: true,
      animations: true,
      highContrast: false,
    }
  },
  {
    id: 'purple-light',
    name: 'purple',
    displayName: 'Royal Purple',
    colors: {
      primary: 'oklch(0.45 0.15 280)', // Royal purple
      secondary: 'oklch(0.55 0.12 300)', // Magenta
      accent: 'oklch(0.65 0.10 320)', // Light purple
    },
    mode: 'light',
    features: {
      glassmorphism: true,
      animations: true,
      highContrast: false,
    }
  },
  {
    id: 'high-contrast-light',
    name: 'high-contrast',
    displayName: 'High Contrast',
    colors: {
      primary: 'oklch(0.1 0 0)', // Pure black for max contrast
    },
    mode: 'light',
    features: {
      glassmorphism: false,
      animations: false,
      highContrast: true,
    }
  },
  {
    id: 'high-contrast-dark',
    name: 'high-contrast-dark',
    displayName: 'High Contrast Dark',
    colors: {
      primary: 'oklch(1 0 0)', // Pure white for max contrast
    },
    mode: 'dark',
    features: {
      glassmorphism: false,
      animations: false,
      highContrast: true,
    }
  }
]

// Color utility functions
export function generateColorShades(baseColor: string): Record<string, string> {
  // This is a simplified version - in production you'd use a proper color manipulation library
  // For now, we'll generate basic variations
  return {
    50: adjustOklchLightness(baseColor, 0.95),
    100: adjustOklchLightness(baseColor, 0.90),
    200: adjustOklchLightness(baseColor, 0.80),
    300: adjustOklchLightness(baseColor, 0.70),
    400: adjustOklchLightness(baseColor, 0.60),
    500: baseColor, // Base color
    600: adjustOklchLightness(baseColor, 0.45),
    700: adjustOklchLightness(baseColor, 0.35),
    800: adjustOklchLightness(baseColor, 0.25),
    900: adjustOklchLightness(baseColor, 0.15),
    950: adjustOklchLightness(baseColor, 0.10),
  }
}

export function adjustOklchLightness(oklchColor: string, lightness: number): string {
  // Extract OKLCH values and adjust lightness
  const match = oklchColor.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+))?\)/)
  if (!match) return oklchColor
  
  const [, , chroma, hue, alpha] = match
  if (!chroma || !hue) return oklchColor
  return `oklch(${lightness} ${chroma} ${hue}${alpha ? ` / ${alpha}` : ''})`
}

export function generateComplementaryColor(oklchColor: string): string {
  const match = oklchColor.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+))?\)/)
  if (!match) return oklchColor
  
  const [, lightness, chroma, hue, alpha] = match
  if (!lightness || !chroma || !hue) return oklchColor
  const complementaryHue = (parseFloat(hue) + 180) % 360
  return `oklch(${lightness} ${chroma} ${complementaryHue}${alpha ? ` / ${alpha}` : ''})`
}

export function generateAnalogousColors(oklchColor: string): string[] {
  const match = oklchColor.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+))?\)/)
  if (!match) return [oklchColor]
  
  const [, lightness, chroma, hue, alpha] = match
  if (!lightness || !chroma || !hue) return [oklchColor]
  const baseHue = parseFloat(hue)
  
  return [
    `oklch(${lightness} ${chroma} ${(baseHue - 30 + 360) % 360}${alpha ? ` / ${alpha}` : ''})`,
    oklchColor,
    `oklch(${lightness} ${chroma} ${(baseHue + 30) % 360}${alpha ? ` / ${alpha}` : ''})`
  ]
}

export function createBrandPalette(primaryColor: string): BrandColors {
  const analogous = generateAnalogousColors(primaryColor)
  const complementary = generateComplementaryColor(primaryColor)
  
  return {
    primary: primaryColor,
    secondary: analogous[0] || primaryColor,
    accent: analogous[2] || primaryColor,
    success: 'oklch(0.55 0.15 145)', // Green
    warning: 'oklch(0.65 0.15 70)', // Yellow/Orange
    error: 'oklch(0.577 0.245 27.325)', // Red
    info: complementary,
  }
}

export function validateThemeConfig(config: Partial<ThemeConfig>): boolean {
  if (!config.id || !config.name || !config.displayName) return false
  if (!config.colors?.primary) return false
  if (!config.mode || !['light', 'dark', 'auto'].includes(config.mode)) return false
  return true
}

export function getThemeById(id: string): ThemeConfig | undefined {
  return predefinedThemes.find(theme => theme.id === id)
}

export function getThemesByMode(mode: 'light' | 'dark'): ThemeConfig[] {
  return predefinedThemes.filter(theme => theme.mode === mode || theme.mode === 'auto')
} 