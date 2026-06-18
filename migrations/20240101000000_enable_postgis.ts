import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

/**
 * Migration 1 of 3: Enable the PostGIS extension.
 *
 * This MUST run before the schema migration because Payload's `point` field
 * maps to a PostGIS geometry(Point) column type.
 *
 * Pre-dated to 2024-01-01 so it always sorts before any schema migration
 * generated at the current date.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS postgis`)
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS postgis_topology`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Intentionally a no-op: dropping PostGIS would destroy all geometry columns.
  // Remove the extension manually only when you are sure it is safe.
}
