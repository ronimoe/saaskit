import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const glassCardVariants = cva(
  // Base glass styles with fallbacks
  [
    "relative overflow-hidden transition-all duration-300",
    // Backdrop blur with fallback
    "backdrop-blur-md supports-[backdrop-filter]:bg-white/10 supports-[backdrop-filter]:dark:bg-black/10",
    // Fallback for browsers without backdrop-filter support
    "@supports not (backdrop-filter: blur(1px)) { bg-white/90 dark:bg-slate-800/90 }",
    // Border and shadow
    "border border-white/20 dark:border-white/10",
    "shadow-lg shadow-black/5 dark:shadow-black/20",
  ],
  {
    variants: {
      variant: {
        // Primary glass card - more opaque, suitable for main content
        primary: [
          "bg-white/20 dark:bg-black/20",
          "supports-[backdrop-filter]:bg-white/15 supports-[backdrop-filter]:dark:bg-black/15",
          "border-white/30 dark:border-white/20",
          "shadow-xl shadow-black/10 dark:shadow-black/30",
        ],
        // Secondary glass card - more transparent, for background elements
        secondary: [
          "bg-white/10 dark:bg-black/10",
          "supports-[backdrop-filter]:bg-white/8 supports-[backdrop-filter]:dark:bg-black/8",
          "border-white/20 dark:border-white/10",
          "shadow-lg shadow-black/5 dark:shadow-black/20",
        ],
        // Floating glass card - for overlays and modals
        floating: [
          "bg-white/25 dark:bg-black/25",
          "supports-[backdrop-filter]:bg-white/20 supports-[backdrop-filter]:dark:bg-black/20",
          "border-white/40 dark:border-white/30",
          "shadow-2xl shadow-black/20 dark:shadow-black/40",
          "backdrop-blur-lg",
        ],
        // Subtle glass card - minimal effect for nested components
        subtle: [
          "bg-white/5 dark:bg-black/5",
          "supports-[backdrop-filter]:bg-white/3 supports-[backdrop-filter]:dark:bg-black/3",
          "border-white/10 dark:border-white/5",
          "shadow-md shadow-black/5 dark:shadow-black/10",
        ],
      },
      size: {
        sm: "rounded-lg p-4",
        md: "rounded-xl p-6",
        lg: "rounded-2xl p-8",
        xl: "rounded-3xl p-10",
      },
      depth: {
        // Different shadow depths for layering
        flat: "shadow-none",
        low: "shadow-lg shadow-black/5 dark:shadow-black/20",
        medium: "shadow-xl shadow-black/10 dark:shadow-black/30",
        high: "shadow-2xl shadow-black/15 dark:shadow-black/40",
        floating: [
          "shadow-2xl shadow-black/20 dark:shadow-black/50",
          "drop-shadow-xl",
        ],
      },
      glow: {
        none: "",
        subtle: "before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-white/20 before:dark:border-white/10",
        medium: [
          "before:absolute before:inset-0 before:rounded-[inherit]",
          "before:border before:border-white/30 before:dark:border-white/20",
          "before:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]",
        ],
        strong: [
          "before:absolute before:inset-0 before:rounded-[inherit]",
          "before:border before:border-white/40 before:dark:border-white/30",
          "before:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]",
          "before:dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]",
        ],
      },
      interactive: {
        none: "",
        hover: [
          "hover:bg-white/30 hover:dark:bg-black/30",
          "hover:border-white/40 hover:dark:border-white/30",
          "hover:shadow-xl hover:shadow-black/15 hover:dark:shadow-black/35",
          "hover:-translate-y-1",
        ],
        press: [
          "hover:bg-white/30 hover:dark:bg-black/30",
          "hover:border-white/40 hover:dark:border-white/30",
          "hover:shadow-xl hover:shadow-black/15 hover:dark:shadow-black/35",
          "hover:-translate-y-1",
          "active:translate-y-0 active:shadow-lg",
          "cursor-pointer",
        ],
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      depth: "medium",
      glow: "subtle",
      interactive: "none",
    },
  }
)

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {
  children?: React.ReactNode
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant, size, depth, glow, interactive, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          glassCardVariants({ variant, size, depth, glow, interactive }),
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
GlassCard.displayName = "GlassCard"

// Glass card sub-components that inherit the glass styling
const GlassCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5", className)}
    {...props}
  />
))
GlassCardHeader.displayName = "GlassCardHeader"

const GlassCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      "text-slate-900 dark:text-white",
      className
    )}
    {...props}
  />
))
GlassCardTitle.displayName = "GlassCardTitle"

const GlassCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm text-slate-600 dark:text-slate-300",
      className
    )}
    {...props}
  />
))
GlassCardDescription.displayName = "GlassCardDescription"

const GlassCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-0", className)} {...props} />
))
GlassCardContent.displayName = "GlassCardContent"

const GlassCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-0", className)}
    {...props}
  />
))
GlassCardFooter.displayName = "GlassCardFooter"

export {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardDescription,
  GlassCardContent,
  GlassCardFooter,
  glassCardVariants,
} 