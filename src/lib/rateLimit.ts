/**
 * Sliding-window rate limiter backed by Upstash Redis.
 * Gracefully no-ops when UPSTASH_REDIS_REST_URL / _TOKEN are not set so local
 * dev and CI work without a Redis instance.
 */
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

let redis: Redis | null = null
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

function makeLimit(
  window: Parameters<typeof Ratelimit.slidingWindow>[1],
  max: number,
  prefix: string,
): Ratelimit | null {
  if (!redis) return null
  return new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(max, window), prefix })
}

// 5 attempts per 15 minutes — auth endpoints (TOTP login, password login)
export const authLimiter = makeLimit('15 m', 5, 'rl:auth')

// 10 submissions per hour — public contact/join forms
export const formLimiter = makeLimit('1 h', 10, 'rl:form')

// 60 requests per minute — open API endpoints (search, map-sites)
export const apiLimiter = makeLimit('1 m', 60, 'rl:api')

// 30 requests per minute — admin-only DOI fetch (extra buffer for editors)
export const doiLimiter = makeLimit('1 m', 30, 'rl:doi')

/** Extract the client IP from standard proxy headers. */
export function getIp(req: { headers: { get(k: string): string | null } }): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    '127.0.0.1'
  )
}

interface LimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

/** Check the limiter; returns { success: true } when no limiter is configured. */
export async function checkLimit(
  limiter: Ratelimit | null,
  identifier: string,
): Promise<LimitResult> {
  if (!limiter) return { success: true, limit: 0, remaining: 0, reset: 0 }
  return limiter.limit(identifier)
}
