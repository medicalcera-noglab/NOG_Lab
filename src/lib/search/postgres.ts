import { getPayload } from 'payload'
import config from '@payload-config'
import type {
  SearchProvider,
  SearchOptions,
  GroupedResults,
  SearchResult,
  ResultType,
} from './types'

// @payloadcms/db-postgres stores the raw pg.Pool on payload.db.pool.
// There is no public TypeScript type for this internal property — hence the cast.
type PgPool = {
  query(text: string, values?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>
}

async function getPool(): Promise<PgPool> {
  const payload = await getPayload({ config })
  return (payload.db as unknown as { pool: PgPool }).pool
}

function toNum(v: unknown): number {
  return typeof v === 'number' ? v : Number(v ?? 0)
}
function toStr(v: unknown): string {
  return typeof v === 'string' ? v : String(v ?? '')
}

const HEADLINE_OPTS =
  'MaxWords=35,MinWords=10,ShortWord=3,HighlightAll=FALSE,MaxFragments=1,StartSel=<mark>,StopSel=</mark>'

function row2result(r: Record<string, unknown>, type: ResultType, url: string): SearchResult {
  return {
    type,
    id: toNum(r.id),
    title: toStr(r.title),
    snippet: toStr(r.snippet || r.title),
    url,
    rank: toNum(r.rank),
  }
}

async function ftsQuery(
  db: PgPool,
  sql: string,
  params: unknown[],
): Promise<Record<string, unknown>[]> {
  try {
    const { rows } = await db.query(sql, params)
    return rows
  } catch {
    // If tsquery is malformed (e.g. only stop words), return empty.
    return []
  }
}

async function trigramQuery(
  db: PgPool,
  table: string,
  column: string,
  q: string,
  excludeIds: number[],
  limit: number,
): Promise<Record<string, unknown>[]> {
  try {
    const { rows } = await db.query(
      `SELECT id, ${column} AS title, CAST(similarity(${column}, $1) AS float8) AS rank
         FROM ${table}
        WHERE similarity(${column}, $1) > 0.15
          AND NOT (id = ANY($3::int[]))
        ORDER BY rank DESC
        LIMIT $2`,
      [q, limit, excludeIds],
    )
    return rows
  } catch {
    return []
  }
}

export class PostgresSearchProvider implements SearchProvider {
  async search(query: string, { limitPerGroup = 5 }: SearchOptions = {}): Promise<GroupedResults> {
    const q = query.trim()
    if (q.length < 2) return emptyResults()

    const limit = Math.min(limitPerGroup, 20)
    const db = await getPool()

    const [publications, people, projects, blog, news] = await Promise.all([
      this.publications(db, q, limit),
      this.people(db, q, limit),
      this.projects(db, q, limit),
      this.blog(db, q, limit),
      this.news(db, q, limit),
    ])

    return {
      publications,
      people,
      projects,
      blog,
      news,
      total: publications.length + people.length + projects.length + blog.length + news.length,
    }
  }

  private async publications(db: PgPool, q: string, limit: number): Promise<SearchResult[]> {
    const rows = await ftsQuery(
      db,
      `SELECT p.id, p.title, p.doi,
              CAST(ts_rank_cd(p.search_vector, tsq, 4) AS float8) AS rank,
              ts_headline('english',
                coalesce(p.title,'') || '. ' || coalesce(p.journal,'') || '. ' || lexical_to_text(p.abstract),
                tsq, $3
              ) AS snippet
         FROM publications p
         CROSS JOIN LATERAL websearch_to_tsquery('english', $1) AS tsq
        WHERE p.search_vector IS NOT NULL
          AND p.search_vector @@ tsq
        ORDER BY rank DESC
        LIMIT $2`,
      [q, limit, HEADLINE_OPTS],
    )

    const results = rows.map((r) =>
      row2result(r, 'publication', r.doi ? `https://doi.org/${toStr(r.doi)}` : '/publications'),
    )

    if (results.length < limit) {
      const ftsIds = results.map((r) => r.id)
      const fuzzy = await trigramQuery(
        db,
        'publications',
        'title',
        q,
        ftsIds,
        limit - results.length,
      )
      fuzzy.forEach((r) =>
        results.push(
          row2result(
            { ...r, rank: toNum(r.rank) * 0.7 },
            'publication',
            r.doi ? `https://doi.org/${toStr(r.doi)}` : '/publications',
          ),
        ),
      )
    }

    return results.sort((a, b) => b.rank - a.rank).slice(0, limit)
  }

  private async people(db: PgPool, q: string, limit: number): Promise<SearchResult[]> {
    const rows = await ftsQuery(
      db,
      `SELECT p.id, p.name AS title, p.slug,
              CAST(ts_rank_cd(p.search_vector, tsq, 4) AS float8) AS rank,
              ts_headline('english',
                p.name || '. ' || lexical_to_text(p.bio),
                tsq, $3
              ) AS snippet
         FROM people p
         CROSS JOIN LATERAL websearch_to_tsquery('english', $1) AS tsq
        WHERE p.search_vector IS NOT NULL
          AND p.search_vector @@ tsq
          AND p.is_active = true
        ORDER BY rank DESC
        LIMIT $2`,
      [q, limit, HEADLINE_OPTS],
    )

    const results = rows.map((r) => row2result(r, 'person', `/people/${toStr(r.slug)}`))

    if (results.length < limit) {
      const ftsIds = results.map((r) => r.id)
      const fuzzy = await trigramQuery(db, 'people', 'name', q, ftsIds, limit - results.length)
      // Re-query slugs for fuzzy hits (trigramQuery only returns id + title)
      for (const r of fuzzy) {
        const { rows: sr } = await db.query(`SELECT slug FROM people WHERE id = $1`, [r.id])
        const slug = sr[0]?.slug ? toStr(sr[0].slug) : ''
        results.push(row2result({ ...r, rank: toNum(r.rank) * 0.7 }, 'person', `/people/${slug}`))
      }
    }

    return results.sort((a, b) => b.rank - a.rank).slice(0, limit)
  }

  private async projects(db: PgPool, q: string, limit: number): Promise<SearchResult[]> {
    const rows = await ftsQuery(
      db,
      `SELECT p.id, p.title, p.slug,
              CAST(ts_rank_cd(p.search_vector, tsq, 4) AS float8) AS rank,
              ts_headline('english',
                p.title || '. ' || lexical_to_text(p.summary),
                tsq, $3
              ) AS snippet
         FROM projects p
         CROSS JOIN LATERAL websearch_to_tsquery('english', $1) AS tsq
        WHERE p.search_vector IS NOT NULL
          AND p.search_vector @@ tsq
        ORDER BY rank DESC
        LIMIT $2`,
      [q, limit, HEADLINE_OPTS],
    )

    const results = rows.map((r) => row2result(r, 'project', `/projects/${toStr(r.slug)}`))

    if (results.length < limit) {
      const ftsIds = results.map((r) => r.id)
      const fuzzy = await trigramQuery(db, 'projects', 'title', q, ftsIds, limit - results.length)
      for (const r of fuzzy) {
        const { rows: sr } = await db.query(`SELECT slug FROM projects WHERE id = $1`, [r.id])
        const slug = sr[0]?.slug ? toStr(sr[0].slug) : ''
        results.push(
          row2result({ ...r, rank: toNum(r.rank) * 0.7 }, 'project', `/projects/${slug}`),
        )
      }
    }

    return results.sort((a, b) => b.rank - a.rank).slice(0, limit)
  }

  private async blog(db: PgPool, q: string, limit: number): Promise<SearchResult[]> {
    const rows = await ftsQuery(
      db,
      `SELECT p.id, p.title, p.slug,
              CAST(ts_rank_cd(p.search_vector, tsq, 4) AS float8) AS rank,
              ts_headline('english',
                coalesce(p.title,'') || '. ' || lexical_to_text(p.body),
                tsq, $3
              ) AS snippet
         FROM blog_posts p
         CROSS JOIN LATERAL websearch_to_tsquery('english', $1) AS tsq
        WHERE p.search_vector IS NOT NULL
          AND p.search_vector @@ tsq
          AND p._status = 'published'
        ORDER BY rank DESC
        LIMIT $2`,
      [q, limit, HEADLINE_OPTS],
    )

    const results = rows.map((r) => row2result(r, 'blog', `/blog/${toStr(r.slug)}`))

    if (results.length < limit) {
      const ftsIds = results.map((r) => r.id)
      const { rows: fuzzy } = await db
        .query(
          `SELECT id, title, slug,
                  CAST(similarity(title, $1) AS float8) AS rank
             FROM blog_posts
            WHERE similarity(title, $1) > 0.15
              AND _status = 'published'
              AND NOT (id = ANY($3::int[]))
            ORDER BY rank DESC
            LIMIT $2`,
          [q, limit - results.length, ftsIds],
        )
        .catch(() => ({ rows: [] as Record<string, unknown>[] }))
      fuzzy.forEach((r) =>
        results.push(
          row2result({ ...r, rank: toNum(r.rank) * 0.7 }, 'blog', `/blog/${toStr(r.slug)}`),
        ),
      )
    }

    return results.sort((a, b) => b.rank - a.rank).slice(0, limit)
  }

  private async news(db: PgPool, q: string, limit: number): Promise<SearchResult[]> {
    const rows = await ftsQuery(
      db,
      `SELECT p.id, p.title, p.slug,
              CAST(ts_rank_cd(p.search_vector, tsq, 4) AS float8) AS rank,
              ts_headline('english',
                coalesce(p.title,'') || '. ' || lexical_to_text(p.body),
                tsq, $3
              ) AS snippet
         FROM news_events p
         CROSS JOIN LATERAL websearch_to_tsquery('english', $1) AS tsq
        WHERE p.search_vector IS NOT NULL
          AND p.search_vector @@ tsq
          AND p._status = 'published'
        ORDER BY rank DESC
        LIMIT $2`,
      [q, limit, HEADLINE_OPTS],
    )

    const results = rows.map((r) => row2result(r, 'news', `/news/${toStr(r.slug)}`))

    if (results.length < limit) {
      const ftsIds = results.map((r) => r.id)
      const { rows: fuzzy } = await db
        .query(
          `SELECT id, title, slug,
                  CAST(similarity(title, $1) AS float8) AS rank
             FROM news_events
            WHERE similarity(title, $1) > 0.15
              AND _status = 'published'
              AND NOT (id = ANY($3::int[]))
            ORDER BY rank DESC
            LIMIT $2`,
          [q, limit - results.length, ftsIds],
        )
        .catch(() => ({ rows: [] as Record<string, unknown>[] }))
      fuzzy.forEach((r) =>
        results.push(
          row2result({ ...r, rank: toNum(r.rank) * 0.7 }, 'news', `/news/${toStr(r.slug)}`),
        ),
      )
    }

    return results.sort((a, b) => b.rank - a.rank).slice(0, limit)
  }
}

function emptyResults(): GroupedResults {
  return { publications: [], people: [], projects: [], blog: [], news: [], total: 0 }
}
