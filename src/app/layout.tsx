import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Inter, Noto_Nastaliq_Urdu } from 'next/font/google'
import { getLocale } from 'next-intl/server'
import './globals.css'

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

const notoNastaliqUrdu = Noto_Nastaliq_Urdu({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-urdu',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'NOG Lab — Nutrition, Oral & Gut Microbiome Lab',
    template: '%s | NOG Lab',
  },
  description:
    'Nutrition, Oral and Gut Microbiome Lab at Khyber Medical University — clinical precision meets living systems.',
  alternates: {
    languages: {
      en: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://noglab.kmu.edu.pk',
      ur: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://noglab.kmu.edu.pk'}/ur`,
      'x-default': process.env.NEXT_PUBLIC_SITE_URL ?? 'https://noglab.kmu.edu.pk',
    },
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // getLocale() reads the locale set by the next-intl middleware.
  // Falls back to 'en' if called outside an intl context (e.g. Payload admin).
  const locale = await getLocale().catch(() => 'en')
  const dir = locale === 'ur' ? 'rtl' : 'ltr'

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${plusJakartaSans.variable} ${inter.variable} ${notoNastaliqUrdu.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-[var(--bg)] font-[family-name:var(--font-body)] text-[var(--fg)] antialiased">
        {children}
      </body>
    </html>
  )
}
