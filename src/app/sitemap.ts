import type { MetadataRoute } from 'next'
import { getAllPeopleSlugs } from '@/lib/data/people'
import { getAllProjectSlugs } from '@/lib/data/projects'
import { getAllBlogSlugs } from '@/lib/data/blog'
import { getAllNewsSlugs } from '@/lib/data/news'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://noglab.org'

function entry(
  path: string,
  priority: number,
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] = 'weekly',
): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [peopleSlugs, projectSlugs, blogSlugs, newsSlugs] = await Promise.all([
    getAllPeopleSlugs(),
    getAllProjectSlugs(),
    getAllBlogSlugs(),
    getAllNewsSlugs(),
  ])

  const staticPages: MetadataRoute.Sitemap = [
    entry('/', 1.0, 'daily'),
    entry('/people', 0.8),
    entry('/projects', 0.8),
    entry('/research', 0.7),
    entry('/publications', 0.8, 'daily'),
    entry('/blog', 0.7),
    entry('/news', 0.7),
    entry('/about', 0.6, 'monthly'),
    entry('/collaborations', 0.6, 'monthly'),
    entry('/impact', 0.6, 'monthly'),
    entry('/contact', 0.5, 'yearly'),
    entry('/join', 0.6, 'monthly'),
  ]

  const peoplePages = peopleSlugs.map((slug) => entry(`/people/${slug}`, 0.7))
  const projectPages = projectSlugs.map((slug) => entry(`/projects/${slug}`, 0.7))
  const blogPages = blogSlugs.map((slug) => entry(`/blog/${slug}`, 0.6))
  const newsPages = newsSlugs.map((slug) => entry(`/news/${slug}`, 0.5))

  return [...staticPages, ...peoplePages, ...projectPages, ...blogPages, ...newsPages]
}
