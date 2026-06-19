import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

/**
 * Adds Payload imageSizes columns to the media table for the three WebP
 * derivatives (thumbnail 300w, medium 800w, large 1600w).
 * Payload stores each size's metadata as a set of flat columns.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE media
      ADD COLUMN IF NOT EXISTS sizes_thumbnail_url      TEXT,
      ADD COLUMN IF NOT EXISTS sizes_thumbnail_width    INTEGER,
      ADD COLUMN IF NOT EXISTS sizes_thumbnail_height   INTEGER,
      ADD COLUMN IF NOT EXISTS sizes_thumbnail_mime_type TEXT,
      ADD COLUMN IF NOT EXISTS sizes_thumbnail_filesize  INTEGER,
      ADD COLUMN IF NOT EXISTS sizes_thumbnail_filename  TEXT,

      ADD COLUMN IF NOT EXISTS sizes_medium_url         TEXT,
      ADD COLUMN IF NOT EXISTS sizes_medium_width       INTEGER,
      ADD COLUMN IF NOT EXISTS sizes_medium_height      INTEGER,
      ADD COLUMN IF NOT EXISTS sizes_medium_mime_type   TEXT,
      ADD COLUMN IF NOT EXISTS sizes_medium_filesize    INTEGER,
      ADD COLUMN IF NOT EXISTS sizes_medium_filename    TEXT,

      ADD COLUMN IF NOT EXISTS sizes_large_url          TEXT,
      ADD COLUMN IF NOT EXISTS sizes_large_width        INTEGER,
      ADD COLUMN IF NOT EXISTS sizes_large_height       INTEGER,
      ADD COLUMN IF NOT EXISTS sizes_large_mime_type    TEXT,
      ADD COLUMN IF NOT EXISTS sizes_large_filesize     INTEGER,
      ADD COLUMN IF NOT EXISTS sizes_large_filename     TEXT
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE media
      DROP COLUMN IF EXISTS sizes_thumbnail_url,
      DROP COLUMN IF EXISTS sizes_thumbnail_width,
      DROP COLUMN IF EXISTS sizes_thumbnail_height,
      DROP COLUMN IF EXISTS sizes_thumbnail_mime_type,
      DROP COLUMN IF EXISTS sizes_thumbnail_filesize,
      DROP COLUMN IF EXISTS sizes_thumbnail_filename,
      DROP COLUMN IF EXISTS sizes_medium_url,
      DROP COLUMN IF EXISTS sizes_medium_width,
      DROP COLUMN IF EXISTS sizes_medium_height,
      DROP COLUMN IF EXISTS sizes_medium_mime_type,
      DROP COLUMN IF EXISTS sizes_medium_filesize,
      DROP COLUMN IF EXISTS sizes_medium_filename,
      DROP COLUMN IF EXISTS sizes_large_url,
      DROP COLUMN IF EXISTS sizes_large_width,
      DROP COLUMN IF EXISTS sizes_large_height,
      DROP COLUMN IF EXISTS sizes_large_mime_type,
      DROP COLUMN IF EXISTS sizes_large_filesize,
      DROP COLUMN IF EXISTS sizes_large_filename
  `)
}
