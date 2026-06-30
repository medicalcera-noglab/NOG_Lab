/* eslint-disable @typescript-eslint/no-explicit-any */
import { getPayload } from 'payload'
import configPromise from '../payload.config'
async function main() {
  const payload = await getPayload({ config: configPromise })
  await payload.updateGlobal({
    slug: 'site_settings',
    data: { heroMotto: 'Advancing Microbiome Science for Better Health' } as any,
  })
  console.log('Hero motto seeded!')
  process.exit(0)
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
