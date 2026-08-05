/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Updates the Navigation global in Payload CMS:
 *   Renames "Collaborations" / "International Collaborations" → "Partnerships"
 *
 * Run: tsx --require ./scripts/load-env.cjs scripts/update-partnerships-nav.ts
 */
import { getPayload } from 'payload'
import configPromise from '../payload.config'

async function main() {
  const payload = await getPayload({ config: configPromise })
  const nav = await payload.findGlobal({ slug: 'navigation' })

  const headerLinks: any[] = (nav.headerLinks ?? []).map((l: any) => {
    if (l.href === '/collaborations') {
      console.log(`  rename: "${l.label}" → "Partnerships"`)
      return { ...l, label: 'Partnerships' }
    }
    return l
  })

  // Ensure /collaborations is present in headerLinks under "Partnerships"
  if (!headerLinks.some((l) => l.href === '/collaborations')) {
    const peopleIdx = headerLinks.findIndex((l) => l.href === '/people')
    const insertAt = peopleIdx >= 0 ? peopleIdx + 1 : 3
    headerLinks.splice(insertAt, 0, {
      label: 'Partnerships',
      href: '/collaborations',
      isExternal: false,
      isVisible: true,
    })
  }

  await payload.updateGlobal({
    slug: 'navigation',
    data: { ...nav, headerLinks } as any,
  })

  console.log('Navigation global updated successfully: Header label is now "Partnerships"')
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
