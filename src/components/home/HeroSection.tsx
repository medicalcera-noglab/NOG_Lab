import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { GrainTexture } from '@/components/motifs/GrainTexture'
import { HeroParticleCanvas } from './HeroParticleCanvas'
import { HeroLogoVisual } from './HeroLogoVisual'
import { cn } from '@/lib/utils'
import type { SiteSetting } from '../../../payload-types'

interface HeroSectionProps {
  labName: string
  tagline: SiteSetting['tagline']
  heroSubline: SiteSetting['heroSubline']
  heroMotto?: SiteSetting['heroMotto']
  ctaPrimary: SiteSetting['heroCtaPrimary']
  ctaSecondary: SiteSetting['heroCtaSecondary']
  heroMedia?: SiteSetting['heroMedia']
  counts?: { publications: number; teamMembers: number }
  foundingYear?: number | null
}

export function HeroSection({
  labName,
  tagline,
  heroSubline,
  heroMotto,
  ctaPrimary,
  ctaSecondary,
}: HeroSectionProps) {
  const headlineText = tagline?.trim() || labName
  const words = headlineText.split(/\s+/)

  return (
    <section
      aria-label="Lab introduction"
      className="relative flex flex-col overflow-hidden bg-white"
      style={{ minHeight: 'calc(100svh - 4rem)' }}
    >
      {/* Subtle brand gradient — very light */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: [
            'radial-gradient(ellipse 80% 60% at 75% 15%, rgba(14,110,110,0.13), transparent 60%)',
            'radial-gradient(ellipse 55% 50% at 5% 90%, rgba(226,114,91,0.09), transparent 55%)',
            'radial-gradient(ellipse 40% 40% at 50% 50%, rgba(14,110,110,0.04), transparent 70%)',
          ].join(', '),
        }}
      />

      {/* Particle network — teal/coral/sand at low opacity, looks great on white */}
      <HeroParticleCanvas />

      {/* Subtle grain */}
      <GrainTexture className="absolute inset-0" opacity={0.025} />

      {/* Bottom fade to white */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent"
      />

      {/* Hero content */}
      <div className="relative z-10 flex flex-1 flex-col items-start justify-center px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto w-full max-w-screen-xl">
          <div className="grid grid-cols-1 items-center gap-6 sm:gap-8 lg:grid-cols-[1fr_420px] lg:gap-12 xl:grid-cols-[1fr_460px]">
            {/* Left column: content */}
            <div className="flex flex-col">
              {/* Eyebrow */}
              <p
                className="mb-5 text-xs font-bold tracking-[0.28em] uppercase"
                style={{ color: '#0E6E6E' }}
              >
                {labName}
              </p>

              {/* H1 */}
              <h1
                className={cn(
                  'font-heading leading-[1.1] font-bold tracking-tight',
                  'text-[#1A1A1A]',
                  'text-[clamp(2.2rem,5vw,4rem)]',
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

              {/* Subtitle + motto */}
              {(heroSubline || heroMotto) && (
                <div className="mb-1 flex flex-col gap-1">
                  {heroSubline && (
                    <p className="text-base text-[#1A1A1A]/55 sm:text-lg">{heroSubline}</p>
                  )}
                  {heroMotto && (
                    <p className="text-sm font-semibold text-[#0E6E6E] italic sm:text-base">
                      {heroMotto}
                    </p>
                  )}
                </div>
              )}

              {/* CTAs */}
              {(ctaPrimary?.label || ctaSecondary?.label) && (
                <div className="hero-cta-row mt-8 flex flex-wrap gap-3 sm:gap-4">
                  {ctaPrimary?.label && ctaPrimary.href && (
                    <Link
                      href={ctaPrimary.href}
                      className={cn(
                        'inline-flex items-center justify-center gap-2 rounded-xl px-7 font-semibold',
                        'min-h-[48px] min-w-[44px] text-sm sm:text-base',
                        'bg-[#0E6E6E] text-white',
                        'shadow-[0_4px_24px_rgba(14,110,110,0.28)]',
                        'hover:scale-[1.03] hover:bg-[#0a5858] hover:shadow-[0_4px_28px_rgba(14,110,110,0.42)]',
                        'transition-all duration-200 active:scale-[0.97]',
                        'focus-visible:ring-2 focus-visible:ring-[#0E6E6E] focus-visible:ring-offset-2 focus-visible:outline-none',
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
                        'border border-[#1A1A1A]/20 text-[#1A1A1A]/70',
                        'hover:scale-[1.03] hover:border-[#1A1A1A]/35 hover:bg-[#1A1A1A]/5 hover:text-[#1A1A1A]',
                        'transition-all duration-200 active:scale-[0.97]',
                        'focus-visible:ring-2 focus-visible:ring-[#1A1A1A]/30 focus-visible:ring-offset-2 focus-visible:outline-none',
                      )}
                    >
                      {ctaSecondary.label}
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Right column: logo with orbital animation */}
            <div className="relative flex h-[280px] items-center justify-center sm:h-[340px] lg:h-[440px] xl:h-[480px]">
              <HeroLogoVisual />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div aria-hidden="true" className="relative z-10 flex justify-center pb-7">
        <ChevronDown size={22} className="hero-scroll-cue text-[#1A1A1A]/25" strokeWidth={1.5} />
      </div>
    </section>
  )
}
