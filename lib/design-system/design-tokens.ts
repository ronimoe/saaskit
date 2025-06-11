// Design Tokens
// Centralized design values for consistent styling across the system

// === SPACING TOKENS ===
export const SPACING = {
  // Base spacing scale (rem values)
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '0.75rem',    // 12px
  lg: '1rem',       // 16px
  xl: '1.5rem',     // 24px
  '2xl': '2rem',    // 32px
  '3xl': '3rem',    // 48px
  '4xl': '4rem',    // 64px
  '5xl': '6rem',    // 96px
  
  // SaaS Layout specific
  sidebar: '16rem',
  header: '3.5rem',
  content: '1.5rem',
} as const

// === TYPOGRAPHY TOKENS ===
export const TYPOGRAPHY = {
  fontFamilies: {
    sans: 'var(--font-geist-sans)',
    mono: 'var(--font-geist-mono)',
  },
  
  // Type scale
  sizes: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
    '7xl': '4.5rem',    // 72px
    '8xl': '6rem',      // 96px
    '9xl': '8rem',      // 128px
  },
  
  lineHeights: {
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  
  fontWeights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
} as const

// === COLOR TOKENS ===
export const COLORS = {
  // Semantic colors
  semantic: {
    primary: 'var(--primary)',
    secondary: 'var(--secondary)',
    accent: 'var(--accent)',
    success: 'var(--success)',
    warning: 'var(--warning)',
    error: 'var(--destructive)',
    info: 'var(--info)',
  },
  
  // Brand colors (dynamic)
  brand: {
    primary: 'var(--brand-primary)',
    secondary: 'var(--brand-secondary)',
    accent: 'var(--brand-accent)',
    success: 'var(--brand-success)',
    warning: 'var(--brand-warning)',
    error: 'var(--brand-error)',
    info: 'var(--brand-info)',
  },
  
  // Surface colors
  surfaces: {
    background: 'var(--background)',
    foreground: 'var(--foreground)',
    card: 'var(--card)',
    popover: 'var(--popover)',
    muted: 'var(--muted)',
    border: 'var(--border)',
  },
  
  // Glass effect colors
  glass: {
    subtle: 'rgba(255, 255, 255, 0.03)',
    light: 'rgba(255, 255, 255, 0.08)',
    medium: 'rgba(255, 255, 255, 0.15)',
    strong: 'rgba(255, 255, 255, 0.25)',
  },
} as const

// === BORDER RADIUS TOKENS ===
export const RADIUS = {
  none: '0',
  sm: 'calc(var(--radius) - 4px)',
  md: 'calc(var(--radius) - 2px)',
  lg: 'var(--radius)',
  xl: 'calc(var(--radius) + 4px)',
  '2xl': 'calc(var(--radius) + 8px)',
  '3xl': 'calc(var(--radius) + 16px)',
  full: '9999px',
} as const

// === SHADOW TOKENS ===
export const SHADOWS = {
  // Standard shadows
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  
  // Glass shadows
  glass: {
    light: '0 4px 16px rgba(0, 0, 0, 0.05)',
    medium: '0 8px 32px rgba(0, 0, 0, 0.1)',
    strong: '0 12px 40px rgba(0, 0, 0, 0.15)',
    floating: '0 25px 50px rgba(0, 0, 0, 0.25)',
  },
  
  // Glow effects
  glow: {
    subtle: '0 0 20px var(--primary)',
    medium: '0 0 40px var(--primary)',
    strong: '0 0 60px var(--primary)',
  },
} as const

// === ANIMATION TOKENS ===
export const ANIMATIONS = {
  durations: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
    slower: '500ms',
  },
  
  easings: {
    linear: 'linear',
    ease: 'ease',
    'ease-in': 'ease-in',
    'ease-out': 'ease-out',
    'ease-in-out': 'ease-in-out',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  delays: {
    none: '0ms',
    short: '100ms',
    medium: '200ms',
    long: '300ms',
    longer: '500ms',
  },
} as const

// === BREAKPOINTS ===
export const BREAKPOINTS = {
  xs: '480px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// === Z-INDEX SCALE ===
export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  'modal-backdrop': 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
} as const

// === GLASS EFFECT TOKENS ===
export const GLASS_EFFECTS = {
  opacity: {
    subtle: 0.03,
    light: 0.08,
    medium: 0.15,
    strong: 0.25,
  },
  
  blur: {
    subtle: '8px',
    light: '10px',
    medium: '12px',
    deep: '16px',
    floating: '20px',
  },
  
  border: {
    subtle: 0.1,
    light: 0.2,
    medium: 0.3,
    strong: 0.4,
  },
} as const

// === MAGNETIC EFFECT TOKENS ===
export const MAGNETIC_EFFECTS = {
  strength: {
    subtle: 0.1,
    light: 0.2,
    medium: 0.3,
    strong: 0.5,
  },
  
  maxDistance: {
    close: 50,
    medium: 100,
    far: 150,
    extreme: 200,
  },
  
  smoothing: {
    instant: 0,
    fast: 0.1,
    medium: 0.2,
    smooth: 0.3,
  },
} as const

// === PARTICLE EFFECT TOKENS ===
export const PARTICLE_EFFECTS = {
  count: {
    minimal: 20,
    light: 40,
    medium: 60,
    heavy: 80,
    extreme: 100,
  },
  
  size: {
    tiny: 1,
    small: 2,
    medium: 3,
    large: 4,
    huge: 6,
  },
  
  speed: {
    slow: 0.1,
    medium: 0.3,
    fast: 0.5,
    rapid: 0.8,
  },
  
  connectionDistance: {
    close: 80,
    medium: 120,
    far: 160,
    extreme: 200,
  },
} as const

// === LAYOUT GRID TOKENS ===
export const GRID = {
  columns: {
    full: 12,
    tablet: 8,
    mobile: 1,
  },
  
  gaps: {
    tight: '0.5rem',
    normal: '1rem',
    relaxed: '1.5rem',
    loose: '2rem',
  },
  
  cellTypes: {
    1: { span: 4, rows: 2 },
    2: { span: 2, rows: 3 },
    3: { span: 6, rows: 1 },
    4: { span: 3, rows: 2 },
    5: { span: 5, rows: 3 },
    6: { span: 2, rows: 1 },
    7: { span: 4, rows: 1 },
    8: { span: 3, rows: 1 },
    9: { span: 3, rows: 2 },
  },
} as const

// === INTERACTIVE TOKENS ===
export const INTERACTIVE = {
  hover: {
    intensity: 1.1,
    duration: '200ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  active: {
    intensity: 0.9,
    duration: '100ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  focus: {
    intensity: 1.05,
    duration: '150ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const

// === TOKEN COLLECTIONS ===
export const DESIGN_TOKENS = {
  spacing: SPACING,
  typography: TYPOGRAPHY,
  colors: COLORS,
  radius: RADIUS,
  shadows: SHADOWS,
  animations: ANIMATIONS,
  breakpoints: BREAKPOINTS,
  zIndex: Z_INDEX,
  glassEffects: GLASS_EFFECTS,
  magneticEffects: MAGNETIC_EFFECTS,
  particleEffects: PARTICLE_EFFECTS,
  grid: GRID,
  interactive: INTERACTIVE,
} as const

// === TYPE EXPORTS ===
export type SpacingToken = keyof typeof SPACING
export type ColorToken = keyof typeof COLORS.semantic
export type RadiusToken = keyof typeof RADIUS
export type ShadowToken = keyof typeof SHADOWS
export type AnimationDuration = keyof typeof ANIMATIONS.durations
export type AnimationEasing = keyof typeof ANIMATIONS.easings
export type Breakpoint = keyof typeof BREAKPOINTS 