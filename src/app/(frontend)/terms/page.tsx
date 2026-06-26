import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import { getSiteSettings } from '@/lib/data/site-settings'
import { getLegalPages } from '@/lib/data/legal'
import { Container } from '@/components/ui/Container'
import { PageBanner } from '@/components/ui/PageBanner'
import { RichText } from '@/components/RichText'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const [settings, legal] = await Promise.all([getSiteSettings(), getLegalPages()])
  const title = legal?.termsOfUseTitle ?? 'Terms of Use'
  return buildMetadata({ title, canonical: '/terms' }, settings)
}

export default async function TermsPage() {
  const legal = await getLegalPages()

  const title = legal?.termsOfUseTitle ?? 'Terms of Use'

  return (
    <main id="main-content">
      <PageBanner eyebrow="Legal" title={title} tint="#1A1A1A" />
      <Container className="py-12 md:py-20">
        <div className="mx-auto max-w-3xl">
          {legal?.termsOfUse ? (
            <RichText data={legal.termsOfUse} className="max-w-none" />
          ) : (
            <p className="text-muted text-base">Content coming soon.</p>
          )}
        </div>
      </Container>
    </main>
  )
}
