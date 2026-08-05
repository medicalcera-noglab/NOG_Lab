import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_inquiries_organization_type" AS ENUM('industry', 'academic', 'ngo', 'government', 'other');
  CREATE TYPE "public"."enum_partnerships_page_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__partnerships_page_v_version_status" AS ENUM('draft', 'published');
  ALTER TYPE "public"."enum_inquiries_form_type" ADD VALUE 'partnership';
  CREATE TABLE "partnerships_page_strengths" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"desc" varchar
  );
  
  CREATE TABLE "partnerships_page_offerings" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "partnerships_page_infrastructure_pillars" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "partnerships_page_sectors_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar
  );
  
  CREATE TABLE "partnerships_page_sectors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar
  );
  
  CREATE TABLE "partnerships_page_example_projects" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar
  );
  
  CREATE TABLE "partnerships_page_models" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"desc" varchar
  );
  
  CREATE TABLE "partnerships_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_eyebrow" varchar DEFAULT 'Research Partnerships',
  	"hero_title" varchar DEFAULT 'Access Real-World Population Data from Pakistan',
  	"hero_description" varchar DEFAULT 'Partner with our established community research network to generate high-quality real-world evidence. NOG Lab provides industry, academic, and global health partners with access to diverse populations in Pakistan including rural, underserved communities enabling population-based cohort studies, clinical trials, nutrition research, microbiome investigations and implementation research in authentic community settings.',
  	"why_partner_title" varchar DEFAULT 'Why Partner With Us?',
  	"why_partner_subtitle" varchar DEFAULT 'Our multidisciplinary team combines expertise in nutrition, microbiome (oral and gut), public health and community-based implementation research to deliver high-quality evidence from real-world populations.',
  	"what_we_offer_title" varchar DEFAULT 'What We Offer?',
  	"what_we_offer_subtitle" varchar DEFAULT 'Comprehensive population-based platforms, clinical trial support, longitudinal cohorts, sample biobanking, and analytics.',
  	"infrastructure_title" varchar DEFAULT 'Our Research Infrastructure',
  	"infrastructure_tagline" varchar DEFAULT 'From Community Research to Advanced Genomics',
  	"infrastructure_overview" varchar DEFAULT 'NOG Lab brings together a unique research ecosystem that combines community-based field research, clinical study infrastructure, laboratory sciences, and advanced genomic technologies. This integrated platform enables us to conduct high-quality research from participant recruitment and data collection in remote communities through to molecular analysis and next-generation sequencing.',
  	"who_we_work_with_title" varchar DEFAULT 'Who We Work With',
  	"who_we_work_with_subtitle" varchar DEFAULT 'We welcome collaborative partnerships across industry, academia, global health organizations, and public health agencies.',
  	"projects_title" varchar DEFAULT 'Example Collaboration Projects',
  	"projects_subtitle" varchar DEFAULT 'Demonstrated experience delivering high-quality evidence across nutrition, clinical interventions, and microbiome analytics.',
  	"models_title" varchar DEFAULT 'Partnership Models',
  	"models_subtitle" varchar DEFAULT 'We offer collaborative frameworks designed to meet the strategic and operational goals of academic, industry, and international partners.',
  	"collaborators_title" varchar DEFAULT 'Partner Institutions',
  	"collaborators_subtitle" varchar DEFAULT 'driving interdisciplinary microbiome research at a global scale.',
  	"cta_title" varchar DEFAULT 'Let''s Build Evidence Together',
  	"cta_description" varchar DEFAULT 'Whether you are developing a new nutritional intervention, validating diagnostic technologies, evaluating health products, or designing population-based studies, we welcome opportunities to collaborate. We work with academic institutions, industry partners, non-governmental organisations, and public health agencies to generate high-quality evidence that improves health outcomes in low- and middle-income countries.',
  	"cta_email" varchar DEFAULT 'research@noglabkmu.org',
  	"_status" "enum_partnerships_page_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_partnerships_page_v_version_strengths" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"desc" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_partnerships_page_v_version_offerings" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_partnerships_page_v_version_infrastructure_pillars" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_partnerships_page_v_version_sectors_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_partnerships_page_v_version_sectors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_partnerships_page_v_version_example_projects" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_partnerships_page_v_version_models" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"desc" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_partnerships_page_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_hero_eyebrow" varchar DEFAULT 'Research Partnerships',
  	"version_hero_title" varchar DEFAULT 'Access Real-World Population Data from Pakistan',
  	"version_hero_description" varchar DEFAULT 'Partner with our established community research network to generate high-quality real-world evidence. NOG Lab provides industry, academic, and global health partners with access to diverse populations in Pakistan including rural, underserved communities enabling population-based cohort studies, clinical trials, nutrition research, microbiome investigations and implementation research in authentic community settings.',
  	"version_why_partner_title" varchar DEFAULT 'Why Partner With Us?',
  	"version_why_partner_subtitle" varchar DEFAULT 'Our multidisciplinary team combines expertise in nutrition, microbiome (oral and gut), public health and community-based implementation research to deliver high-quality evidence from real-world populations.',
  	"version_what_we_offer_title" varchar DEFAULT 'What We Offer?',
  	"version_what_we_offer_subtitle" varchar DEFAULT 'Comprehensive population-based platforms, clinical trial support, longitudinal cohorts, sample biobanking, and analytics.',
  	"version_infrastructure_title" varchar DEFAULT 'Our Research Infrastructure',
  	"version_infrastructure_tagline" varchar DEFAULT 'From Community Research to Advanced Genomics',
  	"version_infrastructure_overview" varchar DEFAULT 'NOG Lab brings together a unique research ecosystem that combines community-based field research, clinical study infrastructure, laboratory sciences, and advanced genomic technologies. This integrated platform enables us to conduct high-quality research from participant recruitment and data collection in remote communities through to molecular analysis and next-generation sequencing.',
  	"version_who_we_work_with_title" varchar DEFAULT 'Who We Work With',
  	"version_who_we_work_with_subtitle" varchar DEFAULT 'We welcome collaborative partnerships across industry, academia, global health organizations, and public health agencies.',
  	"version_projects_title" varchar DEFAULT 'Example Collaboration Projects',
  	"version_projects_subtitle" varchar DEFAULT 'Demonstrated experience delivering high-quality evidence across nutrition, clinical interventions, and microbiome analytics.',
  	"version_models_title" varchar DEFAULT 'Partnership Models',
  	"version_models_subtitle" varchar DEFAULT 'We offer collaborative frameworks designed to meet the strategic and operational goals of academic, industry, and international partners.',
  	"version_collaborators_title" varchar DEFAULT 'Partner Institutions',
  	"version_collaborators_subtitle" varchar DEFAULT 'driving interdisciplinary microbiome research at a global scale.',
  	"version_cta_title" varchar DEFAULT 'Let''s Build Evidence Together',
  	"version_cta_description" varchar DEFAULT 'Whether you are developing a new nutritional intervention, validating diagnostic technologies, evaluating health products, or designing population-based studies, we welcome opportunities to collaborate. We work with academic institutions, industry partners, non-governmental organisations, and public health agencies to generate high-quality evidence that improves health outcomes in low- and middle-income countries.',
  	"version_cta_email" varchar DEFAULT 'research@noglabkmu.org',
  	"version__status" "enum__partnerships_page_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "inquiries" ADD COLUMN "organization" varchar;
  ALTER TABLE "inquiries" ADD COLUMN "organization_type" "enum_inquiries_organization_type";
  ALTER TABLE "inquiries" ADD COLUMN "research_interest" varchar;
  ALTER TABLE "partnerships_page_strengths" ADD CONSTRAINT "partnerships_page_strengths_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partnerships_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partnerships_page_offerings" ADD CONSTRAINT "partnerships_page_offerings_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partnerships_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partnerships_page_infrastructure_pillars" ADD CONSTRAINT "partnerships_page_infrastructure_pillars_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partnerships_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partnerships_page_sectors_items" ADD CONSTRAINT "partnerships_page_sectors_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partnerships_page_sectors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partnerships_page_sectors" ADD CONSTRAINT "partnerships_page_sectors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partnerships_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partnerships_page_example_projects" ADD CONSTRAINT "partnerships_page_example_projects_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partnerships_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partnerships_page_models" ADD CONSTRAINT "partnerships_page_models_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partnerships_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partnerships_page_v_version_strengths" ADD CONSTRAINT "_partnerships_page_v_version_strengths_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partnerships_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partnerships_page_v_version_offerings" ADD CONSTRAINT "_partnerships_page_v_version_offerings_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partnerships_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partnerships_page_v_version_infrastructure_pillars" ADD CONSTRAINT "_partnerships_page_v_version_infrastructure_pillars_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partnerships_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partnerships_page_v_version_sectors_items" ADD CONSTRAINT "_partnerships_page_v_version_sectors_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partnerships_page_v_version_sectors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partnerships_page_v_version_sectors" ADD CONSTRAINT "_partnerships_page_v_version_sectors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partnerships_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partnerships_page_v_version_example_projects" ADD CONSTRAINT "_partnerships_page_v_version_example_projects_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partnerships_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partnerships_page_v_version_models" ADD CONSTRAINT "_partnerships_page_v_version_models_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partnerships_page_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "partnerships_page_strengths_order_idx" ON "partnerships_page_strengths" USING btree ("_order");
  CREATE INDEX "partnerships_page_strengths_parent_id_idx" ON "partnerships_page_strengths" USING btree ("_parent_id");
  CREATE INDEX "partnerships_page_offerings_order_idx" ON "partnerships_page_offerings" USING btree ("_order");
  CREATE INDEX "partnerships_page_offerings_parent_id_idx" ON "partnerships_page_offerings" USING btree ("_parent_id");
  CREATE INDEX "partnerships_page_infrastructure_pillars_order_idx" ON "partnerships_page_infrastructure_pillars" USING btree ("_order");
  CREATE INDEX "partnerships_page_infrastructure_pillars_parent_id_idx" ON "partnerships_page_infrastructure_pillars" USING btree ("_parent_id");
  CREATE INDEX "partnerships_page_sectors_items_order_idx" ON "partnerships_page_sectors_items" USING btree ("_order");
  CREATE INDEX "partnerships_page_sectors_items_parent_id_idx" ON "partnerships_page_sectors_items" USING btree ("_parent_id");
  CREATE INDEX "partnerships_page_sectors_order_idx" ON "partnerships_page_sectors" USING btree ("_order");
  CREATE INDEX "partnerships_page_sectors_parent_id_idx" ON "partnerships_page_sectors" USING btree ("_parent_id");
  CREATE INDEX "partnerships_page_example_projects_order_idx" ON "partnerships_page_example_projects" USING btree ("_order");
  CREATE INDEX "partnerships_page_example_projects_parent_id_idx" ON "partnerships_page_example_projects" USING btree ("_parent_id");
  CREATE INDEX "partnerships_page_models_order_idx" ON "partnerships_page_models" USING btree ("_order");
  CREATE INDEX "partnerships_page_models_parent_id_idx" ON "partnerships_page_models" USING btree ("_parent_id");
  CREATE INDEX "partnerships_page__status_idx" ON "partnerships_page" USING btree ("_status");
  CREATE INDEX "_partnerships_page_v_version_strengths_order_idx" ON "_partnerships_page_v_version_strengths" USING btree ("_order");
  CREATE INDEX "_partnerships_page_v_version_strengths_parent_id_idx" ON "_partnerships_page_v_version_strengths" USING btree ("_parent_id");
  CREATE INDEX "_partnerships_page_v_version_offerings_order_idx" ON "_partnerships_page_v_version_offerings" USING btree ("_order");
  CREATE INDEX "_partnerships_page_v_version_offerings_parent_id_idx" ON "_partnerships_page_v_version_offerings" USING btree ("_parent_id");
  CREATE INDEX "_partnerships_page_v_version_infrastructure_pillars_order_idx" ON "_partnerships_page_v_version_infrastructure_pillars" USING btree ("_order");
  CREATE INDEX "_partnerships_page_v_version_infrastructure_pillars_parent_id_idx" ON "_partnerships_page_v_version_infrastructure_pillars" USING btree ("_parent_id");
  CREATE INDEX "_partnerships_page_v_version_sectors_items_order_idx" ON "_partnerships_page_v_version_sectors_items" USING btree ("_order");
  CREATE INDEX "_partnerships_page_v_version_sectors_items_parent_id_idx" ON "_partnerships_page_v_version_sectors_items" USING btree ("_parent_id");
  CREATE INDEX "_partnerships_page_v_version_sectors_order_idx" ON "_partnerships_page_v_version_sectors" USING btree ("_order");
  CREATE INDEX "_partnerships_page_v_version_sectors_parent_id_idx" ON "_partnerships_page_v_version_sectors" USING btree ("_parent_id");
  CREATE INDEX "_partnerships_page_v_version_example_projects_order_idx" ON "_partnerships_page_v_version_example_projects" USING btree ("_order");
  CREATE INDEX "_partnerships_page_v_version_example_projects_parent_id_idx" ON "_partnerships_page_v_version_example_projects" USING btree ("_parent_id");
  CREATE INDEX "_partnerships_page_v_version_models_order_idx" ON "_partnerships_page_v_version_models" USING btree ("_order");
  CREATE INDEX "_partnerships_page_v_version_models_parent_id_idx" ON "_partnerships_page_v_version_models" USING btree ("_parent_id");
  CREATE INDEX "_partnerships_page_v_version_version__status_idx" ON "_partnerships_page_v" USING btree ("version__status");
  CREATE INDEX "_partnerships_page_v_created_at_idx" ON "_partnerships_page_v" USING btree ("created_at");
  CREATE INDEX "_partnerships_page_v_updated_at_idx" ON "_partnerships_page_v" USING btree ("updated_at");
  CREATE INDEX "_partnerships_page_v_latest_idx" ON "_partnerships_page_v" USING btree ("latest");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "partnerships_page_strengths" CASCADE;
  DROP TABLE "partnerships_page_offerings" CASCADE;
  DROP TABLE "partnerships_page_infrastructure_pillars" CASCADE;
  DROP TABLE "partnerships_page_sectors_items" CASCADE;
  DROP TABLE "partnerships_page_sectors" CASCADE;
  DROP TABLE "partnerships_page_example_projects" CASCADE;
  DROP TABLE "partnerships_page_models" CASCADE;
  DROP TABLE "partnerships_page" CASCADE;
  DROP TABLE "_partnerships_page_v_version_strengths" CASCADE;
  DROP TABLE "_partnerships_page_v_version_offerings" CASCADE;
  DROP TABLE "_partnerships_page_v_version_infrastructure_pillars" CASCADE;
  DROP TABLE "_partnerships_page_v_version_sectors_items" CASCADE;
  DROP TABLE "_partnerships_page_v_version_sectors" CASCADE;
  DROP TABLE "_partnerships_page_v_version_example_projects" CASCADE;
  DROP TABLE "_partnerships_page_v_version_models" CASCADE;
  DROP TABLE "_partnerships_page_v" CASCADE;
  ALTER TABLE "inquiries" ALTER COLUMN "form_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_inquiries_form_type";
  CREATE TYPE "public"."enum_inquiries_form_type" AS ENUM('contact', 'join');
  ALTER TABLE "inquiries" ALTER COLUMN "form_type" SET DATA TYPE "public"."enum_inquiries_form_type" USING "form_type"::"public"."enum_inquiries_form_type";
  ALTER TABLE "inquiries" DROP COLUMN "organization";
  ALTER TABLE "inquiries" DROP COLUMN "organization_type";
  ALTER TABLE "inquiries" DROP COLUMN "research_interest";
  DROP TYPE "public"."enum_inquiries_organization_type";
  DROP TYPE "public"."enum_partnerships_page_status";
  DROP TYPE "public"."enum__partnerships_page_v_version_status";`)
}
