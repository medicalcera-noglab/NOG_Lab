import Link from 'next/link'
import { ArrowRight, Users } from 'lucide-react'
import { FadeUp } from '@/components/FadeUp'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { MediaImage } from '@/components/MediaImage'
import { cn } from '@/lib/utils'
import type { Person, Media } from '../../../payload-types'

const ROLE_LABEL: Record<string, string> = {
  pi: 'Principal Investigator',
  postdoc: 'Postdoctoral Researcher',
  phd: 'PhD Student',
  ms: 'MS Student',
  staff: 'Research Staff',
}

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/)
  const letters =
    parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase()
  return (
    <div
      aria-hidden="true"
      className="bg-primary/15 text-primary flex h-full w-full items-center justify-center text-xl font-bold"
    >
      {letters}
    </div>
  )
}

interface TeamTeaserProps {
  people: Person[]
}

export function TeamTeaser({ people }: TeamTeaserProps) {
  const preview = people.slice(0, 6)

  return (
    <Section className="bg-bg py-16 md:py-24">
      <Container>
        <FadeUp>
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="text-primary mb-1.5 text-xs font-semibold tracking-[0.15em] uppercase">
                The people
              </p>
              <h2 className="font-heading text-fg text-3xl font-bold">Meet our team</h2>
            </div>
            <Link
              href="/people"
              className={cn(
                'text-primary hidden items-center gap-1.5 text-sm font-semibold sm:inline-flex',
                'transition-[gap] duration-150 hover:gap-2.5',
                'focus-visible:ring-ring rounded focus-visible:ring-2 focus-visible:outline-none',
              )}
            >
              All members
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </FadeUp>

        {preview.length === 0 ? (
          /* No people in CMS yet — show a welcoming placeholder */
          <FadeUp delay={0.05}>
            <div className="border-border bg-surface flex flex-col items-center gap-6 rounded-2xl border px-8 py-16 text-center">
              <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-full">
                <Users size={28} className="text-primary" aria-hidden="true" />
              </div>
              <div>
                <p className="text-fg mb-2 text-lg font-semibold">Our team is being introduced</p>
                <p className="text-muted max-w-sm text-sm leading-relaxed">
                  Faculty, researchers, and students driving cutting-edge microbiome science at KMU.
                </p>
              </div>
              <Link
                href="/people"
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold',
                  'border-border text-fg border',
                  'hover:bg-surface-raised transition-colors duration-150',
                  'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                )}
              >
                View team page
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </FadeUp>
        ) : (
          <>
            <ul role="list" className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
              {preview.map((person, i) => {
                const photo =
                  person.photo && typeof person.photo === 'object' ? (person.photo as Media) : null
                const roleLabel = ROLE_LABEL[person.role as string] ?? person.role

                return (
                  <li key={person.id}>
                    <FadeUp delay={i * 0.06}>
                      <Link
                        href={`/people/${person.slug ?? person.id}`}
                        className={cn(
                          'group flex flex-col items-center gap-3 rounded-xl p-4 text-center',
                          'hover:bg-surface transition-colors duration-150',
                          'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                        )}
                      >
                        {/* Avatar */}
                        <div className="border-border h-20 w-20 overflow-hidden rounded-full border-2">
                          {photo ? (
                            <div className="relative h-full w-full">
                              <MediaImage
                                doc={photo}
                                fill
                                sizes="80px"
                                className="object-cover object-top"
                              />
                            </div>
                          ) : (
                            <Initials name={person.name} />
                          )}
                        </div>

                        {/* Name + role */}
                        <div>
                          <p className="text-fg group-hover:text-primary line-clamp-2 text-sm leading-tight font-semibold transition-colors">
                            {person.name}
                          </p>
                          {roleLabel && (
                            <p className="text-muted mt-0.5 text-xs leading-snug">{roleLabel}</p>
                          )}
                        </div>
                      </Link>
                    </FadeUp>
                  </li>
                )
              })}
            </ul>

            {/* Mobile CTA */}
            <FadeUp delay={0.2}>
              <div className="mt-8 text-center sm:hidden">
                <Link
                  href="/people"
                  className={cn(
                    'text-primary inline-flex items-center gap-2 text-sm font-semibold',
                    'focus-visible:ring-ring rounded focus-visible:ring-2 focus-visible:outline-none',
                  )}
                >
                  All members
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </FadeUp>
          </>
        )}
      </Container>
    </Section>
  )
}
