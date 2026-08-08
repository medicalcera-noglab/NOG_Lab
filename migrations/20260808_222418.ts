import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "open_positions" ADD COLUMN "image_id" integer;
  ALTER TABLE "open_positions" ADD CONSTRAINT "open_positions_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "open_positions_image_idx" ON "open_positions" USING btree ("image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "open_positions" DROP CONSTRAINT "open_positions_image_id_media_id_fk";
  
  DROP INDEX "open_positions_image_idx";
  ALTER TABLE "open_positions" DROP COLUMN "image_id";`)
}
