import { NextResponse, type NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const session = request.cookies.get('gym_admin_session');
  const path = request.nextUrl.pathname;
  
  const isPublicRoute = path === '/' || path === '/portal';

  // Redirect unauthenticated users trying to access admin pages
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Redirect authenticated admins trying to access the login page
  if (session && path === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
