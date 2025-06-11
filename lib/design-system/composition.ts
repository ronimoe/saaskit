// Component Composition Utilities
// Helper functions for combining design system components and effects

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// === UTILITY FUNCTIONS ===

/**
 * Utility function to combine class names with tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate responsive classes based on breakpoints
 */
export function responsive(classes: Record<string, string>) {
  return Object.entries(classes)
    .map(([breakpoint, className]) => {
      if (breakpoint === 'base') return className
      return `${breakpoint}:${className}`
    })
    .join(' ')
}

// === GLASS COMPOSITION ===

export interface GlassCompositionProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'floating' | 'subtle'
  depth?: 'subtle' | 'medium' | 'deep' | 'floating'
  glow?: 'none' | 'subtle' | 'medium' | 'strong'
  magnetic?: boolean
  magneticStrength?: number
  className?: string
}

/**
 * Compose glass effect classes with magnetic effects
 */
export function composeGlassEffects({
  variant = 'primary',
  depth = 'medium',
  glow = 'none',
  magnetic = false,
  className = ''
}: GlassCompositionProps) {
  return cn(
    // Base glass styles
    'backdrop-blur-sm bg-background/80 border border-border/50',
    
    // Variant styles
    {
      'bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10': variant === 'primary',
      'bg-secondary/10 border-secondary/20': variant === 'secondary',
      'bg-accent/10 border-accent/20': variant === 'accent',
      'bg-white/5 dark:bg-black/5 border-white/10 dark:border-white/5': variant === 'subtle',
      'bg-white/15 dark:bg-black/15 border-white/30 dark:border-white/20 shadow-2xl': variant === 'floating',
    },
    
    // Depth styles
    {
      'shadow-md': depth === 'subtle',
      'shadow-lg': depth === 'medium', 
      'shadow-xl': depth === 'deep',
      'shadow-2xl drop-shadow-xl': depth === 'floating',
    },
    
    // Glow effects
    {
      'before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-white/20': glow === 'subtle',
      'before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-white/30 before:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]': glow === 'medium',
      'before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-white/40 before:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]': glow === 'strong',
    },
    
    // Magnetic effects
    {
      'magnetic-element cursor-pointer transition-transform duration-200': magnetic,
    },
    
    className
  )
}

// === ANIMATION COMPOSITION ===

export interface AnimationCompositionProps {
  magnetic?: boolean
  particles?: boolean
  stagger?: boolean
  staggerDelay?: number
  hover?: boolean
  className?: string
}

/**
 * Compose animation classes for interactive elements
 */
export function composeAnimations({
  magnetic = false,
  particles = false,
  stagger = false,
  hover = true,
  className = ''
}: AnimationCompositionProps) {
  return cn(
    // Base animation styles
    'transition-all duration-300 ease-smooth',
    
    // Magnetic effects
    {
      'magnetic transform-gpu will-change-transform': magnetic,
    },
    
    // Stagger animations
    {
      'stagger-animation': stagger,
    },
    
    // Hover animations
    {
      'hover:scale-105 hover:shadow-lg hover:-translate-y-1': hover,
    },
    
    // Particle background container
    {
      'relative overflow-hidden': particles,
    },
    
    className
  )
}

// === LAYOUT COMPOSITION ===

export interface LayoutCompositionProps {
  asymmetric?: boolean
  cellType?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
  diagonal?: boolean
  floating?: boolean
  className?: string
}

/**
 * Compose layout classes for non-traditional layouts
 */
export function composeLayout({
  asymmetric = false,
  cellType,
  diagonal = false,
  floating = false,
  className = ''
}: LayoutCompositionProps) {
  return cn(
    // Base layout
    'relative',
    
    // Asymmetric grid
    {
      'asymmetric-grid': asymmetric,
    },
    
    // Grid cell types
    cellType && `grid-cell-${cellType}`,
    
    // Diagonal sections
    {
      'diagonal-section': diagonal,
    },
    
    // Floating elements
    {
      'floating-element absolute animate-float': floating,
    },
    
    className
  )
}

// === THEME COMPOSITION ===

export interface ThemeCompositionProps {
  brand?: boolean
  interactive?: boolean
  conditional?: boolean
  highContrast?: boolean
  className?: string
}

/**
 * Compose theme-aware classes
 */
export function composeTheme({
  brand = false,
  interactive = false,
  conditional = false,
  highContrast = false,
  className = ''
}: ThemeCompositionProps) {
  return cn(
    // Brand integration
    {
      'text-brand-primary bg-brand-primary border-brand-primary': brand,
    },
    
    // Interactive colors
    {
      'interactive-colors': interactive,
    },
    
    // Conditional features
    {
      'conditional-glassmorphism conditional-animation': conditional,
    },
    
    // High contrast mode
    {
      'high-contrast': highContrast,
    },
    
    className
  )
}

// === COMPLETE COMPOSITION ===

export interface CompleteCompositionProps {
  base?: string
  // Glass props
  variant?: 'primary' | 'secondary' | 'accent' | 'floating' | 'subtle'
  depth?: 'subtle' | 'medium' | 'deep' | 'floating'
  glow?: 'none' | 'subtle' | 'medium' | 'strong'
  magnetic?: boolean
  magneticStrength?: number
  // Animation props
  particles?: boolean
  stagger?: boolean
  staggerDelay?: number
  hover?: boolean
  // Layout props
  asymmetric?: boolean
  cellType?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
  diagonal?: boolean
  floating?: boolean
  // Theme props
  brand?: boolean
  interactive?: boolean
  conditional?: boolean
  highContrast?: boolean
  // Common
  className?: string
}

/**
 * Compose all design system effects into a single className
 */
export function composeComplete(props: CompleteCompositionProps) {
  const {
    base = '',
    className = '',
    variant, depth, glow, magnetic, magneticStrength,
    particles, stagger, staggerDelay, hover,
    asymmetric, cellType, diagonal, floating,
    brand, interactive, conditional, highContrast
  } = props
  
  return cn(
    base,
    composeGlassEffects({ variant, depth, glow, magnetic, magneticStrength }),
    composeAnimations({ magnetic, particles, stagger, staggerDelay, hover }),
    composeLayout({ asymmetric, cellType, diagonal, floating }),
    composeTheme({ brand, interactive, conditional, highContrast }),
    className
  )
}

// === PERFORMANCE UTILITIES ===

/**
 * Conditionally apply composition based on performance settings
 */
export function performanceAwareComposition(
  composition: string,
  conditions: {
    respectReducedMotion?: boolean
    respectGlassmorphismToggle?: boolean
    respectAnimationToggle?: boolean
  } = {}
) {
  let classes = composition
  
  // Add conditional classes based on performance toggles
  if (conditions.respectReducedMotion) {
    classes = `${classes} motion-safe:transition-all motion-reduce:transition-none`
  }
  
  if (conditions.respectGlassmorphismToggle) {
    classes = `${classes} conditional-glassmorphism`
  }
  
  if (conditions.respectAnimationToggle) {
    classes = `${classes} conditional-animation`
  }
  
  return classes
}

// === ACCESSIBILITY COMPOSITION ===

/**
 * Add accessibility-aware classes to compositions
 */
export function accessibleComposition(
  composition: string,
  options: {
    focusVisible?: boolean
    highContrast?: boolean
    screenReader?: boolean
  } = {}
) {
  return cn(
    composition,
    {
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2': options.focusVisible,
      'contrast-more:border-contrast-more:bg-contrast-more:text-contrast': options.highContrast,
      'sr-only': options.screenReader,
    }
  )
} 