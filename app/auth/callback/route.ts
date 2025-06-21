import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@/lib/supabase';
import { ensureCustomerExists } from '@/lib/customer-service';
import { checkAccountLinking, generateLinkingToken } from '@/lib/account-linking';

/**
 * Maps OAuth error codes to user-friendly error messages
 */
function getOAuthErrorMessage(error: string, errorDescription?: string | null): string {
  switch (error) {
    case 'access_denied':
      return 'You cancelled the sign-in process. Please try again if you want to continue.';
    case 'invalid_grant':
      return 'The authorization code is invalid or expired. Please try signing in again.';
    case 'invalid_request':
      return 'There was an issue with the sign-in request. Please try again.';
    case 'server_error':
      return 'Google encountered an error during sign-in. Please try again in a moment.';
    case 'temporarily_unavailable':
      return 'Google sign-in is temporarily unavailable. Please try again later.';
    case 'invalid_scope':
      return 'The requested permissions are invalid. Please contact support.';
    default:
      // Return the error description if available, otherwise a generic message
      return errorDescription || 'An error occurred during sign-in. Please try again.';
  }
}

/**
 * Auth callback handler for Supabase authentication flows
 * Handles email confirmations, password resets, OAuth callbacks, and other auth flows
 * Uses atomic customer creation to prevent race conditions
 * Enhanced OAuth error handling and user experience
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/profile';
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // Handle auth errors with OAuth-specific error handling
  if (error) {
    console.error('Auth callback error:', { error, errorDescription, url: requestUrl.href });
    
    // Map OAuth-specific errors to user-friendly messages
    const errorMessage = getOAuthErrorMessage(error, errorDescription);
    
    // Redirect to login with error message
    const loginUrl = new URL('/login', requestUrl.origin);
    loginUrl.searchParams.set('error', errorMessage);
    
    return NextResponse.redirect(loginUrl);
  }

  // Handle successful auth callback with code
  if (code) {
    try {
      const supabase = await createServerComponentClient();
      
      // Exchange the code for a session
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error('Code exchange error:', {
          error: exchangeError,
          code: code?.substring(0, 10) + '...', // Log partial code for debugging
          url: requestUrl.href
        });
        
        // Map exchange errors to user-friendly messages
        let errorMessage = 'Authentication failed. Please try again.';
        if (exchangeError.message?.includes('invalid_grant')) {
          errorMessage = 'The authorization code is invalid or expired. Please try signing in again.';
        } else if (exchangeError.message?.includes('network')) {
          errorMessage = 'Network error during authentication. Please check your connection and try again.';
        }
        
        // Redirect to login with error
        const loginUrl = new URL('/login', requestUrl.origin);
        loginUrl.searchParams.set('error', errorMessage);
        
        return NextResponse.redirect(loginUrl);
      }

      // Get the current user after code exchange to check if it's a new user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Check if this is a new user (OAuth signup detection)
      const isOAuthProvider = user?.app_metadata?.providers?.includes('google');
      const isRecentSignup = user && new Date(user.created_at).getTime() > Date.now() - 60000; // Created within last minute
      const isEmailSignup = requestUrl.searchParams.get('type') === 'signup';
      
      const isNewUser = user && (
        isEmailSignup || 
        (isOAuthProvider && isRecentSignup)
      );

      // Check for account linking if this is a new OAuth user
      if (isNewUser && isOAuthProvider && user?.email) {
        try {
          const linkingResult = await checkAccountLinking(user.email, 'google');
          
          if (linkingResult.needsLinking && linkingResult.existingUserId) {
            // Account linking is needed - redirect to linking confirmation
            const linkingToken = generateLinkingToken(user.email, 'google');
            const linkingUrl = new URL('/auth/link-account', requestUrl.origin);
            linkingUrl.searchParams.set('token', linkingToken);
            linkingUrl.searchParams.set('provider', 'google');
            linkingUrl.searchParams.set('email', user.email);
            linkingUrl.searchParams.set('message', linkingResult.message || 'Account linking required');
            
            return NextResponse.redirect(linkingUrl);
          }
          
          if (linkingResult.conflictType === 'oauth_exists') {
            // OAuth account already exists - redirect to login with message
            const loginUrl = new URL('/login', requestUrl.origin);
            loginUrl.searchParams.set('message', linkingResult.message || 'Please sign in with your existing account');
            
            return NextResponse.redirect(loginUrl);
          }
          
          if (linkingResult.conflictType === 'multiple_providers') {
            // Multiple accounts conflict - redirect to support
            const loginUrl = new URL('/login', requestUrl.origin);
            loginUrl.searchParams.set('error', linkingResult.message || 'Multiple accounts found. Please contact support.');
            
            return NextResponse.redirect(loginUrl);
          }
        } catch (linkingError) {
          console.error('[AUTH CALLBACK] Account linking check failed:', linkingError);
          // Continue with normal flow if linking check fails
        }
      }
      
      // Handle signup confirmation or OAuth signup - create Stripe customer and profile  
      if (isNewUser) {
        try {
          // User is already fetched above
          
          if (user?.id && user?.email) {
            console.log(`[AUTH CALLBACK] Creating customer for new user: ${user.id}`);
            
            // For OAuth users, we'll create the customer but not the profile
            // The profile will be created in the profile completion flow
            if (isOAuthProvider && isRecentSignup) {
              // For OAuth users, just create the Stripe customer
              // Profile creation will happen in the setup flow
              const { ensureStripeCustomer } = await import('@/lib/stripe-sync');
              
              try {
                await ensureStripeCustomer(user.id, user.email);
                console.log('[AUTH CALLBACK] Stripe customer created for OAuth user');
              } catch (stripeError) {
                console.error('[AUTH CALLBACK] Stripe customer creation failed:', stripeError);
                // Don't fail the auth flow
              }
            } else {
              // For email signups, create both customer and profile
              const customerResult = await ensureCustomerExists(
                user.id,
                user.email,
                user.user_metadata?.full_name
              );

              if (!customerResult.success) {
                console.error('[AUTH CALLBACK] Customer creation failed:', customerResult.error);
                // Don't fail the auth flow, but log the error
              } else {
                console.log('[AUTH CALLBACK] Customer and profile created successfully', {
                  profileId: customerResult.profile?.id,
                  stripeCustomerId: customerResult.stripeCustomerId,
                  isNewCustomer: customerResult.isNewCustomer,
                  isNewProfile: customerResult.isNewProfile
                });
              }
            }
          }
        } catch (customerError) {
          console.error('[AUTH CALLBACK] Customer creation error:', customerError);
          // Don't fail the auth flow, continue with normal signup
        }
      }

      // Determine redirect destination based on user type and profile status
      let redirectUrl: URL;
      
      if (isNewUser && isOAuthProvider) {
        // New OAuth users should complete their profile
        redirectUrl = new URL('/auth/setup-profile', requestUrl.origin);
        redirectUrl.searchParams.set('message', 'Successfully signed up with Google! Let\'s complete your profile.');
      } else {
        // Existing users or email confirmations go to intended destination
        redirectUrl = new URL(next, requestUrl.origin);
        
        // Add success message for signup confirmations
        if (isEmailSignup) {
          redirectUrl.searchParams.set('message', 'Email confirmed successfully! Welcome to your account.');
        } else if (isOAuthProvider) {
          redirectUrl.searchParams.set('message', 'Successfully signed in with Google!');
        }
      }
      
      // Handle password reset flow
      if (requestUrl.searchParams.get('type') === 'recovery') {
        // For password reset, redirect to the confirmation page
        const resetConfirmUrl = new URL('/reset-password/confirm', requestUrl.origin);
        return NextResponse.redirect(resetConfirmUrl);
      }
      
      return NextResponse.redirect(redirectUrl);
      
    } catch (error) {
      console.error('Auth callback processing error:', error);
      
      // Redirect to login with generic error
      const loginUrl = new URL('/login', requestUrl.origin);
      loginUrl.searchParams.set('error', 'An unexpected error occurred during authentication.');
      
      return NextResponse.redirect(loginUrl);
    }
  }

  // No code parameter - invalid callback request
  console.warn('Auth callback called without code parameter');
  
  const loginUrl = new URL('/login', requestUrl.origin);
  loginUrl.searchParams.set('error', 'Invalid authentication request.');
  
  return NextResponse.redirect(loginUrl);
} 