import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

/**
 * Migration 3 of 3: Convert study_sites.location to geography(Point,4326).
 *
 * Payload's `point` field creates a geometry(Point) column (generic PostGIS
 * geometry with no enforced SRID). We promote it to geography(Point,4326) —
 * the spheroidal type — so:
 *   • ST_X / ST_Y return correct WGS-84 degrees
 *   • ST_Distance returns metres on the sphere
 *   • District-density queries are geographically accurate
 *
 * Payload's read/write format (EWKT: "SRID=4326;POINT(lon lat)" and EWKB)
 * is compatible with geography columns, so no application-level changes needed.
 *
 * Verification SQL (run after migrations to confirm):
 *   SELECT c.column_name, c.udt_name, c.data_type,
 *          g.type, g.srid, g.coord_dimension
 *   FROM information_schema.columns c
 *   JOIN geometry_columns g
 *     ON g.f_table_schema = c.table_schema
 *    AND g.f_table_name   = c.table_name
 *    AND g.f_geometry_column = c.column_name
 *   WHERE c.table_name = 'study_sites' AND c.column_name = 'location';
 *
 *   -- Expected: udt_name = 'geography', type = 'Point', srid = 4326
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  // 1. Convert geometry(Point) → geography(Point,4326)
  //    geography is the spheroidal type; the CAST is safe because the data
  //    was written with SRID=4326 by Payload's geometryColumn driver.
  await db.execute(sql`
    ALTER TABLE study_sites
      ALTER COLUMN location
        TYPE geography(Point, 4326)
        USING location::geography
  `)

  // 2. Add a GiST spatial index (required for efficient spatial queries)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS study_sites_location_gist
      ON study_sites
      USING GiST (location)
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP INDEX IF EXISTS study_sites_location_gist`)

  await db.execute(sql`
    ALTER TABLE study_sites
      ALTER COLUMN location
        TYPE geometry(Point)
        USING location::geometry
  `)
}
