import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

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
  // ─── 1. Re-add content columns to main tables ───────────────────────────────
  await db.execute(sql`
    ALTER TABLE "site_settings"
      ADD COLUMN IF NOT EXISTS "lab_name"                  varchar,
      ADD COLUMN IF NOT EXISTS "tagline"                   varchar,
      ADD COLUMN IF NOT EXISTS "footer_text"               jsonb,
      ADD COLUMN IF NOT EXISTS "copyright"                 varchar,
      ADD COLUMN IF NOT EXISTS "contact_address"           varchar,
      ADD COLUMN IF NOT EXISTS "hero_cta_primary_label"    varchar,
      ADD COLUMN IF NOT EXISTS "hero_cta_secondary_label"  varchar,
      ADD COLUMN IF NOT EXISTS "role_labels_all"           varchar,
      ADD COLUMN IF NOT EXISTS "role_labels_pi"            varchar,
      ADD COLUMN IF NOT EXISTS "role_labels_postdoc"       varchar,
      ADD COLUMN IF NOT EXISTS "role_labels_phd"           varchar,
      ADD COLUMN IF NOT EXISTS "role_labels_ms"            varchar,
      ADD COLUMN IF NOT EXISTS "role_labels_staff"         varchar,
      ADD COLUMN IF NOT EXISTS "role_labels_alumni"        varchar,
      ADD COLUMN IF NOT EXISTS "no_open_positions_message" varchar;

    ALTER TABLE "site_settings_big_questions"
      ADD COLUMN IF NOT EXISTS "question" varchar;

    ALTER TABLE "about"
      ADD COLUMN IF NOT EXISTS "mission"          jsonb,
      ADD COLUMN IF NOT EXISTS "director_message" jsonb,
      ADD COLUMN IF NOT EXISTS "kmu_affiliation"  jsonb;

    ALTER TABLE "about_facilities"
      ADD COLUMN IF NOT EXISTS "caption" varchar;

    ALTER TABLE "about_testimonials"
      ADD COLUMN IF NOT EXISTS "quote" varchar,
      ADD COLUMN IF NOT EXISTS "name"  varchar,
      ADD COLUMN IF NOT EXISTS "role"  varchar;

    ALTER TABLE "impact_stories"
      ADD COLUMN IF NOT EXISTS "title" varchar,
      ADD COLUMN IF NOT EXISTS "body"  jsonb;

    ALTER TABLE "open_positions"
      ADD COLUMN IF NOT EXISTS "title"       varchar,
      ADD COLUMN IF NOT EXISTS "description" jsonb,
      ADD COLUMN IF NOT EXISTS "type"        varchar;

    ALTER TABLE "media_coverage"
      ADD COLUMN IF NOT EXISTS "outlet" varchar,
      ADD COLUMN IF NOT EXISTS "title"  varchar;

    ALTER TABLE "collaborators"
      ADD COLUMN IF NOT EXISTS "name" varchar;

    ALTER TABLE "study_sites"
      ADD COLUMN IF NOT EXISTS "name"     varchar,
      ADD COLUMN IF NOT EXISTS "district" varchar,
      ADD COLUMN IF NOT EXISTS "province" varchar;
  `)

  await db.execute(sql`
    ALTER TABLE "_site_settings_v"
      ADD COLUMN IF NOT EXISTS "version_lab_name"                  varchar,
      ADD COLUMN IF NOT EXISTS "version_tagline"                   varchar,
      ADD COLUMN IF NOT EXISTS "version_footer_text"               jsonb,
      ADD COLUMN IF NOT EXISTS "version_copyright"                 varchar,
      ADD COLUMN IF NOT EXISTS "version_contact_address"           varchar,
      ADD COLUMN IF NOT EXISTS "version_hero_cta_primary_label"    varchar,
      ADD COLUMN IF NOT EXISTS "version_hero_cta_secondary_label"  varchar,
      ADD COLUMN IF NOT EXISTS "version_role_labels_all"           varchar,
      ADD COLUMN IF NOT EXISTS "version_role_labels_pi"            varchar,
      ADD COLUMN IF NOT EXISTS "version_role_labels_postdoc"       varchar,
      ADD COLUMN IF NOT EXISTS "version_role_labels_phd"           varchar,
      ADD COLUMN IF NOT EXISTS "version_role_labels_ms"            varchar,
      ADD COLUMN IF NOT EXISTS "version_role_labels_staff"         varchar,
      ADD COLUMN IF NOT EXISTS "version_role_labels_alumni"        varchar,
      ADD COLUMN IF NOT EXISTS "version_no_open_positions_message" varchar;

    ALTER TABLE "_site_settings_v_version_big_questions"
      ADD COLUMN IF NOT EXISTS "question" varchar;

    ALTER TABLE "_about_v"
      ADD COLUMN IF NOT EXISTS "version_mission"          jsonb,
      ADD COLUMN IF NOT EXISTS "version_director_message" jsonb,
      ADD COLUMN IF NOT EXISTS "version_kmu_affiliation"  jsonb;

    ALTER TABLE "_about_v_version_facilities"
      ADD COLUMN IF NOT EXISTS "caption" varchar;

    ALTER TABLE "_about_v_version_testimonials"
      ADD COLUMN IF NOT EXISTS "quote" varchar,
      ADD COLUMN IF NOT EXISTS "name"  varchar,
      ADD COLUMN IF NOT EXISTS "role"  varchar;

    ALTER TABLE "_impact_stories_v"
      ADD COLUMN IF NOT EXISTS "version_title" varchar,
      ADD COLUMN IF NOT EXISTS "version_body"  jsonb;
  `)

  // ─── 2. Copy EN data from _locales tables → main tables ────────────────────
  await db.execute(sql`
    UPDATE "site_settings" s
    SET
      "lab_name"                  = l."lab_name",
      "tagline"                   = l."tagline",
      "footer_text"               = l."footer_text",
      "copyright"                 = l."copyright",
      "contact_address"           = l."contact_address",
      "hero_cta_primary_label"    = l."hero_cta_primary_label",
      "hero_cta_secondary_label"  = l."hero_cta_secondary_label",
      "role_labels_all"           = l."role_labels_all",
      "role_labels_pi"            = l."role_labels_pi",
      "role_labels_postdoc"       = l."role_labels_postdoc",
      "role_labels_phd"           = l."role_labels_phd",
      "role_labels_ms"            = l."role_labels_ms",
      "role_labels_staff"         = l."role_labels_staff",
      "role_labels_alumni"        = l."role_labels_alumni",
      "no_open_positions_message" = l."no_open_positions_message"
    FROM "site_settings_locales" l
    WHERE l."_parent_id" = s."id" AND l."_locale" = 'en';

    UPDATE "site_settings_big_questions" t
    SET "question" = l."question"
    FROM "site_settings_big_questions_locales" l
    WHERE l."_parent_id" = t."id" AND l."_locale" = 'en';

    UPDATE "about" t
    SET "mission" = l."mission",
        "director_message" = l."director_message",
        "kmu_affiliation" = l."kmu_affiliation"
    FROM "about_locales" l
    WHERE l."_parent_id" = t."id" AND l."_locale" = 'en';

    UPDATE "about_facilities" t
    SET "caption" = l."caption"
    FROM "about_facilities_locales" l
    WHERE l."_parent_id" = t."id" AND l."_locale" = 'en';

    UPDATE "about_testimonials" t
    SET "quote" = l."quote", "name" = l."name", "role" = l."role"
    FROM "about_testimonials_locales" l
    WHERE l."_parent_id" = t."id" AND l."_locale" = 'en';

    UPDATE "impact_stories" t
    SET "title" = l."title", "body" = l."body"
    FROM "impact_stories_locales" l
    WHERE l."_parent_id" = t."id" AND l."_locale" = 'en';

    UPDATE "open_positions" t
    SET "title" = l."title", "description" = l."description", "type" = l."type"
    FROM "open_positions_locales" l
    WHERE l."_parent_id" = t."id" AND l."_locale" = 'en';

    UPDATE "media_coverage" t
    SET "outlet" = l."outlet", "title" = l."title"
    FROM "media_coverage_locales" l
    WHERE l."_parent_id" = t."id" AND l."_locale" = 'en';

    UPDATE "collaborators" t
    SET "name" = l."name"
    FROM "collaborators_locales" l
    WHERE l."_parent_id" = t."id" AND l."_locale" = 'en';

    UPDATE "study_sites" t
    SET "name" = l."name", "district" = l."district", "province" = l."province"
    FROM "study_sites_locales" l
    WHERE l."_parent_id" = t."id" AND l."_locale" = 'en';
  `)

  // ─── 3. Copy EN data from version _locales tables → version tables ──────────
  await db.execute(sql`
    UPDATE "_site_settings_v" v
    SET
      "version_lab_name"                  = l."version_lab_name",
      "version_tagline"                   = l."version_tagline",
      "version_footer_text"               = l."version_footer_text",
      "version_copyright"                 = l."version_copyright",
      "version_contact_address"           = l."version_contact_address",
      "version_hero_cta_primary_label"    = l."version_hero_cta_primary_label",
      "version_hero_cta_secondary_label"  = l."version_hero_cta_secondary_label",
      "version_role_labels_all"           = l."version_role_labels_all",
      "version_role_labels_pi"            = l."version_role_labels_pi",
      "version_role_labels_postdoc"       = l."version_role_labels_postdoc",
      "version_role_labels_phd"           = l."version_role_labels_phd",
      "version_role_labels_ms"            = l."version_role_labels_ms",
      "version_role_labels_staff"         = l."version_role_labels_staff",
      "version_role_labels_alumni"        = l."version_role_labels_alumni",
      "version_no_open_positions_message" = l."version_no_open_positions_message"
    FROM "_site_settings_v_locales" l
    WHERE l."_parent_id" = v."id" AND l."_locale" = 'en';

    UPDATE "_site_settings_v_version_big_questions" t
    SET "question" = l."question"
    FROM "_site_settings_v_version_big_questions_locales" l
    WHERE l."_parent_id" = t."id" AND l."_locale" = 'en';

    UPDATE "_about_v" v
    SET "version_mission"          = l."version_mission",
        "version_director_message" = l."version_director_message",
        "version_kmu_affiliation"  = l."version_kmu_affiliation"
    FROM "_about_v_locales" l
    WHERE l."_parent_id" = v."id" AND l."_locale" = 'en';

    UPDATE "_about_v_version_facilities" t
    SET "caption" = l."caption"
    FROM "_about_v_version_facilities_locales" l
    WHERE l."_parent_id" = t."id" AND l."_locale" = 'en';

    UPDATE "_about_v_version_testimonials" t
    SET "quote" = l."quote", "name" = l."name", "role" = l."role"
    FROM "_about_v_version_testimonials_locales" l
    WHERE l."_parent_id" = t."id" AND l."_locale" = 'en';

    UPDATE "_impact_stories_v" v
    SET "version_title" = l."version_title", "version_body" = l."version_body"
    FROM "_impact_stories_v_locales" l
    WHERE l."_parent_id" = v."id" AND l."_locale" = 'en';
  `)

  // ─── 4. Drop all 16 _locales side-tables ────────────────────────────────────
  await db.execute(sql`
    DROP TABLE IF EXISTS "_impact_stories_v_locales";
    DROP TABLE IF EXISTS "_about_v_version_testimonials_locales";
    DROP TABLE IF EXISTS "_about_v_version_facilities_locales";
    DROP TABLE IF EXISTS "_about_v_locales";
    DROP TABLE IF EXISTS "_site_settings_v_version_big_questions_locales";
    DROP TABLE IF EXISTS "_site_settings_v_locales";
    DROP TABLE IF EXISTS "study_sites_locales";
    DROP TABLE IF EXISTS "collaborators_locales";
    DROP TABLE IF EXISTS "media_coverage_locales";
    DROP TABLE IF EXISTS "open_positions_locales";
    DROP TABLE IF EXISTS "impact_stories_locales";
    DROP TABLE IF EXISTS "about_testimonials_locales";
    DROP TABLE IF EXISTS "about_facilities_locales";
    DROP TABLE IF EXISTS "about_locales";
    DROP TABLE IF EXISTS "site_settings_big_questions_locales";
    DROP TABLE IF EXISTS "site_settings_locales";
  `)

  // ─── 5. Convert published_locale from enum → varchar (keep the column) ───────
  // Payload 3.85.1 expects published_locale varchar on versioned tables.
  // The column was typed as an enum by the add_localization migration; we cast
  // it to varchar so we can drop the enum types.
  await db.execute(sql`
    ALTER TABLE "_site_settings_v"
      ALTER COLUMN "published_locale"
      TYPE varchar USING "published_locale"::text;

    ALTER TABLE "_about_v"
      ALTER COLUMN "published_locale"
      TYPE varchar USING "published_locale"::text;

    ALTER TABLE "_impact_stories_v"
      ALTER COLUMN "published_locale"
      TYPE varchar USING "published_locale"::text;
  `)

  // ─── 6. Drop enum types ──────────────────────────────────────────────────────
  await db.execute(sql`
    DROP TYPE IF EXISTS "public"."enum__impact_stories_v_published_locale";
    DROP TYPE IF EXISTS "public"."enum__about_v_published_locale";
    DROP TYPE IF EXISTS "public"."enum__site_settings_v_published_locale";
    DROP TYPE IF EXISTS "public"."enum__locales";
  `)

  // ─── 7. Drop Urdu-only columns added by page_seo migration ──────────────────
  const urDrops = PAGES.map(
    (p) =>
      `ALTER TABLE "page_seo" DROP COLUMN IF EXISTS "${p}_title_ur", DROP COLUMN IF EXISTS "${p}_description_ur";`,
  ).join('\n    ')
  await db.execute(sql.raw(urDrops))
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Reversing de-localization requires re-running the add_localization migration
  // manually against a DB snapshot. This migration is intentionally irreversible
  // via the CLI — restore from backup or re-run 20260619_400000_add_localization up.
  throw new Error(
    'drop_localization cannot be reversed automatically. Restore from a DB backup taken before this migration.',
  )
}
