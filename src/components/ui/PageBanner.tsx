import Image from 'next/image'
import { Container } from '@/components/ui/Container'
import { GrainTexture } from '@/components/motifs/GrainTexture'

interface PageBannerProps {
  /** Small uppercase label shown above the title */
  eyebrow: string
  title: string
  description?: React.ReactNode
  /** Tailwind-compatible hex/variable for the tint overlay. Defaults to teal. */
  tint?: string
  children?: React.ReactNode
}

/**
 * Full-width page header banner with the site's scientific SEM background image.
 * Used on Research, People, Projects, Publications, Collaborations, etc.
 */
export function PageBanner({
  eyebrow,
  title,
  description,
  tint = '#0E6E6E',
  children,
}: PageBannerProps) {
  return (
    <div className="relative overflow-hidden py-14 md:py-20">
      {/* ── Background: dark base ─────────────────────────────────────── */}
      <div aria-hidden="true" className="absolute inset-0 bg-[#071918]" />

      {/* ── Background: scientific SEM photo ─────────────────────────── */}
      <div aria-hidden="true" className="absolute inset-0">
        <Image
          src="/media/site-hero-bg.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority={false}
          style={{ filter: 'grayscale(1) brightness(0.22) contrast(1.15)' }}
        />
      </div>

      {/* ── Tint overlay per section ──────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, color-mix(in oklch, ${tint} 35%, transparent) 0%, color-mix(in oklch, ${tint} 12%, transparent) 60%, transparent 100%)`,
        }}
      />

      {/* ── Grain texture ─────────────────────────────────────────────── */}
      <GrainTexture className="absolute inset-0" opacity={0.04} />

      {/* ── Bottom fade ───────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#071918]/60 to-transparent"
      />

      {/* ── Content ───────────────────────────────────────────────────── */}
      <Container className="relative z-10">
        <p
          className="mb-2 text-xs font-semibold tracking-[0.2em] uppercase"
          style={{ color: tint === '#0E6E6E' ? '#1A9090' : tint }}
        >
          {eyebrow}
        </p>
        <h1 className="font-heading mb-4 text-2xl font-bold text-white sm:text-4xl">{title}</h1>
        {description && (
          <div className="max-w-2xl text-base text-white/70 sm:text-lg">{description}</div>
        )}
        {children}
      </Container>
    </div>
  )
}
