import { NextResponse, type NextRequest } from 'next/server';

const SUSPICIOUS_BOT_AGENTS = [
  'sqlmap',
  'nikto',
  'dirbuster',
  'masscan',
  'nmap',
];

export function proxy(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  const lowerUA = userAgent.toLowerCase();

  // Block known malicious vulnerability scanner scripts
  if (SUSPICIOUS_BOT_AGENTS.some((bot) => lowerUA.includes(bot))) {
    return new NextResponse('Access Denied: Automated script detected.', {
      status: 403,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  const session = request.cookies.get('gym_admin_session');
  const path = request.nextUrl.pathname;
  
  const isPublicRoute = path === '/' || path === '/portal' || path === '/robots.txt' || path === '/sitemap.xml';

  let response: NextResponse;

  // Redirect unauthenticated users trying to access admin pages
  if (!session && !isPublicRoute) {
    response = NextResponse.redirect(new URL('/', request.url));
  }
  // Redirect authenticated admins trying to access the login page
  else if (session && path === '/') {
    response = NextResponse.redirect(new URL('/dashboard', request.url));
  } else {
    response = NextResponse.next();
  }

  // Enforce security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
