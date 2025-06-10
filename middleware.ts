import { updateSession } from '@/utils/supabase/middleware'

/**
 * Next.js Middleware for Route Protection
 * 
 * Handles authentication-based route protection and redirects.
 * Integrates with Supabase Auth for session validation.
 * Follows the exact pattern from bootstrap-nextjs-app-with-supabase-auth guide.
 */

export async function middleware(request: any) {
  return await updateSession(request)
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
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}; 