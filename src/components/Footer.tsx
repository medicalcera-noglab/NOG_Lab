import Link from 'next/link'
import Image from 'next/image'
import { ExternalLink, BookOpen, MapPin, Download } from 'lucide-react'
import { getSiteSettings, getNavigation } from '@/lib/data'
import { getLegalPages } from '@/lib/data/legal'
import { lexicalToText } from '@/lib/richtext'
import { Container } from './ui/Container'
import { MediaImage } from './MediaImage'
import { CookiePreferencesLink } from './CookiePreferencesLink'
import { CellBlob } from './motifs/CellBlob'
import { buttonVariants } from './ui/Button'
import type { Media } from '@/../../payload-types'

const LINK_CLASS =
  'text-muted hover:text-fg focus-visible:ring-ring rounded text-sm transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none'

const SOCIAL_CLASS =
  'inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-0.5 text-xs text-muted hover:border-accent hover:text-accent transition-colors duration-150 focus-visible:outline-none focus-visible:ring-ring focus-visible:ring-2'

export async function Footer() {
  const [settings, navData, legal] = await Promise.all([
    getSiteSettings(),
    getNavigation(),
    getLegalPages(),
  ])

  const social = settings.social ?? {}
  const hasSocial = Object.values(social).some(Boolean)

  const footerBodyText = lexicalToText(
    settings.footerText as Parameters<typeof lexicalToText>[0],
    ' ',
  )

  const logo = typeof settings.logo === 'object' ? (settings.logo as Media) : null
  const logoDark = typeof settings.logoDark === 'object' ? (settings.logoDark as Media) : null
  const brochureUrl =
    settings.brochure && typeof settings.brochure === 'object'
      ? (settings.brochure as Media).url
      : null

  const footerGroups = navData?.footerGroups ?? []

  return (
    <footer className="border-border bg-surface relative mt-auto overflow-hidden border-t">
      {/* Decorative blobs — clipped by overflow-hidden */}
      <CellBlob
        className="absolute -right-32 -bottom-24 h-72 w-72 opacity-30"
        color="var(--color-teal)"
      />
      <CellBlob
        className="absolute -top-12 -left-40 h-56 w-56 opacity-15"
        color="var(--color-sand)"
      />

      <Container className="relative z-10 max-w-screen-2xl">
        {/* ── Main row: brand | nav groups ────────────────────────────────── */}
        <div className="flex flex-col gap-10 py-10 lg:flex-row lg:gap-16">
          {/* Brand block */}
          <div className="shrink-0 space-y-3 lg:w-52">
            {/* Logo + wordmark */}
            <div className="flex items-center gap-2">
              {logo ? (
                <>
                  <span className={logoDark ? 'block dark:hidden' : 'block'}>
                    <MediaImage doc={logo} sizes="28px" className="h-7 w-7 object-contain" />
                  </span>
                  {logoDark && (
                    <span className="hidden dark:block">
                      <MediaImage doc={logoDark} sizes="28px" className="h-7 w-7 object-contain" />
                    </span>
                  )}
                </>
              ) : (
                <>
                  <Image
                    src="/logo-stacked.svg"
                    alt={settings.labName}
                    width={120}
                    height={159}
                    className="dark:hidden"
                  />
                  <Image
                    src="/logo-stacked-white.svg"
                    alt={settings.labName}
                    width={120}
                    height={159}
                    className="hidden dark:block"
                  />
                </>
              )}
            </div>

            {/* Mission */}
            {footerBodyText && (
              <p className="text-muted text-xs leading-relaxed">{footerBodyText}</p>
            )}

            {/* Address */}
            {settings.contactAddress && (
              <address className="text-muted flex items-start gap-1.5 text-xs not-italic">
                <MapPin size={12} className="text-primary mt-0.5 shrink-0" aria-hidden="true" />
                <span className="whitespace-pre-line">{settings.contactAddress}</span>
              </address>
            )}

            {/* Social chips */}
            {hasSocial && (
              <div className="flex flex-wrap gap-1.5" aria-label="Social media">
                {social.twitter && (
                  <a
                    href={social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Twitter / X (opens in new tab)"
                    className={SOCIAL_CLASS}
                  >
                    <ExternalLink size={10} aria-hidden="true" />X
                  </a>
                )}
                {social.linkedin && (
                  <a
                    href={social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn (opens in new tab)"
                    className={SOCIAL_CLASS}
                  >
                    <ExternalLink size={10} aria-hidden="true" />
                    LinkedIn
                  </a>
                )}
                {social.researchgate && (
                  <a
                    href={social.researchgate}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="ResearchGate (opens in new tab)"
                    className={SOCIAL_CLASS}
                  >
                    <BookOpen size={10} aria-hidden="true" />
                    RG
                  </a>
                )}
                {social.github && (
                  <a
                    href={social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub (opens in new tab)"
                    className={SOCIAL_CLASS}
                  >
                    <ExternalLink size={10} aria-hidden="true" />
                    GitHub
                  </a>
                )}
              </div>
            )}
          </div>

          {/* CMS-driven nav groups — auto-fill remaining space */}
          {footerGroups.length > 0 && (
            <div
              className="grid flex-1 gap-x-6 gap-y-8 md:gap-x-8"
              style={{
                // auto-fit collapses empty tracks, so column count = min(groups, available space).
                // min(140px,100%) prevents overflow on narrow containers.
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(140px, 100%), 1fr))',
              }}
            >
              {footerGroups.map((group) => (
                <nav key={group.id ?? group.title} aria-label={group.title}>
                  <p className="text-muted mb-3 text-xs font-semibold tracking-wider uppercase">
                    {group.title}
                  </p>
                  <ul role="list" className="space-y-2">
                    {(group.links ?? []).map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          target={link.isExternal ? '_blank' : undefined}
                          rel={link.isExternal ? 'noopener noreferrer' : undefined}
                          className={LINK_CLASS}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
          )}
        </div>

        {/* ── Newsletter / brochure ─────────────────────────────────────────── */}
        {(settings.newsletterEmbedUrl || brochureUrl) && (
          <div className="border-border flex flex-col items-start gap-4 border-t py-6 sm:flex-row sm:items-center sm:justify-between">
            {settings.newsletterEmbedUrl && (
              <iframe
                src={settings.newsletterEmbedUrl}
                title="Newsletter subscription form"
                className="h-20 w-full max-w-md border-0 sm:flex-1"
                loading="lazy"
              />
            )}
            {brochureUrl && (
              <a
                href={brochureUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: 'secondary', size: 'sm' })}
              >
                <Download size={14} aria-hidden="true" />
                Download Brochure
              </a>
            )}
          </div>
        )}

        {/* ── Bottom bar ───────────────────────────────────────────────────── */}
        <div className="border-border flex flex-wrap items-center justify-between gap-3 border-t py-4">
          <p className="text-muted text-xs">
            {settings.copyright ?? `© ${new Date().getFullYear()} ${settings.labName}`}
          </p>
          <nav aria-label="Legal" className="flex flex-wrap items-center gap-3">
            <Link href="/privacy" className={LINK_CLASS}>
              {legal?.privacyPolicyTitle ?? 'Privacy Policy'}
            </Link>
            <Link href="/terms" className={LINK_CLASS}>
              {legal?.termsOfUseTitle ?? 'Terms of Use'}
            </Link>
            <CookiePreferencesLink />
          </nav>
        </div>
      </Container>
    </footer>
  )
}
