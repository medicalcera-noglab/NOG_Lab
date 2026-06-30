import Link from 'next/link'
import { ExternalLink, BookOpen, MapPin, Download } from 'lucide-react'
import { getSiteSettings, getNavigation } from '@/lib/data'
import { getLegalPages } from '@/lib/data/legal'
import { Container } from './ui/Container'
import { CookiePreferencesLink } from './CookiePreferencesLink'
import { CellBlob } from './motifs/CellBlob'
import { buttonVariants } from './ui/Button'
import type { Media } from '@/../../payload-types'

const LINK_CLASS =
  'text-white hover:text-[#1A9090] rounded text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50'

const SOCIAL_CLASS =
  'inline-flex items-center gap-1.5 rounded-md border border-white/40 px-2 py-0.5 text-xs text-white hover:border-[#1A9090] hover:text-[#1A9090] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50'

export async function Footer() {
  const [settings, navData, legal] = await Promise.all([
    getSiteSettings(),
    getNavigation(),
    getLegalPages(),
  ])

  const social = settings.social ?? {}
  const hasSocial = Object.values(social).some(Boolean)

  const brochureUrl =
    settings.brochure && typeof settings.brochure === 'object'
      ? (settings.brochure as Media).url
      : null

  const footerGroups = navData?.footerGroups ?? []

  return (
    <footer className="relative mt-auto overflow-hidden border-t border-white/10 bg-[#071918]">
      {/* Decorative blobs */}
      <CellBlob className="absolute -right-32 -bottom-24 h-72 w-72 opacity-10" color="#1A9090" />
      <CellBlob className="absolute -top-12 -left-40 h-56 w-56 opacity-8" color="#E8C9A0" />

      <Container className="relative z-10 max-w-screen-2xl">
        {/* Main row: brand | nav groups */}
        <div className="flex flex-col gap-10 py-10 lg:flex-row lg:gap-16">
          {/* Brand block */}
          <div className="shrink-0 space-y-3 lg:w-52">
            {/* Logo */}
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/NOG_LAB.png"
                alt={settings.labName}
                style={{
                  height: '52px',
                  width: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                  borderRadius: '8px',
                }}
              />
            </div>

            {/* Address */}
            {settings.contactAddress && (
              <address className="flex items-start gap-1.5 text-xs text-white/80 not-italic">
                <MapPin size={12} className="mt-0.5 shrink-0 text-[#1A9090]" aria-hidden="true" />
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

          {/* CMS-driven nav groups */}
          {footerGroups.length > 0 && (
            <div
              className="grid flex-1 gap-x-6 gap-y-8 md:gap-x-8"
              style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(140px, 100%), 1fr))',
              }}
            >
              {footerGroups.map((group) => (
                <nav key={group.id ?? group.title} aria-label={group.title}>
                  <p className="mb-3 text-xs font-semibold tracking-wider text-white/40 uppercase">
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

        {/* Newsletter / brochure */}
        {(settings.newsletterEmbedUrl || brochureUrl) && (
          <div className="flex flex-col items-start gap-4 border-t border-white/10 py-6 sm:flex-row sm:items-center sm:justify-between">
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

        {/* Bottom bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 py-4">
          <p className="text-xs text-white/40">
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
