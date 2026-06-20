import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_site_settings_hero_media_style"
      AS ENUM('particles', 'video', 'image');
    CREATE TYPE "public"."enum__site_settings_v_version_hero_media_style"
      AS ENUM('particles', 'video', 'image');

    ALTER TABLE "site_settings"
      ADD COLUMN IF NOT EXISTS "hero_media_style"
        "enum_site_settings_hero_media_style" DEFAULT 'particles',
      ADD COLUMN IF NOT EXISTS "hero_media_video_id"
        integer REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action,
      ADD COLUMN IF NOT EXISTS "hero_media_image_id"
        integer REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "_site_settings_v"
      ADD COLUMN IF NOT EXISTS "version_hero_media_style"
        "enum__site_settings_v_version_hero_media_style" DEFAULT 'particles',
      ADD COLUMN IF NOT EXISTS "version_hero_media_video_id"
        integer REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action,
      ADD COLUMN IF NOT EXISTS "version_hero_media_image_id"
        integer REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

    CREATE INDEX IF NOT EXISTS "site_settings_hero_media_video_idx"
      ON "site_settings" USING btree ("hero_media_video_id");
    CREATE INDEX IF NOT EXISTS "site_settings_hero_media_image_idx"
      ON "site_settings" USING btree ("hero_media_image_id");
    CREATE INDEX IF NOT EXISTS "_site_settings_v_version_hero_media_video_idx"
      ON "_site_settings_v" USING btree ("version_hero_media_video_id");
    CREATE INDEX IF NOT EXISTS "_site_settings_v_version_hero_media_image_idx"
      ON "_site_settings_v" USING btree ("version_hero_media_image_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "_site_settings_v_version_hero_media_image_idx";
    DROP INDEX IF EXISTS "_site_settings_v_version_hero_media_video_idx";
    DROP INDEX IF EXISTS "site_settings_hero_media_image_idx";
    DROP INDEX IF EXISTS "site_settings_hero_media_video_idx";

    ALTER TABLE "_site_settings_v"
      DROP COLUMN IF EXISTS "version_hero_media_image_id",
      DROP COLUMN IF EXISTS "version_hero_media_video_id",
      DROP COLUMN IF EXISTS "version_hero_media_style";

    ALTER TABLE "site_settings"
      DROP COLUMN IF EXISTS "hero_media_image_id",
      DROP COLUMN IF EXISTS "hero_media_video_id",
      DROP COLUMN IF EXISTS "hero_media_style";

    DROP TYPE IF EXISTS "public"."enum__site_settings_v_version_hero_media_style";
    DROP TYPE IF EXISTS "public"."enum_site_settings_hero_media_style";
  `)
}
