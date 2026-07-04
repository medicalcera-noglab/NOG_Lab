import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Inter } from 'next/font/google'
import { headers } from 'next/headers'
import Script from 'next/script'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { ConsentProvider } from '@/providers/ConsentProvider'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { CookieBanner } from '@/components/CookieBanner'
import { Analytics } from '@/components/Analytics'
import { WebVitals } from '@/components/WebVitals'
import { ScrollToTop } from '@/components/ScrollToTop'
import { getSiteSettings } from '@/lib/data'
import { cn } from '@/lib/utils'
import '../globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-heading',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'NOG Lab — Nutrition, Oral & Gut Microbiome Lab',
    template: '%s | NOG Lab',
  },
  description:
    'The NOG Lab at Khyber Medical University investigates how nutrition and microbial communities influence human health, with emphasis on the oral and gut microbiomes and malnutrition.',
  icons: {
    icon: [
      { url: '/logo-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/logo-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/logo-192.png', sizes: '192x192', type: 'image/png' }],
    shortcut: '/logo-192.png',
  },
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const [settings, requestHeaders] = await Promise.all([getSiteSettings(), headers()])
  // cookieConsent is a new field not yet in generated types — access via unknown
  type CookieConsentGroup = {
    enabled?: boolean
    description?: string | null
    acceptLabel?: string | null
    declineLabel?: string | null
  }
  const cc = (settings as unknown as { cookieConsent?: CookieConsentGroup }).cookieConsent ?? {}
  const nonce = requestHeaders.get('x-nonce') ?? undefined

  return (
    <html
      lang="en"
      className={`site-root ${plusJakartaSans.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-[var(--bg)] font-[family-name:var(--font-body)] text-[var(--fg)] antialiased">
        {/* Runs before any JS or hydration — sets data-theme from localStorage so the
            page paints in the correct theme on first load, preventing the light→dark flash. */}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
        >{`(function(){try{var h=document.documentElement;if(!h.classList.contains('site-root'))return;var t=localStorage.getItem('theme')||'light';h.setAttribute('data-theme',t)}catch(e){}})();`}</Script>
        <ThemeProvider nonce={nonce}>
          <ConsentProvider>
            <a
              href="#main-content"
              className={cn(
                'sr-only focus:not-sr-only',
                'fixed start-2 top-2 z-50 rounded-lg px-4 py-2 text-sm font-medium',
                'bg-primary text-primary-fg',
                'focus:ring-ring focus:ring-offset-bg focus:ring-2 focus:ring-offset-2 focus:outline-none',
              )}
            >
              Skip to content
            </a>

            <ScrollToTop />
            <Navbar />

            <main id="main-content" tabIndex={-1} className="outline-none">
              {children}
            </main>

            <Footer />

            <CookieBanner
              enabled={cc.enabled !== false}
              description={cc.description}
              acceptLabel={cc.acceptLabel}
              declineLabel={cc.declineLabel}
            />

            <Analytics analyticsId={settings.analyticsId} />
            <WebVitals />
          </ConsentProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
