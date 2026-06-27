import { FadeUp } from '@/components/FadeUp'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { MediaImage } from '@/components/MediaImage'
import { cn } from '@/lib/utils'
import type { Collaborator, Media } from '../../../payload-types'

interface PartnerStripProps {
  collaborators: Collaborator[]
}

export function PartnerStrip({ collaborators }: PartnerStripProps) {
  if (!collaborators.length) return null

  return (
    <Section className="bg-bg py-6 md:py-10" aria-label="Partner institutions">
      <Container>
        <FadeUp>
          <p className="text-muted mb-8 text-center text-xs font-semibold tracking-[0.15em] uppercase">
            Research partners
          </p>
        </FadeUp>

        <FadeUp delay={0.05}>
          <ul
            role="list"
            aria-label="Partner and collaborator logos"
            className="flex flex-wrap items-center justify-center gap-6"
          >
            {collaborators.map((collab) => {
              const logo = (collab.logo as Media | null | undefined) ?? null

              return (
                <li key={collab.id}>
                  {collab.website ? (
                    <a
                      href={collab.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${collab.name} (opens in new tab)`}
                      className={cn(
                        'block rounded-lg transition-opacity duration-150',
                        'hover:opacity-80',
                        'focus-visible:ring-ring focus-visible:ring-offset-bg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                      )}
                    >
                      <PartnerLogo collab={collab} logo={logo} />
                    </a>
                  ) : (
                    <PartnerLogo collab={collab} logo={logo} />
                  )}
                </li>
              )
            })}
          </ul>
        </FadeUp>
      </Container>
    </Section>
  )
}

function PartnerLogo({ collab, logo }: { collab: Collaborator; logo: Media | null }) {
  if (logo) {
    return (
      <div className="relative h-8 w-24 grayscale transition-[filter] duration-200 hover:grayscale-0 sm:h-10 sm:w-32">
        <MediaImage doc={logo} fill sizes="128px" className="object-contain" />
      </div>
    )
  }

  // No logo — text pill fallback
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-4 py-2 text-sm font-medium',
        'border-border text-muted bg-surface-raised border',
      )}
    >
      {collab.name}
    </span>
  )
}
