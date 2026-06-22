import Link from 'next/link'
import Image from 'next/image'
import { HeroCellField } from './HeroCellField'
import { Container } from '@/components/ui/Container'
import { GrainTexture } from '@/components/motifs/GrainTexture'
import { cn } from '@/lib/utils'
import type { SiteSetting, Media } from '../../../payload-types'

interface HeroSectionProps {
  labName: string
  tagline: SiteSetting['tagline']
  ctaPrimary: SiteSetting['heroCtaPrimary']
  ctaSecondary: SiteSetting['heroCtaSecondary']
  heroMedia?: SiteSetting['heroMedia']
}

export function HeroSection({
  labName,
  tagline,
  ctaPrimary,
  ctaSecondary,
  heroMedia,
}: HeroSectionProps) {
  const style = heroMedia?.style ?? 'particles'
  const videoDoc =
    heroMedia?.video && typeof heroMedia.video === 'object' ? (heroMedia.video as Media) : null
  const imageDoc =
    heroMedia?.image && typeof heroMedia.image === 'object' ? (heroMedia.image as Media) : null

  // Split into words for the staggered reveal.
  // Each word gets --word-index so CSS drives the delay without JS.
  const words = labName.trim().split(/\s+/)

  return (
    <section
      aria-label="Lab introduction"
      className="relative flex min-h-[60vh] items-center overflow-hidden sm:min-h-[calc(100vh-64px)]"
    >
      {/* ── Static gradient — always renders first (LCP paint) ──────────────── */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 60% 40%, color-mix(in oklch, var(--color-teal) 12%, transparent), transparent 70%), radial-gradient(ellipse 60% 80% at 20% 80%, color-mix(in oklch, var(--color-coral) 8%, transparent), transparent 70%)',
          backgroundColor: 'var(--bg)',
        }}
      />

      {/* ── Hero background layer (mutually exclusive) ───────────────────────── */}
      {style === 'video' && videoDoc?.url && (
        <video
          aria-hidden="true"
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover opacity-30 motion-safe:block motion-reduce:hidden"
          src={videoDoc.url}
        />
      )}

      {style === 'image' && imageDoc && (
        <div aria-hidden="true" className="absolute inset-0">
          <Image
            src={imageDoc.url ?? ''}
            alt=""
            fill
            className="object-cover opacity-25"
            sizes="100vw"
            priority
          />
        </div>
      )}

      {/* Film-grain micrograph texture */}
      <GrainTexture className="absolute inset-0" opacity={0.04} />

      {/* Animated cell blobs — only when style is particles */}
      {style === 'particles' && <HeroCellField />}

      {/* ── Hero content ─────────────────────────────────────────────────────── */}
      <Container className="relative z-10 py-14 md:py-24 lg:py-32">
        <div className="max-w-3xl">
          {/* Eyebrow — fades up instantly */}
          <p
            className="hero-eyebrow text-primary mb-3 text-xs font-semibold tracking-[0.15em] uppercase sm:mb-4 sm:text-sm"
            aria-hidden="true"
          >
            Khyber Medical University
          </p>

          {/* Heading — LCP text node.
              Words reveal with a CSS stagger driven by --word-index.
              opacity starts at 0.01 (never 0) so Lighthouse treats it as
              visible from first paint. */}
          <h1
            className={cn(
              'font-heading text-fg text-3xl leading-tight font-bold',
              'sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl',
              'mb-4 sm:mb-6',
            )}
          >
            {words.map((word, i) => (
              <span key={i}>
                <span
                  className="hero-word"
                  // CSS custom property drives animation-delay without JS
                  style={{ '--word-index': i } as React.CSSProperties}
                >
                  {word}
                </span>
                {/* Preserve inter-word spacing outside the animated spans */}
                {i < words.length - 1 && ' '}
              </span>
            ))}
          </h1>

          {/* Tagline — fades up 180 ms after eyebrow */}
          {tagline && (
            <p className="hero-tagline text-muted mb-8 max-w-xl text-base leading-relaxed sm:mb-10 sm:text-lg md:text-xl">
              {tagline}
            </p>
          )}

          {/* CTAs — staged last in the entrance sequence */}
          {(ctaPrimary?.label || ctaSecondary?.label) && (
            <div className="hero-cta-row flex flex-wrap gap-4">
              {ctaPrimary?.label && ctaPrimary.href && (
                <Link
                  href={ctaPrimary.href}
                  className={cn(
                    'inline-flex items-center justify-center gap-2 rounded-lg px-6 font-medium',
                    'min-h-[48px] min-w-[44px] text-base',
                    'bg-accent hover:bg-accent-hover text-white',
                    'transition duration-150 active:scale-[0.97]',
                    'focus-visible:ring-ring focus-visible:ring-offset-bg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                  )}
                >
                  {ctaPrimary.label}
                </Link>
              )}
              {ctaSecondary?.label && ctaSecondary.href && (
                <Link
                  href={ctaSecondary.href}
                  className={cn(
                    'inline-flex items-center justify-center gap-2 rounded-lg px-6 font-medium',
                    'min-h-[48px] min-w-[44px] text-base',
                    'border-primary text-primary hover:bg-primary/10 border bg-transparent',
                    'transition duration-150 active:scale-[0.97]',
                    'focus-visible:ring-ring focus-visible:ring-offset-bg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                  )}
                >
                  {ctaSecondary.label}
                </Link>
              )}
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}
