import { z } from 'zod';

/**
 * Authentication validation schemas using Zod
 * These schemas ensure type safety and consistent validation across auth forms
 */

// Email validation schema
const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .toLowerCase()
  .trim();

// Password validation schema  
const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(6, 'Password must be at least 6 characters');

// Strong password validation (for signup/reset)
const strongPasswordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  );

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

/**
 * Signup form validation schema
 */
export const signupSchema = z
  .object({
    email: emailSchema,
    password: strongPasswordSchema,
    confirmPassword: strongPasswordSchema,
    terms: z.boolean().refine(val => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

/**
 * Password reset request schema
 */
export const passwordResetSchema = z.object({
  email: emailSchema,
});

/**
 * Password reset confirmation schema
 */
export const passwordResetConfirmSchema = z
  .object({
    password: strongPasswordSchema,
    confirmPassword: strongPasswordSchema,
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

/**
 * Type definitions inferred from schemas
 */
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type PasswordResetFormData = z.infer<typeof passwordResetSchema>;
export type PasswordResetConfirmFormData = z.infer<typeof passwordResetConfirmSchema>;

/**
 * Common validation messages for consistent UX
 */
export const authMessages = {
  invalidCredentials: 'Invalid email or password',
  emailNotFound: 'No account found with this email address',
  emailAlreadyExists: 'An account with this email already exists',
  passwordTooWeak: 'Password is too weak. Please choose a stronger password.',
  loginSuccess: 'Welcome back!',
  signupSuccess: 'Account created successfully! Please check your email for verification.',
  passwordResetSent: 'Password reset link sent to your email',
  passwordResetSuccess: 'Password updated successfully',
  networkError: 'Network error. Please check your connection and try again.',
  unexpectedError: 'An unexpected error occurred. Please try again.',
} as const; 