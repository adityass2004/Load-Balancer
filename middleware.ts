import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API request logging
  if (pathname.startsWith('/api')) {
    const requestId = crypto.randomUUID();
    const response = NextResponse.next();
    response.headers.set('x-request-id', requestId);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
