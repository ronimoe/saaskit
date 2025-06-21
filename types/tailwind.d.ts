// Type definitions for custom Tailwind CSS configuration

declare module 'tailwindcss' {
  interface Config {
    theme?: {
      extend?: {
        colors?: {
          brand?: {
            primary?: string
            secondary?: string
            accent?: string
            success?: string
            warning?: string
            error?: string
            info?: string
          }
          glass?: {
            subtle?: string
            light?: string
            medium?: string
            strong?: string
          }
          sidebar?: {
            DEFAULT?: string
            foreground?: string
            primary?: string
            'primary-foreground'?: string
            accent?: string
            'accent-foreground'?: string
            border?: string
            ring?: string
          }
        }
        spacing?: {
          content?: string
          sidebar?: string
          header?: string
        }
        gridTemplateColumns?: {
          'auto-fit-300'?: string
          'auto-fill-250'?: string
          'sidebar-content'?: string
          dashboard?: string
        }
        aspectRatio?: {
          card?: string
          video?: string
          square?: string
          portrait?: string
          landscape?: string
        }
        boxShadow?: {
          'glass-sm'?: string
          'glass-md'?: string
          'glass-lg'?: string
          'glass-xl'?: string
          'glow-sm'?: string
          'glow-md'?: string
          'glow-lg'?: string
        }
        backdropBlur?: {
          xs?: string
          '3xl'?: string
        }
        zIndex?: {
          dropdown?: number
          sticky?: number
          fixed?: number
          'modal-backdrop'?: number
          modal?: number
          popover?: number
          tooltip?: number
          toast?: number
        }
      }
    }
  }
}

// Extend global CSS variable types
declare global {
  interface CSSStyleDeclaration {
    '--brand-primary': string
    '--brand-secondary': string
    '--brand-accent': string
    '--brand-success': string
    '--brand-warning': string
    '--brand-error': string
    '--brand-info': string
    '--spacing-sidebar': string
    '--spacing-header': string
    '--spacing-content': string
    '--glassmorphism-enabled': string
    '--animations-enabled': string
    '--high-contrast-enabled': string
  }
}

export {} 