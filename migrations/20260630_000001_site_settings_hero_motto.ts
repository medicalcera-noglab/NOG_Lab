import { sql } from '@payloadcms/db-postgres'
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE site_settings
      ADD COLUMN IF NOT EXISTS hero_motto varchar;
    ALTER TABLE _site_settings_v
      ADD COLUMN IF NOT EXISTS version_hero_motto varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE site_settings
      DROP COLUMN IF EXISTS hero_motto;
    ALTER TABLE _site_settings_v
      DROP COLUMN IF EXISTS version_hero_motto;
  `)
}
