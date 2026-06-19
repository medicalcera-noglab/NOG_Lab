import Image from 'next/image'
import { PlaceholderSvg } from '@/components/placeholders/PlaceholderSvg'
import { cn } from '@/lib/utils'
import type { Media } from '@/../../payload-types'

type MediaDoc = Pick<Media, 'alt' | 'url'> & Partial<Pick<Media, 'width' | 'height' | 'sizes'>>

interface MediaImageProps {
  /**
   * Payload media document (or partial).
   * When null / undefined (or when `url` is absent), a deterministic
   * microbiome-themed SVG placeholder is rendered instead.
   */
  doc: MediaDoc | null | undefined
  /**
   * Seed for the deterministic placeholder variant.
   * Pass the record's id or slug so the illustration is stable across loads.
   */
  seed?: string | number
  /**
   * Accessible label on the placeholder <figure>.
   * Defaults to "Abstract microbiome illustration".
   */
  placeholderLabel?: string
  /** Tailwind / CSS class forwarded to the element. */
  className?: string
  /**
   * Responsive `sizes` hint for the browser.
   * Defaults to a sensible full-width breakpoint set.
   */
  sizes?: string
  /** Set true for above-the-fold hero images — disables lazy loading. */
  priority?: boolean
  /** Fill the parent container instead of using intrinsic dimensions. */
  fill?: boolean
}

/**
 * Theme-aware, srcSet-backed image component for Payload media documents.
 *
 * Behaviour:
 *  - Builds a WebP srcSet from the three Payload imageSizes variants
 *    (thumbnail 300w, medium 800w, large 1600w) when present.
 *  - Falls back to the original `url` if a size is missing or the doc has
 *    no sizes at all (PDFs and MP4s never have sizes).
 *  - When doc is null/undefined or url is absent, renders a deterministic
 *    microbiome SVG placeholder seeded by the `seed` prop.
 *  - `alt` is always pulled from the Payload doc — never hardcoded.
 *  - Lazy-loads by default; pass `priority` for above-the-fold images.
 *  - No layout shift: placeholder and real image occupy identical space.
 */
export function MediaImage({
  doc,
  seed = 0,
  placeholderLabel = 'Abstract microbiome illustration',
  className,
  sizes = '(max-width: 640px) 100vw, (max-width: 1280px) 80vw, 1600px',
  priority = false,
  fill = false,
}: MediaImageProps) {
  // ── Placeholder path ──────────────────────────────────────────────────────
  // Guard on doc AND url so TypeScript narrows doc to non-null below.
  if (!doc?.url) {
    if (fill) {
      return (
        <figure
          aria-label={placeholderLabel}
          role="img"
          className={cn('absolute inset-0 overflow-hidden', className)}
        >
          <PlaceholderSvg seed={seed} className="h-full w-full" />
        </figure>
      )
    }
    // Non-fill: render inline, deferring sizing to the parent container.
    return (
      <figure aria-label={placeholderLabel} role="img" className={cn('block w-full', className)}>
        <PlaceholderSvg seed={seed} className="h-full w-full" />
      </figure>
    )
  }

  // ── Real image path (doc and doc.url are guaranteed non-null here) ────────
  const src = doc.url
  const { thumbnail, medium, large } = doc.sizes ?? {}

  const width = doc.width ?? large?.width ?? medium?.width ?? thumbnail?.width ?? undefined
  const height = doc.height ?? large?.height ?? medium?.height ?? thumbnail?.height ?? undefined

  const bestSrc = large?.url ?? medium?.url ?? thumbnail?.url ?? src

  const sharedProps = {
    src: bestSrc,
    alt: doc.alt,
    sizes,
    priority,
    className,
  } as const

  if (fill) {
    return <Image {...sharedProps} alt={doc.alt} fill style={{ objectFit: 'cover' }} />
  }

  if (width && height) {
    return <Image {...sharedProps} alt={doc.alt} width={width} height={height} />
  }

  // No intrinsic dimensions available (e.g. SVG or freshly uploaded file
  // before Sharp finishes). Fall back to fill with a wrapper.
  return (
    <div className={className} style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
      <Image {...sharedProps} alt={doc.alt} fill style={{ objectFit: 'contain' }} />
    </div>
  )
}
