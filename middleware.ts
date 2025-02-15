import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Get stored tokens from cookies
  const hasTokens = request.cookies.has('tokens');
  
  // Allow access to login page when not authenticated
  if (!hasTokens && pathname === '/login') {
    return NextResponse.next();
  }

  // Redirect to login if no tokens and trying to access protected routes
  if (!hasTokens && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect to dashboard if has tokens and trying to access login
  if (hasTokens && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};