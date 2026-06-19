import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

/**
 * Creates the applicant_files upload collection table and re-points
 * inquiries.cv / inquiries.sop from the media table to applicant_files.
 * Private uploads: served via R2 presigned URLs only (no public CDN).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS applicant_files (
      id             SERIAL PRIMARY KEY,
      submitted_by   TEXT,
      updated_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      url            TEXT,
      thumbnail_url  TEXT,
      filename       TEXT,
      mime_type      TEXT,
      filesize       INTEGER,
      width          INTEGER,
      height         INTEGER,
      focal_x        NUMERIC,
      focal_y        NUMERIC,
      prefix         TEXT
    )
  `)

  // Re-point cv_id / sop_id to applicant_files.
  await db.execute(sql`
    ALTER TABLE inquiries
      DROP COLUMN IF EXISTS cv_id,
      DROP COLUMN IF EXISTS sop_id
  `)
  await db.execute(sql`
    ALTER TABLE inquiries
      ADD COLUMN IF NOT EXISTS cv_id  INTEGER REFERENCES applicant_files(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS sop_id INTEGER REFERENCES applicant_files(id) ON DELETE SET NULL
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE inquiries
      DROP COLUMN IF EXISTS cv_id,
      DROP COLUMN IF EXISTS sop_id
  `)
  await db.execute(sql`DROP TABLE IF EXISTS applicant_files`)
}
