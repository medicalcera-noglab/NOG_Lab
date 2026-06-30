/* eslint-disable @typescript-eslint/no-explicit-any */
import { sql } from '@payloadcms/db-postgres'
import { getPayload } from 'payload'
import configPromise from '../payload.config'

async function main() {
  const payload = await getPayload({ config: configPromise })
  const db = (payload.db as any).drizzle

  await db.execute(sql`
    ALTER TABLE _site_settings_v
      ADD COLUMN IF NOT EXISTS version_founding_year integer,
      ADD COLUMN IF NOT EXISTS version_hero_motto varchar;
  `)
  console.log('Missing version columns added.')
  process.exit(0)
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
