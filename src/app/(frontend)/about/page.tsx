import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import { Download } from 'lucide-react'
import { FadeUp } from '@/components/FadeUp'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { PageBanner } from '@/components/ui/PageBanner'
import { buttonVariants } from '@/components/ui/Button'
import { RichText } from '@/components/RichText'
import { MediaImage } from '@/components/MediaImage'
import { FacilitiesGallery } from '@/components/about/FacilitiesGallery'
import { getAbout } from '@/lib/data/about'
import { getSiteSettings } from '@/lib/data/site-settings'
import { getPageSeo, resolvePageSeo } from '@/lib/data'
import type { Media } from '../../../../payload-types'

export async function generateMetadata(): Promise<Metadata> {
  const [settings, pageSeo] = await Promise.all([getSiteSettings(), getPageSeo()])
  const seo = resolvePageSeo(pageSeo, 'about')
  return buildMetadata(
    {
      title: seo.title ?? 'About',
      description:
        seo.description ?? 'Our mission, leadership, institutional affiliation, and facilities.',
      canonical: '/about',
      ogImage: seo.ogImageUrl,
    },
    settings,
  )
}

export const revalidate = 300

export default async function AboutPage() {
  const [about, settings] = await Promise.all([getAbout(), getSiteSettings()])

  const portrait =
    about?.directorPortrait && typeof about.directorPortrait === 'object'
      ? (about.directorPortrait as Media)
      : null
  const brochureUrl =
    settings?.brochure && typeof settings.brochure === 'object'
      ? (settings.brochure as Media).url
      : null

  return (
    <>
      <PageBanner eyebrow="Who we are" title="About NOG Lab" tint="#0E6E6E" />

      {/* Mission */}
      {about?.mission && (
        <Section className="py-12 md:py-16">
          <Container>
            <FadeUp>
              <RichText data={about.mission} className="max-w-3xl text-lg" />
            </FadeUp>
          </Container>
        </Section>
      )}

      {/* Director's Message */}
      {about?.directorMessage && (
        <Section className="bg-surface py-12">
          <Container>
            <FadeUp>
              <div className="flex flex-col items-start gap-8 md:flex-row">
                {portrait && (
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
                  <h2 className="mb-4 text-2xl font-bold">Director&apos;s Message</h2>
                  <RichText data={about.directorMessage} className="max-w-2xl" />
                </div>
              </div>
            </FadeUp>
          </Container>
        </Section>
      )}

      {/* KMU Affiliation */}
      {about?.kmuAffiliation && (
        <Section className="py-12">
          <Container>
            <FadeUp>
              <h2 className="mb-6 text-2xl font-bold">Institutional Affiliation</h2>
              <RichText data={about.kmuAffiliation} className="max-w-3xl" />
            </FadeUp>
          </Container>
        </Section>
      )}

      {/* Facilities Gallery */}
      {about?.facilities && about.facilities.length > 0 && (
        <Section className="bg-surface py-12">
          <Container>
            <FadeUp>
              <h2 className="mb-6 text-2xl font-bold">Our Facilities</h2>
              <FacilitiesGallery facilities={about.facilities} />
            </FadeUp>
          </Container>
        </Section>
      )}

      {/* Brochure Download */}
      {brochureUrl && (
        <Section className="py-12">
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
