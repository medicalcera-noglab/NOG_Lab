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
  'inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted hover:border-accent hover:text-accent transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

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
    <footer className="border-border relative mt-auto overflow-hidden border-t">
      {/* Decorative microbiome cell motif — bottom-right corner */}
      <CellBlob
        className="absolute -right-40 -bottom-32 h-[28rem] w-[28rem] opacity-40"
        color="var(--color-teal)"
      />
      <CellBlob
        className="absolute top-0 -left-48 h-80 w-80 opacity-20"
        color="var(--color-sand)"
      />

      <Container className="relative z-10">
        {/* ── Main grid ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 py-14 md:grid-cols-3 lg:grid-cols-5">
          {/* Brand block — 2 cols on lg */}
          <div className="col-span-2 space-y-5 lg:col-span-2">
            {/* Logo + wordmark */}
            <div className="flex items-center gap-2.5">
              {logo ? (
                <>
                  <span className={logo && logoDark ? 'block dark:hidden' : 'block'}>
                    <MediaImage doc={logo} sizes="36px" className="h-9 w-9 object-contain" />
                  </span>
                  {logoDark && (
                    <span className="hidden dark:block">
                      <MediaImage doc={logoDark} sizes="36px" className="h-9 w-9 object-contain" />
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="relative block h-9 w-9 dark:hidden" aria-hidden="true">
                    <Image src="/logo.svg" alt="" fill sizes="36px" className="object-contain" />
                  </span>
                  <span className="relative hidden h-9 w-9 dark:block" aria-hidden="true">
                    <Image
                      src="/logo-white.svg"
                      alt=""
                      fill
                      sizes="36px"
                      className="object-contain"
                    />
                  </span>
                </>
              )}
              <span className="font-heading text-primary text-lg font-bold">
                {settings.labName}
              </span>
            </div>

            {/* Mission tagline */}
            {footerBodyText && (
              <p className="text-muted max-w-xs text-sm leading-relaxed">{footerBodyText}</p>
            )}

            {/* Address */}
            {settings.contactAddress && (
              <address className="text-muted flex items-start gap-2 text-sm not-italic">
                <MapPin
                  size={14}
                  className="text-primary mt-0.5 flex-shrink-0"
                  aria-hidden="true"
                />
                <span className="whitespace-pre-line">{settings.contactAddress}</span>
              </address>
            )}

            {/* Socials — compact chips inside brand block */}
            {hasSocial && (
              <div className="flex flex-wrap gap-2" aria-label="Social media">
                {social.twitter && (
                  <a
                    href={social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Twitter / X (opens in new tab)"
                    className={SOCIAL_CLASS}
                  >
                    <ExternalLink size={11} aria-hidden="true" />X / Twitter
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
                    <ExternalLink size={11} aria-hidden="true" />
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
                    <BookOpen size={11} aria-hidden="true" />
                    ResearchGate
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
                    <ExternalLink size={11} aria-hidden="true" />
                    GitHub
                  </a>
                )}
              </div>
            )}
          </div>

          {/* CMS-driven footer nav groups */}
          {footerGroups.map((group) => (
            <nav key={group.id ?? group.title} aria-label={group.title}>
              <p className="text-muted mb-4 text-xs font-semibold tracking-wider uppercase">
                {group.title}
              </p>
              <ul role="list" className="space-y-2.5">
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

        {/* ── Newsletter / brochure row ─────────────────────────────────────── */}
        {(settings.newsletterEmbedUrl || brochureUrl) && (
          <div className="border-border flex flex-col items-start gap-6 border-t py-8 sm:flex-row sm:items-center sm:justify-between">
            {settings.newsletterEmbedUrl && (
              <iframe
                src={settings.newsletterEmbedUrl}
                title="Newsletter subscription form"
                className="h-24 w-full max-w-lg border-0 sm:flex-1"
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
                <Download size={15} aria-hidden="true" />
                Download Brochure
              </a>
            )}
          </div>
        )}

        {/* ── Bottom bar ───────────────────────────────────────────────────── */}
        <div className="border-border flex flex-wrap items-center justify-between gap-4 border-t py-5">
          <p className="text-muted text-xs">
            {settings.copyright ?? `© ${new Date().getFullYear()} ${settings.labName}`}
          </p>
          <nav aria-label="Legal" className="flex flex-wrap items-center gap-4">
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
