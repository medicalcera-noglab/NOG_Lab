import type { Metadata } from 'next'
import type { SiteSetting, Media } from '../../payload-types'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://noglabkmu.org'

interface PageMetaInput {
  /** Page-specific title — the lab name suffix is appended automatically. */
  title?: string
  description?: string
  /** Path only, e.g. "/people/dr-ali". Resolved against NEXT_PUBLIC_SITE_URL. */
  canonical?: string
  /** Override the default og:image from site settings. Pass null to suppress. */
  ogImage?: string | null
  noIndex?: boolean
}

/**
 * Builds a complete Next.js Metadata object from site-settings defaults and
 * per-page overrides. Call from generateMetadata in every page.
 */
export function buildMetadata(
  { title, description, canonical, ogImage, noIndex }: PageMetaInput,
  settings: Pick<SiteSetting, 'labName' | 'tagline' | 'seoDefaults'>,
): Metadata {
  const suffix = settings.seoDefaults?.titleSuffix ?? settings.labName
  const fullTitle = title ? `${title} | ${suffix}` : suffix
  const desc = description ?? settings.tagline ?? undefined

  // Resolve og:image — page override → settings default → undefined
  const defaultOgMedia =
    settings.seoDefaults?.ogImage && typeof settings.seoDefaults.ogImage === 'object'
      ? (settings.seoDefaults.ogImage as Media)
      : null
  const resolvedOgImage: string | undefined =
    ogImage !== null ? (ogImage ?? defaultOgMedia?.url ?? undefined) : undefined

  const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : undefined

  return {
    title: fullTitle,
    description: desc,
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
    ...(canonicalUrl ? { alternates: { canonical: canonicalUrl } } : {}),
    openGraph: {
      title: fullTitle,
      description: desc,
      ...(canonicalUrl ? { url: canonicalUrl } : {}),
      siteName: settings.labName,
      ...(resolvedOgImage
        ? { images: [{ url: resolvedOgImage, width: 1200, height: 630, alt: fullTitle }] }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: desc,
      ...(resolvedOgImage ? { images: [resolvedOgImage] } : {}),
    },
  }
}
