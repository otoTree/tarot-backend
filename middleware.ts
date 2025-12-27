import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Only run on /admin routes
  if (path.startsWith('/admin')) {
    const token = request.cookies.get('admin_token')?.value;
    const isLoginPage = path === '/admin/login';

    // Verify token
    const payload = token ? await verifyToken(token) : null;
    const isAuthenticated = !!payload;

    // If trying to access login page while authenticated, redirect to dashboard
    if (isLoginPage && isAuthenticated) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    // If trying to access protected route while not authenticated, redirect to login
    if (!isLoginPage && !isAuthenticated) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
