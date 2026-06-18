/**
 * Next.js 16 middleware (proxy layer).
 *
 * Responsibilities:
 *   1. Security headers on every response (HSTS, X-Content-Type-Options, etc.)
 *   2. HTTPS enforcement in production (redirect http → https)
 *   3. Redirect unauthenticated /admin requests to /admin/login (UX only —
 *      real authz stays in Payload's collection-level access control)
 *
 * Content-Security-Policy and API rate limiting are stubbed here and will be
 * hardened in the dedicated security step.
 *
 * cookies() and headers() are async in Next.js 16 — always await them.
 */
import { NextResponse, type NextRequest } from 'next/server'

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  // CSP stub — will be tightened in the security hardening step.
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // relaxed for Payload admin; tighten per-route later
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
  ].join('; '),
}

function applyHeaders(res: NextResponse): NextResponse {
  const isProd = process.env.NODE_ENV === 'production'

  if (isProd) {
    // HSTS: 1 year, include subdomains. Only set in production.
    res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }

  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    res.headers.set(key, value)
  }

  return res
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname, protocol, host } = request.nextUrl
  const isProd = process.env.NODE_ENV === 'production'

  // 1. HTTPS enforcement in production.
  if (isProd && protocol === 'http:') {
    const httpsUrl = `https://${host}${pathname}${request.nextUrl.search}`
    return NextResponse.redirect(httpsUrl, { status: 301 })
  }

  // 2. Admin auth redirect (UX gate only).
  //    Payload's own auth protects the actual data — this is just a redirect
  //    so unauthenticated users land on the login page instead of a 403.
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = request.cookies.get('payload-token')?.value
    if (!token) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      const redirect = NextResponse.redirect(loginUrl)
      return applyHeaders(redirect)
    }
  }

  // 3. Apply security headers to all responses.
  const res = NextResponse.next()
  return applyHeaders(res)
}

export const config = {
  matcher: [
    // All routes except Next.js internals and static assets.
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
