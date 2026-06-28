import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { RichText } from '@/components/RichText'
import { FadeUp } from '@/components/FadeUp'
import { MolecularDots } from '@/components/motifs/MolecularDots'
import { PublicationListItem } from '@/components/publications/PublicationListItem'
import { LucideIcon, resolveLucideIcon } from '@/lib/lucideIcon'
import { lexicalToText } from '@/lib/richtext'
import { cn } from '@/lib/utils'
import type { ResearchTheme, Project, Publication, Person, Media } from '../../../payload-types'

interface ThemeSectionProps {
  theme: ResearchTheme
  projects: Project[]
  publications: Publication[]
  /** Distinct active team members derived from all projects under this theme. */
  leads: Person[]
  /** Alternate background for visual rhythm. */
  alternate?: boolean
}

export function ThemeSection({
  theme,
  projects,
  publications,
  leads,
  alternate,
}: ThemeSectionProps) {
  const sectionId = `theme-${theme.slug ?? theme.id}`

  return (
    <section
      id={sectionId}
      aria-labelledby={`${sectionId}-heading`}
      className={cn(
        'relative scroll-mt-20 overflow-hidden py-10 md:py-14',
        alternate ? 'bg-surface' : 'bg-bg',
      )}
      style={{ '--tc': theme.color } as React.CSSProperties}
    >
      {/* Decorative motif */}
      <MolecularDots
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
      />

      {/* Left accent bar */}
      <div
        className="absolute top-0 left-0 h-full w-1"
        style={{ backgroundColor: 'var(--tc)', opacity: 0.6 }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* ── Header ── */}
        <FadeUp>
          <div className="mb-10 flex items-start gap-4">
            {theme.icon && resolveLucideIcon(theme.icon) && (
              <span
                className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: 'color-mix(in oklch, var(--tc) 15%, transparent)' }}
                aria-hidden="true"
              >
                <LucideIcon name={theme.icon} size={20} style={{ color: 'var(--tc)' }} />
              </span>
            )}
            <div>
              <p
                className="mb-1 text-xs font-semibold tracking-[0.15em] uppercase"
                style={{ color: 'var(--tc)' }}
              >
                Research theme
              </p>
              <h2
                id={`${sectionId}-heading`}
                className="font-heading text-fg text-3xl font-bold md:text-4xl"
              >
                {theme.name}
              </h2>
            </div>
          </div>
        </FadeUp>

        <FadeUp delay={0.08}>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[2fr_1fr] lg:gap-16">
            {/* ── Main column ── */}
            <div>
              {/* Description */}
              {theme.description ? (
                <RichText data={theme.description} className="mb-8 max-w-2xl text-base" />
              ) : null}

              {/* Methods */}
              {theme.methods && theme.methods.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-heading text-fg mb-3 text-sm font-bold tracking-wide uppercase">
                    Methods
                  </h3>
                  <ul className="flex flex-wrap gap-2">
                    {theme.methods.map((m) => (
                      <li
                        key={m.id ?? m.method}
                        className="border-border bg-surface-raised text-muted rounded-full border px-3 py-1 text-xs"
                      >
                        {m.method}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Related projects */}
              {projects.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-heading text-fg mb-3 text-sm font-bold tracking-wide uppercase">
                    Projects
                  </h3>
                  <ul role="list" className="flex flex-col gap-3">
                    {projects.map((project) => (
                      <li key={project.id}>
                        <Link
                          href={`/projects/${project.slug ?? project.id}`}
                          className={cn(
                            'border-border bg-bg group flex items-center justify-between',
                            'rounded-lg border px-4 py-3',
                            'transition-shadow duration-150 hover:shadow-sm',
                            'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                          )}
                        >
                          <span className="font-heading text-fg text-sm font-bold">
                            {project.title}
                          </span>
                          <span
                            className={cn(
                              'ml-3 shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold',
                              project.status === 'ongoing'
                                ? 'bg-primary/10 text-primary'
                                : 'bg-surface-raised text-muted',
                            )}
                          >
                            {project.status}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Related publications */}
              {publications.length > 0 && (
                <div>
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <h3 className="font-heading text-fg text-sm font-bold tracking-wide uppercase">
                      Publications
                    </h3>
                    <Link
                      href={`/publications?theme=${theme.slug ?? theme.id}`}
                      className={cn(
                        'inline-flex items-center gap-1 text-xs font-semibold',
                        'focus-visible:ring-ring rounded focus-visible:ring-2 focus-visible:outline-none',
                      )}
                      style={{ color: 'var(--tc)' }}
                    >
                      All
                      <ArrowRight size={12} aria-hidden="true" />
                    </Link>
                  </div>
                  <ul role="list" className="flex flex-col gap-3">
                    {publications.slice(0, 4).map((pub) => (
                      <li key={pub.id}>
                        <PublicationListItem publication={pub} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* ── Sidebar: lead team ── */}
            {leads.length > 0 && (
              <aside aria-label={`${theme.name} team leads`}>
                <h3 className="font-heading text-fg mb-4 text-sm font-bold tracking-wide uppercase">
                  Lab leads
                </h3>
                <ul role="list" className="flex flex-col gap-3">
                  {leads.map((person) => {
                    const photo = (person.photo as Media | null | undefined) ?? null
                    const slug = person.slug ?? String(person.id)
                    return (
                      <li key={person.id}>
                        <Link
                          href={`/people/${slug}`}
                          className={cn(
                            'border-border bg-bg flex items-center gap-3 rounded-lg border p-3',
                            'transition-shadow duration-150 hover:shadow-sm',
                            'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                          )}
                        >
                          {/* Avatar */}
                          <div
                            className="bg-surface-raised flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full"
                            aria-hidden="true"
                          >
                            {photo?.url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={photo.url}
                                alt=""
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <span className="text-muted text-sm font-bold">
                                {person.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-fg truncate text-sm font-semibold">{person.name}</p>
                            <p className="text-muted truncate text-xs capitalize">
                              {person.role.replace('_', ' ')}
                            </p>
                          </div>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </aside>
            )}
          </div>
        </FadeUp>

        {/* Empty state */}
        {projects.length === 0 && publications.length === 0 && leads.length === 0 && (
          <p className="text-muted py-4 text-sm">
            No projects or publications yet under this theme.
          </p>
        )}
      </div>
    </section>
  )
}

// Derive distinct active team members from a list of projects.
export function deriveLeads(projects: Project[]): Person[] {
  const seen = new Set<number>()
  const leads: Person[] = []
  for (const project of projects) {
    for (const member of project.team ?? []) {
      if (typeof member !== 'object') continue
      const person = member as Person
      if (!seen.has(person.id) && person.is_active) {
        seen.add(person.id)
        leads.push(person)
      }
    }
  }
  return leads
}

// Extract plain text from a Lexical field for truncation.
export { lexicalToText }
