import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings"
      ADD COLUMN IF NOT EXISTS "role_labels_all" varchar,
      ADD COLUMN IF NOT EXISTS "role_labels_pi" varchar,
      ADD COLUMN IF NOT EXISTS "role_labels_postdoc" varchar,
      ADD COLUMN IF NOT EXISTS "role_labels_phd" varchar,
      ADD COLUMN IF NOT EXISTS "role_labels_ms" varchar,
      ADD COLUMN IF NOT EXISTS "role_labels_staff" varchar,
      ADD COLUMN IF NOT EXISTS "role_labels_alumni" varchar;

    ALTER TABLE "_site_settings_v"
      ADD COLUMN IF NOT EXISTS "version_role_labels_all" varchar,
      ADD COLUMN IF NOT EXISTS "version_role_labels_pi" varchar,
      ADD COLUMN IF NOT EXISTS "version_role_labels_postdoc" varchar,
      ADD COLUMN IF NOT EXISTS "version_role_labels_phd" varchar,
      ADD COLUMN IF NOT EXISTS "version_role_labels_ms" varchar,
      ADD COLUMN IF NOT EXISTS "version_role_labels_staff" varchar,
      ADD COLUMN IF NOT EXISTS "version_role_labels_alumni" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings"
      DROP COLUMN IF EXISTS "role_labels_all",
      DROP COLUMN IF EXISTS "role_labels_pi",
      DROP COLUMN IF EXISTS "role_labels_postdoc",
      DROP COLUMN IF EXISTS "role_labels_phd",
      DROP COLUMN IF EXISTS "role_labels_ms",
      DROP COLUMN IF EXISTS "role_labels_staff",
      DROP COLUMN IF EXISTS "role_labels_alumni";

    ALTER TABLE "_site_settings_v"
      DROP COLUMN IF EXISTS "version_role_labels_all",
      DROP COLUMN IF EXISTS "version_role_labels_pi",
      DROP COLUMN IF EXISTS "version_role_labels_postdoc",
      DROP COLUMN IF EXISTS "version_role_labels_phd",
      DROP COLUMN IF EXISTS "version_role_labels_ms",
      DROP COLUMN IF EXISTS "version_role_labels_staff",
      DROP COLUMN IF EXISTS "version_role_labels_alumni";
  `)
}
