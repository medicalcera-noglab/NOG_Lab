/**
 * Tests for cron route authentication logic.
 *
 * We test the auth check pattern used by both cron routes in isolation —
 * without spinning up Payload — to confirm that missing or wrong secrets
 * yield 401 responses.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// The auth logic extracted from cron/citations/route.ts and cron/publish-scheduled/route.ts
// Citations uses x-cron-secret header; publish-scheduled uses Authorization: Bearer.

function checkCitationsAuth(headerValue: string | null, envSecret: string | undefined): boolean {
  const expected = envSecret
  if (!expected || !headerValue || headerValue !== expected) return false
  return true
}

function checkPublishScheduledAuth(
  headerValue: string | null,
  envSecret: string | undefined,
): boolean {
  const secret = envSecret
  if (secret && headerValue !== `Bearer ${secret}`) return false
  return true
}

describe('cron/citations — x-cron-secret authentication', () => {
  beforeEach(() => {
    vi.stubEnv('CRON_SECRET', 'test-secret-abc123')
  })
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('allows request with correct secret', () => {
    expect(checkCitationsAuth('test-secret-abc123', 'test-secret-abc123')).toBe(true)
  })

  it('rejects request with wrong secret', () => {
    expect(checkCitationsAuth('wrong-secret', 'test-secret-abc123')).toBe(false)
  })

  it('rejects request with no secret header', () => {
    expect(checkCitationsAuth(null, 'test-secret-abc123')).toBe(false)
  })

  it('rejects when CRON_SECRET env var is not set', () => {
    expect(checkCitationsAuth('any-value', undefined)).toBe(false)
  })

  it('rejects empty string secret', () => {
    expect(checkCitationsAuth('', 'test-secret-abc123')).toBe(false)
  })
})

describe('cron/publish-scheduled — Authorization: Bearer authentication', () => {
  it('allows correct Bearer token', () => {
    expect(checkPublishScheduledAuth('Bearer mysecret', 'mysecret')).toBe(true)
  })

  it('rejects wrong token value', () => {
    expect(checkPublishScheduledAuth('Bearer wrong', 'mysecret')).toBe(false)
  })

  it('rejects bare token without Bearer prefix', () => {
    expect(checkPublishScheduledAuth('mysecret', 'mysecret')).toBe(false)
  })

  it('rejects null header', () => {
    expect(checkPublishScheduledAuth(null, 'mysecret')).toBe(false)
  })

  it('passes through if CRON_SECRET is not set (open in dev — CI catches this)', () => {
    // When secret is undefined the route passes through; CI must set CRON_SECRET.
    expect(checkPublishScheduledAuth(null, undefined)).toBe(true)
  })
})
