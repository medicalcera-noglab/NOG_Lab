import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { buildMetadata } from '@/lib/metadata'
import { getSiteSettings } from '@/lib/data/site-settings'
import { getLegalPages } from '@/lib/data/legal'
import { Container } from '@/components/ui/Container'
import { RichText } from '@/components/RichText'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const [settings, legal] = await Promise.all([getSiteSettings(), getLegalPages()])
  const title = legal?.termsOfUseTitle ?? 'Terms of Use'
  return buildMetadata({ title, canonical: '/terms' }, settings)
}

export default async function TermsPage() {
  const [legal, t] = await Promise.all([getLegalPages(), getTranslations('legal')])

  const title = legal?.termsOfUseTitle ?? 'Terms of Use'

  return (
    <main id="main-content">
      <Container className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-heading text-fg mb-10 text-4xl font-bold">{title}</h1>
          {legal?.termsOfUse ? (
            <RichText data={legal.termsOfUse} className="max-w-none" />
          ) : (
            <p className="text-muted text-base">{t('noContent')}</p>
          )}
        </div>
      </Container>
    </main>
  )
}
