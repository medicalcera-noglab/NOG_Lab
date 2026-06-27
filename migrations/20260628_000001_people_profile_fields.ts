import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- Simple scalar fields on people
    ALTER TABLE people
      ADD COLUMN IF NOT EXISTS scopus varchar,
      ADD COLUMN IF NOT EXISTS academic_title varchar,
      ADD COLUMN IF NOT EXISTS institution varchar;

    -- Education array table
    CREATE TABLE IF NOT EXISTS "people_education" (
      "_order"      integer NOT NULL,
      "_parent_id"  integer NOT NULL,
      "id"          varchar PRIMARY KEY NOT NULL,
      "degree"      varchar NOT NULL,
      "institution" varchar NOT NULL,
      "country"     varchar,
      "start_year"  varchar,
      "end_year"    varchar
    );

    -- Experience array table
    CREATE TABLE IF NOT EXISTS "people_experience" (
      "_order"      integer NOT NULL,
      "_parent_id"  integer NOT NULL,
      "id"          varchar PRIMARY KEY NOT NULL,
      "role"        varchar NOT NULL,
      "institution" varchar NOT NULL,
      "country"     varchar,
      "start_year"  varchar,
      "end_year"    varchar
    );

    -- Grants array table
    CREATE TABLE IF NOT EXISTS "people_grants" (
      "_order"      integer NOT NULL,
      "_parent_id"  integer NOT NULL,
      "id"          varchar PRIMARY KEY NOT NULL,
      "title"       varchar NOT NULL,
      "funder"      varchar,
      "year"        varchar
    );
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "people_grants";
    DROP TABLE IF EXISTS "people_experience";
    DROP TABLE IF EXISTS "people_education";

    ALTER TABLE people
      DROP COLUMN IF EXISTS scopus,
      DROP COLUMN IF EXISTS academic_title,
      DROP COLUMN IF EXISTS institution;
  `)
}
