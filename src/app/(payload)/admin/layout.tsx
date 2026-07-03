import type { ReactNode } from 'react'
import { Plus_Jakarta_Sans, Inter } from 'next/font/google'

const heading = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--admin-font-heading',
  display: 'swap',
})

const body = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--admin-font-body',
  display: 'swap',
})

export const metadata = {
  title: 'Admin · NOG Lab',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <head />
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily: "var(--admin-font-body, 'Inter', system-ui, sans-serif)",
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        }}
      >
        {children}
      </body>
    </html>
  )
}
