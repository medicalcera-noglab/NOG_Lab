import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'

export const routing = defineRouting({
  locales: ['en', 'ur'] as const,
  defaultLocale: 'en',
  // English at `/`, Urdu at `/ur/...`
  localePrefix: 'as-needed',
})

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)
