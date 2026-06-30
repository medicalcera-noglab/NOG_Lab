'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'

interface ThemeProviderProps {
  children: React.ReactNode
  nonce?: string
}

export function ThemeProvider({ children, nonce }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="light"
      disableTransitionOnChange
      nonce={nonce}
    >
      {children}
    </NextThemesProvider>
  )
}
