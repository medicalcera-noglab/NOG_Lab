import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayload({ config })
  const now = new Date().toISOString()

  const [blogResult, newsResult] = await Promise.all([
    payload.find({
      collection: 'blog_posts',
      where: {
        and: [
          { status: { not_equals: 'published' } },
          { scheduledPublishAt: { less_than_equal: now } },
          { scheduledPublishAt: { exists: true } },
        ],
      },
      limit: 100,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'news_events',
      where: {
        and: [
          { status: { not_equals: 'published' } },
          { scheduledPublishAt: { less_than_equal: now } },
          { scheduledPublishAt: { exists: true } },
        ],
      },
      limit: 100,
      overrideAccess: true,
    }),
  ])

  const blogUpdates = blogResult.docs.map((doc) =>
    payload.update({
      collection: 'blog_posts',
      id: doc.id,
      data: { status: 'published', publishedAt: doc.publishedAt ?? now },
      overrideAccess: true,
    }),
  )
  const newsUpdates = newsResult.docs.map((doc) =>
    payload.update({
      collection: 'news_events',
      id: doc.id,
      data: { status: 'published', publishedAt: doc.publishedAt ?? now },
      overrideAccess: true,
    }),
  )

  await Promise.all([...blogUpdates, ...newsUpdates])

  return NextResponse.json({
    published: {
      blog: blogResult.docs.length,
      news: newsResult.docs.length,
    },
  })
}
