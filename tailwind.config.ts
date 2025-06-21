import type { Config } from 'tailwindcss'
import { defaultBrandConfig, type BrandConfig } from './config/brand'
import { SPACING, TYPOGRAPHY, COLORS, RADIUS, SHADOWS, ANIMATIONS, BREAKPOINTS, Z_INDEX } from './lib/design-system/design-tokens'
import { predefinedThemes, generateColorShades, type ThemeConfig } from './lib/theme-config'

// Helper function to load brand configuration at build time
function getBrandConfig(): BrandConfig {
  try {
    // In build environment, use default config
    // In development, this could be extended to load from environment or file
    return defaultBrandConfig
  } catch {
    return defaultBrandConfig
  }
}

// Generate color palette from brand colors
function generateBrandColorPalette(brandConfig: BrandConfig) {
  const { colors } = brandConfig
  
  return {
    primary: generateColorShades(colors.primary),
    secondary: generateColorShades(colors.secondary),
    accent: generateColorShades(colors.accent),
    success: generateColorShades(colors.success),
    warning: generateColorShades(colors.warning),
    error: generateColorShades(colors.error),
    info: generateColorShades(colors.info),
  }
}

// Convert design tokens to Tailwind format
function convertSpacingTokens() {
  return {
    ...SPACING,
    // Add semantic spacing for SaaS layouts
    'sidebar': SPACING.sidebar,
    'header': SPACING.header,
    'content': SPACING.content,
  }
}

function convertTypographyTokens() {
  return {
    fontFamily: {
      sans: [TYPOGRAPHY.fontFamilies.sans, 'system-ui', 'sans-serif'],
      mono: [TYPOGRAPHY.fontFamilies.mono, 'Monaco', 'monospace'],
    },
    fontSize: TYPOGRAPHY.sizes,
    lineHeight: TYPOGRAPHY.lineHeights,
    fontWeight: TYPOGRAPHY.fontWeights,
  }
}

function convertShadowTokens() {
  return {
    ...SHADOWS,
    // Add glass shadows
    'glass-sm': SHADOWS.glass.light,
    'glass-md': SHADOWS.glass.medium,
    'glass-lg': SHADOWS.glass.strong,
    'glass-xl': SHADOWS.glass.floating,
    // Add glow effects
    'glow-sm': SHADOWS.glow.subtle,
    'glow-md': SHADOWS.glow.medium,
    'glow-lg': SHADOWS.glow.strong,
  }
}

function convertAnimationTokens() {
  return {
    transitionDuration: ANIMATIONS.durations,
    transitionTimingFunction: ANIMATIONS.easings,
    transitionDelay: ANIMATIONS.delays,
    animation: {
      'fade-in': 'fadeIn 0.5s ease-in-out',
      'slide-up': 'slideUp 0.3s ease-out',
      'slide-down': 'slideDown 0.3s ease-out',
      'pulse-glow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      'spin-slow': 'spin 3s linear infinite',
      'bounce-subtle': 'bounce 1s ease-in-out infinite',
    },
  }
}

// Generate configuration
const brandConfig = getBrandConfig()
const brandColorPalette = generateBrandColorPalette(brandConfig)

const config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  
  darkMode: 'class',
  
  theme: {
    // Override default screens with SaaS-optimized breakpoints
    screens: {
      xs: BREAKPOINTS.xs,
      sm: BREAKPOINTS.sm,
      md: BREAKPOINTS.md,
      lg: BREAKPOINTS.lg,
      xl: BREAKPOINTS.xl,
      '2xl': BREAKPOINTS['2xl'],
    },
    
    extend: {
      // Colors - integrate brand system with CSS variables
      colors: {
        // Shadcn/ui color system (connected to CSS variables)
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          ...brandColorPalette.primary,
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          ...brandColorPalette.secondary,
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
          ...brandColorPalette.accent,
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        
        // Extended semantic colors for SaaS
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
          ...brandColorPalette.success,
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
          ...brandColorPalette.warning,
        },
        error: {
          DEFAULT: 'hsl(var(--error))',
          foreground: 'hsl(var(--error-foreground))',
          ...brandColorPalette.error,
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: 'hsl(var(--info-foreground))',
          ...brandColorPalette.info,
        },
        
        // Chart colors
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        
        // Sidebar colors
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
        
        // Brand colors (for dynamic theming)
        brand: {
          primary: 'hsl(var(--brand-primary))',
          secondary: 'hsl(var(--brand-secondary))',
          accent: 'hsl(var(--brand-accent))',
          success: 'hsl(var(--brand-success))',
          warning: 'hsl(var(--brand-warning))',
          error: 'hsl(var(--brand-error))',
          info: 'hsl(var(--brand-info))',
        },
        
        // Glass effect colors
        glass: {
          subtle: 'rgba(255, 255, 255, 0.03)',
          light: 'rgba(255, 255, 255, 0.08)',
          medium: 'rgba(255, 255, 255, 0.15)',
          strong: 'rgba(255, 255, 255, 0.25)',
        },
      },
      
      // Spacing - integrate design tokens
      spacing: convertSpacingTokens(),
      
      // Typography - integrate design tokens
      ...convertTypographyTokens(),
      
      // Border radius - connect to CSS variables and design tokens
      borderRadius: {
        ...RADIUS,
        // Override with CSS variable-based values
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
        '3xl': 'calc(var(--radius) + 16px)',
      },
      
      // Box shadows - integrate design tokens
      boxShadow: convertShadowTokens(),
      
      // Animations - integrate design tokens
      ...convertAnimationTokens(),
      
      // Z-index scale
      zIndex: Z_INDEX,
      
      // Custom utilities for SaaS layouts
      width: {
        sidebar: 'var(--spacing-sidebar)',
      },
      height: {
        header: 'var(--spacing-header)',
      },
      
      // Backdrop blur for glassmorphism
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        '3xl': '40px',
      },
      
      // Grid template columns for dashboard layouts
      gridTemplateColumns: {
        'auto-fit-300': 'repeat(auto-fit, minmax(300px, 1fr))',
        'auto-fill-250': 'repeat(auto-fill, minmax(250px, 1fr))',
        'sidebar-content': 'var(--spacing-sidebar) 1fr',
        'dashboard': '250px 1fr',
      },
      
      // Custom aspect ratios for SaaS components
      aspectRatio: {
        'card': '16 / 10',
        'video': '16 / 9',
        'square': '1 / 1',
        'portrait': '3 / 4',
        'landscape': '4 / 3',
      },
    },
  },
  
  plugins: [
    // Custom plugin for theme-aware utilities
    function({ addUtilities, theme, addVariant }: any) {
      // Add glassmorphism utilities
      addUtilities({
        '.glass': {
          'background': 'rgba(255, 255, 255, 0.1)',
          'backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-dark': {
          'background': 'rgba(0, 0, 0, 0.1)',
          'backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.glass-subtle': {
          'background': 'var(--glass-subtle, rgba(255, 255, 255, 0.03))',
          'backdrop-filter': 'blur(2px)',
        },
        '.glass-light': {
          'background': 'var(--glass-light, rgba(255, 255, 255, 0.08))',
          'backdrop-filter': 'blur(8px)',
        },
        '.glass-medium': {
          'background': 'var(--glass-medium, rgba(255, 255, 255, 0.15))',
          'backdrop-filter': 'blur(12px)',
        },
        '.glass-strong': {
          'background': 'var(--glass-strong, rgba(255, 255, 255, 0.25))',
          'backdrop-filter': 'blur(16px)',
        },
      })
      
      // Add layout utilities for SaaS
      addUtilities({
        '.sidebar-layout': {
          'display': 'grid',
          'grid-template-columns': 'var(--spacing-sidebar) 1fr',
          'min-height': '100vh',
        },
        '.content-container': {
          'max-width': '1200px',
          'margin': '0 auto',
          'padding': '0 var(--spacing-content)',
        },
        '.dashboard-grid': {
          'display': 'grid',
          'grid-template-columns': 'repeat(auto-fit, minmax(300px, 1fr))',
          'gap': theme('spacing.6'),
        },
      })
      
      // Add theme-aware variants
      addVariant('glassmorphism', '&:where([data-glassmorphism="true"] *)')
      addVariant('no-animations', '&:where([data-animations="false"] *)')
      addVariant('high-contrast', '&:where([data-high-contrast="true"] *)')
    },
    
    // Plugin for dynamic brand colors
    function({ addBase }: any) {
      addBase({
        ':root': {
          // Ensure CSS variables are defined
          '--brand-primary': brandConfig.colors.primary,
          '--brand-secondary': brandConfig.colors.secondary,
          '--brand-accent': brandConfig.colors.accent,
          '--brand-success': brandConfig.colors.success,
          '--brand-warning': brandConfig.colors.warning,
          '--brand-error': brandConfig.colors.error,
          '--brand-info': brandConfig.colors.info,
        },
      })
    },
  ],
}

export default config satisfies Config

// Export types for better TypeScript integration
export type TailwindConfig = typeof config
export type BrandColorPalette = typeof brandColorPalette

// Export utility functions for dynamic theme generation
export { generateBrandColorPalette, getBrandConfig } 