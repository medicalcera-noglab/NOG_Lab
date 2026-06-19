import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // `projects_rels` is the join table Payload uses for hasMany relationships
  // on the projects collection. It currently has `people_id` and
  // `collaborators_id` columns. We add `publications_id` for the new
  // relatedPublications field — existing rows are untouched.
  await db.execute(sql`
    ALTER TABLE "projects_rels"
      ADD COLUMN IF NOT EXISTS "publications_id" integer;

    ALTER TABLE "projects_rels"
      ADD CONSTRAINT "projects_rels_publications_id_publications_id_fk"
      FOREIGN KEY ("publications_id")
      REFERENCES "public"."publications"("id")
      ON DELETE cascade ON UPDATE no action;

    CREATE INDEX IF NOT EXISTS "projects_rels_publications_id_idx"
      ON "projects_rels" USING btree ("publications_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "projects_rels_publications_id_idx";

    ALTER TABLE "projects_rels"
      DROP CONSTRAINT IF EXISTS "projects_rels_publications_id_publications_id_fk";

    ALTER TABLE "projects_rels"
      DROP COLUMN IF EXISTS "publications_id";
  `)
}
