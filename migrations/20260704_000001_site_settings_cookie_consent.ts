import { sql } from '@payloadcms/db-postgres'
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings"
      ADD COLUMN IF NOT EXISTS "cookie_consent_enabled"      boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "cookie_consent_description"  text,
      ADD COLUMN IF NOT EXISTS "cookie_consent_accept_label" varchar,
      ADD COLUMN IF NOT EXISTS "cookie_consent_decline_label" varchar;

    ALTER TABLE "_site_settings_v"
      ADD COLUMN IF NOT EXISTS "version_cookie_consent_enabled"      boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "version_cookie_consent_description"  text,
      ADD COLUMN IF NOT EXISTS "version_cookie_consent_accept_label" varchar,
      ADD COLUMN IF NOT EXISTS "version_cookie_consent_decline_label" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "_site_settings_v"
      DROP COLUMN IF EXISTS "version_cookie_consent_decline_label",
      DROP COLUMN IF EXISTS "version_cookie_consent_accept_label",
      DROP COLUMN IF EXISTS "version_cookie_consent_description",
      DROP COLUMN IF EXISTS "version_cookie_consent_enabled";

    ALTER TABLE "site_settings"
      DROP COLUMN IF EXISTS "cookie_consent_decline_label",
      DROP COLUMN IF EXISTS "cookie_consent_accept_label",
      DROP COLUMN IF EXISTS "cookie_consent_description",
      DROP COLUMN IF EXISTS "cookie_consent_enabled";
  `)
}
