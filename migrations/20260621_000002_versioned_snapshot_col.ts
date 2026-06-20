import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Payload 3.85.1 expects `snapshot`, `autosave`, and `published_locale`
// columns on every _*_v versioned shadow table. The initial migration
// pre-dates those fields for blog_posts and news_events; legal_pages was
// hand-written and also omitted them.
const TABLES = ['_blog_posts_v', '_news_events_v', '_legal_pages_v']

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const table of TABLES) {
    await db.execute(sql.raw(`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "snapshot" boolean;`))
    await db.execute(sql.raw(`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "autosave" boolean;`))
    await db.execute(
      sql.raw(`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "published_locale" varchar;`),
    )
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const table of TABLES) {
    await db.execute(sql.raw(`ALTER TABLE "${table}" DROP COLUMN IF EXISTS "published_locale";`))
    await db.execute(sql.raw(`ALTER TABLE "${table}" DROP COLUMN IF EXISTS "autosave";`))
    await db.execute(sql.raw(`ALTER TABLE "${table}" DROP COLUMN IF EXISTS "snapshot";`))
  }
}
