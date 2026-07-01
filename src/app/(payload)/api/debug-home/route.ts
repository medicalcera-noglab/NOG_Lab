import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_noStore as noStore } from 'next/cache'

export const dynamic = 'force-dynamic'

async function runQuery(
  name: string,
  fn: () => Promise<unknown>,
): Promise<{ name: string; ok: boolean; ms: number; error?: string; result?: unknown }> {
  const start = Date.now()
  try {
    const result = await fn()
    return {
      name,
      ok: true,
      ms: Date.now() - start,
      result:
        typeof result === 'object'
          ? Array.isArray(result)
            ? `[${(result as unknown[]).length} items]`
            : result
              ? 'object'
              : null
          : result,
    }
  } catch (err) {
    return {
      name,
      ok: false,
      ms: Date.now() - start,
      error:
        err instanceof Error
          ? `${err.message}\n${err.stack?.split('\n').slice(0, 5).join('\n')}`
          : String(err),
    }
  }
}

export async function GET() {
  noStore()

  const payload = await getPayload({ config })

  const results = await Promise.allSettled([
    runQuery('getSiteSettings', () =>
      payload.findGlobal({ slug: 'site_settings', depth: 1, overrideAccess: true }),
    ),
    runQuery('getCounts-publications', () =>
      payload.count({ collection: 'publications', overrideAccess: true }),
    ),
    runQuery('getCounts-projects', () =>
      payload.count({ collection: 'projects', overrideAccess: true }),
    ),
    runQuery('getCounts-people', () =>
      payload.count({ collection: 'people', overrideAccess: true }),
    ),
    runQuery('getCounts-collaborators', () =>
      payload.count({ collection: 'collaborators', overrideAccess: true }),
    ),
    runQuery('getFeaturedProject', () =>
      payload.find({
        collection: 'projects',
        where: { isFeaturedHome: { equals: true } },
        limit: 1,
        depth: 2,
        overrideAccess: true,
      }),
    ),
    runQuery('getLatestNews', () =>
      payload.find({
        collection: 'news_events',
        where: { status: { equals: 'published' } },
        sort: '-date',
        limit: 3,
        depth: 1,
        overrideAccess: true,
      }),
    ),
    runQuery('getCollaborators', () =>
      payload.find({
        collection: 'collaborators',
        sort: 'displayOrder',
        depth: 1,
        overrideAccess: true,
      }),
    ),
    runQuery('getAllStudySites', () =>
      payload.find({
        collection: 'study_sites',
        sort: 'name',
        limit: 100,
        depth: 0,
        overrideAccess: true,
      }),
    ),
    runQuery('getAbout', () =>
      payload.findGlobal({ slug: 'about', depth: 2, overrideAccess: true }),
    ),
    runQuery('getAllPeople', () =>
      payload.find({
        collection: 'people',
        sort: 'displayOrder',
        limit: 0,
        depth: 1,
        overrideAccess: true,
      }),
    ),
    runQuery('getAllResearchThemes', () =>
      payload.find({
        collection: 'research_themes',
        sort: 'displayOrder',
        limit: 0,
        depth: 0,
        overrideAccess: true,
      }),
    ),
    runQuery('getHomeProjects', () =>
      payload.find({
        collection: 'projects',
        sort: '-createdAt',
        limit: 3,
        depth: 2,
        overrideAccess: true,
      }),
    ),
    runQuery('getLatestPublications', () =>
      payload.find({
        collection: 'publications',
        sort: '-year',
        limit: 5,
        depth: 1,
        overrideAccess: true,
      }),
    ),
    runQuery('getPageSeo', () =>
      payload.findGlobal({ slug: 'page_seo', depth: 0, overrideAccess: true }),
    ),
  ])

  const data = results.map((r) =>
    r.status === 'fulfilled' ? r.value : { name: 'unknown', ok: false, error: String(r.reason) },
  )
  const failures = data.filter((r) => !r.ok)

  return NextResponse.json(
    { failures: failures.length, results: data },
    { status: failures.length > 0 ? 500 : 200 },
  )
}
