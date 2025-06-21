/**
 * Utility Functions
 * 
 * Common utility functions used throughout the application.
 * Includes class name merging, type guards, and other helper functions.
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names using clsx and merges Tailwind CSS classes using tailwind-merge
 * 
 * This function handles conditional class names and resolves Tailwind CSS conflicts
 * by merging conflicting classes intelligently (e.g., 'px-2 px-4' becomes 'px-4').
 * 
 * @param inputs - Class names, objects, arrays, or any values accepted by clsx
 * @returns Merged and deduplicated class string
 * 
 * @example
 * ```tsx
 * // Basic usage
 * cn('px-2', 'py-1') // 'px-2 py-1'
 * 
 * // Conditional classes
 * cn('px-2', { 'py-4': isLarge, 'py-2': !isLarge })
 * 
 * // Tailwind conflict resolution
 * cn('px-2', 'px-4') // 'px-4' (later class wins)
 * 
 * // With component props
 * cn('base-styles', className, { 'active': isActive })
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Type guard to check if a value is not null or undefined
 * 
 * @param value - Value to check
 * @returns True if value is not null or undefined
 * 
 * @example
 * ```tsx
 * const items = [1, null, 3, undefined, 5]
 * const validItems = items.filter(isDefined) // [1, 3, 5]
 * ```
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

/**
 * Type guard to check if a value is a non-empty string
 * 
 * @param value - Value to check
 * @returns True if value is a non-empty string
 * 
 * @example
 * ```tsx
 * isNonEmptyString('hello') // true
 * isNonEmptyString('') // false
 * isNonEmptyString(null) // false
 * ```
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}

/**
 * Formats a number as currency using the user's locale
 * 
 * @param amount - Amount in cents (e.g., 2999 for $29.99)
 * @param currency - Currency code (default: 'USD')
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted currency string
 * 
 * @example
 * ```tsx
 * formatCurrency(2999) // '$29.99'
 * formatCurrency(5000, 'EUR', 'de-DE') // '50,00 €'
 * ```
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount / 100)
}

/**
 * Truncates text to a specified length and adds ellipsis
 * 
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @param suffix - Suffix to add when truncated (default: '...')
 * @returns Truncated text
 * 
 * @example
 * ```tsx
 * truncateText('Hello world', 5) // 'Hello...'
 * truncateText('Short', 10) // 'Short'
 * ```
 */
export function truncateText(
  text: string,
  maxLength: number,
  suffix: string = '...'
): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - suffix.length) + suffix
}

/**
 * Debounces a function call, useful for search inputs and API calls
 * 
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 * 
 * @example
 * ```tsx
 * const debouncedSearch = debounce((query: string) => {
 *   // API call
 * }, 300)
 * 
 * // In component
 * const handleSearch = debouncedSearch
 * ```
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * Generates a random ID string
 * 
 * @param length - Length of the generated ID (default: 8)
 * @returns Random ID string
 * 
 * @example
 * ```tsx
 * generateId() // 'k3j9d8f2'
 * generateId(12) // 'a8k3j9d8f2m1'
 * ```
 */
export function generateId(length: number = 8): string {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length)
}
