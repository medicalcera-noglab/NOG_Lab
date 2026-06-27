import Link from 'next/link'
import { ArrowRight, Download } from 'lucide-react'
import { FadeUp } from '@/components/FadeUp'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { RichText } from '@/components/RichText'
import { MediaImage } from '@/components/MediaImage'
import { FacilitiesGallery } from '@/components/about/FacilitiesGallery'
import { AnimatedCounter } from './AnimatedCounter'
import { buttonVariants } from '@/components/ui/Button'
import type { About, Media, Person, SiteSetting } from '../../../payload-types'
import type { HomeCounts } from '@/lib/data'

interface AboutFullProps {
  about: About | null
  settings: SiteSetting
  /** The PI person record — used for the "View Profile" card */
  piPerson?: Person | null
  /** When provided, renders the impact counters below the affiliation block */
  counts?: HomeCounts
}

const COUNTER_DEFS = [
  { key: 'publications', label: 'Publications' },
  { key: 'projects', label: 'Active Projects' },
  { key: 'teamMembers', label: 'Team Members' },
  { key: 'collaborators', label: 'Collaborators' },
] as const

export function AboutFull({ about, settings, piPerson, counts }: AboutFullProps) {
  if (!about) return null

  const portrait =
    about.directorPortrait && typeof about.directorPortrait === 'object'
      ? (about.directorPortrait as Media)
      : null

  const brochureUrl =
    settings.brochure && typeof settings.brochure === 'object'
      ? (settings.brochure as Media).url
      : null

  const hasFacilities = about.facilities && about.facilities.length > 0

  if (!about.directorMessage && !about.kmuAffiliation && !hasFacilities && !brochureUrl) return null

  return (
    <>
      {/* Principal Investigator */}
      {about.directorMessage && (
        <Section className="bg-surface py-10 md:py-14">
          <Container>
            <FadeUp>
              <h2 className="font-heading text-fg mb-8 text-2xl font-bold">
                Principal Investigator
              </h2>
              <RichText data={about.directorMessage} className="max-w-2xl" />

              {/* PI identity card */}
              {piPerson && (
                <div className="border-border bg-bg mt-8 flex items-center gap-4 rounded-2xl border p-4 shadow-sm">
                  <div className="border-primary/20 relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 shadow-sm">
                    {portrait ? (
                      <MediaImage
                        doc={portrait}
                        fill
                        sizes="64px"
                        className="object-cover object-top"
                      />
                    ) : (
                      <div className="bg-primary/10 flex h-full w-full items-center justify-center">
                        <span className="text-primary text-xl font-bold">
                          {piPerson.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-fg truncate font-bold">{piPerson.name}</p>
                    <p className="text-muted text-sm">Principal Investigator · NOG Lab</p>
                  </div>
                  <Link
                    href={`/people/${piPerson.slug ?? piPerson.id}`}
                    className="text-primary hover:text-accent inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold transition-colors focus-visible:underline focus-visible:outline-none"
                  >
                    View Profile
                    <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </div>
              )}
            </FadeUp>
          </Container>
        </Section>
      )}

      {/* KMU Affiliation + Impact Counters */}
      {about.kmuAffiliation && (
        <Section className="py-10 md:py-14">
          <Container>
            <FadeUp>
              <h2 className="font-heading text-fg mb-6 text-2xl font-bold">
                Institutional Affiliation
              </h2>
              <RichText data={about.kmuAffiliation} className="max-w-3xl" />
            </FadeUp>

            {/* Impact counters inline — no separate section gap */}
            {counts && (
              <FadeUp delay={0.1}>
                <div className="border-border mt-10 border-t pt-10">
                  <p className="text-primary mb-8 text-xs font-semibold tracking-[0.15em] uppercase">
                    Impact at a glance
                  </p>
                  <div
                    role="list"
                    aria-label="Lab statistics"
                    className="grid grid-cols-2 gap-6 md:grid-cols-4"
                  >
                    {COUNTER_DEFS.map(({ key, label }) => (
                      <div key={key} role="listitem">
                        <AnimatedCounter target={counts[key]} label={label} />
                      </div>
                    ))}
                  </div>
                </div>
              </FadeUp>
            )}
          </Container>
        </Section>
      )}

      {/* Facilities Gallery */}
      {hasFacilities && (
        <Section className="bg-surface py-10 md:py-14">
          <Container>
            <FadeUp>
              <h2 className="font-heading text-fg mb-6 text-2xl font-bold">Our Facilities</h2>
              <FacilitiesGallery facilities={about.facilities!} />
            </FadeUp>
          </Container>
        </Section>
      )}

      {/* Brochure Download */}
      {brochureUrl && (
        <Section className="py-6">
          <Container>
            <FadeUp>
              <a
                href={brochureUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: 'primary', size: 'lg' })}
              >
                <Download size={18} />
                Download Lab Brochure
              </a>
            </FadeUp>
          </Container>
        </Section>
      )}
    </>
  )
}
