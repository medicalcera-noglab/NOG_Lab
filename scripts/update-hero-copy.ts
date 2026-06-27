/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Updates the hero headline and subline in SiteSettings.
 *
 * Headline: short, bold, research-forward — no lab/university name.
 * Subline:  one precise sentence about what the lab actually investigates.
 *
 * Run: tsx --env-file=.env.local scripts/update-hero-copy.ts
 */
import { getPayload } from 'payload'
import configPromise from '../payload.config'

const HERO_TAGLINE = 'Decoding how diet drives disease'

const HERO_SUBLINE =
  'Investigating the microbial mechanisms that translate nutritional exposure into systemic health outcomes'

async function main() {
  const payload = await getPayload({ config: configPromise })

  await payload.updateGlobal({
    slug: 'site_settings',
    data: {
      tagline: HERO_TAGLINE,
      heroSubline: HERO_SUBLINE,
    } as any,
  })

  console.log('Hero copy updated:')
  console.log(`  Headline : "${HERO_TAGLINE}"`)
  console.log(`  Subline  : "${HERO_SUBLINE}"`)
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
