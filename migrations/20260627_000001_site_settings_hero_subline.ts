import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE site_settings
      ADD COLUMN IF NOT EXISTS hero_subline varchar;

    ALTER TABLE _site_settings_v
      ADD COLUMN IF NOT EXISTS version_hero_subline varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE site_settings DROP COLUMN IF EXISTS hero_subline;
    ALTER TABLE _site_settings_v DROP COLUMN IF EXISTS version_hero_subline;
  `)
}
