import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { FadeUp } from '@/components/FadeUp'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { MediaImage } from '@/components/MediaImage'
import { lexicalToText } from '@/lib/richtext'
import { cn } from '@/lib/utils'
import type { Project, Media, ResearchTheme } from '../../../payload-types'

interface FeaturedProjectProps {
  project: Project | null
}

export function FeaturedProject({ project }: FeaturedProjectProps) {
  if (!project) return null

  const coverImage = (project.coverImage as Media | null | undefined) ?? null
  const theme = (project.theme as ResearchTheme | null | undefined) ?? null
  const slug = project.slug ?? String(project.id)
  const summary = lexicalToText(project.summary as Parameters<typeof lexicalToText>[0], ' ')

  return (
    <Section className="bg-surface py-10 md:py-16" aria-label="Featured research project">
      <Container>
        <FadeUp>
          <p className="text-primary mb-10 text-xs font-semibold tracking-[0.15em] uppercase">
            Featured project
          </p>
        </FadeUp>

        <FadeUp delay={0.05}>
          <article
            className={cn(
              'group border-border relative grid grid-cols-1 gap-0 overflow-hidden rounded-2xl border',
              'md:grid-cols-5',
            )}
          >
            {/* Image pane */}
            {coverImage && (
              <div className="relative h-48 overflow-hidden sm:h-56 md:col-span-3 md:h-auto md:min-h-[320px]">
                <MediaImage
                  doc={coverImage}
                  fill
                  sizes="(max-width: 768px) 100vw, 60vw"
                  className="transition-transform duration-500 group-hover:scale-[1.03]"
                />
                {/* Subtle overlay */}
                <div
                  aria-hidden="true"
                  className="to-surface/50 absolute inset-0 bg-gradient-to-r from-transparent"
                />
              </div>
            )}

            {/* Content pane */}
            <div
              className={cn(
                'flex flex-col justify-between p-5 sm:p-8 md:p-10',
                coverImage ? 'md:col-span-2' : 'md:col-span-5',
              )}
            >
              <div>
                {theme?.name && (
                  <span className="text-primary mb-3 inline-block text-xs font-semibold tracking-wider uppercase">
                    {theme.name}
                  </span>
                )}
                <h2 className="font-heading text-fg mb-4 text-2xl leading-tight font-bold">
                  {project.title}
                </h2>
                {summary && (
                  <p className="text-muted line-clamp-5 text-sm leading-relaxed">{summary}</p>
                )}
              </div>

              <Link
                href={`/projects/${slug}`}
                className={cn(
                  'text-primary mt-8 inline-flex items-center gap-2 text-sm font-semibold',
                  'transition-[gap] duration-150 hover:gap-3',
                  'focus-visible:ring-ring rounded focus-visible:ring-2 focus-visible:outline-none',
                )}
                aria-label={`Read more about ${project.title}`}
              >
                Explore project
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </article>
        </FadeUp>
      </Container>
    </Section>
  )
}
