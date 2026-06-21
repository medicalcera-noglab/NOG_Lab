import { describe, it, expect } from 'vitest'
import { parseDoi } from '../doiUtils'

describe('parseDoi — SSRF guard / DOI normalisation', () => {
  // ── Valid inputs ────────────────────────────────────────────────────────────
  it('accepts a bare DOI', () => {
    expect(parseDoi('10.1038/nature12373')).toBe('10.1038/nature12373')
  })

  it('accepts an https://doi.org/ URL and strips the prefix', () => {
    expect(parseDoi('https://doi.org/10.1038/nature12373')).toBe('10.1038/nature12373')
  })

  it('accepts an http://doi.org/ URL', () => {
    expect(parseDoi('http://doi.org/10.1038/nature12373')).toBe('10.1038/nature12373')
  })

  it('accepts a doi.org/ URL without scheme', () => {
    expect(parseDoi('doi.org/10.1000/xyz123')).toBe('10.1000/xyz123')
  })

  it('trims surrounding whitespace before parsing', () => {
    expect(parseDoi('  10.1234/abc.456  ')).toBe('10.1234/abc.456')
  })

  it('accepts DOIs with a 9-digit registrant', () => {
    expect(parseDoi('10.123456789/suffix')).toBe('10.123456789/suffix')
  })

  it('accepts DOIs with complex suffixes', () => {
    expect(parseDoi('10.1000/S0002-9947(99)02304-0')).toBe('10.1000/S0002-9947(99)02304-0')
  })

  // ── Invalid / attack inputs (SSRF guard must reject) ─────────────────────
  it('rejects an arbitrary https URL', () => {
    expect(parseDoi('https://evil.example.com/payload')).toBeNull()
  })

  it('rejects a non-DOI path via doi.org', () => {
    expect(parseDoi('https://doi.org/not-a-doi')).toBeNull()
  })

  it('rejects a string missing the registrant digits', () => {
    expect(parseDoi('10./missing-registrant')).toBeNull()
  })

  it('rejects a string with fewer than 4 registrant digits', () => {
    expect(parseDoi('10.123/ok')).toBeNull()
  })

  it('rejects an empty string', () => {
    expect(parseDoi('')).toBeNull()
  })

  it('rejects a number-only string', () => {
    expect(parseDoi('12345')).toBeNull()
  })

  it('rejects file:// and other dangerous schemes', () => {
    expect(parseDoi('file:///etc/passwd')).toBeNull()
  })

  it('rejects a string that starts with 10. but has no slash', () => {
    expect(parseDoi('10.1234')).toBeNull()
  })

  it('rejects DOI with empty suffix after slash', () => {
    expect(parseDoi('10.1234/')).toBeNull()
  })
})
