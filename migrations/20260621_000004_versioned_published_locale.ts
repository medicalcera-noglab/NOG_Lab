import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Payload 3.85.1 also expects `published_locale` varchar on versioned tables.
// _blog_posts_v and _news_events_v were created before this column existed.
const TABLES = ['_blog_posts_v', '_news_events_v', '_legal_pages_v']

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const table of TABLES) {
    await db.execute(
      sql.raw(`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "published_locale" varchar;`),
    )
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const table of TABLES) {
    await db.execute(sql.raw(`ALTER TABLE "${table}" DROP COLUMN IF EXISTS "published_locale";`))
  }
}
