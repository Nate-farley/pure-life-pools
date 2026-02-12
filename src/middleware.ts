// middleware.ts (project root)
import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // Redirect /login to /admin/login
  if (request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/admin/:path*'],
};
