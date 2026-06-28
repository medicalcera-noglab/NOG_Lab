import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE inquiries
      ADD COLUMN IF NOT EXISTS cv_filename varchar,
      ADD COLUMN IF NOT EXISTS sop_filename varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE inquiries
      DROP COLUMN IF EXISTS cv_filename,
      DROP COLUMN IF EXISTS sop_filename;
  `)
}
