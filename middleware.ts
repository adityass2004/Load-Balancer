import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_DASHBOARD_ROUTES = ['/', '/dashboard', '/servers', '/logs', '/team'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requestId = pathname.startsWith('/api') ? crypto.randomUUID() : undefined;

  const hasSessionToken =
    request.cookies.has('authjs.session-token') ||
    request.cookies.has('__Secure-authjs.session-token') ||
    request.cookies.has('next-auth.session-token') ||
    request.cookies.has('__Secure-next-auth.session-token');

  // 1. Protect Admin API routes (/api/admin/*)
  if (pathname.startsWith('/api/admin')) {
    if (!hasSessionToken) {
      const unauthorizedResponse = NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
      if (requestId) {
        unauthorizedResponse.headers.set('x-request-id', requestId);
      }
      return unauthorizedResponse;
    }
  }

  // 2. Protect Dashboard Pages
  const isProtectedPage =
    pathname === '/' ||
    PROTECTED_DASHBOARD_ROUTES.some(
      (route) => route !== '/' && (pathname === route || pathname.startsWith(`${route}/`))
    );

  if (isProtectedPage && !pathname.startsWith('/login') && !pathname.startsWith('/api')) {
    if (!hasSessionToken) {
      const loginUrl = new URL('/login', request.url);
      // Callback URL security: only store safe relative path
      if (pathname !== '/') {
        loginUrl.searchParams.set('callbackUrl', pathname);
      }
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Redirect authenticated users away from /login
  if (pathname === '/login' && hasSessionToken) {
    const callback = request.nextUrl.searchParams.get('callbackUrl');
    const validCallback =
      callback && callback.startsWith('/') && !callback.startsWith('//')
        ? callback
        : '/dashboard';
    return NextResponse.redirect(new URL(validCallback, request.url));
  }

  // 4. Default pass-through
  const response = NextResponse.next();
  if (requestId) {
    response.headers.set('x-request-id', requestId);
  }
  return response;
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/servers/:path*',
    '/logs/:path*',
    '/team/:path*',
    '/login',
    '/api/admin/:path*',
  ],
};
