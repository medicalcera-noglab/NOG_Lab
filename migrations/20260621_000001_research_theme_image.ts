import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(
    sql.raw(`
    ALTER TABLE "research_themes"
      ADD COLUMN IF NOT EXISTS "theme_image_id" integer
        REFERENCES "media"("id") ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS "research_themes_theme_image_idx"
      ON "research_themes" ("theme_image_id");
  `),
  )
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(
    sql.raw(`
    DROP INDEX IF EXISTS "research_themes_theme_image_idx";
    ALTER TABLE "research_themes" DROP COLUMN IF EXISTS "theme_image_id";
  `),
  )
}
