/**
 * Unified proxy / middleware layer.
 *
 * Responsibilities (in order):
 *   1. HTTPS enforcement in production
 *   2. Admin auth redirect (UX gate — real authz is in Payload access control)
 *   3. next-intl locale routing for public frontend routes
 *   4. Security headers on every response
 *
 * cookies() and headers() are async in Next.js 16 — always await them.
 */
import { NextResponse, type NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  // CSP stub — will be tightened in the security hardening step.
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
  ].join('; '),
}

function applyHeaders(res: NextResponse): NextResponse {
  if (process.env.NODE_ENV === 'production') {
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

  // 1. HTTPS enforcement.
  if (isProd && protocol === 'http:') {
    const httpsUrl = `https://${host}${pathname}${request.nextUrl.search}`
    return NextResponse.redirect(httpsUrl, { status: 301 })
  }

  // 2. Admin auth redirect (UX only — Payload owns real access control).
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = request.cookies.get('payload-token')?.value
    if (!token) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return applyHeaders(NextResponse.redirect(loginUrl))
    }
  }

  // 3. Locale routing for public frontend routes only.
  const isPublicFrontend = !pathname.startsWith('/admin') && !pathname.startsWith('/api')
  const res = isPublicFrontend ? intlMiddleware(request) : NextResponse.next()

  return applyHeaders(res)
}

export const config = {
  matcher: [
    // Exclude Next.js internals and common static file extensions.
    '/((?!_next/static|_next/image|favicon.ico|[^?]*\\.(?:webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
}
