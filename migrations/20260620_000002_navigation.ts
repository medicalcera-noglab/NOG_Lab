import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "navigation" (
      "id"          serial PRIMARY KEY,
      "updated_at"  timestamp(3) with time zone,
      "created_at"  timestamp(3) with time zone
    );

    CREATE TABLE IF NOT EXISTS "navigation_header_links" (
      "id"          serial PRIMARY KEY,
      "_order"      integer NOT NULL,
      "_parent_id"  integer NOT NULL REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action,
      "label"       varchar NOT NULL,
      "label_ur"    varchar,
      "href"        varchar NOT NULL,
      "is_external" boolean DEFAULT false,
      "is_visible"  boolean DEFAULT true
    );

    CREATE TABLE IF NOT EXISTS "navigation_footer_groups" (
      "id"          serial PRIMARY KEY,
      "_order"      integer NOT NULL,
      "_parent_id"  integer NOT NULL REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action,
      "title"       varchar NOT NULL,
      "title_ur"    varchar
    );

    CREATE TABLE IF NOT EXISTS "navigation_footer_groups_links" (
      "id"          serial PRIMARY KEY,
      "_order"      integer NOT NULL,
      "_parent_id"  integer NOT NULL REFERENCES "public"."navigation_footer_groups"("id") ON DELETE cascade ON UPDATE no action,
      "label"       varchar NOT NULL,
      "label_ur"    varchar,
      "href"        varchar NOT NULL,
      "is_external" boolean DEFAULT false
    );

    CREATE INDEX IF NOT EXISTS "navigation_header_links_order_idx"
      ON "navigation_header_links" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "navigation_header_links_parent_id_idx"
      ON "navigation_header_links" USING btree ("_parent_id");

    CREATE INDEX IF NOT EXISTS "navigation_footer_groups_order_idx"
      ON "navigation_footer_groups" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "navigation_footer_groups_parent_id_idx"
      ON "navigation_footer_groups" USING btree ("_parent_id");

    CREATE INDEX IF NOT EXISTS "navigation_footer_groups_links_order_idx"
      ON "navigation_footer_groups_links" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "navigation_footer_groups_links_parent_id_idx"
      ON "navigation_footer_groups_links" USING btree ("_parent_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "navigation_footer_groups_links";
    DROP TABLE IF EXISTS "navigation_footer_groups";
    DROP TABLE IF EXISTS "navigation_header_links";
    DROP TABLE IF EXISTS "navigation";
  `)
}
