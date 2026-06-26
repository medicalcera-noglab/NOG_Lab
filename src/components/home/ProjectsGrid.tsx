import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { FadeUp } from '@/components/FadeUp'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { MediaImage } from '@/components/MediaImage'
import { lexicalToText } from '@/lib/richtext'
import { cn } from '@/lib/utils'
import type { Project, Media, ResearchTheme } from '../../../payload-types'

interface ProjectsGridProps {
  projects: Project[]
}

export function ProjectsGrid({ projects }: ProjectsGridProps) {
  if (!projects.length) return null

  return (
    <Section className="bg-bg py-16 md:py-24" aria-label="Research projects">
      <Container>
        <FadeUp>
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="text-primary mb-1 text-xs font-semibold tracking-[0.15em] uppercase">
                Our work
              </p>
              <h2 className="font-heading text-fg text-3xl font-bold">Research projects</h2>
            </div>
            <Link
              href="/projects"
              className={cn(
                'text-primary hidden items-center gap-1.5 text-sm font-semibold sm:inline-flex',
                'transition-[gap] duration-150 hover:gap-2.5',
                'focus-visible:ring-ring rounded focus-visible:ring-2 focus-visible:outline-none',
              )}
            >
              All projects
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </FadeUp>

        <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => {
            const cover =
              project.coverImage && typeof project.coverImage === 'object'
                ? (project.coverImage as Media)
                : null
            const theme =
              project.theme && typeof project.theme === 'object'
                ? (project.theme as ResearchTheme)
                : null
            const slug = project.slug ?? String(project.id)
            const summary = lexicalToText(
              project.summary as Parameters<typeof lexicalToText>[0],
              ' ',
            )

            return (
              <li key={project.id}>
                <FadeUp delay={i * 0.07}>
                  <article
                    className={cn(
                      'group border-border bg-surface flex h-full flex-col overflow-hidden rounded-2xl border',
                      'transition-shadow duration-200 hover:shadow-lg',
                    )}
                  >
                    {/* Cover image */}
                    <Link
                      href={`/projects/${slug}`}
                      tabIndex={-1}
                      aria-hidden
                      className="block aspect-video overflow-hidden"
                    >
                      <MediaImage
                        doc={cover}
                        seed={project.id}
                        placeholderLabel={`Cover image for ${project.title}`}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    </Link>

                    {/* Content */}
                    <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
                      {theme?.name && (
                        <span className="text-primary text-xs font-semibold tracking-wider uppercase">
                          {theme.name}
                        </span>
                      )}
                      <h3 className="font-heading text-fg text-lg leading-snug font-bold">
                        <Link
                          href={`/projects/${slug}`}
                          className="hover:text-primary transition-colors focus-visible:underline focus-visible:outline-none"
                        >
                          {project.title}
                        </Link>
                      </h3>
                      {summary && (
                        <p className="text-muted line-clamp-3 flex-1 text-sm leading-relaxed">
                          {summary}
                        </p>
                      )}
                      <Link
                        href={`/projects/${slug}`}
                        className={cn(
                          'text-primary mt-auto inline-flex items-center gap-1.5 text-sm font-semibold',
                          'transition-[gap] duration-150 group-hover:gap-2.5',
                          'focus-visible:ring-ring rounded focus-visible:ring-2 focus-visible:outline-none',
                        )}
                        aria-label={`Explore project: ${project.title}`}
                      >
                        Explore project
                        <ArrowRight size={14} aria-hidden="true" />
                      </Link>
                    </div>
                  </article>
                </FadeUp>
              </li>
            )
          })}
        </ul>

        {/* Mobile "All projects" link */}
        <FadeUp delay={0.2}>
          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/projects"
              className={cn(
                'text-primary inline-flex items-center gap-2 text-sm font-semibold',
                'focus-visible:ring-ring rounded focus-visible:ring-2 focus-visible:outline-none',
              )}
            >
              All projects
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </FadeUp>
      </Container>
    </Section>
  )
}
