import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Inter } from 'next/font/google'
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
      'x-default': process.env.NEXT_PUBLIC_SITE_URL ?? 'https://noglab.kmu.edu.pk',
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${plusJakartaSans.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-[var(--bg)] font-[family-name:var(--font-body)] text-[var(--fg)] antialiased">
        {children}
      </body>
    </html>
  )
}
