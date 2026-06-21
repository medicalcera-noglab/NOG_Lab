import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Inter } from 'next/font/google'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { ConsentProvider } from '@/providers/ConsentProvider'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { CookieBanner } from '@/components/CookieBanner'
import { Analytics } from '@/components/Analytics'
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
    'Nutrition, Oral and Gut Microbiome Lab at Khyber Medical University — clinical precision meets living systems.',
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

            <Navbar />

            <main id="main-content" tabIndex={-1} className="outline-none">
              {children}
            </main>

            <Footer />

            <CookieBanner />

            <Analytics analyticsId={settings.analyticsId} />
          </ConsentProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
