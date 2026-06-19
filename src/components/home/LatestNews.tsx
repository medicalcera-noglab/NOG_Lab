import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { FadeUp } from '@/components/FadeUp'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { MolecularDots } from '@/components/motifs/MolecularDots'
import { cn } from '@/lib/utils'
import type { NewsEvent } from '../../../payload-types'

interface LatestNewsProps {
  items: NewsEvent[]
}

const CATEGORY_COLORS: Record<string, string> = {
  award: 'text-accent bg-accent/10',
  grant: 'text-primary bg-primary/10',
  talk: 'text-muted bg-surface-raised',
  conference: 'text-primary bg-primary/10',
  press: 'text-muted bg-surface-raised',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function LatestNews({ items }: LatestNewsProps) {
  if (!items.length) return null

  return (
    <Section
      className="bg-surface relative overflow-hidden py-16 md:py-24"
      aria-label="Latest news and events"
    >
      <MolecularDots className="absolute inset-0" />

      <Container className="relative z-10">
        <FadeUp>
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="text-primary mb-1 text-xs font-semibold tracking-[0.15em] uppercase">
                Latest
              </p>
              <h2 className="font-heading text-fg text-3xl font-bold">News &amp; events</h2>
            </div>
            <Link
              href="/news"
              className={cn(
                'text-primary hidden items-center gap-1.5 text-sm font-semibold sm:inline-flex',
                'transition-[gap] duration-150 hover:gap-2.5',
                'focus-visible:ring-ring rounded focus-visible:ring-2 focus-visible:outline-none',
              )}
            >
              All news
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </FadeUp>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <FadeUp key={item.id} delay={i * 0.08}>
              <article
                className={cn(
                  'group border-border bg-bg flex flex-col rounded-xl border p-6',
                  'transition-shadow duration-200 hover:shadow-md',
                  'h-full',
                )}
              >
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className={cn(
                      'inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize',
                      CATEGORY_COLORS[item.category] ?? 'text-muted bg-surface-raised',
                    )}
                  >
                    {item.category}
                  </span>
                  <time dateTime={item.date} className="text-muted text-xs">
                    {formatDate(item.date)}
                  </time>
                </div>

                <h3 className="font-heading text-fg mb-3 line-clamp-3 flex-1 text-base leading-snug font-bold">
                  {item.title}
                </h3>

                {item.venue && <p className="text-muted mb-4 text-xs">{item.venue}</p>}

                <Link
                  href={`/news/${item.id}`}
                  className={cn(
                    'text-primary mt-auto inline-flex items-center gap-1.5 text-xs font-semibold',
                    'transition-[gap] duration-150 group-hover:gap-2.5',
                    'focus-visible:ring-ring rounded focus-visible:ring-2 focus-visible:outline-none',
                  )}
                  aria-label={`Read more: ${item.title}`}
                >
                  Read more
                  <ArrowRight size={13} aria-hidden="true" />
                </Link>
              </article>
            </FadeUp>
          ))}
        </div>

        {/* Mobile "All news" link */}
        <FadeUp delay={0.2}>
          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/news"
              className={cn(
                'text-primary inline-flex items-center gap-2 text-sm font-semibold',
                'focus-visible:ring-ring rounded focus-visible:ring-2 focus-visible:outline-none',
              )}
            >
              All news
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </FadeUp>
      </Container>
    </Section>
  )
}
