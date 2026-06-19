import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Where } from 'payload'
import type { BlogPost } from '../../../payload-types'

export const getBlogList = unstable_cache(
  async (tag?: string): Promise<BlogPost[]> => {
    const payload = await getPayload({ config })
    const andClauses: Where[] = [{ status: { equals: 'published' } }]
    if (tag) andClauses.push({ 'tags.tag': { equals: tag } })
    const where: Where = andClauses.length === 1 ? andClauses[0]! : { and: andClauses }
    const result = await payload.find({
      collection: 'blog_posts',
      where,
      sort: '-publishedAt',
      limit: 50,
      depth: 2,
      overrideAccess: true,
    })
    return result.docs
  },
  ['blog-list'],
  { revalidate: 120, tags: ['blog_posts'] },
)

export const getBlogBySlug = unstable_cache(
  async (slug: string): Promise<BlogPost | null> => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'blog_posts',
      where: {
        and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }],
      },
      limit: 1,
      depth: 3,
      overrideAccess: true,
    })
    return result.docs[0] ?? null
  },
  ['blog-by-slug'],
  { revalidate: 60, tags: ['blog_posts'] },
)

export const getRelatedPosts = unstable_cache(
  async (currentId: number, tags: string[]): Promise<BlogPost[]> => {
    if (tags.length === 0) return []
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'blog_posts',
      where: {
        and: [
          { status: { equals: 'published' } },
          { id: { not_equals: currentId } },
          { 'tags.tag': { in: tags } },
        ],
      },
      sort: '-publishedAt',
      limit: 3,
      depth: 2,
      overrideAccess: true,
    })
    return result.docs
  },
  ['related-posts'],
  { revalidate: 300, tags: ['blog_posts'] },
)

export const getAllBlogSlugs = unstable_cache(
  async (): Promise<string[]> => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'blog_posts',
      where: { status: { equals: 'published' } },
      limit: 500,
      select: { slug: true },
      overrideAccess: true,
    })
    return result.docs.map((d) => d.slug).filter((s): s is string => Boolean(s))
  },
  ['all-blog-slugs'],
  { revalidate: 300, tags: ['blog_posts'] },
)
