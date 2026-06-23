import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_legal_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__legal_pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_site_settings_hero_media_style" AS ENUM('particles', 'video', 'image');
  CREATE TYPE "public"."enum__site_settings_v_version_hero_media_style" AS ENUM('particles', 'video', 'image');
  CREATE TABLE "legal_pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"privacy_policy_title" varchar DEFAULT 'Privacy Policy',
  	"privacy_policy" jsonb,
  	"terms_of_use_title" varchar DEFAULT 'Terms of Use',
  	"terms_of_use" jsonb,
  	"_status" "enum_legal_pages_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_legal_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_privacy_policy_title" varchar DEFAULT 'Privacy Policy',
  	"version_privacy_policy" jsonb,
  	"version_terms_of_use_title" varchar DEFAULT 'Terms of Use',
  	"version_terms_of_use" jsonb,
  	"version__status" "enum__legal_pages_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "navigation_header_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL,
  	"is_external" boolean DEFAULT false,
  	"is_visible" boolean DEFAULT true
  );
  
  CREATE TABLE "navigation_footer_groups_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL,
  	"is_external" boolean DEFAULT false
  );
  
  CREATE TABLE "navigation_footer_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL
  );
  
  CREATE TABLE "navigation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_seo" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"home_title" varchar,
  	"home_description" varchar,
  	"home_og_image_id" integer,
  	"about_title" varchar,
  	"about_description" varchar,
  	"about_og_image_id" integer,
  	"research_title" varchar,
  	"research_description" varchar,
  	"research_og_image_id" integer,
  	"projects_title" varchar,
  	"projects_description" varchar,
  	"projects_og_image_id" integer,
  	"publications_title" varchar,
  	"publications_description" varchar,
  	"publications_og_image_id" integer,
  	"collaborations_title" varchar,
  	"collaborations_description" varchar,
  	"collaborations_og_image_id" integer,
  	"impact_title" varchar,
  	"impact_description" varchar,
  	"impact_og_image_id" integer,
  	"news_title" varchar,
  	"news_description" varchar,
  	"news_og_image_id" integer,
  	"blog_title" varchar,
  	"blog_description" varchar,
  	"blog_og_image_id" integer,
  	"join_title" varchar,
  	"join_description" varchar,
  	"join_og_image_id" integer,
  	"contact_title" varchar,
  	"contact_description" varchar,
  	"contact_og_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "media" ADD COLUMN "source_url" varchar;
  ALTER TABLE "media" ADD COLUMN "source_author" varchar;
  ALTER TABLE "media" ADD COLUMN "source_license" varchar;
  ALTER TABLE "media" ADD COLUMN "is_demo" boolean DEFAULT false;
  ALTER TABLE "research_themes" ADD COLUMN "theme_image_id" integer;
  ALTER TABLE "research_themes" ADD COLUMN "is_demo" boolean DEFAULT false;
  ALTER TABLE "people" ADD COLUMN "is_demo" boolean DEFAULT false;
  ALTER TABLE "projects" ADD COLUMN "is_demo" boolean DEFAULT false;
  ALTER TABLE "study_sites" ADD COLUMN "is_demo" boolean DEFAULT false;
  ALTER TABLE "collaborators" ADD COLUMN "is_demo" boolean DEFAULT false;
  ALTER TABLE "blog_posts" ADD COLUMN "is_demo" boolean DEFAULT false;
  ALTER TABLE "_blog_posts_v" ADD COLUMN "version_is_demo" boolean DEFAULT false;
  ALTER TABLE "news_events" ADD COLUMN "is_demo" boolean DEFAULT false;
  ALTER TABLE "_news_events_v" ADD COLUMN "version_is_demo" boolean DEFAULT false;
  ALTER TABLE "open_positions" ADD COLUMN "is_demo" boolean DEFAULT false;
  ALTER TABLE "impact_stories" ADD COLUMN "is_demo" boolean DEFAULT false;
  ALTER TABLE "_impact_stories_v" ADD COLUMN "version_is_demo" boolean DEFAULT false;
  ALTER TABLE "inquiries" ADD COLUMN "position_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "logo_dark_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "hero_media_style" "enum_site_settings_hero_media_style" DEFAULT 'particles';
  ALTER TABLE "site_settings" ADD COLUMN "hero_media_video_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "hero_media_image_id" integer;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_logo_dark_id" integer;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_hero_media_style" "enum__site_settings_v_version_hero_media_style" DEFAULT 'particles';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_hero_media_video_id" integer;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_hero_media_image_id" integer;
  ALTER TABLE "navigation_header_links" ADD CONSTRAINT "navigation_header_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_groups_links" ADD CONSTRAINT "navigation_footer_groups_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_footer_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_groups" ADD CONSTRAINT "navigation_footer_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_seo" ADD CONSTRAINT "page_seo_home_og_image_id_media_id_fk" FOREIGN KEY ("home_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_seo" ADD CONSTRAINT "page_seo_about_og_image_id_media_id_fk" FOREIGN KEY ("about_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_seo" ADD CONSTRAINT "page_seo_research_og_image_id_media_id_fk" FOREIGN KEY ("research_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_seo" ADD CONSTRAINT "page_seo_projects_og_image_id_media_id_fk" FOREIGN KEY ("projects_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_seo" ADD CONSTRAINT "page_seo_publications_og_image_id_media_id_fk" FOREIGN KEY ("publications_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_seo" ADD CONSTRAINT "page_seo_collaborations_og_image_id_media_id_fk" FOREIGN KEY ("collaborations_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_seo" ADD CONSTRAINT "page_seo_impact_og_image_id_media_id_fk" FOREIGN KEY ("impact_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_seo" ADD CONSTRAINT "page_seo_news_og_image_id_media_id_fk" FOREIGN KEY ("news_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_seo" ADD CONSTRAINT "page_seo_blog_og_image_id_media_id_fk" FOREIGN KEY ("blog_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_seo" ADD CONSTRAINT "page_seo_join_og_image_id_media_id_fk" FOREIGN KEY ("join_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_seo" ADD CONSTRAINT "page_seo_contact_og_image_id_media_id_fk" FOREIGN KEY ("contact_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "legal_pages__status_idx" ON "legal_pages" USING btree ("_status");
  CREATE INDEX "_legal_pages_v_version_version__status_idx" ON "_legal_pages_v" USING btree ("version__status");
  CREATE INDEX "_legal_pages_v_created_at_idx" ON "_legal_pages_v" USING btree ("created_at");
  CREATE INDEX "_legal_pages_v_updated_at_idx" ON "_legal_pages_v" USING btree ("updated_at");
  CREATE INDEX "_legal_pages_v_latest_idx" ON "_legal_pages_v" USING btree ("latest");
  CREATE INDEX "navigation_header_links_order_idx" ON "navigation_header_links" USING btree ("_order");
  CREATE INDEX "navigation_header_links_parent_id_idx" ON "navigation_header_links" USING btree ("_parent_id");
  CREATE INDEX "navigation_footer_groups_links_order_idx" ON "navigation_footer_groups_links" USING btree ("_order");
  CREATE INDEX "navigation_footer_groups_links_parent_id_idx" ON "navigation_footer_groups_links" USING btree ("_parent_id");
  CREATE INDEX "navigation_footer_groups_order_idx" ON "navigation_footer_groups" USING btree ("_order");
  CREATE INDEX "navigation_footer_groups_parent_id_idx" ON "navigation_footer_groups" USING btree ("_parent_id");
  CREATE INDEX "page_seo_home_home_og_image_idx" ON "page_seo" USING btree ("home_og_image_id");
  CREATE INDEX "page_seo_about_about_og_image_idx" ON "page_seo" USING btree ("about_og_image_id");
  CREATE INDEX "page_seo_research_research_og_image_idx" ON "page_seo" USING btree ("research_og_image_id");
  CREATE INDEX "page_seo_projects_projects_og_image_idx" ON "page_seo" USING btree ("projects_og_image_id");
  CREATE INDEX "page_seo_publications_publications_og_image_idx" ON "page_seo" USING btree ("publications_og_image_id");
  CREATE INDEX "page_seo_collaborations_collaborations_og_image_idx" ON "page_seo" USING btree ("collaborations_og_image_id");
  CREATE INDEX "page_seo_impact_impact_og_image_idx" ON "page_seo" USING btree ("impact_og_image_id");
  CREATE INDEX "page_seo_news_news_og_image_idx" ON "page_seo" USING btree ("news_og_image_id");
  CREATE INDEX "page_seo_blog_blog_og_image_idx" ON "page_seo" USING btree ("blog_og_image_id");
  CREATE INDEX "page_seo_join_join_og_image_idx" ON "page_seo" USING btree ("join_og_image_id");
  CREATE INDEX "page_seo_contact_contact_og_image_idx" ON "page_seo" USING btree ("contact_og_image_id");
  ALTER TABLE "research_themes" ADD CONSTRAINT "research_themes_theme_image_id_media_id_fk" FOREIGN KEY ("theme_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_dark_id_media_id_fk" FOREIGN KEY ("logo_dark_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_hero_media_video_id_media_id_fk" FOREIGN KEY ("hero_media_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_hero_media_image_id_media_id_fk" FOREIGN KEY ("hero_media_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_logo_dark_id_media_id_fk" FOREIGN KEY ("version_logo_dark_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_hero_media_video_id_media_id_fk" FOREIGN KEY ("version_hero_media_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_hero_media_image_id_media_id_fk" FOREIGN KEY ("version_hero_media_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "research_themes_theme_image_idx" ON "research_themes" USING btree ("theme_image_id");
  CREATE INDEX "site_settings_logo_dark_idx" ON "site_settings" USING btree ("logo_dark_id");
  CREATE INDEX "site_settings_hero_media_hero_media_video_idx" ON "site_settings" USING btree ("hero_media_video_id");
  CREATE INDEX "site_settings_hero_media_hero_media_image_idx" ON "site_settings" USING btree ("hero_media_image_id");
  CREATE INDEX "_site_settings_v_version_version_logo_dark_idx" ON "_site_settings_v" USING btree ("version_logo_dark_id");
  CREATE INDEX "_site_settings_v_version_hero_media_version_hero_media_v_idx" ON "_site_settings_v" USING btree ("version_hero_media_video_id");
  CREATE INDEX "_site_settings_v_version_hero_media_version_hero_media_i_idx" ON "_site_settings_v" USING btree ("version_hero_media_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "legal_pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_legal_pages_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_header_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_footer_groups_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_footer_groups" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_seo" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "legal_pages" CASCADE;
  DROP TABLE "_legal_pages_v" CASCADE;
  DROP TABLE "navigation_header_links" CASCADE;
  DROP TABLE "navigation_footer_groups_links" CASCADE;
  DROP TABLE "navigation_footer_groups" CASCADE;
  DROP TABLE "navigation" CASCADE;
  DROP TABLE "page_seo" CASCADE;
  ALTER TABLE "research_themes" DROP CONSTRAINT "research_themes_theme_image_id_media_id_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_logo_dark_id_media_id_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_hero_media_video_id_media_id_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_hero_media_image_id_media_id_fk";
  
  ALTER TABLE "_site_settings_v" DROP CONSTRAINT "_site_settings_v_version_logo_dark_id_media_id_fk";
  
  ALTER TABLE "_site_settings_v" DROP CONSTRAINT "_site_settings_v_version_hero_media_video_id_media_id_fk";
  
  ALTER TABLE "_site_settings_v" DROP CONSTRAINT "_site_settings_v_version_hero_media_image_id_media_id_fk";
  
  DROP INDEX "research_themes_theme_image_idx";
  DROP INDEX "site_settings_logo_dark_idx";
  DROP INDEX "site_settings_hero_media_hero_media_video_idx";
  DROP INDEX "site_settings_hero_media_hero_media_image_idx";
  DROP INDEX "_site_settings_v_version_version_logo_dark_idx";
  DROP INDEX "_site_settings_v_version_hero_media_version_hero_media_v_idx";
  DROP INDEX "_site_settings_v_version_hero_media_version_hero_media_i_idx";
  ALTER TABLE "blog_posts" DROP COLUMN "is_demo";
  ALTER TABLE "_blog_posts_v" DROP COLUMN "version_is_demo";
  ALTER TABLE "news_events" DROP COLUMN "is_demo";
  ALTER TABLE "_news_events_v" DROP COLUMN "version_is_demo";
  ALTER TABLE "open_positions" DROP COLUMN "is_demo";
  ALTER TABLE "impact_stories" DROP COLUMN "is_demo";
  ALTER TABLE "_impact_stories_v" DROP COLUMN "version_is_demo";
  ALTER TABLE "projects" DROP COLUMN "is_demo";
  ALTER TABLE "research_themes" DROP COLUMN "theme_image_id";
  ALTER TABLE "research_themes" DROP COLUMN "is_demo";
  ALTER TABLE "study_sites" DROP COLUMN "is_demo";
  ALTER TABLE "people" DROP COLUMN "is_demo";
  ALTER TABLE "collaborators" DROP COLUMN "is_demo";
  ALTER TABLE "media" DROP COLUMN "source_url";
  ALTER TABLE "media" DROP COLUMN "source_author";
  ALTER TABLE "media" DROP COLUMN "source_license";
  ALTER TABLE "media" DROP COLUMN "is_demo";
  ALTER TABLE "inquiries" DROP COLUMN "position_title";
  ALTER TABLE "site_settings" DROP COLUMN "logo_dark_id";
  ALTER TABLE "site_settings" DROP COLUMN "hero_media_style";
  ALTER TABLE "site_settings" DROP COLUMN "hero_media_video_id";
  ALTER TABLE "site_settings" DROP COLUMN "hero_media_image_id";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_logo_dark_id";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_hero_media_style";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_hero_media_video_id";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_hero_media_image_id";
  DROP TYPE "public"."enum_legal_pages_status";
  DROP TYPE "public"."enum__legal_pages_v_version_status";
  DROP TYPE "public"."enum_site_settings_hero_media_style";
  DROP TYPE "public"."enum__site_settings_v_version_hero_media_style";`)
}
