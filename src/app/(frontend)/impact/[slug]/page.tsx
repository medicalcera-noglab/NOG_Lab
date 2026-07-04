import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { RichText } from '@/components/RichText'
import { MediaImage } from '@/components/MediaImage'
import { getSiteSettings } from '@/lib/data'
import { getImpactStoryBySlug, getAllImpactStorySlugs } from '@/lib/data/impact'
import type { Media, Project } from '../../../../../payload-types'

export const revalidate = 120

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllImpactStorySlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const [story, settings] = await Promise.all([getImpactStoryBySlug(slug), getSiteSettings()])
  if (!story) return {}
  const cover = story.cover && typeof story.cover === 'object' ? (story.cover as Media) : null
  return buildMetadata(
    {
      title: story.title,
      canonical: `/impact/${slug}`,
      ogImage: cover?.url ?? null,
    },
    settings,
  )
}

export default async function ImpactStoryPage({ params }: Props) {
  const { slug } = await params
  const story = await getImpactStoryBySlug(slug)
  if (!story) notFound()

  const cover = story.cover && typeof story.cover === 'object' ? (story.cover as Media) : null
  const relatedProjects = (
    Array.isArray(story.relatedProjects) ? story.relatedProjects : []
  ).filter((p): p is Project => typeof p === 'object')

  const date = story.publishedAt
    ? new Date(story.publishedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  return (
    <>
      <Section className="pt-8 pb-4">
        <Container className="max-w-3xl">
          <Link
            href="/impact"
            className="text-muted hover:text-fg mb-8 inline-flex items-center gap-1.5 text-sm transition-colors focus-visible:underline focus-visible:outline-none"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Impact
          </Link>

          {date && (
            <time dateTime={story.publishedAt!} className="text-muted mb-3 block text-sm">
              {date}
            </time>
          )}
          <h1 className="font-heading text-fg mb-6 text-3xl leading-tight font-bold md:text-4xl">
            {story.title}
          </h1>
        </Container>
      </Section>

      {cover && (
        <Section className="py-0">
          <Container className="max-w-3xl px-0 sm:px-6">
            <div className="aspect-video overflow-hidden sm:rounded-xl">
              <MediaImage
                doc={cover}
                sizes="(max-width:768px) 100vw, 768px"
                priority
                className="h-full w-full object-cover"
              />
            </div>
          </Container>
        </Section>
      )}

      <Section className="py-12">
        <Container className="max-w-3xl">
          <RichText data={story.body} className="text-base leading-relaxed" />

          {relatedProjects.length > 0 && (
            <div className="border-border mt-12 border-t pt-8">
              <h2 className="font-heading text-fg mb-4 text-lg font-bold">Related Projects</h2>
              <ul role="list" className="flex flex-col gap-3">
                {relatedProjects.map((project) => (
                  <li key={project.id}>
                    <Link
                      href={`/projects/${project.slug ?? project.id}`}
                      className="border-border bg-surface flex items-center justify-between rounded-lg border p-4 transition-shadow hover:shadow-sm focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none"
                    >
                      <span className="font-heading text-fg text-sm font-semibold">
                        {project.title}
                      </span>
                      <span className="text-accent text-sm">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Container>
      </Section>
    </>
  )
}
