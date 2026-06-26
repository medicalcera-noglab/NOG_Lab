import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Inter } from 'next/font/google'
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
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()

  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-[var(--bg)] font-[family-name:var(--font-body)] text-[var(--fg)] antialiased">
        {/* Runs before any JS or hydration — sets data-theme from localStorage so the
            page paints in the correct theme on first load, preventing the light→dark flash. */}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
        >{`(function(){try{var t=localStorage.getItem('theme')||'light';document.documentElement.setAttribute('data-theme',t)}catch(e){}})();`}</Script>
        <ThemeProvider>
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

            <CookieBanner />

            <Analytics analyticsId={settings.analyticsId} />
            <WebVitals />
          </ConsentProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
