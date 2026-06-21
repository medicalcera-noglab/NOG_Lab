import { describe, it, expect } from 'vitest'
import { isAdminOrEditor, isSuperAdmin, isOwnerDraftOnly, canCreateContent } from '@/access'
import type { PayloadRequest } from 'payload'

function makeReq(role: string | undefined, userId = 1): { req: PayloadRequest } {
  return {
    req: {
      user: role ? { id: userId, role, collection: 'users' } : null,
    } as unknown as PayloadRequest,
  }
}

// ── isAdminOrEditor ───────────────────────────────────────────────────────────

describe('isAdminOrEditor', () => {
  it('returns true for super_admin', () => {
    expect(isAdminOrEditor(makeReq('super_admin'))).toBe(true)
  })

  it('returns true for editor', () => {
    expect(isAdminOrEditor(makeReq('editor'))).toBe(true)
  })

  it('returns false for contributor', () => {
    expect(isAdminOrEditor(makeReq('contributor'))).toBe(false)
  })

  it('returns false for unauthenticated user', () => {
    expect(isAdminOrEditor(makeReq(undefined))).toBe(false)
  })
})

// ── isSuperAdmin ──────────────────────────────────────────────────────────────

describe('isSuperAdmin', () => {
  it('returns true only for super_admin', () => {
    expect(isSuperAdmin(makeReq('super_admin'))).toBe(true)
  })

  it('returns false for editor', () => {
    expect(isSuperAdmin(makeReq('editor'))).toBe(false)
  })

  it('returns false for contributor', () => {
    expect(isSuperAdmin(makeReq('contributor'))).toBe(false)
  })

  it('returns false for unauthenticated', () => {
    expect(isSuperAdmin(makeReq(undefined))).toBe(false)
  })
})

// ── canCreateContent ──────────────────────────────────────────────────────────

describe('canCreateContent', () => {
  it('allows super_admin', () => {
    expect(canCreateContent(makeReq('super_admin'))).toBe(true)
  })

  it('allows editor', () => {
    expect(canCreateContent(makeReq('editor'))).toBe(true)
  })

  it('allows contributor', () => {
    expect(canCreateContent(makeReq('contributor'))).toBe(true)
  })

  it('denies unauthenticated', () => {
    expect(canCreateContent(makeReq(undefined))).toBe(false)
  })
})

// ── isOwnerDraftOnly ──────────────────────────────────────────────────────────

describe('isOwnerDraftOnly', () => {
  it('returns true for super_admin (unrestricted)', () => {
    expect(isOwnerDraftOnly(makeReq('super_admin', 1))).toBe(true)
  })

  it('returns true for editor (unrestricted)', () => {
    expect(isOwnerDraftOnly(makeReq('editor', 2))).toBe(true)
  })

  it('returns a Where clause for contributor restricting to own drafts', () => {
    const result = isOwnerDraftOnly(makeReq('contributor', 3))
    expect(result).toEqual({
      and: [{ createdBy: { equals: 3 } }, { status: { not_in: ['published'] } }],
    })
  })

  it('returns false for unauthenticated', () => {
    expect(isOwnerDraftOnly(makeReq(undefined))).toBe(false)
  })

  it('contributor Where clause uses the correct user id', () => {
    const result = isOwnerDraftOnly(makeReq('contributor', 42)) as Record<string, unknown>
    const clauses = result.and as { createdBy?: { equals: number } }[]
    expect(clauses[0]?.createdBy?.equals).toBe(42)
  })
})
