import Link from 'next/link'
import { HeroCellField } from './HeroCellField'
import { Container } from '@/components/ui/Container'
import { GrainTexture } from '@/components/motifs/GrainTexture'
import { cn } from '@/lib/utils'
import type { SiteSetting } from '../../../payload-types'

interface HeroSectionProps {
  labName: string
  tagline: SiteSetting['tagline']
  ctaPrimary: SiteSetting['heroCtaPrimary']
  ctaSecondary: SiteSetting['heroCtaSecondary']
}

export function HeroSection({ labName, tagline, ctaPrimary, ctaSecondary }: HeroSectionProps) {
  return (
    <section
      aria-label="Lab introduction"
      className="relative flex min-h-[calc(100vh-64px)] items-center overflow-hidden"
    >
      {/* ── Static gradient background — paints immediately (LCP) ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 60% 40%, color-mix(in oklch, var(--color-teal) 12%, transparent), transparent 70%), radial-gradient(ellipse 60% 80% at 20% 80%, color-mix(in oklch, var(--color-coral) 8%, transparent), transparent 70%)',
          backgroundColor: 'var(--bg)',
        }}
      />

      {/* Film-grain micrograph texture */}
      <GrainTexture className="absolute inset-0" opacity={0.04} />

      {/* Animated cell blobs (client, hydrated after first paint) */}
      <HeroCellField />

      {/* ── Hero content ────────────────────────────────────────── */}
      <Container className="relative z-10 py-24 md:py-32">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <p
            className="text-primary mb-4 text-sm font-semibold tracking-[0.15em] uppercase"
            aria-hidden="true"
          >
            Khyber Medical University
          </p>

          {/* Heading — this is the LCP text node in the HTML */}
          <h1
            className={cn(
              'font-heading text-fg text-4xl leading-tight font-bold',
              'sm:text-5xl lg:text-6xl xl:text-7xl',
              'mb-6',
            )}
          >
            {labName}
          </h1>

          {tagline && (
            <p className="text-muted mb-10 max-w-xl text-lg leading-relaxed sm:text-xl">
              {tagline}
            </p>
          )}

          {/* CTAs */}
          {(ctaPrimary?.label || ctaSecondary?.label) && (
            <div className="flex flex-wrap gap-4">
              {ctaPrimary?.label && ctaPrimary.href && (
                <Link
                  href={ctaPrimary.href}
                  className={cn(
                    'inline-flex items-center justify-center gap-2 rounded-lg px-6 font-medium',
                    'min-h-[48px] min-w-[44px] text-base',
                    'bg-accent hover:bg-accent-hover text-white',
                    'transition-colors duration-150',
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
                    'transition-colors duration-150',
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
