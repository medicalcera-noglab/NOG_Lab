/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Adds "Outreach" (/outreach) to the Navigation global in Payload CMS.
 *
 * Run: tsx --require ./scripts/load-env.cjs scripts/add-outreach-nav.ts
 */
import { getPayload } from 'payload'
import configPromise from '../payload.config'

async function main() {
  const payload = await getPayload({ config: configPromise })
  const nav = await payload.findGlobal({ slug: 'navigation' })

  const headerLinks: any[] = nav.headerLinks ? [...nav.headerLinks] : []

  const hasOutreachHeader = headerLinks.some((l) => l.href === '/outreach')
  if (!hasOutreachHeader) {
    const collabIdx = headerLinks.findIndex((l) => l.href === '/collaborations')
    const insertAt = collabIdx >= 0 ? collabIdx + 1 : headerLinks.length
    headerLinks.splice(insertAt, 0, {
      label: 'Outreach',
      href: '/outreach',
      isExternal: false,
      isVisible: true,
    })
    console.log('Added Outreach to headerLinks after Collaborations.')
  } else {
    console.log('Outreach already present in headerLinks.')
  }

  const footerGroups = nav.footerGroups ? [...nav.footerGroups] : []
  const targetGroup =
    footerGroups.find(
      (g: any) =>
        g.title?.toLowerCase().includes('research') || g.title?.toLowerCase().includes('explore'),
    ) || footerGroups[0]

  if (targetGroup) {
    const links = targetGroup.links ? [...targetGroup.links] : []
    if (!links.some((l: any) => l.href === '/outreach')) {
      links.push({
        label: 'Outreach',
        href: '/outreach',
        isExternal: false,
      })
      targetGroup.links = links
      console.log(`Added Outreach to footer group "${targetGroup.title}".`)
    }
  }

  await payload.updateGlobal({
    slug: 'navigation',
    data: { ...nav, headerLinks, footerGroups } as any,
  })

  console.log('Navigation global updated successfully in database!')
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
