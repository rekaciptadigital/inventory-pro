import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { STORAGE_KEYS } from '@/lib/config/constants';

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/inventory',
  '/settings',
  '/users',
  '/profile',
];

// Define public routes that don't require authentication
const publicRoutes = ['/login'];

export function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const { pathname } = request.nextUrl;

  // Check if user has valid auth tokens
  const hasTokens = request.cookies.has(STORAGE_KEYS.TOKENS);
  const tokens = hasTokens ? JSON.parse(request.cookies.get(STORAGE_KEYS.TOKENS)?.value || '{}') : null;
  const isAuthenticated = Boolean(tokens?.access_token);

  // Check if token is expired
  const isTokenExpired = tokens?.expires_in && Date.now() >= tokens.expires_in;

  // Handle expired tokens
  if (isAuthenticated && isTokenExpired) {
    // Clear auth cookies
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete(STORAGE_KEYS.TOKENS);
    response.cookies.delete(STORAGE_KEYS.USER);
    return response;
  }

  // Redirect authenticated users away from public routes (like login)
  if (isAuthenticated && publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect unauthenticated users to login for protected routes
  if (!isAuthenticated && protectedRoutes.some(route => pathname.startsWith(route))) {
    const searchParams = new URLSearchParams({
      callbackUrl: pathname,
    });
    return NextResponse.redirect(new URL(`/login?${searchParams}`, request.url));
  }

  // Allow the request to continue
  return NextResponse.next();
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};