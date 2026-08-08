import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import { getAbout } from '@/lib/data/about'
import { getOpenPositions } from '@/lib/data/positions'
import { getSiteSettings } from '@/lib/data/site-settings'
import { getPageSeo, resolvePageSeo } from '@/lib/data'
import { PageBanner } from '@/components/ui/PageBanner'
import { JoinPageContent, type PositionCard } from '@/components/join/JoinPageContent'
import type { OpenPosition, Media } from '../../../../payload-types'

export async function generateMetadata(): Promise<Metadata> {
  const [settings, pageSeo] = await Promise.all([getSiteSettings(), getPageSeo()])
  const seo = resolvePageSeo(pageSeo, 'join')
  return buildMetadata(
    {
      title: seo.title ?? 'Join the Lab',
      description: seo.description ?? `Open positions and how to apply to ${settings.labName}.`,
      canonical: '/join',
      ogImage: seo.ogImageUrl,
    },
    settings,
  )
}

export const revalidate = 300

// Extract readable plain text from Payload Lexical JSON for card previews.
function extractPlainText(data: OpenPosition['description'] | undefined | null): string {
  if (!data || typeof data !== 'object') return ''
  const root = (data as Record<string, unknown>).root as { children?: unknown[] } | undefined
  if (!root?.children) return ''

  const traverse = (nodes: unknown[]): string =>
    nodes
      .map((node) => {
        const n = node as Record<string, unknown>
        if (n.type === 'text') return String(n.text ?? '')
        const children = n.children
        if (Array.isArray(children)) return traverse(children)
        return ''
      })
      .join(' ')

  return traverse(root.children).replace(/\s+/g, ' ').trim()
}

export default async function JoinPage() {
  const [positions, about, settings] = await Promise.all([
    getOpenPositions(),
    getAbout(),
    getSiteSettings(),
  ])

  const positionCards: PositionCard[] = positions.map((p) => ({
    id: p.id,
    title: p.title,
    type: p.type,
    previewText: extractPlainText(p.description).slice(0, 220),
    image: p.image && typeof p.image === 'object' ? (p.image as Media) : null,
    rawDoc: p,
  }))

  const testimonials = (about?.testimonials ?? []).map((t) => ({
    id: t.id ?? undefined,
    name: t.name,
    role: t.role,
    quote: t.quote,
  }))

  return (
    <>
      <PageBanner
        eyebrow="Work with us"
        title="Join the Lab"
        description="We welcome motivated researchers and students to join our microbiome research programme."
        tint="#E2725B"
      />

      <JoinPageContent
        positions={positionCards}
        rawPositions={positions}
        testimonials={testimonials}
        noPositionsMessage={settings?.noOpenPositionsMessage}
        recaptchaSiteKey={settings?.recaptchaSiteKey}
      />
    </>
  )
}
