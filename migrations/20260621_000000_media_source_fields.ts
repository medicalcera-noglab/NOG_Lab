import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(
    sql.raw(`
    ALTER TABLE "media"
      ADD COLUMN IF NOT EXISTS "source_url"     varchar,
      ADD COLUMN IF NOT EXISTS "source_author"  varchar,
      ADD COLUMN IF NOT EXISTS "source_license" varchar,
      ADD COLUMN IF NOT EXISTS "is_demo"        boolean DEFAULT false NOT NULL;
  `),
  )
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(
    sql.raw(`
    ALTER TABLE "media"
      DROP COLUMN IF EXISTS "source_url",
      DROP COLUMN IF EXISTS "source_author",
      DROP COLUMN IF EXISTS "source_license",
      DROP COLUMN IF EXISTS "is_demo";
  `),
  )
}
