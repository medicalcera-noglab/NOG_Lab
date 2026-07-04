import { sql } from '@payloadcms/db-postgres'
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings"
      ADD COLUMN IF NOT EXISTS "home_sections_show_about_teaser"    boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "home_sections_show_about_full"       boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "home_sections_show_featured_project" boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "home_sections_show_projects_grid"    boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "home_sections_show_map"              boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "home_sections_show_publications"     boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "home_sections_show_team"             boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "home_sections_show_news"             boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "home_sections_show_partners"         boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "blog_settings_show_articles"         boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "blog_settings_show_news_events"      boolean DEFAULT true;

    ALTER TABLE "_site_settings_v"
      ADD COLUMN IF NOT EXISTS "version_home_sections_show_about_teaser"    boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "version_home_sections_show_about_full"       boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "version_home_sections_show_featured_project" boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "version_home_sections_show_projects_grid"    boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "version_home_sections_show_map"              boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "version_home_sections_show_publications"     boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "version_home_sections_show_team"             boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "version_home_sections_show_news"             boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "version_home_sections_show_partners"         boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "version_blog_settings_show_articles"         boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "version_blog_settings_show_news_events"      boolean DEFAULT true;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "_site_settings_v"
      DROP COLUMN IF EXISTS "version_home_sections_show_about_teaser",
      DROP COLUMN IF EXISTS "version_home_sections_show_about_full",
      DROP COLUMN IF EXISTS "version_home_sections_show_featured_project",
      DROP COLUMN IF EXISTS "version_home_sections_show_projects_grid",
      DROP COLUMN IF EXISTS "version_home_sections_show_map",
      DROP COLUMN IF EXISTS "version_home_sections_show_publications",
      DROP COLUMN IF EXISTS "version_home_sections_show_team",
      DROP COLUMN IF EXISTS "version_home_sections_show_news",
      DROP COLUMN IF EXISTS "version_home_sections_show_partners",
      DROP COLUMN IF EXISTS "version_blog_settings_show_articles",
      DROP COLUMN IF EXISTS "version_blog_settings_show_news_events";

    ALTER TABLE "site_settings"
      DROP COLUMN IF EXISTS "home_sections_show_about_teaser",
      DROP COLUMN IF EXISTS "home_sections_show_about_full",
      DROP COLUMN IF EXISTS "home_sections_show_featured_project",
      DROP COLUMN IF EXISTS "home_sections_show_projects_grid",
      DROP COLUMN IF EXISTS "home_sections_show_map",
      DROP COLUMN IF EXISTS "home_sections_show_publications",
      DROP COLUMN IF EXISTS "home_sections_show_team",
      DROP COLUMN IF EXISTS "home_sections_show_news",
      DROP COLUMN IF EXISTS "home_sections_show_partners",
      DROP COLUMN IF EXISTS "blog_settings_show_articles",
      DROP COLUMN IF EXISTS "blog_settings_show_news_events";
  `)
}
