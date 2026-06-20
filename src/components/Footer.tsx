import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { ExternalLink, BookOpen, MapPin } from 'lucide-react'
import { getSiteSettings } from '@/lib/data'
import { getLegalPages } from '@/lib/data/legal'
import { lexicalToText } from '@/lib/richtext'
import { PRIMARY_NAV } from '@/lib/nav'
import { Container } from './ui/Container'
import { MediaImage } from './MediaImage'
import { CookiePreferencesLink } from './CookiePreferencesLink'
import type { Media } from '@/../../payload-types'

const SOCIAL_LINK_CLASS =
  'flex items-center gap-2 text-sm text-muted hover:text-fg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded'

export async function Footer() {
  const [settings, legal, t, tNav] = await Promise.all([
    getSiteSettings(),
    getLegalPages(),
    getTranslations('footer'),
    getTranslations('nav'),
  ])

  const social = settings.social ?? {}
  const hasSocial = Object.values(social).some(Boolean)

  const footerBodyText = lexicalToText(
    settings.footerText as Parameters<typeof lexicalToText>[0],
    ' ',
  )

  const logo = typeof settings.logo === 'object' ? (settings.logo as Media) : null
  const logoDark = typeof settings.logoDark === 'object' ? (settings.logoDark as Media) : null

  return (
    <footer className="border-border bg-surface mt-auto border-t">
      <Container>
        <div className="grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4 lg:col-span-2">
            {/* Logo mark */}
            {logo && (
              <div className="flex items-center gap-3">
                <span className={logoDark ? 'block dark:hidden' : 'block'}>
                  <MediaImage doc={logo} sizes="40px" className="h-10 w-10 object-contain" />
                </span>
                {logoDark && (
                  <span className="hidden dark:block">
                    <MediaImage doc={logoDark} sizes="40px" className="h-10 w-10 object-contain" />
                  </span>
                )}
                <p className="font-heading text-primary text-lg font-bold">{settings.labName}</p>
              </div>
            )}
            {!logo && (
              <p className="font-heading text-primary text-lg font-bold">{settings.labName}</p>
            )}
            {footerBodyText && (
              <p className="text-muted max-w-sm text-sm leading-relaxed">{footerBodyText}</p>
            )}
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
          </div>

          {/* Navigation */}
          <nav aria-label={t('footerNav')}>
            <p className="text-muted mb-4 text-xs font-semibold tracking-wider uppercase">
              {t('siteSection')}
            </p>
            <ul role="list" className="space-y-2">
              {PRIMARY_NAV.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted hover:text-fg focus-visible:ring-ring rounded text-sm transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none"
                  >
                    {tNav(link.msgKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal */}
          <div>
            <p className="text-muted mb-4 text-xs font-semibold tracking-wider uppercase">
              {t('legalSection')}
            </p>
            <ul role="list" className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-muted hover:text-fg focus-visible:ring-ring rounded text-sm transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none"
                >
                  {legal?.privacyPolicyTitle ?? t('privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted hover:text-fg focus-visible:ring-ring rounded text-sm transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none"
                >
                  {legal?.termsOfUseTitle ?? t('termsOfUse')}
                </Link>
              </li>
              <li>
                <CookiePreferencesLink />
              </li>
            </ul>
          </div>

          {/* Social */}
          {hasSocial && (
            <div>
              <p className="text-muted mb-4 text-xs font-semibold tracking-wider uppercase">
                {t('connectSection')}
              </p>
              <ul role="list" className="space-y-3">
                {social.twitter && (
                  <li>
                    <a
                      href={social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t('twitter')}
                      className={SOCIAL_LINK_CLASS}
                    >
                      <ExternalLink size={13} aria-hidden="true" />
                      Twitter / X
                    </a>
                  </li>
                )}
                {social.linkedin && (
                  <li>
                    <a
                      href={social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t('linkedin')}
                      className={SOCIAL_LINK_CLASS}
                    >
                      <ExternalLink size={13} aria-hidden="true" />
                      LinkedIn
                    </a>
                  </li>
                )}
                {social.researchgate && (
                  <li>
                    <a
                      href={social.researchgate}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t('researchgate')}
                      className={SOCIAL_LINK_CLASS}
                    >
                      <BookOpen size={13} aria-hidden="true" />
                      ResearchGate
                    </a>
                  </li>
                )}
                {social.github && (
                  <li>
                    <a
                      href={social.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t('github')}
                      className={SOCIAL_LINK_CLASS}
                    >
                      <ExternalLink size={13} aria-hidden="true" />
                      GitHub
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Newsletter embed */}
        {settings.newsletterEmbedUrl && (
          <div className="border-border border-t py-6">
            <iframe
              src={settings.newsletterEmbedUrl}
              title={t('newsletter')}
              className="h-24 w-full max-w-lg border-0"
              loading="lazy"
            />
          </div>
        )}

        {/* Copyright */}
        {settings.copyright && (
          <div className="border-border border-t py-6">
            <p className="text-muted text-center text-xs">{settings.copyright}</p>
          </div>
        )}
      </Container>
    </footer>
  )
}
