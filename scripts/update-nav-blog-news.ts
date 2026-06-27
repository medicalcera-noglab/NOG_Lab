/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Updates Navigation global:
 *   Removes "Impact" (/impact) — page deleted
 *   Removes "News and Events" (/news) — merged into /blog
 *   Renames "Blog" → "Blog & News" at /blog
 *
 * Run: tsx --env-file=.env.local scripts/update-nav-blog-news.ts
 */
import { getPayload } from 'payload'
import configPromise from '../payload.config'

async function main() {
  const payload = await getPayload({ config: configPromise })
  const nav = await payload.findGlobal({ slug: 'navigation' })

  const headerLinks: any[] = (nav.headerLinks ?? [])
    .filter((l: any) => {
      if (l.href === '/impact') {
        console.log(`  remove: "${l.label}" (/impact)`)
        return false
      }
      if (l.href === '/news') {
        console.log(`  remove: "${l.label}" (/news)`)
        return false
      }
      return true
    })
    .map((l: any) => {
      if (l.href === '/blog') {
        console.log(`  rename: "${l.label}" → "Blog & News"`)
        return { ...l, label: 'Blog & News' }
      }
      return l
    })

  const footerGroups = (nav.footerGroups ?? []).map((group: any) => ({
    ...group,
    links: (group.links ?? [])
      .filter((l: any) => {
        if (l.href === '/impact') {
          console.log(`  remove footer: "${l.label}"`)
          return false
        }
        if (l.href === '/news') {
          console.log(`  remove footer: "${l.label}"`)
          return false
        }
        return true
      })
      .map((l: any) => {
        if (l.href === '/blog') return { ...l, label: 'Blog & News' }
        return l
      }),
  }))

  await payload.updateGlobal({
    slug: 'navigation',
    data: { ...nav, headerLinks, footerGroups } as any,
  })

  console.log('\nNav updated:')
  console.log('  Header:', headerLinks.map((l: any) => `${l.label} (${l.href})`).join(', '))
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
