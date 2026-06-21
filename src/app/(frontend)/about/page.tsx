import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import { Download } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
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
      {/* Mission */}
      {about?.mission && (
        <Section className="pt-20 pb-12">
          <Container>
            <h1 className="mb-8 text-4xl font-bold">About NOG Lab</h1>
            <RichText data={about.mission} className="max-w-3xl text-lg" />
          </Container>
        </Section>
      )}

      {/* Director's Message */}
      {about?.directorMessage && (
        <Section className="bg-surface py-12">
          <Container>
            <div className="flex flex-col items-start gap-10 md:flex-row">
              {portrait && (
                <div className="border-border h-48 w-48 shrink-0 overflow-hidden rounded-full border-4">
                  <MediaImage
                    doc={portrait}
                    sizes="192px"
                    priority
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h2 className="mb-4 text-2xl font-bold">Director&apos;s Message</h2>
                <RichText data={about.directorMessage} className="max-w-2xl" />
              </div>
            </div>
          </Container>
        </Section>
      )}

      {/* KMU Affiliation */}
      {about?.kmuAffiliation && (
        <Section className="py-12">
          <Container>
            <h2 className="mb-6 text-2xl font-bold">Institutional Affiliation</h2>
            <RichText data={about.kmuAffiliation} className="max-w-3xl" />
          </Container>
        </Section>
      )}

      {/* Facilities Gallery */}
      {about?.facilities && about.facilities.length > 0 && (
        <Section className="bg-surface py-12">
          <Container>
            <h2 className="mb-6 text-2xl font-bold">Our Facilities</h2>
            <FacilitiesGallery facilities={about.facilities} />
          </Container>
        </Section>
      )}

      {/* Brochure Download */}
      {brochureUrl && (
        <Section className="py-12">
          <Container>
            <a
              href={brochureUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: 'primary', size: 'lg' })}
            >
              <Download size={18} />
              Download Lab Brochure
            </a>
          </Container>
        </Section>
      )}
    </>
  )
}
