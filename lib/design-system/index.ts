// Design System Entry Point
// Centralized exports for all innovative UI components and utilities

// === COMPONENTS ===
// Glass Components (14.1)
export { GlassCard } from '@/components/ui/glass-card'
export { MagneticGlassCard } from '@/components/ui/magnetic-glass-card'

// Interactive Components (14.6)  
export { UnfoldableFeatureCard } from '@/components/ui/unfoldable-feature-card'
export { FeatureConnections } from '@/components/ui/feature-connections'
export { AnimatedProductMockup } from '@/components/ui/animated-product-mockup'

// Animation Components (14.3)
export { ParticleBackground } from '@/components/ui/particle-background'

// Layout Components (14.4)
// Note: Layout components are primarily CSS-based with utility classes

// === HOOKS ===
// Magnetic Effects Hook (14.3)
export { useMagneticEffect } from '@/lib/hooks/use-magnetic-effect'

// Theme Configuration Hook (14.2)
export { useThemeConfig } from '@/lib/hooks/use-theme-config'

// === UTILITIES ===
// Theme Configuration and Types (14.2)
export { 
  type ThemeConfig,
  type BrandColors,
  predefinedThemes,
  generateColorShades,
  adjustOklchLightness,
  createBrandPalette,
  validateThemeConfig,
  getThemeById,
  getThemesByMode
} from '@/lib/theme-config'

// Gamification Utilities (14.5)
export {
  type Achievement,
  type UserProgress,
  type UserLevel,
  calculateUserLevel,
  calculateUserXP,
  calculateProfileCompletion,
  getAvailableAchievements,
  checkAchievements,
  getAchievementRarityStyles,
  calculateUserProgress
} from '@/lib/gamification-utils'

// === DESIGN TOKENS ===
export * from '@/lib/design-system/design-tokens'

// === COMPOSITION UTILITIES ===
export * from '@/lib/design-system/composition'

// === TYPES ===
export * from '@/lib/design-system/types'

// === VERSION ===
export const DESIGN_SYSTEM_VERSION = '1.0.0'

// === FEATURE FLAGS ===
export const FEATURES = {
  GLASSMORPHISM: true,
  MAGNETIC_EFFECTS: true, 
  PARTICLE_ANIMATIONS: true,
  INTERACTIVE_CONNECTIONS: true,
  GAMIFICATION: true,
  NON_TRADITIONAL_LAYOUTS: true,
  DYNAMIC_THEMING: true,
  ACCESSIBILITY_ENHANCEMENTS: true
} as const

// === BROWSER SUPPORT ===
export const BROWSER_SUPPORT = {
  BACKDROP_FILTER: ['Chrome 88+', 'Firefox 103+', 'Safari 14+', 'Edge 88+'],
  CSS_GRID: ['Chrome 57+', 'Firefox 52+', 'Safari 10.1+', 'Edge 16+'],
  CUSTOM_PROPERTIES: ['Chrome 49+', 'Firefox 31+', 'Safari 9.1+', 'Edge 15+'],
  INTERSECTION_OBSERVER: ['Chrome 51+', 'Firefox 55+', 'Safari 12.1+', 'Edge 17+'],
  RESIZE_OBSERVER: ['Chrome 64+', 'Firefox 69+', 'Safari 13.1+', 'Edge 79+']
} as const

// === ACCESSIBILITY ===
export const ACCESSIBILITY_FEATURES = {
  REDUCED_MOTION_SUPPORT: true,
  HIGH_CONTRAST_MODE: true,
  SCREEN_READER_COMPATIBLE: true,
  KEYBOARD_NAVIGATION: true,
  FOCUS_MANAGEMENT: true,
  SEMANTIC_HTML: true
} as const 