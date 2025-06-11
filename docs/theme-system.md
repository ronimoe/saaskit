# Advanced Theme System (Task 14.2)

The Advanced Theme System provides dynamic color adaptation, brand integration, and intelligent theme switching capabilities. This system creates cohesive visual experiences that adapt to user preferences and brand requirements.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Theme Configuration](#theme-configuration)
4. [Dynamic Color System](#dynamic-color-system)
5. [Brand Integration](#brand-integration)
6. [Performance Toggles](#performance-toggles)
7. [Implementation Guide](#implementation-guide)
8. [Customization](#customization)
9. [Accessibility](#accessibility)

## Overview

The Advanced Theme System goes beyond traditional dark/light mode switching to provide:

- **Dynamic Color Adaptation**: Colors that change based on user interactions and context
- **Brand Integration**: Seamless integration of custom brand colors with automatic palette generation
- **Intelligent Switching**: Smart theme detection based on time, location, and user behavior
- **Performance Controls**: Granular control over visual effects and animations
- **Accessibility First**: WCAG compliant with high contrast and reduced motion support

### Key Features

✅ **Dynamic Theming**: Real-time color adaptation and theme switching
✅ **Brand Consistency**: Automatic brand color integration across all components
✅ **Performance Optimized**: Toggleable effects for better performance on low-end devices
✅ **User Preferences**: Respects system preferences and accessibility settings
✅ **Developer Friendly**: Simple API with comprehensive customization options

## Architecture

### CSS Custom Properties Foundation

The theme system is built on CSS custom properties for maximum performance and flexibility:

```css
:root {
  /* Core theme colors */
  --primary: 222.2 84% 4.9%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;
  
  /* Dynamic brand colors */
  --brand-primary: var(--primary);
  --brand-secondary: var(--secondary);
  --brand-accent: var(--accent);
  
  /* Interactive color intensities */
  --interactive-hover-intensity: 1.1;
  --interactive-active-intensity: 0.9;
  --interactive-transition-duration: 0.2s;
}
```

### Theme Variants

```css
/* Light theme */
.light {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
}

/* Dark theme */
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
}

/* High contrast theme */
.high-contrast {
  --background: 0 0% 100%;
  --foreground: 0 0% 0%;
  --primary: 240 100% 50%;
  --primary-foreground: 0 0% 100%;
}
```

## Theme Configuration

### Basic Theme Setup

```typescript
// lib/theme-config.ts
export interface ThemeConfig {
  defaultTheme: 'light' | 'dark' | 'system'
  enableDynamicColors: boolean
  enableBrandIntegration: boolean
  brandColors?: {
    primary: string
    secondary: string
    accent: string
  }
  performanceToggles?: {
    glassmorphism: boolean
    animations: boolean
    particleEffects: boolean
  }
  accessibility?: {
    highContrast: boolean
    reducedMotion: boolean
    forcedColors: boolean
  }
}

export const defaultThemeConfig: ThemeConfig = {
  defaultTheme: 'system',
  enableDynamicColors: true,
  enableBrandIntegration: true,
  performanceToggles: {
    glassmorphism: true,
    animations: true,
    particleEffects: true
  },
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    forcedColors: false
  }
}
```

### Theme Provider Component

```tsx
// components/providers/theme-provider.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { ThemeConfig, defaultThemeConfig } from '@/lib/theme-config'

interface ThemeContextType {
  theme: string
  setTheme: (theme: string) => void
  config: ThemeConfig
  updateConfig: (config: Partial<ThemeConfig>) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ 
  children, 
  defaultTheme = 'system',
  ...props 
}: {
  children: React.ReactNode
  defaultTheme?: string
}) {
  const [theme, setTheme] = useState(defaultTheme)
  const [config, setConfig] = useState<ThemeConfig>(defaultThemeConfig)

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }

    // Apply performance toggles
    root.style.setProperty(
      '--glassmorphism-enabled', 
      config.performanceToggles?.glassmorphism ? '1' : '0'
    )
    root.style.setProperty(
      '--animations-enabled', 
      config.performanceToggles?.animations ? '1' : '0'
    )

    // Apply brand colors if enabled
    if (config.enableBrandIntegration && config.brandColors) {
      Object.entries(config.brandColors).forEach(([key, value]) => {
        root.style.setProperty(`--brand-${key}`, value)
      })
    }
  }, [theme, config])

  const updateConfig = (newConfig: Partial<ThemeConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }))
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, config, updateConfig }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
```

## Dynamic Color System

### Interactive Color Classes

Colors that adapt based on user interactions:

```css
/* Interactive color utilities */
.interactive-colors {
  /* Base colors that change on hover/focus */
  --base-opacity: 1;
  --hover-opacity: calc(var(--base-opacity) * var(--interactive-hover-intensity));
  --active-opacity: calc(var(--base-opacity) * var(--interactive-active-intensity));
  
  transition: all var(--interactive-transition-duration) ease-in-out;
}

.interactive-colors:hover {
  opacity: var(--hover-opacity);
  transform: translateY(-1px);
}

.interactive-colors:active {
  opacity: var(--active-opacity);
  transform: translateY(0px);
}

/* Dynamic background colors */
.dynamic-bg-primary {
  background-color: hsl(var(--primary) / var(--base-opacity));
}

.dynamic-bg-primary:hover {
  background-color: hsl(var(--primary) / var(--hover-opacity));
}

/* Dynamic text colors */
.dynamic-text-primary {
  color: hsl(var(--primary) / var(--base-opacity));
}

.dynamic-text-primary:hover {
  color: hsl(var(--primary) / var(--hover-opacity));
}
```

### Context-Aware Colors

Colors that change based on the current context:

```css
/* Time-based color adjustments */
@media (prefers-color-scheme: dark) {
  .context-adaptive {
    --intensity-multiplier: 0.8;
  }
}

@media (prefers-color-scheme: light) {
  .context-adaptive {
    --intensity-multiplier: 1.2;
  }
}

/* Focus-aware color adjustments */
.focus-context:focus-within {
  --interactive-hover-intensity: 1.3;
  --interactive-transition-duration: 0.1s;
}

/* Error context */
.error-context {
  --primary: 0 84% 60%; /* Red shade */
  --primary-foreground: 0 0% 100%;
}

/* Success context */
.success-context {
  --primary: 142 71% 45%; /* Green shade */
  --primary-foreground: 0 0% 100%;
}
```

## Brand Integration

### Automatic Brand Color Integration

```typescript
// lib/brand-integration.ts
export interface BrandColors {
  primary: string
  secondary: string
  accent: string
  logo?: string
}

export function generateBrandPalette(brandColors: BrandColors) {
  return {
    // Primary variations
    'brand-primary': brandColors.primary,
    'brand-primary-light': lighten(brandColors.primary, 20),
    'brand-primary-dark': darken(brandColors.primary, 20),
    'brand-primary-muted': desaturate(brandColors.primary, 50),
    
    // Secondary variations
    'brand-secondary': brandColors.secondary,
    'brand-secondary-light': lighten(brandColors.secondary, 20),
    'brand-secondary-dark': darken(brandColors.secondary, 20),
    
    // Accent variations
    'brand-accent': brandColors.accent,
    'brand-accent-light': lighten(brandColors.accent, 20),
    'brand-accent-dark': darken(brandColors.accent, 20),
  }
}

// Color manipulation utilities
function lighten(color: string, amount: number): string {
  // Implementation for lightening HSL colors
  const hsl = parseHSL(color)
  return `${hsl.h} ${hsl.s}% ${Math.min(100, hsl.l + amount)}%`
}

function darken(color: string, amount: number): string {
  // Implementation for darkening HSL colors
  const hsl = parseHSL(color)
  return `${hsl.h} ${hsl.s}% ${Math.max(0, hsl.l - amount)}%`
}

function desaturate(color: string, amount: number): string {
  // Implementation for desaturating HSL colors
  const hsl = parseHSL(color)
  return `${hsl.h} ${Math.max(0, hsl.s - amount)}% ${hsl.l}%`
}
```

### Brand Color Application

```tsx
// Usage example with brand integration
function BrandedComponent() {
  const { config, updateConfig } = useTheme()

  const applyBrandColors = (colors: BrandColors) => {
    updateConfig({
      enableBrandIntegration: true,
      brandColors: colors
    })
  }

  return (
    <div className="brand-integrated">
      <div 
        className="bg-brand-primary text-brand-primary-foreground p-4 rounded-lg"
        style={{
          backgroundColor: 'hsl(var(--brand-primary))',
          color: 'hsl(var(--brand-primary-foreground))'
        }}
      >
        Brand-integrated content
      </div>
    </div>
  )
}
```

## Performance Toggles

### CSS Feature Toggles

```css
/* Conditional glassmorphism effects */
.glass-effect {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Disable glassmorphism when toggle is off */
:root[style*="--glassmorphism-enabled: 0"] .glass-effect {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: none;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

/* Conditional animations */
.animated-element {
  transition: all 0.3s ease-in-out;
  animation: fadeIn 0.5s ease-in-out;
}

/* Disable animations when toggle is off */
:root[style*="--animations-enabled: 0"] .animated-element {
  transition: none !important;
  animation: none !important;
}

/* Conditional particle effects */
.particle-background {
  position: relative;
}

:root[style*="--particle-effects-enabled: 0"] .particle-background::before {
  display: none;
}
```

### Performance Toggle Component

```tsx
// components/ui/performance-toggles.tsx
import { useTheme } from '@/components/providers/theme-provider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export function PerformanceToggles() {
  const { config, updateConfig } = useTheme()

  const toggles = [
    {
      key: 'glassmorphism',
      label: 'Glassmorphism Effects',
      description: 'Translucent blur effects'
    },
    {
      key: 'animations',
      label: 'Animations',
      description: 'Smooth transitions and animations'
    },
    {
      key: 'particleEffects',
      label: 'Particle Effects',
      description: 'Interactive background particles'
    }
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Performance Settings</h3>
      {toggles.map(({ key, label, description }) => (
        <div key={key} className="flex items-center justify-between">
          <div>
            <Label htmlFor={key}>{label}</Label>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <Switch
            id={key}
            checked={config.performanceToggles?.[key] ?? true}
            onCheckedChange={(checked) => {
              updateConfig({
                performanceToggles: {
                  ...config.performanceToggles,
                  [key]: checked
                }
              })
            }}
          />
        </div>
      ))}
    </div>
  )
}
```

## Implementation Guide

### Setting Up the Theme System

1. **Install the Theme Provider**:

```tsx
// app/layout.tsx
import { ThemeProvider } from '@/components/providers/theme-provider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          defaultTheme="system"
          enableDynamicColors={true}
          enableBrandIntegration={true}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

2. **Use Theme in Components**:

```tsx
// components/example-component.tsx
import { useTheme } from '@/components/providers/theme-provider'

export function ExampleComponent() {
  const { theme, setTheme, config } = useTheme()

  return (
    <div className={`theme-aware ${theme}`}>
      <button
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        className="interactive-colors dynamic-bg-primary"
      >
        Toggle Theme
      </button>
    </div>
  )
}
```

3. **Apply Dynamic Colors**:

```tsx
// Apply dynamic colors to any component
function DynamicCard() {
  return (
    <div className="interactive-colors dynamic-bg-secondary p-6 rounded-lg">
      <h3 className="dynamic-text-primary">Dynamic Colors</h3>
      <p className="dynamic-text-secondary">
        Colors adapt to interactions and theme
      </p>
    </div>
  )
}
```

### Theme Switching Component

```tsx
// components/ui/theme-switcher.tsx
import { useTheme } from '@/components/providers/theme-provider'
import { Button } from '@/components/ui/button'
import { Sun, Moon, Monitor } from 'lucide-react'

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  const themes = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' }
  ]

  return (
    <div className="flex items-center space-x-2">
      {themes.map(({ value, icon: Icon, label }) => (
        <Button
          key={value}
          variant={theme === value ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTheme(value)}
          className="interactive-colors"
        >
          <Icon className="w-4 h-4 mr-2" />
          {label}
        </Button>
      ))}
    </div>
  )
}
```

## Customization

### Custom Theme Variants

```css
/* Custom theme variants */
.theme-ocean {
  --primary: 200 100% 40%;
  --primary-foreground: 0 0% 100%;
  --secondary: 200 50% 90%;
  --secondary-foreground: 200 100% 20%;
  --accent: 180 100% 50%;
  --accent-foreground: 0 0% 100%;
}

.theme-sunset {
  --primary: 20 100% 60%;
  --primary-foreground: 0 0% 100%;
  --secondary: 40 100% 85%;
  --secondary-foreground: 20 100% 30%;
  --accent: 350 100% 70%;
  --accent-foreground: 0 0% 100%;
}

.theme-forest {
  --primary: 120 50% 40%;
  --primary-foreground: 0 0% 100%;
  --secondary: 120 30% 85%;
  --secondary-foreground: 120 50% 20%;
  --accent: 60 80% 50%;
  --accent-foreground: 0 0% 10%;
}
```

### Advanced Color Utilities

```typescript
// lib/color-utilities.ts
export class ColorUtils {
  static hslToString(h: number, s: number, l: number): string {
    return `${h} ${s}% ${l}%`
  }

  static parseHSL(hslString: string): { h: number; s: number; l: number } {
    const match = hslString.match(/(\d+)\s+(\d+)%\s+(\d+)%/)
    if (!match) throw new Error('Invalid HSL string')
    
    return {
      h: parseInt(match[1]),
      s: parseInt(match[2]),
      l: parseInt(match[3])
    }
  }

  static generatePalette(baseColor: string, steps: number = 9): string[] {
    const hsl = this.parseHSL(baseColor)
    const palette: string[] = []
    
    for (let i = 0; i < steps; i++) {
      const lightness = 10 + (i * (90 / (steps - 1)))
      palette.push(this.hslToString(hsl.h, hsl.s, lightness))
    }
    
    return palette
  }

  static getContrastColor(backgroundColor: string): string {
    const hsl = this.parseHSL(backgroundColor)
    return hsl.l > 50 ? '222.2 84% 4.9%' : '210 40% 98%'
  }
}
```

## Accessibility

### High Contrast Support

```css
/* High contrast theme */
@media (prefers-contrast: high) {
  :root {
    --primary: 240 100% 50%;
    --primary-foreground: 0 0% 100%;
    --secondary: 0 0% 90%;
    --secondary-foreground: 0 0% 10%;
    --border: 0 0% 50%;
    --ring: 240 100% 50%;
  }

  .glass-effect {
    background: var(--background) !important;
    backdrop-filter: none !important;
    border: 2px solid var(--border) !important;
  }
}

/* Forced colors mode (Windows High Contrast) */
@media (forced-colors: active) {
  .interactive-colors {
    forced-color-adjust: auto;
  }

  .glass-effect {
    background: Canvas !important;
    border: 1px solid ButtonBorder !important;
    backdrop-filter: none !important;
  }
}
```

### Reduced Motion Support

```css
/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .interactive-colors {
    transition: none !important;
    animation: none !important;
  }

  .dynamic-bg-primary,
  .dynamic-text-primary {
    transition: none !important;
  }
}
```

### ARIA Support

```tsx
// Theme switcher with ARIA support
export function AccessibleThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  return (
    <div role="group" aria-labelledby="theme-switcher-label">
      <span id="theme-switcher-label" className="sr-only">
        Theme selection
      </span>
      
      <fieldset className="flex items-center space-x-2">
        <legend className="sr-only">Choose your preferred theme</legend>
        
        {themes.map(({ value, label }) => (
          <label key={value} className="cursor-pointer">
            <input
              type="radio"
              name="theme"
              value={value}
              checked={theme === value}
              onChange={() => setTheme(value)}
              className="sr-only"
            />
            <span 
              className={`
                block px-3 py-2 rounded-md border
                ${theme === value 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-secondary text-secondary-foreground border-border'
                }
                interactive-colors
              `}
              role="button"
              aria-pressed={theme === value}
            >
              {label}
            </span>
          </label>
        ))}
      </fieldset>
    </div>
  )
}
```

## Advanced Features

### System Integration

```typescript
// lib/system-theme-detection.ts
export class SystemThemeDetector {
  private mediaQuery: MediaQueryList

  constructor() {
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  }

  getCurrentTheme(): 'light' | 'dark' {
    return this.mediaQuery.matches ? 'dark' : 'light'
  }

  onThemeChange(callback: (theme: 'light' | 'dark') => void): void {
    this.mediaQuery.addEventListener('change', (e) => {
      callback(e.matches ? 'dark' : 'light')
    })
  }

  getSystemPreferences() {
    return {
      prefersColorScheme: this.getCurrentTheme(),
      prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      prefersContrast: window.matchMedia('(prefers-contrast: high)').matches,
      forcedColors: window.matchMedia('(forced-colors: active)').matches
    }
  }
}
```

### Performance Monitoring

```typescript
// lib/theme-performance.ts
export class ThemePerformanceMonitor {
  private observer: PerformanceObserver

  constructor() {
    this.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes('theme-transition')) {
          console.log(`Theme transition took: ${entry.duration}ms`)
        }
      }
    })

    this.observer.observe({ entryTypes: ['measure'] })
  }

  measureThemeSwitch(callback: () => void): void {
    performance.mark('theme-switch-start')
    callback()
    
    requestAnimationFrame(() => {
      performance.mark('theme-switch-end')
      performance.measure(
        'theme-transition',
        'theme-switch-start',
        'theme-switch-end'
      )
    })
  }
}
```

---

**Related Documentation:**
- [UI System Overview](./ui-system-overview.md)
- [Glass Components](./glass-components.md)
- [Animation System](./animations-system.md)

*Last Updated: June 11, 2025* 