import { Download } from 'lucide-react'
import { FadeUp } from '@/components/FadeUp'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { RichText } from '@/components/RichText'
import { MediaImage } from '@/components/MediaImage'
import { FacilitiesGallery } from '@/components/about/FacilitiesGallery'
import { buttonVariants } from '@/components/ui/Button'
import type { About, Media, SiteSetting } from '../../../payload-types'

interface AboutFullProps {
  about: About | null
  settings: SiteSetting
  /** Pass true when the portrait is already rendered above (e.g. in AboutTeaser) */
  hidePortrait?: boolean
}

export function AboutFull({ about, settings, hidePortrait = false }: AboutFullProps) {
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
      {/* Director's Message */}
      {about.directorMessage && (
        <Section className="bg-surface py-8 md:py-12">
          <Container>
            <FadeUp>
              <div className="flex flex-col items-start gap-8 md:flex-row">
                {portrait && !hidePortrait && (
                  <div className="border-border relative h-44 w-32 shrink-0 overflow-hidden rounded-2xl border shadow-sm sm:h-56 sm:w-40">
                    <MediaImage
                      doc={portrait}
                      fill
                      sizes="160px"
                      priority
                      className="object-cover object-top"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="font-heading text-fg mb-4 text-2xl font-bold">
                    Director&apos;s Message
                  </h2>
                  <RichText data={about.directorMessage} className="max-w-2xl" />
                </div>
              </div>
            </FadeUp>
          </Container>
        </Section>
      )}

      {/* KMU Affiliation */}
      {about.kmuAffiliation && (
        <Section className="py-8 md:py-12">
          <Container>
            <FadeUp>
              <h2 className="font-heading text-fg mb-6 text-2xl font-bold">
                Institutional Affiliation
              </h2>
              <RichText data={about.kmuAffiliation} className="max-w-3xl" />
            </FadeUp>
          </Container>
        </Section>
      )}

      {/* Facilities Gallery */}
      {hasFacilities && (
        <Section className="bg-surface py-8 md:py-12">
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
