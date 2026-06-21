import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // id is varchar — Payload uses hex strings; generate one via encode(gen_random_bytes(16),'hex')
  await db.execute(sql`
    INSERT INTO navigation_header_links (id, _order, _parent_id, label, href, is_external, is_visible)
    SELECT
      md5(random()::text || clock_timestamp()::text),
      COALESCE((SELECT MAX(_order) FROM navigation_header_links WHERE _parent_id = n.id), 0) + 1,
      n.id,
      'Join Us',
      '/join',
      false,
      true
    FROM navigation n
    WHERE NOT EXISTS (
      SELECT 1 FROM navigation_header_links
      WHERE _parent_id = n.id AND href = '/join'
    )
    LIMIT 1
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DELETE FROM navigation_header_links WHERE href = '/join'
  `)
}
