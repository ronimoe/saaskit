/**
 * Button Component
 * 
 * A versatile button component built on top of Radix UI Slot with class-variance-authority
 * for type-safe variant handling. Supports multiple variants, sizes, and can render as
 * different elements using the asChild prop.
 * 
 * @example
 * ```tsx
 * // Basic button
 * <Button>Click me</Button>
 * 
 * // Button with variant and size
 * <Button variant="destructive" size="lg">Delete</Button>
 * 
 * // Button as a link
 * <Button asChild>
 *   <Link href="/dashboard">Go to Dashboard</Link>
 * </Button>
 * ```
 */

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Button variant configuration using class-variance-authority
 * Defines all possible button styles and their corresponding CSS classes
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

/**
 * Button component props interface
 */
interface ButtonProps extends 
  React.ComponentProps<"button">,
  VariantProps<typeof buttonVariants> {
  /**
   * When true, the button will render as a Slot component,
   * allowing it to merge with its child component
   * @default false
   */
  asChild?: boolean
}

/**
 * Button Component
 * 
 * @param className - Additional CSS classes to apply
 * @param variant - Button style variant (default, destructive, outline, secondary, ghost, link)
 * @param size - Button size (default, sm, lg, icon)
 * @param asChild - Whether to render as a Slot component
 * @param props - Additional button props
 */
function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
