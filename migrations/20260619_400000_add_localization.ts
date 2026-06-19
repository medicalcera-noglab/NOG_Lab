import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // ─── 1. Enum types ─────────────────────────────────────────────────────────
  await db.execute(sql`
    CREATE TYPE "public"."enum__locales" AS ENUM ('en', 'ur');
    CREATE TYPE "public"."enum__site_settings_v_published_locale" AS ENUM ('en', 'ur');
    CREATE TYPE "public"."enum__about_v_published_locale" AS ENUM ('en', 'ur');
    CREATE TYPE "public"."enum__impact_stories_v_published_locale" AS ENUM ('en', 'ur');
  `)

  // ─── 2. Add snapshot + published_locale to versioned tables ────────────────
  await db.execute(sql`
    ALTER TABLE "_site_settings_v"
      ADD COLUMN IF NOT EXISTS "snapshot" boolean,
      ADD COLUMN IF NOT EXISTS "published_locale" "enum__site_settings_v_published_locale";

    ALTER TABLE "_about_v"
      ADD COLUMN IF NOT EXISTS "snapshot" boolean,
      ADD COLUMN IF NOT EXISTS "published_locale" "enum__about_v_published_locale";

    ALTER TABLE "_impact_stories_v"
      ADD COLUMN IF NOT EXISTS "snapshot" boolean,
      ADD COLUMN IF NOT EXISTS "published_locale" "enum__impact_stories_v_published_locale";
  `)

  // ─── 3. Locales tables — globals ───────────────────────────────────────────

  // site_settings_locales
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "site_settings_locales" (
      "id"                          serial PRIMARY KEY NOT NULL,
      "_locale"                     "enum__locales" NOT NULL,
      "_parent_id"                  integer NOT NULL REFERENCES "site_settings"("id") ON DELETE CASCADE,
      "lab_name"                    varchar,
      "tagline"                     varchar,
      "footer_text"                 jsonb,
      "copyright"                   varchar,
      "contact_address"             varchar,
      "hero_cta_primary_label"      varchar,
      "hero_cta_secondary_label"    varchar,
      "role_labels_all"             varchar,
      "role_labels_pi"              varchar,
      "role_labels_postdoc"         varchar,
      "role_labels_phd"             varchar,
      "role_labels_ms"              varchar,
      "role_labels_staff"           varchar,
      "role_labels_alumni"          varchar,
      "no_open_positions_message"   varchar,
      CONSTRAINT "site_settings_locales_locale_parent_id_unique" UNIQUE ("_locale", "_parent_id")
    );
    CREATE INDEX IF NOT EXISTS "site_settings_locales_parent_id_idx"
      ON "site_settings_locales" ("_parent_id");
  `)

  // site_settings_big_questions_locales
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "site_settings_big_questions_locales" (
      "id"          serial PRIMARY KEY NOT NULL,
      "_locale"     "enum__locales" NOT NULL,
      "_parent_id"  varchar NOT NULL REFERENCES "site_settings_big_questions"("id") ON DELETE CASCADE,
      "question"    varchar,
      CONSTRAINT "site_settings_big_questions_locales_locale_parent_id_unique" UNIQUE ("_locale", "_parent_id")
    );
    CREATE INDEX IF NOT EXISTS "site_settings_big_questions_locales_parent_id_idx"
      ON "site_settings_big_questions_locales" ("_parent_id");
  `)

  // about_locales
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "about_locales" (
      "id"                   serial PRIMARY KEY NOT NULL,
      "_locale"              "enum__locales" NOT NULL,
      "_parent_id"           integer NOT NULL REFERENCES "about"("id") ON DELETE CASCADE,
      "mission"              jsonb,
      "director_message"     jsonb,
      "kmu_affiliation"      jsonb,
      CONSTRAINT "about_locales_locale_parent_id_unique" UNIQUE ("_locale", "_parent_id")
    );
    CREATE INDEX IF NOT EXISTS "about_locales_parent_id_idx"
      ON "about_locales" ("_parent_id");
  `)

  // about_facilities_locales
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "about_facilities_locales" (
      "id"          serial PRIMARY KEY NOT NULL,
      "_locale"     "enum__locales" NOT NULL,
      "_parent_id"  varchar NOT NULL REFERENCES "about_facilities"("id") ON DELETE CASCADE,
      "caption"     varchar,
      CONSTRAINT "about_facilities_locales_locale_parent_id_unique" UNIQUE ("_locale", "_parent_id")
    );
    CREATE INDEX IF NOT EXISTS "about_facilities_locales_parent_id_idx"
      ON "about_facilities_locales" ("_parent_id");
  `)

  // about_testimonials_locales
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "about_testimonials_locales" (
      "id"          serial PRIMARY KEY NOT NULL,
      "_locale"     "enum__locales" NOT NULL,
      "_parent_id"  varchar NOT NULL REFERENCES "about_testimonials"("id") ON DELETE CASCADE,
      "quote"       varchar,
      "name"        varchar,
      "role"        varchar,
      CONSTRAINT "about_testimonials_locales_locale_parent_id_unique" UNIQUE ("_locale", "_parent_id")
    );
    CREATE INDEX IF NOT EXISTS "about_testimonials_locales_parent_id_idx"
      ON "about_testimonials_locales" ("_parent_id");
  `)

  // ─── 4. Locales tables — collections ───────────────────────────────────────

  // impact_stories_locales
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "impact_stories_locales" (
      "id"          serial PRIMARY KEY NOT NULL,
      "_locale"     "enum__locales" NOT NULL,
      "_parent_id"  integer NOT NULL REFERENCES "impact_stories"("id") ON DELETE CASCADE,
      "title"       varchar,
      "body"        jsonb,
      CONSTRAINT "impact_stories_locales_locale_parent_id_unique" UNIQUE ("_locale", "_parent_id")
    );
    CREATE INDEX IF NOT EXISTS "impact_stories_locales_parent_id_idx"
      ON "impact_stories_locales" ("_parent_id");
  `)

  // open_positions_locales
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "open_positions_locales" (
      "id"           serial PRIMARY KEY NOT NULL,
      "_locale"      "enum__locales" NOT NULL,
      "_parent_id"   integer NOT NULL REFERENCES "open_positions"("id") ON DELETE CASCADE,
      "title"        varchar,
      "description"  jsonb,
      "type"         varchar,
      CONSTRAINT "open_positions_locales_locale_parent_id_unique" UNIQUE ("_locale", "_parent_id")
    );
    CREATE INDEX IF NOT EXISTS "open_positions_locales_parent_id_idx"
      ON "open_positions_locales" ("_parent_id");
  `)

  // media_coverage_locales
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "media_coverage_locales" (
      "id"          serial PRIMARY KEY NOT NULL,
      "_locale"     "enum__locales" NOT NULL,
      "_parent_id"  integer NOT NULL REFERENCES "media_coverage"("id") ON DELETE CASCADE,
      "outlet"      varchar,
      "title"       varchar,
      CONSTRAINT "media_coverage_locales_locale_parent_id_unique" UNIQUE ("_locale", "_parent_id")
    );
    CREATE INDEX IF NOT EXISTS "media_coverage_locales_parent_id_idx"
      ON "media_coverage_locales" ("_parent_id");
  `)

  // collaborators_locales
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "collaborators_locales" (
      "id"          serial PRIMARY KEY NOT NULL,
      "_locale"     "enum__locales" NOT NULL,
      "_parent_id"  integer NOT NULL REFERENCES "collaborators"("id") ON DELETE CASCADE,
      "name"        varchar,
      CONSTRAINT "collaborators_locales_locale_parent_id_unique" UNIQUE ("_locale", "_parent_id")
    );
    CREATE INDEX IF NOT EXISTS "collaborators_locales_parent_id_idx"
      ON "collaborators_locales" ("_parent_id");
  `)

  // study_sites_locales
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "study_sites_locales" (
      "id"          serial PRIMARY KEY NOT NULL,
      "_locale"     "enum__locales" NOT NULL,
      "_parent_id"  integer NOT NULL REFERENCES "study_sites"("id") ON DELETE CASCADE,
      "name"        varchar,
      "district"    varchar,
      "province"    varchar,
      CONSTRAINT "study_sites_locales_locale_parent_id_unique" UNIQUE ("_locale", "_parent_id")
    );
    CREATE INDEX IF NOT EXISTS "study_sites_locales_parent_id_idx"
      ON "study_sites_locales" ("_parent_id");
  `)

  // ─── 5. Locales tables — version tables ────────────────────────────────────

  // _site_settings_v_locales
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "_site_settings_v_locales" (
      "id"                            serial PRIMARY KEY NOT NULL,
      "_locale"                       "enum__locales" NOT NULL,
      "_parent_id"                    integer NOT NULL REFERENCES "_site_settings_v"("id") ON DELETE CASCADE,
      "version_lab_name"              varchar,
      "version_tagline"               varchar,
      "version_footer_text"           jsonb,
      "version_copyright"             varchar,
      "version_contact_address"       varchar,
      "version_hero_cta_primary_label"   varchar,
      "version_hero_cta_secondary_label" varchar,
      "version_role_labels_all"       varchar,
      "version_role_labels_pi"        varchar,
      "version_role_labels_postdoc"   varchar,
      "version_role_labels_phd"       varchar,
      "version_role_labels_ms"        varchar,
      "version_role_labels_staff"     varchar,
      "version_role_labels_alumni"    varchar,
      "version_no_open_positions_message" varchar,
      CONSTRAINT "_site_settings_v_locales_locale_parent_id_unique" UNIQUE ("_locale", "_parent_id")
    );
    CREATE INDEX IF NOT EXISTS "_site_settings_v_locales_parent_id_idx"
      ON "_site_settings_v_locales" ("_parent_id");
  `)

  // _site_settings_v_version_big_questions_locales
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "_site_settings_v_version_big_questions_locales" (
      "id"          serial PRIMARY KEY NOT NULL,
      "_locale"     "enum__locales" NOT NULL,
      "_parent_id"  integer NOT NULL REFERENCES "_site_settings_v_version_big_questions"("id") ON DELETE CASCADE,
      "question"    varchar,
      CONSTRAINT "_site_settings_v_version_big_questions_locales_locale_parent_id_unique" UNIQUE ("_locale", "_parent_id")
    );
    CREATE INDEX IF NOT EXISTS "_site_settings_v_version_big_questions_locales_parent_id_idx"
      ON "_site_settings_v_version_big_questions_locales" ("_parent_id");
  `)

  // _about_v_locales
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "_about_v_locales" (
      "id"                       serial PRIMARY KEY NOT NULL,
      "_locale"                  "enum__locales" NOT NULL,
      "_parent_id"               integer NOT NULL REFERENCES "_about_v"("id") ON DELETE CASCADE,
      "version_mission"          jsonb,
      "version_director_message" jsonb,
      "version_kmu_affiliation"  jsonb,
      CONSTRAINT "_about_v_locales_locale_parent_id_unique" UNIQUE ("_locale", "_parent_id")
    );
    CREATE INDEX IF NOT EXISTS "_about_v_locales_parent_id_idx"
      ON "_about_v_locales" ("_parent_id");
  `)

  // _about_v_version_facilities_locales
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "_about_v_version_facilities_locales" (
      "id"          serial PRIMARY KEY NOT NULL,
      "_locale"     "enum__locales" NOT NULL,
      "_parent_id"  integer NOT NULL REFERENCES "_about_v_version_facilities"("id") ON DELETE CASCADE,
      "caption"     varchar,
      CONSTRAINT "_about_v_version_facilities_locales_locale_parent_id_unique" UNIQUE ("_locale", "_parent_id")
    );
    CREATE INDEX IF NOT EXISTS "_about_v_version_facilities_locales_parent_id_idx"
      ON "_about_v_version_facilities_locales" ("_parent_id");
  `)

  // _about_v_version_testimonials_locales
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "_about_v_version_testimonials_locales" (
      "id"          serial PRIMARY KEY NOT NULL,
      "_locale"     "enum__locales" NOT NULL,
      "_parent_id"  integer NOT NULL REFERENCES "_about_v_version_testimonials"("id") ON DELETE CASCADE,
      "quote"       varchar,
      "name"        varchar,
      "role"        varchar,
      CONSTRAINT "_about_v_version_testimonials_locales_locale_parent_id_unique" UNIQUE ("_locale", "_parent_id")
    );
    CREATE INDEX IF NOT EXISTS "_about_v_version_testimonials_locales_parent_id_idx"
      ON "_about_v_version_testimonials_locales" ("_parent_id");
  `)

  // _impact_stories_v_locales
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "_impact_stories_v_locales" (
      "id"            serial PRIMARY KEY NOT NULL,
      "_locale"       "enum__locales" NOT NULL,
      "_parent_id"    integer NOT NULL REFERENCES "_impact_stories_v"("id") ON DELETE CASCADE,
      "version_title" varchar,
      "version_body"  jsonb,
      CONSTRAINT "_impact_stories_v_locales_locale_parent_id_unique" UNIQUE ("_locale", "_parent_id")
    );
    CREATE INDEX IF NOT EXISTS "_impact_stories_v_locales_parent_id_idx"
      ON "_impact_stories_v_locales" ("_parent_id");
  `)

  // ─── 6. Migrate existing data → locales tables as 'en' ─────────────────────

  await db.execute(sql`
    INSERT INTO "site_settings_locales"
      ("_locale", "_parent_id",
       "lab_name", "tagline", "footer_text", "copyright", "contact_address",
       "hero_cta_primary_label", "hero_cta_secondary_label",
       "role_labels_all", "role_labels_pi", "role_labels_postdoc",
       "role_labels_phd", "role_labels_ms", "role_labels_staff",
       "role_labels_alumni", "no_open_positions_message")
    SELECT
      'en',
      "id",
      "lab_name", "tagline", "footer_text", "copyright", "contact_address",
      "hero_cta_primary_label", "hero_cta_secondary_label",
      "role_labels_all", "role_labels_pi", "role_labels_postdoc",
      "role_labels_phd", "role_labels_ms", "role_labels_staff",
      "role_labels_alumni", "no_open_positions_message"
    FROM "site_settings"
    ON CONFLICT DO NOTHING;

    INSERT INTO "site_settings_big_questions_locales" ("_locale", "_parent_id", "question")
    SELECT 'en', "id", "question"
    FROM "site_settings_big_questions"
    ON CONFLICT DO NOTHING;

    INSERT INTO "about_locales" ("_locale", "_parent_id", "mission", "director_message", "kmu_affiliation")
    SELECT 'en', "id", "mission", "director_message", "kmu_affiliation"
    FROM "about"
    ON CONFLICT DO NOTHING;

    INSERT INTO "about_facilities_locales" ("_locale", "_parent_id", "caption")
    SELECT 'en', "id", "caption"
    FROM "about_facilities"
    ON CONFLICT DO NOTHING;

    INSERT INTO "about_testimonials_locales" ("_locale", "_parent_id", "quote", "name", "role")
    SELECT 'en', "id", "quote", "name", "role"
    FROM "about_testimonials"
    ON CONFLICT DO NOTHING;

    INSERT INTO "impact_stories_locales" ("_locale", "_parent_id", "title", "body")
    SELECT 'en', "id", "title", "body"
    FROM "impact_stories"
    ON CONFLICT DO NOTHING;

    INSERT INTO "open_positions_locales" ("_locale", "_parent_id", "title", "description", "type")
    SELECT 'en', "id", "title", "description", "type"
    FROM "open_positions"
    ON CONFLICT DO NOTHING;

    INSERT INTO "media_coverage_locales" ("_locale", "_parent_id", "outlet", "title")
    SELECT 'en', "id", "outlet", "title"
    FROM "media_coverage"
    ON CONFLICT DO NOTHING;

    INSERT INTO "collaborators_locales" ("_locale", "_parent_id", "name")
    SELECT 'en', "id", "name"
    FROM "collaborators"
    ON CONFLICT DO NOTHING;

    INSERT INTO "study_sites_locales" ("_locale", "_parent_id", "name", "district", "province")
    SELECT 'en', "id", "name", "district", "province"
    FROM "study_sites"
    ON CONFLICT DO NOTHING;
  `)

  // Version table data migration
  await db.execute(sql`
    INSERT INTO "_site_settings_v_locales"
      ("_locale", "_parent_id",
       "version_lab_name", "version_tagline", "version_footer_text", "version_copyright",
       "version_contact_address", "version_hero_cta_primary_label", "version_hero_cta_secondary_label",
       "version_role_labels_all", "version_role_labels_pi", "version_role_labels_postdoc",
       "version_role_labels_phd", "version_role_labels_ms", "version_role_labels_staff",
       "version_role_labels_alumni", "version_no_open_positions_message")
    SELECT
      'en', "id",
      "version_lab_name", "version_tagline", "version_footer_text", "version_copyright",
      "version_contact_address", "version_hero_cta_primary_label", "version_hero_cta_secondary_label",
      "version_role_labels_all", "version_role_labels_pi", "version_role_labels_postdoc",
      "version_role_labels_phd", "version_role_labels_ms", "version_role_labels_staff",
      "version_role_labels_alumni", "version_no_open_positions_message"
    FROM "_site_settings_v"
    ON CONFLICT DO NOTHING;

    INSERT INTO "_site_settings_v_version_big_questions_locales" ("_locale", "_parent_id", "question")
    SELECT 'en', "id", "question"
    FROM "_site_settings_v_version_big_questions"
    ON CONFLICT DO NOTHING;

    INSERT INTO "_about_v_locales" ("_locale", "_parent_id", "version_mission", "version_director_message", "version_kmu_affiliation")
    SELECT 'en', "id", "version_mission", "version_director_message", "version_kmu_affiliation"
    FROM "_about_v"
    ON CONFLICT DO NOTHING;

    INSERT INTO "_about_v_version_facilities_locales" ("_locale", "_parent_id", "caption")
    SELECT 'en', "id", "caption"
    FROM "_about_v_version_facilities"
    ON CONFLICT DO NOTHING;

    INSERT INTO "_about_v_version_testimonials_locales" ("_locale", "_parent_id", "quote", "name", "role")
    SELECT 'en', "id", "quote", "name", "role"
    FROM "_about_v_version_testimonials"
    ON CONFLICT DO NOTHING;

    INSERT INTO "_impact_stories_v_locales" ("_locale", "_parent_id", "version_title", "version_body")
    SELECT 'en', "id", "version_title", "version_body"
    FROM "_impact_stories_v"
    ON CONFLICT DO NOTHING;
  `)

  // ─── 7. Drop migrated columns from main tables ──────────────────────────────

  await db.execute(sql`
    ALTER TABLE "site_settings"
      DROP COLUMN IF EXISTS "lab_name",
      DROP COLUMN IF EXISTS "tagline",
      DROP COLUMN IF EXISTS "footer_text",
      DROP COLUMN IF EXISTS "copyright",
      DROP COLUMN IF EXISTS "contact_address",
      DROP COLUMN IF EXISTS "hero_cta_primary_label",
      DROP COLUMN IF EXISTS "hero_cta_secondary_label",
      DROP COLUMN IF EXISTS "role_labels_all",
      DROP COLUMN IF EXISTS "role_labels_pi",
      DROP COLUMN IF EXISTS "role_labels_postdoc",
      DROP COLUMN IF EXISTS "role_labels_phd",
      DROP COLUMN IF EXISTS "role_labels_ms",
      DROP COLUMN IF EXISTS "role_labels_staff",
      DROP COLUMN IF EXISTS "role_labels_alumni",
      DROP COLUMN IF EXISTS "no_open_positions_message";

    ALTER TABLE "site_settings_big_questions"
      DROP COLUMN IF EXISTS "question";

    ALTER TABLE "about"
      DROP COLUMN IF EXISTS "mission",
      DROP COLUMN IF EXISTS "director_message",
      DROP COLUMN IF EXISTS "kmu_affiliation";

    ALTER TABLE "about_facilities"
      DROP COLUMN IF EXISTS "caption";

    ALTER TABLE "about_testimonials"
      DROP COLUMN IF EXISTS "quote",
      DROP COLUMN IF EXISTS "name",
      DROP COLUMN IF EXISTS "role";

    ALTER TABLE "impact_stories"
      DROP COLUMN IF EXISTS "title",
      DROP COLUMN IF EXISTS "body";

    ALTER TABLE "open_positions"
      DROP COLUMN IF EXISTS "title",
      DROP COLUMN IF EXISTS "description",
      DROP COLUMN IF EXISTS "type";

    ALTER TABLE "media_coverage"
      DROP COLUMN IF EXISTS "outlet",
      DROP COLUMN IF EXISTS "title";

    ALTER TABLE "collaborators"
      DROP COLUMN IF EXISTS "name";

    ALTER TABLE "study_sites"
      DROP COLUMN IF EXISTS "name",
      DROP COLUMN IF EXISTS "district",
      DROP COLUMN IF EXISTS "province";
  `)

  await db.execute(sql`
    ALTER TABLE "_site_settings_v"
      DROP COLUMN IF EXISTS "version_lab_name",
      DROP COLUMN IF EXISTS "version_tagline",
      DROP COLUMN IF EXISTS "version_footer_text",
      DROP COLUMN IF EXISTS "version_copyright",
      DROP COLUMN IF EXISTS "version_contact_address",
      DROP COLUMN IF EXISTS "version_hero_cta_primary_label",
      DROP COLUMN IF EXISTS "version_hero_cta_secondary_label",
      DROP COLUMN IF EXISTS "version_role_labels_all",
      DROP COLUMN IF EXISTS "version_role_labels_pi",
      DROP COLUMN IF EXISTS "version_role_labels_postdoc",
      DROP COLUMN IF EXISTS "version_role_labels_phd",
      DROP COLUMN IF EXISTS "version_role_labels_ms",
      DROP COLUMN IF EXISTS "version_role_labels_staff",
      DROP COLUMN IF EXISTS "version_role_labels_alumni",
      DROP COLUMN IF EXISTS "version_no_open_positions_message";

    ALTER TABLE "_site_settings_v_version_big_questions"
      DROP COLUMN IF EXISTS "question";

    ALTER TABLE "_about_v"
      DROP COLUMN IF EXISTS "version_mission",
      DROP COLUMN IF EXISTS "version_director_message",
      DROP COLUMN IF EXISTS "version_kmu_affiliation";

    ALTER TABLE "_about_v_version_facilities"
      DROP COLUMN IF EXISTS "caption";

    ALTER TABLE "_about_v_version_testimonials"
      DROP COLUMN IF EXISTS "quote",
      DROP COLUMN IF EXISTS "name",
      DROP COLUMN IF EXISTS "role";

    ALTER TABLE "_impact_stories_v"
      DROP COLUMN IF EXISTS "version_title",
      DROP COLUMN IF EXISTS "version_body";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // ─── 1. Re-add columns to main tables ──────────────────────────────────────
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

  // ─── 2. Restore data from locales tables (en rows only) ────────────────────
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
    SET "mission" = l."mission", "director_message" = l."director_message", "kmu_affiliation" = l."kmu_affiliation"
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
    SET "version_mission" = l."version_mission",
        "version_director_message" = l."version_director_message",
        "version_kmu_affiliation" = l."version_kmu_affiliation"
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

  // ─── 3. Drop locales tables ─────────────────────────────────────────────────
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

  // ─── 4. Drop version table extra columns ────────────────────────────────────
  await db.execute(sql`
    ALTER TABLE "_site_settings_v"
      DROP COLUMN IF EXISTS "snapshot",
      DROP COLUMN IF EXISTS "published_locale";

    ALTER TABLE "_about_v"
      DROP COLUMN IF EXISTS "snapshot",
      DROP COLUMN IF EXISTS "published_locale";

    ALTER TABLE "_impact_stories_v"
      DROP COLUMN IF EXISTS "snapshot",
      DROP COLUMN IF EXISTS "published_locale";
  `)

  // ─── 5. Drop enum types ─────────────────────────────────────────────────────
  await db.execute(sql`
    DROP TYPE IF EXISTS "public"."enum__impact_stories_v_published_locale";
    DROP TYPE IF EXISTS "public"."enum__about_v_published_locale";
    DROP TYPE IF EXISTS "public"."enum__site_settings_v_published_locale";
    DROP TYPE IF EXISTS "public"."enum__locales";
  `)
}
