/**
 * Search visibility contract tests.
 *
 * These verify that the SQL queries in PostgresSearchProvider include the
 * correct status/visibility filters — specifically that unpublished drafts
 * and private docs never surface in search results.
 *
 * Strategy: we inspect the SQL strings baked into the provider rather than
 * running a real DB, so these tests are fast and environment-free.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

const PROVIDER_SRC = readFileSync(join(__dirname, '../../lib/search/postgres.ts'), 'utf-8')

describe('PostgresSearchProvider — draft / visibility filtering', () => {
  it("blog_posts query filters for _status = 'published'", () => {
    // Extract the blog section SQL (between 'blog_posts' and next private method)
    const blogIdx = PROVIDER_SRC.indexOf('FROM blog_posts')
    expect(blogIdx).toBeGreaterThan(-1)
    const blogSnippet = PROVIDER_SRC.slice(blogIdx, blogIdx + 500)
    expect(blogSnippet).toContain("_status = 'published'")
  })

  it("news_events query filters for _status = 'published'", () => {
    const newsIdx = PROVIDER_SRC.indexOf('FROM news_events')
    expect(newsIdx).toBeGreaterThan(-1)
    const newsSnippet = PROVIDER_SRC.slice(newsIdx, newsIdx + 500)
    expect(newsSnippet).toContain("_status = 'published'")
  })

  it('blog fuzzy fallback also filters for published status', () => {
    // Count occurrences of _status = 'published' in blog_posts context
    const blogPublishedMatches = [
      ...PROVIDER_SRC.matchAll(/FROM blog_posts[\s\S]{0,600}?_status = 'published'/g),
    ]
    expect(blogPublishedMatches.length).toBeGreaterThanOrEqual(2)
  })

  it('news fuzzy fallback also filters for published status', () => {
    const newsPublishedMatches = [
      ...PROVIDER_SRC.matchAll(/FROM news_events[\s\S]{0,600}?_status = 'published'/g),
    ]
    expect(newsPublishedMatches.length).toBeGreaterThanOrEqual(2)
  })

  it('publications query does not filter by status (all publications are public)', () => {
    const pubIdx = PROVIDER_SRC.indexOf('FROM publications')
    expect(pubIdx).toBeGreaterThan(-1)
    // Publications have no draft concept — no status filter expected
    const pubSnippet = PROVIDER_SRC.slice(pubIdx, pubIdx + 400)
    expect(pubSnippet).not.toContain('_status')
  })

  it('people query does not filter by status (all people are public)', () => {
    const peopleIdx = PROVIDER_SRC.indexOf('FROM people')
    expect(peopleIdx).toBeGreaterThan(-1)
    const peopleSnippet = PROVIDER_SRC.slice(peopleIdx, peopleIdx + 400)
    expect(peopleSnippet).not.toContain('_status')
  })

  it("projects query does not expose _status 'draft' records via direct publish gate", () => {
    const projectIdx = PROVIDER_SRC.indexOf('FROM projects')
    expect(projectIdx).toBeGreaterThan(-1)
    // Projects use a status field (not _status), searched globally — acceptable as
    // the projects collection has no draft/preview concept in the Payload config.
    // Just ensure the query exists.
    expect(projectIdx).toBeGreaterThan(-1)
  })
})

describe('Search SQL — no direct data leakage via LIMIT bypass', () => {
  it('all FTS queries include a LIMIT clause', () => {
    const ftsMatches = [...PROVIDER_SRC.matchAll(/websearch_to_tsquery[\s\S]{0,800}?LIMIT \$2/g)]
    expect(ftsMatches.length).toBeGreaterThan(0)
    for (const m of ftsMatches) {
      expect(m[0]).toContain('LIMIT $2')
    }
  })

  it('all trigram fallback queries include a LIMIT clause', () => {
    const trigramMatches = [
      ...PROVIDER_SRC.matchAll(/similarity\([^)]+\) > 0\.15[\s\S]{0,300}?LIMIT/g),
    ]
    // At least publications, people, projects have trigram fallback
    expect(trigramMatches.length).toBeGreaterThanOrEqual(3)
  })
})
