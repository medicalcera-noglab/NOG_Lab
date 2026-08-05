import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Create enum types (IF NOT EXISTS for safety)
  await db.execute(sql`
    DO $$ BEGIN CREATE TYPE "public"."enum_outreach_activities_status" AS ENUM('draft', 'published'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__outreach_activities_v_version_status" AS ENUM('draft', 'published'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_outreach_page_status" AS ENUM('draft', 'published'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__outreach_page_v_version_status" AS ENUM('draft', 'published'); EXCEPTION WHEN duplicate_object THEN null; END $$;
  `)

  // Create tables (IF NOT EXISTS for idempotency)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "outreach_activities_gallery" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "image_id" integer,
      "caption" varchar
    );

    CREATE TABLE IF NOT EXISTS "outreach_activities_partner_orgs" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "name" varchar
    );

    CREATE TABLE IF NOT EXISTS "outreach_activities" (
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar,
      "slug" varchar,
      "date" timestamp(3) with time zone,
      "location" varchar,
      "short_description" varchar,
      "body" jsonb,
      "cover_image_id" integer,
      "related_project_id" integer,
      "status" "enum_outreach_activities_status" DEFAULT 'draft',
      "published_at" timestamp(3) with time zone,
      "is_demo" boolean DEFAULT false,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "_status" "enum_outreach_activities_status" DEFAULT 'draft'
    );

    CREATE TABLE IF NOT EXISTS "_outreach_activities_v_version_gallery" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "image_id" integer,
      "caption" varchar,
      "_uuid" varchar
    );

    CREATE TABLE IF NOT EXISTS "_outreach_activities_v_version_partner_orgs" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar,
      "_uuid" varchar
    );

    CREATE TABLE IF NOT EXISTS "_outreach_activities_v" (
      "id" serial PRIMARY KEY NOT NULL,
      "parent_id" integer,
      "version_title" varchar,
      "version_slug" varchar,
      "version_date" timestamp(3) with time zone,
      "version_location" varchar,
      "version_short_description" varchar,
      "version_body" jsonb,
      "version_cover_image_id" integer,
      "version_related_project_id" integer,
      "version_status" "enum__outreach_activities_v_version_status" DEFAULT 'draft',
      "version_published_at" timestamp(3) with time zone,
      "version_is_demo" boolean DEFAULT false,
      "version_updated_at" timestamp(3) with time zone,
      "version_created_at" timestamp(3) with time zone,
      "version__status" "enum__outreach_activities_v_version_status" DEFAULT 'draft',
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "latest" boolean
    );

    CREATE TABLE IF NOT EXISTS "people_education" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "degree" varchar NOT NULL,
      "institution" varchar NOT NULL,
      "country" varchar,
      "start_year" varchar,
      "end_year" varchar
    );

    CREATE TABLE IF NOT EXISTS "people_experience" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "role" varchar NOT NULL,
      "institution" varchar NOT NULL,
      "country" varchar,
      "start_year" varchar,
      "end_year" varchar
    );

    CREATE TABLE IF NOT EXISTS "people_grants" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "title" varchar NOT NULL,
      "funder" varchar,
      "year" varchar
    );

    CREATE TABLE IF NOT EXISTS "outreach_page" (
      "id" serial PRIMARY KEY NOT NULL,
      "intro_text" jsonb,
      "section_title" varchar DEFAULT 'Community Outreach and Engagement Activities',
      "_status" "enum_outreach_page_status" DEFAULT 'draft',
      "updated_at" timestamp(3) with time zone,
      "created_at" timestamp(3) with time zone
    );

    CREATE TABLE IF NOT EXISTS "_outreach_page_v" (
      "id" serial PRIMARY KEY NOT NULL,
      "version_intro_text" jsonb,
      "version_section_title" varchar DEFAULT 'Community Outreach and Engagement Activities',
      "version__status" "enum__outreach_page_v_version_status" DEFAULT 'draft',
      "version_updated_at" timestamp(3) with time zone,
      "version_created_at" timestamp(3) with time zone,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "latest" boolean
    );
  `)

  // Drop constraints & indexes safely (they may already be gone)
  await db.execute(sql`
    DO $$ BEGIN ALTER TABLE "inquiries" DROP CONSTRAINT IF EXISTS "inquiries_cv_id_applicant_files_id_fk"; EXCEPTION WHEN undefined_object THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "inquiries" DROP CONSTRAINT IF EXISTS "inquiries_sop_id_applicant_files_id_fk"; EXCEPTION WHEN undefined_object THEN null; END $$;
    DROP INDEX IF EXISTS "inquiries_cv_idx";
    DROP INDEX IF EXISTS "inquiries_sop_idx";
  `)

  // ADD COLUMN IF NOT EXISTS for all column additions
  await db.execute(sql`
    ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "scopus" varchar;
    ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "academic_title" varchar;
    ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "institution" varchar;
    ALTER TABLE "inquiries" ADD COLUMN IF NOT EXISTS "cv_filename" varchar;
    ALTER TABLE "inquiries" ADD COLUMN IF NOT EXISTS "cv_url" varchar;
    ALTER TABLE "inquiries" ADD COLUMN IF NOT EXISTS "sop_filename" varchar;
    ALTER TABLE "inquiries" ADD COLUMN IF NOT EXISTS "sop_url" varchar;
    ALTER TABLE "inquiries" ADD COLUMN IF NOT EXISTS "reply_text" varchar;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "outreach_activities_id" integer;
    ALTER TABLE "page_seo" ADD COLUMN IF NOT EXISTS "outreach_title" varchar;
    ALTER TABLE "page_seo" ADD COLUMN IF NOT EXISTS "outreach_description" varchar;
    ALTER TABLE "page_seo" ADD COLUMN IF NOT EXISTS "outreach_og_image_id" integer;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "hero_subline" varchar;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "hero_motto" varchar;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "founding_year" numeric;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "home_sections_show_about_teaser" boolean DEFAULT true;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "home_sections_show_about_full" boolean DEFAULT true;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "home_sections_show_featured_project" boolean DEFAULT true;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "home_sections_show_projects_grid" boolean DEFAULT true;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "home_sections_show_map" boolean DEFAULT true;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "home_sections_show_publications" boolean DEFAULT true;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "home_sections_show_team" boolean DEFAULT true;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "home_sections_show_news" boolean DEFAULT true;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "home_sections_show_partners" boolean DEFAULT true;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "blog_settings_show_articles" boolean DEFAULT true;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "blog_settings_show_news_events" boolean DEFAULT true;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "cookie_consent_enabled" boolean DEFAULT true;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "cookie_consent_description" varchar;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "cookie_consent_accept_label" varchar;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "cookie_consent_decline_label" varchar;
    ALTER TABLE "_site_settings_v" ADD COLUMN IF NOT EXISTS "version_hero_subline" varchar;
    ALTER TABLE "_site_settings_v" ADD COLUMN IF NOT EXISTS "version_hero_motto" varchar;
    ALTER TABLE "_site_settings_v" ADD COLUMN IF NOT EXISTS "version_founding_year" numeric;
    ALTER TABLE "_site_settings_v" ADD COLUMN IF NOT EXISTS "version_home_sections_show_about_teaser" boolean DEFAULT true;
    ALTER TABLE "_site_settings_v" ADD COLUMN IF NOT EXISTS "version_home_sections_show_about_full" boolean DEFAULT true;
    ALTER TABLE "_site_settings_v" ADD COLUMN IF NOT EXISTS "version_home_sections_show_featured_project" boolean DEFAULT true;
    ALTER TABLE "_site_settings_v" ADD COLUMN IF NOT EXISTS "version_home_sections_show_projects_grid" boolean DEFAULT true;
    ALTER TABLE "_site_settings_v" ADD COLUMN IF NOT EXISTS "version_home_sections_show_map" boolean DEFAULT true;
    ALTER TABLE "_site_settings_v" ADD COLUMN IF NOT EXISTS "version_home_sections_show_publications" boolean DEFAULT true;
    ALTER TABLE "_site_settings_v" ADD COLUMN IF NOT EXISTS "version_home_sections_show_team" boolean DEFAULT true;
    ALTER TABLE "_site_settings_v" ADD COLUMN IF NOT EXISTS "version_home_sections_show_news" boolean DEFAULT true;
    ALTER TABLE "_site_settings_v" ADD COLUMN IF NOT EXISTS "version_home_sections_show_partners" boolean DEFAULT true;
    ALTER TABLE "_site_settings_v" ADD COLUMN IF NOT EXISTS "version_blog_settings_show_articles" boolean DEFAULT true;
    ALTER TABLE "_site_settings_v" ADD COLUMN IF NOT EXISTS "version_blog_settings_show_news_events" boolean DEFAULT true;
    ALTER TABLE "_site_settings_v" ADD COLUMN IF NOT EXISTS "version_cookie_consent_enabled" boolean DEFAULT true;
    ALTER TABLE "_site_settings_v" ADD COLUMN IF NOT EXISTS "version_cookie_consent_description" varchar;
    ALTER TABLE "_site_settings_v" ADD COLUMN IF NOT EXISTS "version_cookie_consent_accept_label" varchar;
    ALTER TABLE "_site_settings_v" ADD COLUMN IF NOT EXISTS "version_cookie_consent_decline_label" varchar;
  `)

  // Foreign keys (safe — will error if already exist, so wrap in DO blocks)
  await db.execute(sql`
    DO $$ BEGIN ALTER TABLE "outreach_activities_gallery" ADD CONSTRAINT "outreach_activities_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "outreach_activities_gallery" ADD CONSTRAINT "outreach_activities_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."outreach_activities"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "outreach_activities_partner_orgs" ADD CONSTRAINT "outreach_activities_partner_orgs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."outreach_activities"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "outreach_activities" ADD CONSTRAINT "outreach_activities_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "outreach_activities" ADD CONSTRAINT "outreach_activities_related_project_id_projects_id_fk" FOREIGN KEY ("related_project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "_outreach_activities_v_version_gallery" ADD CONSTRAINT "_outreach_activities_v_version_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "_outreach_activities_v_version_gallery" ADD CONSTRAINT "_outreach_activities_v_version_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_outreach_activities_v"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "_outreach_activities_v_version_partner_orgs" ADD CONSTRAINT "_outreach_activities_v_version_partner_orgs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_outreach_activities_v"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "_outreach_activities_v" ADD CONSTRAINT "_outreach_activities_v_parent_id_outreach_activities_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."outreach_activities"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "_outreach_activities_v" ADD CONSTRAINT "_outreach_activities_v_version_cover_image_id_media_id_fk" FOREIGN KEY ("version_cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "_outreach_activities_v" ADD CONSTRAINT "_outreach_activities_v_version_related_project_id_projects_id_fk" FOREIGN KEY ("version_related_project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "people_education" ADD CONSTRAINT "people_education_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "people_experience" ADD CONSTRAINT "people_experience_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "people_grants" ADD CONSTRAINT "people_grants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_outreach_activities_fk" FOREIGN KEY ("outreach_activities_id") REFERENCES "public"."outreach_activities"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "page_seo" ADD CONSTRAINT "page_seo_outreach_og_image_id_media_id_fk" FOREIGN KEY ("outreach_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
  `)

  // Indexes (IF NOT EXISTS)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "outreach_activities_gallery_order_idx" ON "outreach_activities_gallery" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "outreach_activities_gallery_parent_id_idx" ON "outreach_activities_gallery" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "outreach_activities_gallery_image_idx" ON "outreach_activities_gallery" USING btree ("image_id");
    CREATE INDEX IF NOT EXISTS "outreach_activities_partner_orgs_order_idx" ON "outreach_activities_partner_orgs" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "outreach_activities_partner_orgs_parent_id_idx" ON "outreach_activities_partner_orgs" USING btree ("_parent_id");
    CREATE UNIQUE INDEX IF NOT EXISTS "outreach_activities_slug_idx" ON "outreach_activities" USING btree ("slug");
    CREATE INDEX IF NOT EXISTS "outreach_activities_cover_image_idx" ON "outreach_activities" USING btree ("cover_image_id");
    CREATE INDEX IF NOT EXISTS "outreach_activities_related_project_idx" ON "outreach_activities" USING btree ("related_project_id");
    CREATE INDEX IF NOT EXISTS "outreach_activities_updated_at_idx" ON "outreach_activities" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "outreach_activities_created_at_idx" ON "outreach_activities" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "outreach_activities__status_idx" ON "outreach_activities" USING btree ("_status");
    CREATE INDEX IF NOT EXISTS "_outreach_activities_v_version_gallery_order_idx" ON "_outreach_activities_v_version_gallery" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_outreach_activities_v_version_gallery_parent_id_idx" ON "_outreach_activities_v_version_gallery" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_outreach_activities_v_version_gallery_image_idx" ON "_outreach_activities_v_version_gallery" USING btree ("image_id");
    CREATE INDEX IF NOT EXISTS "_outreach_activities_v_version_partner_orgs_order_idx" ON "_outreach_activities_v_version_partner_orgs" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_outreach_activities_v_version_partner_orgs_parent_id_idx" ON "_outreach_activities_v_version_partner_orgs" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_outreach_activities_v_parent_idx" ON "_outreach_activities_v" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "_outreach_activities_v_version_version_slug_idx" ON "_outreach_activities_v" USING btree ("version_slug");
    CREATE INDEX IF NOT EXISTS "_outreach_activities_v_version_version_cover_image_idx" ON "_outreach_activities_v" USING btree ("version_cover_image_id");
    CREATE INDEX IF NOT EXISTS "_outreach_activities_v_version_version_related_project_idx" ON "_outreach_activities_v" USING btree ("version_related_project_id");
    CREATE INDEX IF NOT EXISTS "_outreach_activities_v_version_version_updated_at_idx" ON "_outreach_activities_v" USING btree ("version_updated_at");
    CREATE INDEX IF NOT EXISTS "_outreach_activities_v_version_version_created_at_idx" ON "_outreach_activities_v" USING btree ("version_created_at");
    CREATE INDEX IF NOT EXISTS "_outreach_activities_v_version_version__status_idx" ON "_outreach_activities_v" USING btree ("version__status");
    CREATE INDEX IF NOT EXISTS "_outreach_activities_v_created_at_idx" ON "_outreach_activities_v" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "_outreach_activities_v_updated_at_idx" ON "_outreach_activities_v" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "_outreach_activities_v_latest_idx" ON "_outreach_activities_v" USING btree ("latest");
    CREATE INDEX IF NOT EXISTS "people_education_order_idx" ON "people_education" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "people_education_parent_id_idx" ON "people_education" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "people_experience_order_idx" ON "people_experience" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "people_experience_parent_id_idx" ON "people_experience" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "people_grants_order_idx" ON "people_grants" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "people_grants_parent_id_idx" ON "people_grants" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "outreach_page__status_idx" ON "outreach_page" USING btree ("_status");
    CREATE INDEX IF NOT EXISTS "_outreach_page_v_version_version__status_idx" ON "_outreach_page_v" USING btree ("version__status");
    CREATE INDEX IF NOT EXISTS "_outreach_page_v_created_at_idx" ON "_outreach_page_v" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "_outreach_page_v_updated_at_idx" ON "_outreach_page_v" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "_outreach_page_v_latest_idx" ON "_outreach_page_v" USING btree ("latest");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_outreach_activities_id_idx" ON "payload_locked_documents_rels" USING btree ("outreach_activities_id");
    CREATE INDEX IF NOT EXISTS "page_seo_outreach_outreach_og_image_idx" ON "page_seo" USING btree ("outreach_og_image_id");
  `)

  // Drop old columns safely
  await db.execute(sql`
    ALTER TABLE "open_positions" DROP COLUMN IF EXISTS "is_demo";
    ALTER TABLE "inquiries" DROP COLUMN IF EXISTS "cv_id";
    ALTER TABLE "inquiries" DROP COLUMN IF EXISTS "sop_id";
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "outreach_activities_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "outreach_activities_partner_orgs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "outreach_activities" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_outreach_activities_v_version_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_outreach_activities_v_version_partner_orgs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_outreach_activities_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "people_education" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "people_experience" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "people_grants" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "outreach_page" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_outreach_page_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "outreach_activities_gallery" CASCADE;
  DROP TABLE "outreach_activities_partner_orgs" CASCADE;
  DROP TABLE "outreach_activities" CASCADE;
  DROP TABLE "_outreach_activities_v_version_gallery" CASCADE;
  DROP TABLE "_outreach_activities_v_version_partner_orgs" CASCADE;
  DROP TABLE "_outreach_activities_v" CASCADE;
  DROP TABLE "people_education" CASCADE;
  DROP TABLE "people_experience" CASCADE;
  DROP TABLE "people_grants" CASCADE;
  DROP TABLE "outreach_page" CASCADE;
  DROP TABLE "_outreach_page_v" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_outreach_activities_fk";
  
  ALTER TABLE "page_seo" DROP CONSTRAINT "page_seo_outreach_og_image_id_media_id_fk";
  
  DROP INDEX "payload_locked_documents_rels_outreach_activities_id_idx";
  DROP INDEX "page_seo_outreach_outreach_og_image_idx";
  ALTER TABLE "open_positions" ADD COLUMN "is_demo" boolean DEFAULT false;
  ALTER TABLE "inquiries" ADD COLUMN "cv_id" integer;
  ALTER TABLE "inquiries" ADD COLUMN "sop_id" integer;
  ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_cv_id_applicant_files_id_fk" FOREIGN KEY ("cv_id") REFERENCES "public"."applicant_files"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_sop_id_applicant_files_id_fk" FOREIGN KEY ("sop_id") REFERENCES "public"."applicant_files"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "inquiries_cv_idx" ON "inquiries" USING btree ("cv_id");
  CREATE INDEX "inquiries_sop_idx" ON "inquiries" USING btree ("sop_id");
  ALTER TABLE "people" DROP COLUMN "scopus";
  ALTER TABLE "people" DROP COLUMN "academic_title";
  ALTER TABLE "people" DROP COLUMN "institution";
  ALTER TABLE "inquiries" DROP COLUMN "cv_filename";
  ALTER TABLE "inquiries" DROP COLUMN "cv_url";
  ALTER TABLE "inquiries" DROP COLUMN "sop_filename";
  ALTER TABLE "inquiries" DROP COLUMN "sop_url";
  ALTER TABLE "inquiries" DROP COLUMN "reply_text";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "outreach_activities_id";
  ALTER TABLE "page_seo" DROP COLUMN "outreach_title";
  ALTER TABLE "page_seo" DROP COLUMN "outreach_description";
  ALTER TABLE "page_seo" DROP COLUMN "outreach_og_image_id";
  ALTER TABLE "site_settings" DROP COLUMN "hero_subline";
  ALTER TABLE "site_settings" DROP COLUMN "hero_motto";
  ALTER TABLE "site_settings" DROP COLUMN "founding_year";
  ALTER TABLE "site_settings" DROP COLUMN "home_sections_show_about_teaser";
  ALTER TABLE "site_settings" DROP COLUMN "home_sections_show_about_full";
  ALTER TABLE "site_settings" DROP COLUMN "home_sections_show_featured_project";
  ALTER TABLE "site_settings" DROP COLUMN "home_sections_show_projects_grid";
  ALTER TABLE "site_settings" DROP COLUMN "home_sections_show_map";
  ALTER TABLE "site_settings" DROP COLUMN "home_sections_show_publications";
  ALTER TABLE "site_settings" DROP COLUMN "home_sections_show_team";
  ALTER TABLE "site_settings" DROP COLUMN "home_sections_show_news";
  ALTER TABLE "site_settings" DROP COLUMN "home_sections_show_partners";
  ALTER TABLE "site_settings" DROP COLUMN "blog_settings_show_articles";
  ALTER TABLE "site_settings" DROP COLUMN "blog_settings_show_news_events";
  ALTER TABLE "site_settings" DROP COLUMN "cookie_consent_enabled";
  ALTER TABLE "site_settings" DROP COLUMN "cookie_consent_description";
  ALTER TABLE "site_settings" DROP COLUMN "cookie_consent_accept_label";
  ALTER TABLE "site_settings" DROP COLUMN "cookie_consent_decline_label";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_hero_subline";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_hero_motto";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_founding_year";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_home_sections_show_about_teaser";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_home_sections_show_about_full";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_home_sections_show_featured_project";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_home_sections_show_projects_grid";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_home_sections_show_map";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_home_sections_show_publications";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_home_sections_show_team";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_home_sections_show_news";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_home_sections_show_partners";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_blog_settings_show_articles";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_blog_settings_show_news_events";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_cookie_consent_enabled";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_cookie_consent_description";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_cookie_consent_accept_label";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_cookie_consent_decline_label";
  DROP TYPE "public"."enum_outreach_activities_status";
  DROP TYPE "public"."enum__outreach_activities_v_version_status";
  DROP TYPE "public"."enum_outreach_page_status";
  DROP TYPE "public"."enum__outreach_page_v_version_status";`)
}
