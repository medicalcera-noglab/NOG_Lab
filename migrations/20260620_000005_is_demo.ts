import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

const LIVE_TABLES = [
  'people',
  'research_themes',
  'projects',
  'study_sites',
  'collaborators',
  'open_positions',
  'blog_posts',
  'news_events',
  'impact_stories',
]

const VERSION_TABLES = ['_blog_posts_v', '_news_events_v', '_impact_stories_v']

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const table of LIVE_TABLES) {
    await db.execute(
      sql.raw(
        `ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "is_demo" boolean DEFAULT false NOT NULL;`,
      ),
    )
  }
  for (const table of VERSION_TABLES) {
    await db.execute(
      sql.raw(
        `ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "version_is_demo" boolean DEFAULT false NOT NULL;`,
      ),
    )
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const table of LIVE_TABLES) {
    await db.execute(sql.raw(`ALTER TABLE "${table}" DROP COLUMN IF EXISTS "is_demo";`))
  }
  for (const table of VERSION_TABLES) {
    await db.execute(sql.raw(`ALTER TABLE "${table}" DROP COLUMN IF EXISTS "version_is_demo";`))
  }
}
