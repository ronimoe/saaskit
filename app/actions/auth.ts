'use server';

import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@/lib/supabase';
import { authHelpers } from '@/lib/supabase';
import { loginSchema, signupSchema, passwordResetSchema } from '@/lib/schemas/auth';
import { authMessages } from '@/lib/schemas/auth';
import { env } from '@/lib/env';
import type { LoginFormData, SignupFormData, PasswordResetFormData } from '@/lib/schemas/auth';

/**
 * Server action response type for consistent error handling
 */
type ActionResponse<T = void> = {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
};

/**
 * Helper function to handle validation errors
 */
function handleValidationError(error: unknown): ActionResponse {
  if (error && typeof error === 'object' && 'issues' in error) {
    const zodError = error as { issues: Array<{ path: string[]; message: string }> };
    const errors: Record<string, string[]> = {};
    
    zodError.issues.forEach((issue) => {
      const field = issue.path.join('.');
      if (!errors[field]) {
        errors[field] = [];
      }
      errors[field].push(issue.message);
    });

    return {
      success: false,
      message: 'Validation failed',
      errors,
    };
  }

  return {
    success: false,
    message: authMessages.unexpectedError,
  };
}

/**
 * Sign in with email and password
 */
export async function signInAction(formData: LoginFormData): Promise<ActionResponse> {
  try {
    // Validate input data
    const validatedData = loginSchema.parse(formData);
    
    // Create Supabase client
    const supabase = await createServerComponentClient();
    
    // Attempt to sign in
    const result = await authHelpers.signInWithPassword(
      supabase,
      validatedData.email,
      validatedData.password
    );
    
    if (result.error) {
      // Handle specific authentication errors
      if (result.error.includes('Invalid login credentials')) {
        return {
          success: false,
          message: authMessages.invalidCredentials,
        };
      }
      
      if (result.error.includes('Email not confirmed')) {
        return {
          success: false,
          message: 'Please check your email and click the confirmation link before signing in.',
        };
      }
      
      return {
        success: false,
        message: result.error,
      };
    }
    
    // Success - redirect will happen in the component
    return {
      success: true,
      message: authMessages.loginSuccess,
    };
    
  } catch (error) {
    console.error('Sign in error:', error);
    
    // Handle validation errors
    if (error && typeof error === 'object' && 'issues' in error) {
      return handleValidationError(error);
    }
    
    return {
      success: false,
      message: authMessages.unexpectedError,
    };
  }
}

/**
 * Sign up with email and password
 */
export async function signUpAction(formData: SignupFormData): Promise<ActionResponse> {
  try {
    // Validate input data
    const validatedData = signupSchema.parse(formData);
    
    // Create Supabase client
    const supabase = await createServerComponentClient();
    
    // Attempt to sign up
    const result = await authHelpers.signUpWithPassword(
      supabase,
      validatedData.email,
      validatedData.password,
      {
        emailRedirectTo: `${env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      }
    );
    
    if (result.error) {
      // Handle specific registration errors
      if (result.error.includes('already registered')) {
        return {
          success: false,
          message: authMessages.emailAlreadyExists,
        };
      }
      
      return {
        success: false,
        message: result.error,
      };
    }
    
    return {
      success: true,
      message: authMessages.signupSuccess,
    };
    
  } catch (error) {
    console.error('Sign up error:', error);
    
    // Handle validation errors
    if (error && typeof error === 'object' && 'issues' in error) {
      return handleValidationError(error);
    }
    
    return {
      success: false,
      message: authMessages.unexpectedError,
    };
  }
}

/**
 * Request password reset
 */
export async function requestPasswordResetAction(formData: PasswordResetFormData): Promise<ActionResponse> {
  try {
    // Validate input data
    const validatedData = passwordResetSchema.parse(formData);
    
    // Create Supabase client
    const supabase = await createServerComponentClient();
    
    // Send password reset email
    const result = await authHelpers.resetPassword(
      supabase,
      validatedData.email,
      `${env.NEXT_PUBLIC_APP_URL}/auth/reset-password`
    );
    
    if (result.error) {
      return {
        success: false,
        message: result.error,
      };
    }
    
    return {
      success: true,
      message: authMessages.passwordResetSent,
    };
    
  } catch (error) {
    console.error('Password reset error:', error);
    
    // Handle validation errors
    if (error && typeof error === 'object' && 'issues' in error) {
      return handleValidationError(error);
    }
    
    return {
      success: false,
      message: authMessages.unexpectedError,
    };
  }
}

/**
 * Sign out the current user
 */
export async function signOutAction(): Promise<void> {
  try {
    const supabase = await createServerComponentClient();
    await authHelpers.signOut(supabase);
  } catch (error) {
    console.error('Sign out error:', error);
  } finally {
    // Always redirect to home page after sign out attempt
    redirect('/');
  }
} 