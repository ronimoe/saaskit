import { type NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@/lib/supabase';
import {
  getAuthStatus,
  getRouteType,
  createLoginUrl,
  createPostAuthRedirectUrl,
} from '@/lib/auth-middleware';

/**
 * Next.js Middleware for Route Protection
 * 
 * Handles authentication-based route protection and redirects.
 * Integrates with Supabase Auth for session validation.
 */

export async function middleware(request: NextRequest) {
  try {
    const { response } = createMiddlewareClient(request);
    const { pathname } = request.nextUrl;
    
    // Get authentication status
    const authResult = await getAuthStatus(request);
    
    if (authResult.error) {
      console.error('Middleware: Error getting auth status:', authResult.error);
    }

    const routeType = getRouteType(pathname);

    // Handle protected routes
    if (routeType === 'protected') {
      if (!authResult.isAuthenticated) {
        // Redirect to login with return URL
        const loginUrl = createLoginUrl(request.url, pathname);
        return Response.redirect(loginUrl);
      }
      
      // User is authenticated, allow access
      return response;
    }

    // Handle auth routes (login, signup, etc.)
    if (routeType === 'auth') {
      if (authResult.isAuthenticated) {
        // Check if there's a return URL
        const returnTo = request.nextUrl.searchParams.get('returnTo');
        const redirectUrl = createPostAuthRedirectUrl(request.url, returnTo || undefined);
        return Response.redirect(redirectUrl);
      }
      
      // User is not authenticated, allow access to auth pages
      return response;
    }

    // Handle public routes and other routes - always allow access
    return response;

  } catch (error) {
    console.error('Middleware error:', error);
    
    // On error, let the request through to avoid breaking the app
    // In production, you might want to redirect to an error page
    return NextResponse.next();
  }
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (images, icons, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}; 