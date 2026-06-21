/** Valid DOI: starts with "10.", 4+ digits, slash, non-empty suffix. */
const DOI_RE = /^10\.\d{4,}\/.+$/

/**
 * Extract a bare DOI from a user-supplied string.
 * Accepts raw DOIs, https://doi.org/… and http://doi.org/… URLs.
 * Returns null for anything that doesn't match the DOI pattern — this is the
 * SSRF guard that ensures we only ever call Crossref with well-formed DOIs.
 */
export function parseDoi(raw: string): string | null {
  const s = raw.trim()
  let bare = s
  if (bare.startsWith('https://doi.org/')) bare = bare.slice(16)
  else if (bare.startsWith('http://doi.org/')) bare = bare.slice(15)
  else if (bare.startsWith('doi.org/')) bare = bare.slice(8)
  return DOI_RE.test(bare) ? bare : null
}
