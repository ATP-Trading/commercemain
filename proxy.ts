import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';

// Export as 'proxy' instead of 'default' for Next.js 16
const localeMiddleware = createMiddleware(routing);

export function proxy(request: NextRequest) {
  // A stable permanent destination consolidates the bare homepage with /en.
  // Explicit locale paths and language detection on other routes stay intact.
  if (request.nextUrl.pathname === '/') {
    const destination = request.nextUrl.clone();
    destination.pathname = '/en';
    return NextResponse.redirect(destination, 308);
  }
  return localeMiddleware(request);
}

export default proxy;

export const config = {
  // Match all pathnames except for
  // - API routes (/api/*)
  // - TRPC routes (/trpc/*)
  // - Next.js internals (/_next/*, /_vercel/*)
  // - Static files (containing a dot)
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)' 
};