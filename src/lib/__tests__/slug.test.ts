import { describe, it, expect } from 'vitest'
import { makeSlugHook } from '../../hooks/makeSlug'

// Pull the hook into a callable function
const slugHook = makeSlugHook('title')

function callHook(
  operation: 'create' | 'update',
  data: Record<string, unknown>,
  originalDoc?: Record<string, unknown>,
) {
  return slugHook({
    operation,
    data,
    originalDoc,
    req: {} as never,
    collection: {} as never,
    context: {} as never,
  })
}

describe('makeSlugHook — slug generation', () => {
  // ── Create ──────────────────────────────────────────────────────────────────
  it('generates a slug on create when none is provided', () => {
    const result = callHook('create', { title: 'Hello World' })
    expect((result as Record<string, unknown>).slug).toBe('hello-world')
  })

  it('does not overwrite an existing slug on create', () => {
    const result = callHook('create', { title: 'Hello World', slug: 'custom-slug' })
    expect((result as Record<string, unknown>).slug).toBe('custom-slug')
  })

  it('uses originalDoc title when data.title is missing on create', () => {
    const result = callHook('create', {}, { title: 'From Original' })
    expect((result as Record<string, unknown>).slug).toBe('from-original')
  })

  it('returns data unchanged when title is missing and no originalDoc on create', () => {
    const result = callHook('create', {})
    expect((result as Record<string, unknown>).slug).toBeUndefined()
  })

  // ── Update ──────────────────────────────────────────────────────────────────
  it('does NOT auto-generate a slug on update if slug is already set', () => {
    const result = callHook('update', { title: 'New Title', slug: 'existing-slug' })
    expect((result as Record<string, unknown>).slug).toBe('existing-slug')
  })

  it('regenerates slug on update if slug is explicitly cleared to empty string', () => {
    const result = callHook('update', { title: 'Regenerated Title', slug: '' })
    expect((result as Record<string, unknown>).slug).toBe('regenerated-title')
  })

  // ── Slugify transforms ───────────────────────────────────────────────────────
  it('lowercases and hyphenates', () => {
    const result = callHook('create', { title: 'Gut Microbiome Study 2024' })
    expect((result as Record<string, unknown>).slug).toBe('gut-microbiome-study-2024')
  })

  it('strips accents from Latin characters', () => {
    const result = callHook('create', { title: 'Étude Préliminaire' })
    expect((result as Record<string, unknown>).slug).toBe('etude-preliminaire')
  })

  it('collapses multiple spaces and underscores to single hyphens', () => {
    const result = callHook('create', { title: 'double  space  title' })
    expect((result as Record<string, unknown>).slug).toBe('double-space-title')
  })

  it('collapses multiple hyphens', () => {
    const result = callHook('create', { title: 'one--two---three' })
    expect((result as Record<string, unknown>).slug).toBe('one-two-three')
  })

  it('trims leading and trailing whitespace', () => {
    const result = callHook('create', { title: '  trimmed  ' })
    expect((result as Record<string, unknown>).slug).toBe('trimmed')
  })

  it('removes special characters', () => {
    const result = callHook('create', { title: 'Impact of COVID-19 (2021)' })
    const slug = (result as Record<string, unknown>).slug as string
    // Parens are removed; COVID-19 hyphen and number are kept
    expect(slug).not.toContain('(')
    expect(slug).not.toContain(')')
    expect(slug).toContain('covid-19')
  })

  it('returns null-safe when data is null/undefined', () => {
    // Hook should return data as-is when it is null/undefined
    expect(
      makeSlugHook('title')({
        operation: 'create',
        data: null as never,
        req: {} as never,
        collection: {} as never,
        context: {} as never,
      }),
    ).toBeNull()
  })
})
