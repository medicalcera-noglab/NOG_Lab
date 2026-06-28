import Link from 'next/link'
import Image from 'next/image'
import { ChevronDown } from 'lucide-react'
import { GrainTexture } from '@/components/motifs/GrainTexture'
import { HeroParticleCanvas } from './HeroParticleCanvas'
import { HeroMicrobiomeVisual } from './HeroMicrobiomeVisual'
import { HeroTypewriter } from './HeroTypewriter'
import { HeroStatCounters } from './HeroStatCounters'
import { cn } from '@/lib/utils'
import type { SiteSetting, Media } from '../../../payload-types'

interface HeroSectionProps {
  labName: string
  tagline: SiteSetting['tagline']
  heroSubline: SiteSetting['heroSubline']
  ctaPrimary: SiteSetting['heroCtaPrimary']
  ctaSecondary: SiteSetting['heroCtaSecondary']
  heroMedia?: SiteSetting['heroMedia']
  counts?: {
    publications: number
    teamMembers: number
  }
  foundingYear?: number | null
}

export function HeroSection({
  labName,
  tagline,
  heroSubline,
  ctaPrimary,
  ctaSecondary,
  heroMedia,
  counts,
  foundingYear,
}: HeroSectionProps) {
  const style = heroMedia?.style ?? 'particles'
  const imageDoc =
    heroMedia?.image && typeof heroMedia.image === 'object' ? (heroMedia.image as Media) : null

  const headlineText = tagline?.trim() || labName
  const words = headlineText.split(/\s+/)

  return (
    <section
      aria-label="Lab introduction"
      className="relative flex flex-col overflow-hidden"
      style={{ minHeight: 'calc(100svh - 4rem)' }}
    >
      {/* ── Layer 1: Static dark base (LCP — first paint) ─────────────────────── */}
      <div aria-hidden="true" className="absolute inset-0 bg-[#071918]" />

      {/* ── Layer 2: Brand gradient mesh ──────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: [
            'radial-gradient(ellipse 80% 55% at 72% 18%, color-mix(in oklch, #0E6E6E 22%, transparent), transparent 65%)',
            'radial-gradient(ellipse 55% 65% at 8% 78%, color-mix(in oklch, #E2725B 12%, transparent), transparent 60%)',
            'radial-gradient(ellipse 45% 45% at 88% 85%, color-mix(in oklch, #E8C9A0 8%, transparent), transparent 55%)',
          ].join(', '),
        }}
      />

      {/* ── Layer 3: Microscopy texture ────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/hero-micro.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.18,
          filter: 'brightness(0.6)',
        }}
      />

      {/* ── Layer 4: Hero image (when style === image) ─────────────────────────── */}
      {style === 'image' && imageDoc?.url && (
        <div aria-hidden="true" className="absolute inset-0">
          <Image
            src={imageDoc.url}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority
            style={{ filter: 'grayscale(1) brightness(0.32) contrast(1.15)' }}
          />
          <div className="absolute inset-0" style={{ background: 'rgba(7,25,24,0.55)' }} />
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 55% 65% at 85% 20%, rgba(226,114,91,0.28), transparent 60%)',
            }}
          />
        </div>
      )}

      {/* ── Layer 5: Canvas particle network ──────────────────────────────────── */}
      <HeroParticleCanvas />

      {/* ── Layer 6: Film grain texture ────────────────────────────────────────── */}
      <GrainTexture className="absolute inset-0" opacity={0.04} />

      {/* ── Layer 7: Bottom vignette ───────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#071918]/90 to-transparent"
      />

      {/* ── Hero content ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-1 flex-col items-start justify-center px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto w-full max-w-screen-xl">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_420px] lg:gap-8 xl:grid-cols-[1fr_480px]">
            {/* ── Left column: content ──────────────────────────────────────── */}
            <div className="flex flex-col">
              {/* Eyebrow */}
              <p
                className="mb-4 text-[10px] font-semibold tracking-[0.22em] uppercase"
                style={{ color: '#1A9090', opacity: 0.9 }}
              >
                {labName}
              </p>

              {/* H1 — CSS stagger animation (LCP safe: never opacity 0) */}
              <h1
                className={cn(
                  'font-heading leading-[1.06] font-bold tracking-tight text-white',
                  'text-[clamp(2.4rem,7.5vw,5rem)]',
                  'mb-5 sm:mb-6',
                )}
              >
                {words.map((word, i) => (
                  <span key={i}>
                    <span
                      className="hero-word"
                      style={{ '--word-index': i } as React.CSSProperties}
                    >
                      {word}
                    </span>
                    {i < words.length - 1 && ' '}
                  </span>
                ))}
              </h1>

              {/* Typewriter subtitle */}
              {heroSubline && <HeroTypewriter text={heroSubline} startDelay={900} speed={30} />}

              {/* Stat counters */}
              {counts && (
                <HeroStatCounters
                  publications={counts.publications}
                  teamMembers={counts.teamMembers}
                  foundingYear={foundingYear}
                />
              )}

              {/* CTAs */}
              {(ctaPrimary?.label || ctaSecondary?.label) && (
                <div className="hero-cta-row flex flex-wrap gap-3 sm:gap-4">
                  {ctaPrimary?.label && ctaPrimary.href && (
                    <Link
                      href={ctaPrimary.href}
                      className={cn(
                        'inline-flex items-center justify-center gap-2 rounded-xl px-7 font-semibold',
                        'min-h-[48px] min-w-[44px] text-sm sm:text-base',
                        'bg-[#E2725B] text-white',
                        'shadow-[0_4px_24px_rgba(226,114,91,0.35)]',
                        'hover:scale-[1.03] hover:bg-[#cc5744] hover:shadow-[0_4px_28px_rgba(226,114,91,0.5)]',
                        'transition-all duration-200 active:scale-[0.97]',
                        'focus-visible:ring-2 focus-visible:ring-[#E2725B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#071918] focus-visible:outline-none',
                      )}
                    >
                      {ctaPrimary.label}
                    </Link>
                  )}
                  {ctaSecondary?.label && ctaSecondary.href && (
                    <Link
                      href={ctaSecondary.href}
                      className={cn(
                        'inline-flex items-center justify-center gap-2 rounded-xl px-7 font-medium',
                        'min-h-[48px] min-w-[44px] text-sm sm:text-base',
                        'border border-white/20 text-white/70',
                        'hover:scale-[1.03] hover:border-white/35 hover:bg-white/10 hover:text-white',
                        'transition-all duration-200 active:scale-[0.97]',
                        'focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#071918] focus-visible:outline-none',
                      )}
                    >
                      {ctaSecondary.label}
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* ── Right column: microbiome visual (hidden on mobile) ─────────── */}
            <div className="relative hidden lg:flex lg:h-[440px] lg:items-center lg:justify-center xl:h-[500px]">
              <HeroMicrobiomeVisual />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div aria-hidden="true" className="relative z-10 flex justify-center pb-7">
        <ChevronDown size={22} className="hero-scroll-cue text-white/25" strokeWidth={1.5} />
      </div>
    </section>
  )
}
