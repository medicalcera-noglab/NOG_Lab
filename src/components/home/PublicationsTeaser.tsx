import Link from 'next/link'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { FadeUp } from '@/components/FadeUp'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { cn } from '@/lib/utils'
import type { Publication, Person } from '../../../payload-types'

interface PublicationsTeaserProps {
  publications: Publication[]
}

const TYPE_LABEL: Record<string, string> = {
  journal_article: 'Article',
  review: 'Review',
  conference: 'Conference',
  book_chapter: 'Book Chapter',
  preprint: 'Preprint',
  thesis: 'Thesis',
  other: 'Other',
}

const TYPE_COLOR: Record<string, string> = {
  journal_article: 'bg-primary/10 text-primary',
  review: 'bg-accent/10 text-accent',
  conference: 'bg-sand/20 text-fg',
  book_chapter: 'bg-surface-raised text-muted',
  preprint: 'bg-surface-raised text-muted',
  thesis: 'bg-surface-raised text-muted',
  other: 'bg-surface-raised text-muted',
}

export function PublicationsTeaser({ publications }: PublicationsTeaserProps) {
  if (!publications.length) return null

  return (
    <Section
      className="bg-surface relative overflow-hidden py-10 md:py-16"
      aria-label="Recent publications"
    >
      <Container>
        <FadeUp>
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="text-primary mb-1 text-xs font-semibold tracking-[0.15em] uppercase">
                Our output
              </p>
              <h2 className="font-heading text-fg text-3xl font-bold">Recent publications</h2>
            </div>
            <Link
              href="/publications"
              className={cn(
                'text-primary hidden items-center gap-1.5 text-sm font-semibold sm:inline-flex',
                'transition-[gap] duration-150 hover:gap-2.5',
                'focus-visible:ring-ring rounded focus-visible:ring-2 focus-visible:outline-none',
              )}
            >
              All publications
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </FadeUp>

        <ol role="list" className="divide-border divide-y">
          {publications.map((pub, i) => {
            const authorNames = (pub.authors ?? [])
              .slice(0, 3)
              .map((a) => a.author)
              .filter(Boolean)
            const hasMore = (pub.authors?.length ?? 0) > 3
            const typeLabel = TYPE_LABEL[pub.type] ?? pub.type
            const typeColor = TYPE_COLOR[pub.type] ?? 'bg-surface-raised text-muted'

            // Pick a DOI link or journal link if available
            const href = pub.doi ? `https://doi.org/${pub.doi}` : null

            return (
              <FadeUp key={pub.id} delay={i * 0.06}>
                <li className="group flex gap-4 py-5 sm:gap-6">
                  {/* Year badge */}
                  <div className="hidden w-12 shrink-0 sm:block">
                    <span className="text-muted text-sm font-semibold tabular-nums">
                      {pub.year}
                    </span>
                  </div>

                  {/* Main content */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      {/* Year on mobile */}
                      <span className="text-muted text-xs font-semibold tabular-nums sm:hidden">
                        {pub.year}
                      </span>
                      <span
                        className={cn(
                          'inline-block rounded-full px-2 py-0.5 text-xs font-semibold',
                          typeColor,
                        )}
                      >
                        {typeLabel}
                      </span>
                    </div>

                    <p className="text-fg mb-1 text-sm leading-snug font-semibold sm:text-base">
                      {href ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            'hover:text-primary transition-colors',
                            'focus-visible:ring-ring rounded focus-visible:ring-2 focus-visible:outline-none',
                          )}
                        >
                          {pub.title}
                        </a>
                      ) : (
                        pub.title
                      )}
                    </p>

                    <p className="text-muted text-xs leading-relaxed">
                      {authorNames.join(', ')}
                      {hasMore && ' et al.'}
                      {pub.journal && (
                        <>
                          {' '}
                          <span aria-hidden>·</span> <em>{pub.journal}</em>
                        </>
                      )}
                    </p>
                  </div>

                  {/* External link icon */}
                  {href && (
                    <div className="hidden shrink-0 items-center sm:flex">
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${pub.title} (external link)`}
                        className={cn(
                          'text-muted hover:text-primary rounded p-1 transition-colors',
                          'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                          'opacity-0 transition-opacity duration-150 group-hover:opacity-100',
                        )}
                      >
                        <ExternalLink size={15} aria-hidden="true" />
                      </a>
                    </div>
                  )}
                </li>
              </FadeUp>
            )
          })}
        </ol>

        {/* Mobile "All publications" */}
        <FadeUp delay={0.3}>
          <div className="mt-6 text-center sm:hidden">
            <Link
              href="/publications"
              className={cn(
                'text-primary inline-flex items-center gap-2 text-sm font-semibold',
                'focus-visible:ring-ring rounded focus-visible:ring-2 focus-visible:outline-none',
              )}
            >
              All publications
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </FadeUp>
      </Container>
    </Section>
  )
}
