import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { MediaImage } from '@/components/MediaImage'
import { lexicalToText } from '@/lib/richtext'
import { cn } from '@/lib/utils'
import type { Project, ResearchTheme, Media } from '../../../payload-types'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const slug = project.slug ?? String(project.id)
  const coverImage = (project.coverImage as Media | null | undefined) ?? null
  const theme = (project.theme as ResearchTheme | null | undefined) ?? null
  const summaryText = lexicalToText(project.summary as Parameters<typeof lexicalToText>[0])
  const excerpt = summaryText.length > 160 ? summaryText.slice(0, 157) + '…' : summaryText

  return (
    <article
      className={cn(
        'group border-border bg-bg flex h-full flex-col overflow-hidden rounded-xl border',
        'transition-shadow duration-200 hover:shadow-md',
      )}
    >
      {/* Cover image — always rendered; MediaImage shows placeholder when coverImage is absent */}
      <Link
        href={`/projects/${slug}`}
        tabIndex={-1}
        aria-hidden="true"
        className="bg-surface-raised block aspect-[16/9] max-h-44 overflow-hidden sm:max-h-none"
      >
        <div className="relative h-full w-full">
          <MediaImage
            doc={coverImage}
            fill
            seed={project.id}
            placeholderLabel={`Illustration placeholder for ${project.title}`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Theme + status badges */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {theme && (
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
              style={{
                backgroundColor: `color-mix(in oklch, ${theme.color} 15%, transparent)`,
                color: theme.color,
              }}
            >
              {theme.name}
            </span>
          )}
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize',
              project.status === 'ongoing'
                ? 'bg-primary/10 text-primary'
                : 'bg-surface-raised text-muted',
            )}
          >
            {project.status}
          </span>
        </div>

        <h3 className="font-heading text-fg mb-2 text-base leading-snug font-bold">
          <Link
            href={`/projects/${slug}`}
            className={cn(
              'hover:text-primary transition-colors duration-150',
              'focus-visible:ring-ring rounded focus-visible:ring-2 focus-visible:outline-none',
            )}
          >
            {project.title}
          </Link>
        </h3>

        {excerpt && (
          <p className="text-muted mb-4 line-clamp-3 flex-1 text-sm leading-relaxed">{excerpt}</p>
        )}

        {project.funder && (
          <p className="text-muted mb-4 text-xs">
            <span className="font-medium">Funder:</span> {project.funder}
          </p>
        )}

        <Link
          href={`/projects/${slug}`}
          className={cn(
            'text-primary mt-auto inline-flex items-center gap-1.5 text-xs font-semibold',
            'transition-[gap] duration-150 hover:gap-2.5',
            'focus-visible:ring-ring rounded focus-visible:ring-2 focus-visible:outline-none',
          )}
          aria-label={`View project: ${project.title}`}
        >
          View project
          <ArrowRight size={13} aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}
