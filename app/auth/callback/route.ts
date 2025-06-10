import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@/lib/supabase';

/**
 * Auth callback handler for Supabase authentication flows
 * Handles email confirmations, password resets, and other auth callbacks
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/profile';
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // Handle auth errors
  if (error) {
    console.error('Auth callback error:', error, errorDescription);
    
    // Redirect to login with error message
    const loginUrl = new URL('/login', requestUrl.origin);
    loginUrl.searchParams.set('error', errorDescription || error);
    
    return NextResponse.redirect(loginUrl);
  }

  // Handle successful auth callback with code
  if (code) {
    try {
      const supabase = await createServerComponentClient();
      
      // Exchange the code for a session
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error('Code exchange error:', exchangeError);
        
        // Redirect to login with error
        const loginUrl = new URL('/login', requestUrl.origin);
        loginUrl.searchParams.set('error', 'Authentication failed. Please try again.');
        
        return NextResponse.redirect(loginUrl);
      }

      // Handle signup confirmation - create Stripe customer and profile
      if (requestUrl.searchParams.get('type') === 'signup') {
        try {
          // Get the current user after code exchange
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user?.id && user?.email) {
            console.log(`[AUTH CALLBACK] Creating customer for new user: ${user.id}`);
            
            // Call our customer creation API
            const createCustomerResponse = await fetch(new URL('/api/auth/create-customer', requestUrl.origin), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: user.id,
                email: user.email,
              }),
            });

            if (!createCustomerResponse.ok) {
              const errorData = await createCustomerResponse.json();
              console.error('[AUTH CALLBACK] Customer creation failed:', errorData);
              
              // Don't fail the auth flow, but log the error
              // User can still access the app, customer can be created later
            } else {
              console.log('[AUTH CALLBACK] Customer and profile created successfully');
            }
          }
        } catch (customerError) {
          console.error('[AUTH CALLBACK] Customer creation error:', customerError);
          // Don't fail the auth flow, continue with normal signup
        }
      }

      // Successful authentication - redirect to intended destination
      const redirectUrl = new URL(next, requestUrl.origin);
      
      // Add success message for email confirmations
      if (requestUrl.searchParams.get('type') === 'signup') {
        redirectUrl.searchParams.set('message', 'Email confirmed successfully! Welcome to your account.');
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