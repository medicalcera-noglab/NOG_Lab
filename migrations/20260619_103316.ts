import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_impact_stories_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__impact_stories_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_about_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__about_v_version_status" AS ENUM('draft', 'published');

  CREATE TABLE "impact_stories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"status" "enum_impact_stories_status" DEFAULT 'draft',
  	"published_at" timestamp(3) with time zone,
  	"cover_id" integer,
  	"body" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_impact_stories_status" DEFAULT 'draft'
  );

  CREATE TABLE "impact_stories_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"projects_id" integer
  );

  CREATE TABLE "_impact_stories_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_status" "enum__impact_stories_v_version_status" DEFAULT 'draft',
  	"version_published_at" timestamp(3) with time zone,
  	"version_cover_id" integer,
  	"version_body" jsonb,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__impact_stories_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );

  CREATE TABLE "_impact_stories_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"projects_id" integer
  );

  CREATE TABLE "media_coverage" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"outlet" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"logo_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "about_facilities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar
  );

  CREATE TABLE "about_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"name" varchar,
  	"role" varchar,
  	"photo_id" integer
  );

  CREATE TABLE "about" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"mission" jsonb,
  	"director_message" jsonb,
  	"director_portrait_id" integer,
  	"kmu_affiliation" jsonb,
  	"_status" "enum_about_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );

  CREATE TABLE "_about_v_version_facilities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );

  CREATE TABLE "_about_v_version_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"name" varchar,
  	"role" varchar,
  	"photo_id" integer,
  	"_uuid" varchar
  );

  CREATE TABLE "_about_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_mission" jsonb,
  	"version_director_message" jsonb,
  	"version_director_portrait_id" integer,
  	"version_kmu_affiliation" jsonb,
  	"version__status" "enum__about_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );

  ALTER TABLE "blog_posts" ADD COLUMN "scheduled_publish_at" timestamp(3) with time zone;
  ALTER TABLE "_blog_posts_v" ADD COLUMN "version_scheduled_publish_at" timestamp(3) with time zone;
  ALTER TABLE "news_events" ADD COLUMN "slug" varchar;
  ALTER TABLE "_news_events_v" ADD COLUMN "version_slug" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "impact_stories_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "media_coverage_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "google_maps_embed_url" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "no_open_positions_message" varchar DEFAULT 'We have no open positions at this time. Check back soon or send a general inquiry.';
  ALTER TABLE "site_settings" ADD COLUMN "contact_email" varchar;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_google_maps_embed_url" varchar;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_no_open_positions_message" varchar DEFAULT 'We have no open positions at this time. Check back soon or send a general inquiry.';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_contact_email" varchar;

  ALTER TABLE "impact_stories" ADD CONSTRAINT "impact_stories_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "impact_stories_rels" ADD CONSTRAINT "impact_stories_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."impact_stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "impact_stories_rels" ADD CONSTRAINT "impact_stories_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_impact_stories_v" ADD CONSTRAINT "_impact_stories_v_parent_id_impact_stories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."impact_stories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_impact_stories_v" ADD CONSTRAINT "_impact_stories_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_impact_stories_v_rels" ADD CONSTRAINT "_impact_stories_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_impact_stories_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_impact_stories_v_rels" ADD CONSTRAINT "_impact_stories_v_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_coverage" ADD CONSTRAINT "media_coverage_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_facilities" ADD CONSTRAINT "about_facilities_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_facilities" ADD CONSTRAINT "about_facilities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_testimonials" ADD CONSTRAINT "about_testimonials_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_testimonials" ADD CONSTRAINT "about_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about" ADD CONSTRAINT "about_director_portrait_id_media_id_fk" FOREIGN KEY ("director_portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_about_v_version_facilities" ADD CONSTRAINT "_about_v_version_facilities_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_about_v_version_facilities" ADD CONSTRAINT "_about_v_version_facilities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_about_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_about_v_version_testimonials" ADD CONSTRAINT "_about_v_version_testimonials_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_about_v_version_testimonials" ADD CONSTRAINT "_about_v_version_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_about_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_about_v" ADD CONSTRAINT "_about_v_version_director_portrait_id_media_id_fk" FOREIGN KEY ("version_director_portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_impact_stories_fk" FOREIGN KEY ("impact_stories_id") REFERENCES "public"."impact_stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_coverage_fk" FOREIGN KEY ("media_coverage_id") REFERENCES "public"."media_coverage"("id") ON DELETE cascade ON UPDATE no action;

  CREATE UNIQUE INDEX "impact_stories_slug_idx" ON "impact_stories" USING btree ("slug");
  CREATE INDEX "impact_stories_cover_idx" ON "impact_stories" USING btree ("cover_id");
  CREATE INDEX "impact_stories_updated_at_idx" ON "impact_stories" USING btree ("updated_at");
  CREATE INDEX "impact_stories_created_at_idx" ON "impact_stories" USING btree ("created_at");
  CREATE INDEX "impact_stories__status_idx" ON "impact_stories" USING btree ("_status");
  CREATE INDEX "impact_stories_rels_order_idx" ON "impact_stories_rels" USING btree ("order");
  CREATE INDEX "impact_stories_rels_parent_idx" ON "impact_stories_rels" USING btree ("parent_id");
  CREATE INDEX "impact_stories_rels_path_idx" ON "impact_stories_rels" USING btree ("path");
  CREATE INDEX "impact_stories_rels_projects_id_idx" ON "impact_stories_rels" USING btree ("projects_id");
  CREATE INDEX "_impact_stories_v_parent_idx" ON "_impact_stories_v" USING btree ("parent_id");
  CREATE INDEX "_impact_stories_v_version_version_slug_idx" ON "_impact_stories_v" USING btree ("version_slug");
  CREATE INDEX "_impact_stories_v_version_version_cover_idx" ON "_impact_stories_v" USING btree ("version_cover_id");
  CREATE INDEX "_impact_stories_v_version_version_updated_at_idx" ON "_impact_stories_v" USING btree ("version_updated_at");
  CREATE INDEX "_impact_stories_v_version_version_created_at_idx" ON "_impact_stories_v" USING btree ("version_created_at");
  CREATE INDEX "_impact_stories_v_version_version__status_idx" ON "_impact_stories_v" USING btree ("version__status");
  CREATE INDEX "_impact_stories_v_created_at_idx" ON "_impact_stories_v" USING btree ("created_at");
  CREATE INDEX "_impact_stories_v_updated_at_idx" ON "_impact_stories_v" USING btree ("updated_at");
  CREATE INDEX "_impact_stories_v_latest_idx" ON "_impact_stories_v" USING btree ("latest");
  CREATE INDEX "_impact_stories_v_rels_order_idx" ON "_impact_stories_v_rels" USING btree ("order");
  CREATE INDEX "_impact_stories_v_rels_parent_idx" ON "_impact_stories_v_rels" USING btree ("parent_id");
  CREATE INDEX "_impact_stories_v_rels_path_idx" ON "_impact_stories_v_rels" USING btree ("path");
  CREATE INDEX "_impact_stories_v_rels_projects_id_idx" ON "_impact_stories_v_rels" USING btree ("projects_id");
  CREATE INDEX "media_coverage_logo_idx" ON "media_coverage" USING btree ("logo_id");
  CREATE INDEX "media_coverage_updated_at_idx" ON "media_coverage" USING btree ("updated_at");
  CREATE INDEX "media_coverage_created_at_idx" ON "media_coverage" USING btree ("created_at");
  CREATE INDEX "about_facilities_order_idx" ON "about_facilities" USING btree ("_order");
  CREATE INDEX "about_facilities_parent_id_idx" ON "about_facilities" USING btree ("_parent_id");
  CREATE INDEX "about_facilities_image_idx" ON "about_facilities" USING btree ("image_id");
  CREATE INDEX "about_testimonials_order_idx" ON "about_testimonials" USING btree ("_order");
  CREATE INDEX "about_testimonials_parent_id_idx" ON "about_testimonials" USING btree ("_parent_id");
  CREATE INDEX "about_testimonials_photo_idx" ON "about_testimonials" USING btree ("photo_id");
  CREATE INDEX "about_director_portrait_idx" ON "about" USING btree ("director_portrait_id");
  CREATE INDEX "about__status_idx" ON "about" USING btree ("_status");
  CREATE INDEX "_about_v_version_facilities_order_idx" ON "_about_v_version_facilities" USING btree ("_order");
  CREATE INDEX "_about_v_version_facilities_parent_id_idx" ON "_about_v_version_facilities" USING btree ("_parent_id");
  CREATE INDEX "_about_v_version_facilities_image_idx" ON "_about_v_version_facilities" USING btree ("image_id");
  CREATE INDEX "_about_v_version_testimonials_order_idx" ON "_about_v_version_testimonials" USING btree ("_order");
  CREATE INDEX "_about_v_version_testimonials_parent_id_idx" ON "_about_v_version_testimonials" USING btree ("_parent_id");
  CREATE INDEX "_about_v_version_testimonials_photo_idx" ON "_about_v_version_testimonials" USING btree ("photo_id");
  CREATE INDEX "_about_v_version_version_director_portrait_idx" ON "_about_v" USING btree ("version_director_portrait_id");
  CREATE INDEX "_about_v_version_version__status_idx" ON "_about_v" USING btree ("version__status");
  CREATE INDEX "_about_v_created_at_idx" ON "_about_v" USING btree ("created_at");
  CREATE INDEX "_about_v_updated_at_idx" ON "_about_v" USING btree ("updated_at");
  CREATE INDEX "_about_v_latest_idx" ON "_about_v" USING btree ("latest");
  CREATE UNIQUE INDEX "news_events_slug_idx" ON "news_events" USING btree ("slug");
  CREATE INDEX "_news_events_v_version_version_slug_idx" ON "_news_events_v" USING btree ("version_slug");
  CREATE INDEX "payload_locked_documents_rels_impact_stories_id_idx" ON "payload_locked_documents_rels" USING btree ("impact_stories_id");
  CREATE INDEX "payload_locked_documents_rels_media_coverage_id_idx" ON "payload_locked_documents_rels" USING btree ("media_coverage_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "impact_stories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "impact_stories_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_impact_stories_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_impact_stories_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "media_coverage" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_facilities" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_about_v_version_facilities" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_about_v_version_testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_about_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "impact_stories" CASCADE;
  DROP TABLE "impact_stories_rels" CASCADE;
  DROP TABLE "_impact_stories_v" CASCADE;
  DROP TABLE "_impact_stories_v_rels" CASCADE;
  DROP TABLE "media_coverage" CASCADE;
  DROP TABLE "about_facilities" CASCADE;
  DROP TABLE "about_testimonials" CASCADE;
  DROP TABLE "about" CASCADE;
  DROP TABLE "_about_v_version_facilities" CASCADE;
  DROP TABLE "_about_v_version_testimonials" CASCADE;
  DROP TABLE "_about_v" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_impact_stories_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_media_coverage_fk";
  DROP INDEX "news_events_slug_idx";
  DROP INDEX "_news_events_v_version_version_slug_idx";
  DROP INDEX "payload_locked_documents_rels_impact_stories_id_idx";
  DROP INDEX "payload_locked_documents_rels_media_coverage_id_idx";
  ALTER TABLE "blog_posts" DROP COLUMN "scheduled_publish_at";
  ALTER TABLE "_blog_posts_v" DROP COLUMN "version_scheduled_publish_at";
  ALTER TABLE "news_events" DROP COLUMN "slug";
  ALTER TABLE "_news_events_v" DROP COLUMN "version_slug";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "impact_stories_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "media_coverage_id";
  ALTER TABLE "site_settings" DROP COLUMN "google_maps_embed_url";
  ALTER TABLE "site_settings" DROP COLUMN "no_open_positions_message";
  ALTER TABLE "site_settings" DROP COLUMN "contact_email";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_google_maps_embed_url";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_no_open_positions_message";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_contact_email";
  DROP TYPE "public"."enum_impact_stories_status";
  DROP TYPE "public"."enum__impact_stories_v_version_status";
  DROP TYPE "public"."enum_about_status";
  DROP TYPE "public"."enum__about_v_version_status";`)
}
