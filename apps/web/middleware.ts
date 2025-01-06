import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const token = req.cookies.get('token')?.value;

  // Protected routes
  const protectedPaths = ['/admin', '/profile'];
  const isProtectedPath = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path));

  // Check if it's an event management page
  const eventManageMatch = req.nextUrl.pathname.match(/^\/events\/([^\/]+)\/manage$/);
  if (eventManageMatch) {
    if (!token) {
      const redirectUrl = new URL('/login', req.url);
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
    return res;
  }

  if (isProtectedPath && !token) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect to events if already logged in
  if (req.nextUrl.pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/events', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|api/).*)',
  ],
};
