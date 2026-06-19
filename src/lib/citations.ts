import type { Publication } from '../../payload-types'

/**
 * Builds a formatted citation string from the live publication document.
 * Pattern: Author1, Author2 (year). Title. Journal. https://doi.org/...
 */
export function formatCitation(pub: Publication): string {
  const authors = pub.authors.map((a) => a.author).join(', ')
  const title = pub.title.trimEnd()
  const parts = [
    `${authors || 'Unknown author'} (${pub.year}).`,
    title.endsWith('.') ? title : `${title}.`,
  ]
  if (pub.journal) parts.push(`${pub.journal}.`)
  if (pub.doi) parts.push(`https://doi.org/${pub.doi}`)
  return parts.join(' ')
}

// ── BibTeX ────────────────────────────────────────────────────────────────────

function bibtexType(type: Publication['type']): string {
  switch (type) {
    case 'journal_article':
      return 'article'
    case 'conference':
      return 'inproceedings'
    case 'preprint':
      return 'misc'
    case 'book_chapter':
      return 'incollection'
  }
}

/** Stable cite key: lastNameOfFirstAuthor + year + firstWordOfTitle */
function citeKey(pub: Publication): string {
  const firstAuthor = pub.authors[0]?.author ?? 'unknown'
  const surname =
    firstAuthor
      .split(/\s+/)
      .at(-1)
      ?.toLowerCase()
      .replace(/[^a-z]/g, '') ?? 'unknown'
  const firstWord =
    pub.title
      .split(/\s+/)[0]
      ?.toLowerCase()
      .replace(/[^a-z]/g, '') ?? 'x'
  return `${surname}${pub.year}${firstWord}`
}

/** Escape backslashes and curly braces for BibTeX field values. */
function bibtexEscape(s: string): string {
  return s.replace(/[\\{}]/g, (c) => `\\${c}`)
}

function bibtexField(key: string, value: string): string {
  return `  ${key} = {${bibtexEscape(value)}}`
}

export function toBibTeX(pub: Publication): string {
  const fields = [
    bibtexField('title', pub.title),
    bibtexField('author', pub.authors.map((a) => a.author).join(' and ')),
    bibtexField('year', String(pub.year)),
  ]
  if (pub.journal) fields.push(bibtexField('journal', pub.journal))
  if (pub.doi) fields.push(bibtexField('doi', pub.doi))
  return `@${bibtexType(pub.type)}{${citeKey(pub)},\n${fields.join(',\n')},\n}`
}

export function manyBibTeX(pubs: Publication[]): string {
  return pubs.map(toBibTeX).join('\n\n')
}

// ── RIS ───────────────────────────────────────────────────────────────────────

function risType(type: Publication['type']): string {
  switch (type) {
    case 'journal_article':
      return 'JOUR'
    case 'conference':
      return 'CONF'
    case 'preprint':
      return 'UNPB'
    case 'book_chapter':
      return 'CHAP'
  }
}

export function toRIS(pub: Publication): string {
  const lines: string[] = [`TY  - ${risType(pub.type)}`, `TI  - ${pub.title}`]
  for (const { author } of pub.authors) lines.push(`AU  - ${author}`)
  if (pub.journal) lines.push(`JO  - ${pub.journal}`)
  lines.push(`PY  - ${pub.year}`)
  if (pub.doi) lines.push(`DO  - ${pub.doi}`)
  lines.push('ER  - ')
  return lines.join('\n')
}

export function manyRIS(pubs: Publication[]): string {
  return pubs.map(toRIS).join('\n\n')
}
