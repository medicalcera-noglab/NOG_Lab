import { sql } from '@payloadcms/db-postgres'
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

// Adds missing versioned columns to _site_settings_v that were omitted from earlier migrations.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE _site_settings_v
      ADD COLUMN IF NOT EXISTS version_founding_year integer,
      ADD COLUMN IF NOT EXISTS version_hero_motto    varchar,
      ADD COLUMN IF NOT EXISTS version_contact_email varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE _site_settings_v
      DROP COLUMN IF EXISTS version_founding_year,
      DROP COLUMN IF EXISTS version_hero_motto,
      DROP COLUMN IF EXISTS version_contact_email;
  `)
}
