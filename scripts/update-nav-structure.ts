/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Updates the Navigation global:
 *   "International Collaborations" → "Collaborations" (href /collaborations)
 *   Removes "/about" nav item (page deleted, shows on home page now)
 *   Removes "/projects" nav item (page deleted, content merged into /research)
 *
 * Run: tsx --env-file=.env.local scripts/update-nav-structure.ts
 */
import { getPayload } from 'payload'
import configPromise from '../payload.config'

async function main() {
  const payload = await getPayload({ config: configPromise })
  const nav = await payload.findGlobal({ slug: 'navigation' })

  const headerLinks: any[] = (nav.headerLinks ?? [])
    .map((l: any) => {
      // Rename "International Collaborations" → "Collaborations"
      if (l.href === '/collaborations') {
        console.log(`  rename: "${l.label}" → "Collaborations"`)
        return { ...l, label: 'Collaborations' }
      }
      return l
    })
    .filter((l: any) => {
      // Remove /about (content now on home page)
      if (l.href === '/about') {
        console.log(`  remove: "${l.label}" (/about)`)
        return false
      }
      // Remove /projects (content merged into /research)
      if (l.href === '/projects') {
        console.log(`  remove: "${l.label}" (/projects)`)
        return false
      }
      return true
    })

  // Footer uses footerGroups (grouped columns), not a flat list.
  // Filter out /about and /projects links from within each group.
  const footerGroups = (nav.footerGroups ?? []).map((group: any) => ({
    ...group,
    links: (group.links ?? []).filter((l: any) => {
      if (l.href === '/about') {
        console.log(`  remove footer: "${l.label}" (/about)`)
        return false
      }
      if (l.href === '/projects') {
        console.log(`  remove footer: "${l.label}" (/projects)`)
        return false
      }
      return true
    }),
  }))

  await payload.updateGlobal({
    slug: 'navigation',
    data: { ...nav, headerLinks, footerGroups } as any,
  })

  console.log('\nNavigation updated:')
  console.log('  Header links:', headerLinks.map((l: any) => `${l.label} (${l.href})`).join(', '))
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
