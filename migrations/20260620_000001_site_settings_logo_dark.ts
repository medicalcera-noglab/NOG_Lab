import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings"
      ADD COLUMN IF NOT EXISTS "logo_dark_id" integer
        REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "_site_settings_v"
      ADD COLUMN IF NOT EXISTS "version_logo_dark_id" integer
        REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

    CREATE INDEX IF NOT EXISTS "site_settings_logo_dark_idx"
      ON "site_settings" USING btree ("logo_dark_id");
    CREATE INDEX IF NOT EXISTS "_site_settings_v_version_logo_dark_idx"
      ON "_site_settings_v" USING btree ("version_logo_dark_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "_site_settings_v_version_logo_dark_idx";
    DROP INDEX IF EXISTS "site_settings_logo_dark_idx";

    ALTER TABLE "_site_settings_v"
      DROP COLUMN IF EXISTS "version_logo_dark_id";

    ALTER TABLE "site_settings"
      DROP COLUMN IF EXISTS "logo_dark_id";
  `)
}
