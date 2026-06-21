import { describe, it, expect } from 'vitest'
import { formatCitation, toBibTeX, toRIS, manyBibTeX, manyRIS } from '../citations'
import type { Publication } from '../../../payload-types'

function makePub(overrides: Partial<Publication> = {}): Publication {
  return {
    id: 1,
    title: 'Gut Microbiome Diversity in Pakistan',
    authors: [{ author: 'Ahmed Khan' }, { author: 'Sara Malik' }],
    year: 2023,
    journal: 'Nature Microbiology',
    doi: '10.1038/s41564-023-01234-5',
    type: 'journal_article',
    citationCount: 0,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  } as unknown as Publication
}

// ── formatCitation ────────────────────────────────────────────────────────────

describe('formatCitation', () => {
  it('formats a complete citation correctly', () => {
    const result = formatCitation(makePub())
    expect(result).toContain('Ahmed Khan, Sara Malik')
    expect(result).toContain('(2023)')
    expect(result).toContain('Gut Microbiome Diversity in Pakistan')
    expect(result).toContain('Nature Microbiology')
    expect(result).toContain('https://doi.org/10.1038/s41564-023-01234-5')
  })

  it('uses "Unknown author" when authors array is empty', () => {
    const pub = makePub({ authors: [] } as Partial<Publication>)
    expect(formatCitation(pub)).toContain('Unknown author')
  })

  it('omits journal if absent', () => {
    const pub = makePub({ journal: undefined })
    const result = formatCitation(pub)
    expect(result).not.toContain('undefined')
  })

  it('omits DOI link if absent', () => {
    const pub = makePub({ doi: undefined })
    const result = formatCitation(pub)
    expect(result).not.toContain('doi.org')
  })

  it('adds a period after the title if it lacks one', () => {
    const pub = makePub({ title: 'No period' })
    expect(formatCitation(pub)).toContain('No period.')
  })

  it('does not double-up periods on a title that already ends with one', () => {
    const pub = makePub({ title: 'Already ends.' })
    const result = formatCitation(pub)
    // Should not contain ".." (double period) anywhere
    expect(result).not.toContain('..')
  })
})

// ── toBibTeX ──────────────────────────────────────────────────────────────────

describe('toBibTeX', () => {
  it('produces a @article entry for journal_article', () => {
    const bib = toBibTeX(makePub())
    expect(bib).toMatch(/^@article\{/)
  })

  it('produces @inproceedings for conference', () => {
    const bib = toBibTeX(makePub({ type: 'conference' }))
    expect(bib).toMatch(/^@inproceedings\{/)
  })

  it('produces @misc for preprint', () => {
    const bib = toBibTeX(makePub({ type: 'preprint' }))
    expect(bib).toMatch(/^@misc\{/)
  })

  it('produces @incollection for book_chapter', () => {
    const bib = toBibTeX(makePub({ type: 'book_chapter' }))
    expect(bib).toMatch(/^@incollection\{/)
  })

  it('generates a stable cite key from surname + year + first word', () => {
    const bib = toBibTeX(makePub())
    // First author is "Ahmed Khan" → surname "khan", year 2023, first word "gut"
    expect(bib).toContain('khan2023gut')
  })

  it('includes title, author, year, journal, doi fields', () => {
    const bib = toBibTeX(makePub())
    expect(bib).toContain('title = {Gut Microbiome Diversity in Pakistan}')
    expect(bib).toContain('author = {Ahmed Khan and Sara Malik}')
    expect(bib).toContain('year = {2023}')
    expect(bib).toContain('journal = {Nature Microbiology}')
    expect(bib).toContain('doi = {10.1038/s41564-023-01234-5}')
  })

  it('escapes backslashes and curly braces in field values', () => {
    const pub = makePub({ title: 'Title with {braces} and \\backslash' })
    const bib = toBibTeX(pub)
    expect(bib).toContain('\\{braces\\}')
    expect(bib).toContain('\\\\backslash')
  })

  it('omits journal field if absent', () => {
    const bib = toBibTeX(makePub({ journal: undefined }))
    expect(bib).not.toContain('journal')
  })
})

// ── toRIS ─────────────────────────────────────────────────────────────────────

describe('toRIS', () => {
  it('starts with TY  - JOUR for journal articles', () => {
    const ris = toRIS(makePub())
    expect(ris.startsWith('TY  - JOUR')).toBe(true)
  })

  it('uses TY CONF for conference', () => {
    expect(toRIS(makePub({ type: 'conference' }))).toContain('TY  - CONF')
  })

  it('uses TY UNPB for preprint', () => {
    expect(toRIS(makePub({ type: 'preprint' }))).toContain('TY  - UNPB')
  })

  it('uses TY CHAP for book_chapter', () => {
    expect(toRIS(makePub({ type: 'book_chapter' }))).toContain('TY  - CHAP')
  })

  it('includes all required fields', () => {
    const ris = toRIS(makePub())
    expect(ris).toContain('TI  - Gut Microbiome Diversity in Pakistan')
    expect(ris).toContain('AU  - Ahmed Khan')
    expect(ris).toContain('AU  - Sara Malik')
    expect(ris).toContain('PY  - 2023')
    expect(ris).toContain('JO  - Nature Microbiology')
    expect(ris).toContain('DO  - 10.1038/s41564-023-01234-5')
    expect(ris).toContain('ER  - ')
  })

  it('ends with ER  - ', () => {
    const ris = toRIS(makePub())
    expect(ris.trim().endsWith('ER  -')).toBe(true)
  })
})

// ── manyBibTeX / manyRIS ──────────────────────────────────────────────────────

describe('manyBibTeX', () => {
  it('separates entries with a blank line', () => {
    const result = manyBibTeX([makePub({ id: 1 }), makePub({ id: 2 })])
    expect(result).toContain('\n\n')
    expect((result.match(/@article/g) ?? []).length).toBe(2)
  })
})

describe('manyRIS', () => {
  it('joins multiple records with a blank line', () => {
    const result = manyRIS([makePub({ id: 1 }), makePub({ id: 2 })])
    expect(result).toContain('\n\n')
    expect((result.match(/TY  - JOUR/g) ?? []).length).toBe(2)
  })
})
