// Design System Type Definitions
// Centralized type definitions for all design system components and utilities

// === COMPONENT VARIANTS ===

export type GlassVariant = 'primary' | 'secondary' | 'accent' | 'floating' | 'subtle'
export type GlassDepth = 'subtle' | 'medium' | 'deep' | 'floating'
export type GlassGlow = 'none' | 'subtle' | 'medium' | 'strong'
export type GlassSize = 'sm' | 'md' | 'lg' | 'xl'

export type MagneticStrength = 'subtle' | 'light' | 'medium' | 'strong'
export type MagneticDistance = 'close' | 'medium' | 'far' | 'extreme'

export type AnimationDurationType = 'fast' | 'normal' | 'slow' | 'slower'
export type AnimationEasingType = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'smooth' | 'spring' | 'bounce'

export type ParticleCount = 'minimal' | 'light' | 'medium' | 'heavy' | 'extreme'
export type ParticleSize = 'tiny' | 'small' | 'medium' | 'large' | 'huge'
export type ParticleSpeed = 'slow' | 'medium' | 'fast' | 'rapid'

export type GridCellType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
export type GridGap = 'tight' | 'normal' | 'relaxed' | 'loose'

// === THEME TYPES ===

export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  success: string
  warning: string
  error: string
  info: string
}

export interface BrandConfiguration {
  primary: string
  secondary: string
  accent: string
  logo?: string
  name?: string
}

export interface PerformanceToggles {
  glassmorphism: boolean
  animations: boolean
  particleEffects: boolean
  magneticEffects: boolean
  highContrast: boolean
}

export interface AccessibilityOptions {
  reducedMotion: boolean
  highContrast: boolean
  screenReaderOptimized: boolean
  keyboardNavigation: boolean
}

// === COMPONENT PROPS ===

export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
  'data-testid'?: string
}

export interface GlassComponentProps extends BaseComponentProps {
  variant?: GlassVariant
  size?: GlassSize
  depth?: GlassDepth
  glow?: GlassGlow
  interactive?: boolean
}

export interface MagneticComponentProps extends BaseComponentProps {
  magnetic?: boolean
  magneticStrength?: number
  magneticDistance?: number
  magneticGlow?: boolean
}

export interface AnimatedComponentProps extends BaseComponentProps {
  animate?: boolean
  animationDuration?: AnimationDurationType
  animationEasing?: AnimationEasingType
  animationDelay?: number
  stagger?: boolean
  staggerDelay?: number
}

export interface ParticleComponentProps extends BaseComponentProps {
  particleCount?: number
  particleColor?: string
  particleSize?: number
  particleSpeed?: number
  connectionDistance?: number
  mouseInteraction?: boolean
}

export interface LayoutComponentProps extends BaseComponentProps {
  asymmetric?: boolean
  cellType?: GridCellType
  diagonal?: boolean
  floating?: boolean
  perspective?: boolean
}

// === INTERACTION TYPES ===

export interface InteractionState {
  isHover: boolean
  isFocus: boolean
  isActive: boolean
  isPressed: boolean
  isDisabled: boolean
}

export interface MotionConfig {
  respectReducedMotion: boolean
  enableHardwareAcceleration: boolean
  enableGPUAcceleration: boolean
  enableTransforms: boolean
}

export interface GestureConfig {
  enableMagnetic: boolean
  enableParallax: boolean
  enableTilt: boolean
  enableHover: boolean
  enableTouch: boolean
}

// === LAYOUT TYPES ===

export interface BreakpointConfig {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  '2xl': number
}

export interface SpacingScale {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
  '3xl': string
  '4xl': string
  '5xl': string
}

export interface TypographyScale {
  xs: string
  sm: string
  base: string
  lg: string
  xl: string
  '2xl': string
  '3xl': string
  '4xl': string
  '5xl': string
  '6xl': string
  '7xl': string
  '8xl': string
  '9xl': string
}

// === ANIMATION TYPES ===

export interface AnimationKeyframes {
  from: Record<string, string | number>
  to: Record<string, string | number>
  [key: string]: Record<string, string | number>
}

export interface TransitionConfig {
  property: string | string[]
  duration: string | number
  timingFunction: string
  delay?: string | number
}

export interface KeyframeAnimation {
  name: string
  keyframes: AnimationKeyframes
  duration: string | number
  timingFunction?: string
  delay?: string | number
  iterationCount?: number | 'infinite'
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both'
}

// === COMPOSITION TYPES ===

export interface CompositionLayer {
  type: 'glass' | 'magnetic' | 'particle' | 'layout' | 'theme'
  props: Record<string, unknown>
  priority: number
  conditional?: boolean
}

export interface CompositionStack {
  layers: CompositionLayer[]
  baseClasses: string
  responsive?: boolean
  accessible?: boolean
  performanceOptimized?: boolean
}

// === UTILITY TYPES ===

export type ResponsiveValue<T> = T | {
  base?: T
  sm?: T
  md?: T
  lg?: T
  xl?: T
  '2xl'?: T
}

export type ConditionalValue<T> = T | {
  default: T
  hover?: T
  focus?: T
  active?: T
  disabled?: T
}

export type VariantValue<T> = T | {
  [variant: string]: T
}

// === CONFIGURATION TYPES ===

export interface DesignSystemConfig {
  theme: {
    colors: ThemeColors
    brand?: BrandConfiguration
    breakpoints: BreakpointConfig
    spacing: SpacingScale
    typography: TypographyScale
  }
  features: {
    glassmorphism: boolean
    magneticEffects: boolean
    particleAnimations: boolean
    nonTraditionalLayouts: boolean
    dynamicTheming: boolean
    gamification: boolean
  }
  performance: PerformanceToggles
  accessibility: AccessibilityOptions
  motion: MotionConfig
  gestures: GestureConfig
}

export interface ComponentLibrary {
  glass: {
    GlassCard: React.ComponentType<GlassComponentProps>
    MagneticGlassCard: React.ComponentType<GlassComponentProps & MagneticComponentProps>
  }
  interactive: {
    UnfoldableFeatureCard: React.ComponentType<BaseComponentProps>
    FeatureConnections: React.ComponentType<BaseComponentProps>
    AnimatedProductMockup: React.ComponentType<AnimatedComponentProps>
  }
  animation: {
    ParticleBackground: React.ComponentType<ParticleComponentProps>
  }
  layout: {
    AsymmetricGrid: React.ComponentType<LayoutComponentProps>
    DiagonalSection: React.ComponentType<LayoutComponentProps>
    FloatingElement: React.ComponentType<LayoutComponentProps>
  }
}

// === HOOK TYPES ===

export interface MagneticHookOptions {
  strength?: number
  smoothing?: number
  maxDistance?: number
  resetDuration?: number
  enabled?: boolean
}

export interface ThemeHookReturn {
  theme: string
  setTheme: (theme: string) => void
  config: DesignSystemConfig
  updateConfig: (config: Partial<DesignSystemConfig>) => void
  colors: ThemeColors
  brand?: BrandConfiguration
}

export interface AnimationHookOptions {
  duration?: AnimationDurationType
  easing?: AnimationEasingType
  delay?: number
  autoPlay?: boolean
  loop?: boolean
  direction?: 'normal' | 'reverse' | 'alternate'
}

// === EVENT TYPES ===

export interface DesignSystemEvent {
  type: 'theme-change' | 'performance-toggle' | 'accessibility-change' | 'animation-complete'
  payload: Record<string, unknown>
  timestamp: number
}

export interface InteractionEvent {
  type: 'hover' | 'focus' | 'click' | 'touch' | 'magnetic-activate' | 'particle-interact'
  target: HTMLElement
  coordinates?: { x: number; y: number }
  force?: number
  timestamp: number
}

// === VALIDATION TYPES ===

export interface ValidationRule<T> {
  required?: boolean
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array'
  validator?: (value: T) => boolean
  message?: string
}

export type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule<T[K]>
}

export interface ValidationResult {
  isValid: boolean
  errors: Array<{
    field: string
    message: string
    value: unknown
  }>
}

// === BROWSER SUPPORT TYPES ===

export interface BrowserSupport {
  backdropFilter: string[]
  cssGrid: string[]
  customProperties: string[]
  intersectionObserver: string[]
  resizeObserver: string[]
}

export interface FeatureDetection {
  backdropFilter: boolean
  cssGrid: boolean
  customProperties: boolean
  intersectionObserver: boolean
  resizeObserver: boolean
  touchEvents: boolean
  pointerEvents: boolean
  webGL: boolean
}

// === EXPORT COLLECTIONS ===

export type DesignSystemComponent = keyof ComponentLibrary[keyof ComponentLibrary]

export type AllVariants = GlassVariant | MagneticStrength | AnimationEasing | ParticleCount | GridCellType

export type AllSizes = GlassSize | ParticleSize

export type AllColors = keyof ThemeColors

export type AllSpacing = keyof SpacingScale

export type AllTypography = keyof TypographyScale 