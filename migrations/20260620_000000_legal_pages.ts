import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE IF NOT EXISTS "public"."enum_legal_pages_status"
      AS ENUM('draft', 'published');
    CREATE TYPE IF NOT EXISTS "public"."enum__legal_pages_v_version_status"
      AS ENUM('draft', 'published');

    CREATE TABLE IF NOT EXISTS "legal_pages" (
      "id"                          serial PRIMARY KEY,
      "privacy_policy_title"        varchar,
      "privacy_policy_title_ur"     varchar,
      "privacy_policy"              jsonb,
      "privacy_policy_ur"           jsonb,
      "terms_of_use_title"          varchar,
      "terms_of_use_title_ur"       varchar,
      "terms_of_use"                jsonb,
      "terms_of_use_ur"             jsonb,
      "_status" "enum_legal_pages_status" DEFAULT 'draft',
      "updated_at"                  timestamp(3) with time zone,
      "created_at"                  timestamp(3) with time zone
    );

    CREATE TABLE IF NOT EXISTS "_legal_pages_v" (
      "id"                                  serial PRIMARY KEY,
      "version_privacy_policy_title"        varchar,
      "version_privacy_policy_title_ur"     varchar,
      "version_privacy_policy"              jsonb,
      "version_privacy_policy_ur"           jsonb,
      "version_terms_of_use_title"          varchar,
      "version_terms_of_use_title_ur"       varchar,
      "version_terms_of_use"                jsonb,
      "version_terms_of_use_ur"             jsonb,
      "version__status" "enum__legal_pages_v_version_status" DEFAULT 'draft',
      "created_at"                          timestamp(3) with time zone,
      "updated_at"                          timestamp(3) with time zone,
      "latest"                              boolean,
      "autosave"                            boolean
    );

    CREATE INDEX IF NOT EXISTS "legal_pages__status_idx"
      ON "legal_pages" USING btree ("_status");
    CREATE INDEX IF NOT EXISTS "_legal_pages_v_version__status_idx"
      ON "_legal_pages_v" USING btree ("version__status");
    CREATE INDEX IF NOT EXISTS "_legal_pages_v_created_at_idx"
      ON "_legal_pages_v" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "_legal_pages_v_updated_at_idx"
      ON "_legal_pages_v" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "_legal_pages_v_latest_idx"
      ON "_legal_pages_v" USING btree ("latest");
    CREATE INDEX IF NOT EXISTS "_legal_pages_v_autosave_idx"
      ON "_legal_pages_v" USING btree ("autosave");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "_legal_pages_v";
    DROP TABLE IF EXISTS "legal_pages";
    DROP TYPE IF EXISTS "public"."enum__legal_pages_v_version_status";
    DROP TYPE IF EXISTS "public"."enum_legal_pages_status";
  `)
}
