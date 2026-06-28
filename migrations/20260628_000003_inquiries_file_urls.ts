import { sql } from '@payloadcms/db-postgres'
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

/**
 * Replaces the Payload upload-field approach (cv_id / sop_id FKs to applicant_files)
 * with plain text URL columns. Files are now uploaded directly to Vercel Blob in the
 * server action and the resulting public URL is stored here for direct admin download.
 *
 * cv_id / sop_id are left in place (nulled out for old rows) to avoid a destructive
 * migration — they simply go unused going forward.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE inquiries
      ADD COLUMN IF NOT EXISTS cv_url  varchar,
      ADD COLUMN IF NOT EXISTS sop_url varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE inquiries
      DROP COLUMN IF EXISTS cv_url,
      DROP COLUMN IF EXISTS sop_url;
  `)
}
