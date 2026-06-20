import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Static page keys
const PAGES = [
  'home',
  'about',
  'research',
  'projects',
  'publications',
  'collaborations',
  'impact',
  'news',
  'blog',
  'join',
  'contact',
] as const

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Build column list dynamically
  const textCols = PAGES.flatMap((p) => [
    `"${p}_title" varchar`,
    `"${p}_title_ur" varchar`,
    `"${p}_description" text`,
    `"${p}_description_ur" text`,
    `"${p}_og_image_id" integer REFERENCES "public"."media"("id") ON DELETE set null`,
  ]).join(',\n      ')

  await db.execute(
    sql.raw(`
    CREATE TABLE IF NOT EXISTS "page_seo" (
      "id"          serial PRIMARY KEY,
      ${textCols},
      "updated_at"  timestamp(3) with time zone,
      "created_at"  timestamp(3) with time zone
    );
  `),
  )

  // Indexes on og_image FK columns for query performance
  for (const p of PAGES) {
    await db.execute(
      sql.raw(`
      CREATE INDEX IF NOT EXISTS "page_seo_${p}_og_image_idx"
        ON "page_seo" USING btree ("${p}_og_image_id");
    `),
    )
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE IF EXISTS "page_seo";`)
}
