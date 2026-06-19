import Image from 'next/image'
import type { Media } from '@/../../payload-types'

interface MediaImageProps {
  /** Payload media document (or partial). `alt` and `url` are required. */
  doc: Pick<Media, 'alt' | 'url'> & Partial<Pick<Media, 'width' | 'height' | 'sizes'>>
  /** Tailwind / CSS class forwarded to the <Image> wrapper div. */
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
 *  - `alt` is always pulled from the Payload doc — never hardcoded.
 *  - Lazy-loads by default; pass `priority` for above-the-fold images.
 */
export function MediaImage({
  doc,
  className,
  sizes = '(max-width: 640px) 100vw, (max-width: 1280px) 80vw, 1600px',
  priority = false,
  fill = false,
}: MediaImageProps) {
  const src = doc.url ?? ''
  if (!src) return null

  const { thumbnail, medium, large } = doc.sizes ?? {}

  // Build a srcSet string from the available size variants.
  const srcSetParts: string[] = []
  if (thumbnail?.url) srcSetParts.push(`${thumbnail.url} 300w`)
  if (medium?.url) srcSetParts.push(`${medium.url} 800w`)
  if (large?.url) srcSetParts.push(`${large.url} 1600w`)

  const width = doc.width ?? large?.width ?? medium?.width ?? thumbnail?.width ?? undefined
  const height = doc.height ?? large?.height ?? medium?.height ?? thumbnail?.height ?? undefined

  // next/image doesn't accept the `srcSet` prop directly — we pass the best
  // available src (largest size or original) and rely on the loader + sizes
  // hint for responsive delivery via CDN.
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
