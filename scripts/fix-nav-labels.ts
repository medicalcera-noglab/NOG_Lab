/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Fixes navigation labels and adds missing pages:
 *   "Publication"  → "Publications"
 *   "Blogs"        → "Blog"
 *   Adds "About"   after "Home" if not present
 *   Adds "Impact"  to footer if not present
 *
 * Run: tsx --env-file=.env.local scripts/fix-nav-labels.ts
 */
import { getPayload } from 'payload'
import configPromise from '../payload.config'

async function main() {
  const payload = await getPayload({ config: configPromise })
  const nav = await payload.findGlobal({ slug: 'navigation' })

  const headerLinks: any[] = (nav.headerLinks ?? []).map((l: any) => {
    if (l.href === '/publications' && l.label === 'Publication') {
      console.log('  fix: Publication → Publications')
      return { ...l, label: 'Publications' }
    }
    if (l.href === '/blog' && l.label === 'Blogs') {
      console.log('  fix: Blogs → Blog')
      return { ...l, label: 'Blog' }
    }
    return l
  })

  // Add "About" after "Home" if not already present
  const hasAbout = headerLinks.some((l) => l.href === '/about')
  if (!hasAbout) {
    const homeIdx = headerLinks.findIndex((l) => l.href === '/')
    const insertAt = homeIdx >= 0 ? homeIdx + 1 : 1
    headerLinks.splice(insertAt, 0, {
      label: 'About',
      href: '/about',
      isExternal: false,
      isVisible: true,
    })
    console.log('  added: About → /about')
  }

  // Add "Impact" after "Publications" if not present in header
  const hasImpact = headerLinks.some((l) => l.href === '/impact')
  if (!hasImpact) {
    const pubIdx = headerLinks.findIndex((l) => l.href === '/publications')
    const insertAt = pubIdx >= 0 ? pubIdx + 1 : headerLinks.length
    headerLinks.splice(insertAt, 0, {
      label: 'Impact',
      href: '/impact',
      isExternal: false,
      isVisible: true,
    })
    console.log('  added: Impact → /impact')
  }

  await payload.updateGlobal({ slug: 'navigation', data: { ...nav, headerLinks } as any })
  console.log('Navigation updated.')
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
