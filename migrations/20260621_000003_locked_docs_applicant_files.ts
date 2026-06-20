import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// The applicant_files collection was added after the initial migration that
// created payload_locked_documents_rels. Payload expects a FK column here
// for every collection it manages locking on.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(
    sql.raw(`
    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "applicant_files_id"
        integer REFERENCES "applicant_files"("id") ON DELETE cascade ON UPDATE no action;
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_applicant_files_id_idx"
      ON "payload_locked_documents_rels" USING btree ("applicant_files_id");
  `),
  )
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(
    sql.raw(`
    DROP INDEX IF EXISTS "payload_locked_documents_rels_applicant_files_id_idx";
    ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "applicant_files_id";
  `),
  )
}
