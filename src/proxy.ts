/**
 * Unified proxy / middleware layer.
 *
 * Responsibilities (in order):
 *   1. www → non-www canonical redirect (production only)
 *   2. HTTPS enforcement (production only)
 *   3. Admin auth redirect (UX gate — real authz is in Payload access control)
 *   4. Security headers — HSTS, CSP (nonce-based), X-Frame-Options, etc. — on every response
 *
 * CSP third-party allowlist:
 *   script-src   — reCAPTCHA (google.com, gstatic.com); nonce for all inline scripts
 *   style-src    — 'unsafe-inline' required for Tailwind utilities & framer-motion
 *   img-src      — OSM tiles (light), CARTO tiles (dark), Cloudinary CDN, R2 media CDN
 *   frame-src    — Google Maps embed + reCAPTCHA iframe + newsletter embed
 *   connect-src  — Crossref API (DOI fetch / citation cron)
 *
 * cookies() and headers() are async in Next.js 16 — always await them.
 */
import { NextResponse, type NextRequest } from 'next/server'

// R2 public CDN hostname (no trailing slash) for img-src.
const r2PublicHost = (() => {
  const raw = process.env.R2_PUBLIC_URL ?? ''
  try {
    return raw ? new URL(raw).origin : ''
  } catch {
    return ''
  }
})()

// Newsletter embed origin for frame-src (must be explicit to avoid wildcard).
const newsletterEmbedOrigin = (() => {
  const raw = process.env.NEWSLETTER_EMBED_URL ?? ''
  try {
    return raw ? new URL(raw).origin : ''
  } catch {
    return ''
  }
})()

function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV !== 'production'
  const r2Part = r2PublicHost ? ` ${r2PublicHost}` : ''
  const newsletterPart = newsletterEmbedOrigin ? ` ${newsletterEmbedOrigin}` : ''
  return [
    "default-src 'self'",
    // nonce covers Next.js hydration scripts + any inline <script>; no unsafe-inline.
    // unsafe-eval is needed in dev mode: React uses eval() for stack-trace reconstruction.
    `script-src 'self' 'nonce-${nonce}' https://www.google.com https://www.gstatic.com${isDev ? " 'unsafe-eval'" : ''}`,
    // unsafe-inline required for Tailwind utility style="" and framer-motion DOM mutations
    "style-src 'self' 'unsafe-inline'",
    // OSM tiles + CARTO tiles + Cloudinary CDN + optional R2 CDN + Wikimedia (seed/demo images)
    `img-src 'self' data: blob: https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com https://res.cloudinary.com https://upload.wikimedia.org https://images.unsplash.com https://images.pexels.com${r2Part}`,
    "font-src 'self'",
    // Google Maps embed (contact page) + reCAPTCHA v3 iframe + optional newsletter embed
    `frame-src https://www.google.com${newsletterPart}`,
    // Crossref DOI/citation API; ws:/wss: for Turbopack HMR WebSocket in dev
    `connect-src 'self' https://api.crossref.org${isDev ? ' ws: wss:' : ''}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; ')
}

function applyHeaders(res: NextResponse, nonce: string, csp?: string): NextResponse {
  const isProd = process.env.NODE_ENV === 'production'
  if (isProd) {
    res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  }
  res.headers.set('Content-Security-Policy', csp ?? buildCsp(nonce))
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  return res
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl
  const isProd = process.env.NODE_ENV === 'production'

  // 1. www → non-www canonical redirect.
  if (isProd && request.nextUrl.hostname === `www.${request.nextUrl.host.replace(/^www\./, '')}`) {
    const url = request.nextUrl.clone()
    url.hostname = url.hostname.replace(/^www\./, '')
    return NextResponse.redirect(url, { status: 301 })
  }

  // 2. HTTPS enforcement.
  if (isProd && request.nextUrl.protocol === 'http:') {
    const url = request.nextUrl.clone()
    url.protocol = 'https:'
    const nonce = buildNonce()
    return applyHeaders(NextResponse.redirect(url, { status: 301 }), nonce)
  }

  // Generate a fresh nonce for this request.
  const nonce = buildNonce()
  // Build CSP once so the same value goes on both request and response headers.
  // Next.js reads content-security-policy from REQUEST headers (app-render.js line ~167)
  // to extract the nonce and apply it to automatically injected <script> tags.
  // We must set it on the request AND the response so they always match.
  const csp = buildCsp(nonce)

  // Modified request headers so Server Components can read x-nonce via headers(),
  // AND so Next.js app-render can extract the nonce from content-security-policy.
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('content-security-policy', csp)

  // 3. Admin auth redirect (UX only — Payload owns real access control).
  // Allow /admin/login and /admin/create-first-user through without a token.
  const adminPublicPaths = ['/admin/login', '/admin/create-first-user']
  if (pathname.startsWith('/admin') && !adminPublicPaths.some((p) => pathname.startsWith(p))) {
    const token = request.cookies.get('payload-token')?.value
    if (!token) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return applyHeaders(NextResponse.redirect(loginUrl), nonce, csp)
    }
  }

  // 4. Pass-through with nonce in request headers so Server Components can read x-nonce.
  const res = NextResponse.next({ request: { headers: requestHeaders } })

  return applyHeaders(res, nonce, csp)
}

function buildNonce(): string {
  const arr = new Uint8Array(16)
  crypto.getRandomValues(arr)
  // btoa(String.fromCharCode(...arr)) is safe for 16 bytes — no stack overflow risk.
  return btoa(String.fromCharCode(...Array.from(arr)))
}

// Next.js 16 proxy convention requires the function to be exported as `proxy`.
export { middleware as proxy }

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|[^?]*\\.(?:webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
}
