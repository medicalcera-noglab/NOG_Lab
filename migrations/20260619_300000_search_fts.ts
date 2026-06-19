/**
 * Search FTS Migration
 *
 * Adds PostgreSQL full-text search infrastructure (idempotent — safe to re-run):
 *   - pg_trgm extension for trigram similarity / fuzzy matching
 *   - lexical_to_text() helper: extracts visible text from Payload Lexical richText JSONB
 *   - search_vector tsvector column on each searchable table, kept current by triggers
 *   - GIN index on search_vector (FTS) and gin_trgm_ops index on title/name (fuzzy)
 *   - BEFORE INSERT OR UPDATE trigger on each parent table
 *   - AFTER INSERT/UPDATE/DELETE trigger on each child array table so that author/
 *     tag/interest/objective changes are reflected immediately in the parent's vector
 *   - Back-fill UPDATE for all pre-existing rows
 *
 * Tables indexed: publications, people, projects, blog_posts, news_events
 */

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // ── Extensions ─────────────────────────────────────────────────────────────
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`)

  // ── Helper: extract visible text from Payload Lexical richText JSONB ───────
  // Lexical serialises content as { root: { children: [{ children: [{ text }] }] } }.
  // IMMUTABLE + CALLED ON NULL INPUT so it can be used in generated expressions.
  await db.execute(sql`
    CREATE OR REPLACE FUNCTION lexical_to_text(doc jsonb)
    RETURNS text LANGUAGE sql IMMUTABLE CALLED ON NULL INPUT AS $$
      SELECT coalesce(
        string_agg(val #>> '{}', ' '),
        ''
      )
      FROM jsonb_path_query(
        coalesce(doc, '{"root":{"children":[]}}'::jsonb),
        '$.root.children[*].children[*].text'
      ) AS val
    $$
  `)

  // ══════════════════════════════════════════════════════════════════════════════
  // publications
  // ══════════════════════════════════════════════════════════════════════════════

  await db.execute(sql`ALTER TABLE publications ADD COLUMN IF NOT EXISTS search_vector tsvector`)
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS idx_publications_fts ON publications USING GIN(search_vector)`,
  )
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS idx_publications_title_trgm ON publications USING GIN(title gin_trgm_ops)`,
  )

  // Trigger function on parent row — queries publications_authors at fire time.
  // On BEFORE UPDATE the children have been updated by Payload before the parent
  // update fires, so the subquery returns the current author list.
  await db.execute(sql`
    CREATE OR REPLACE FUNCTION build_pub_sv()
    RETURNS trigger LANGUAGE plpgsql AS $$
    DECLARE v_authors text;
    BEGIN
      SELECT coalesce(string_agg(a.author, ' '), '')
        INTO v_authors
        FROM publications_authors a
       WHERE a._parent_id = NEW.id;

      NEW.search_vector :=
        setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english',
          v_authors || ' ' || coalesce(NEW.journal, '')), 'B') ||
        setweight(to_tsvector('english', lexical_to_text(NEW.abstract)), 'C');
      RETURN NEW;
    END;
    $$
  `)
  await db.execute(sql`DROP TRIGGER IF EXISTS trig_pub_sv ON publications`)
  await db.execute(sql`
    CREATE TRIGGER trig_pub_sv
    BEFORE INSERT OR UPDATE ON publications
    FOR EACH ROW EXECUTE FUNCTION build_pub_sv()
  `)

  // Child trigger — keeps parent vector fresh when author rows change independently.
  await db.execute(sql`
    CREATE OR REPLACE FUNCTION refresh_pub_sv_from_authors()
    RETURNS trigger LANGUAGE plpgsql AS $$
    DECLARE pid integer;
    BEGIN
      pid := coalesce(NEW._parent_id, OLD._parent_id);
      IF pid IS NOT NULL THEN
        UPDATE publications p
           SET search_vector =
                 setweight(to_tsvector('english', coalesce(p.title, '')), 'A') ||
                 setweight(to_tsvector('english',
                   coalesce(
                     (SELECT string_agg(a.author, ' ')
                        FROM publications_authors a
                       WHERE a._parent_id = pid),
                     ''
                   ) || ' ' || coalesce(p.journal, '')), 'B') ||
                 setweight(to_tsvector('english', lexical_to_text(p.abstract)), 'C')
         WHERE p.id = pid;
      END IF;
      RETURN NULL;
    END;
    $$
  `)
  await db.execute(sql`DROP TRIGGER IF EXISTS trig_pub_authors ON publications_authors`)
  await db.execute(sql`
    CREATE TRIGGER trig_pub_authors
    AFTER INSERT OR UPDATE OR DELETE ON publications_authors
    FOR EACH ROW EXECUTE FUNCTION refresh_pub_sv_from_authors()
  `)

  // ══════════════════════════════════════════════════════════════════════════════
  // people
  // ══════════════════════════════════════════════════════════════════════════════

  await db.execute(sql`ALTER TABLE people ADD COLUMN IF NOT EXISTS search_vector tsvector`)
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS idx_people_fts ON people USING GIN(search_vector)`,
  )
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS idx_people_name_trgm ON people USING GIN(name gin_trgm_ops)`,
  )

  await db.execute(sql`
    CREATE OR REPLACE FUNCTION build_people_sv()
    RETURNS trigger LANGUAGE plpgsql AS $$
    DECLARE v_interests text;
    BEGIN
      SELECT coalesce(string_agg(i.interest, ' '), '')
        INTO v_interests
        FROM people_interests i
       WHERE i._parent_id = NEW.id;

      NEW.search_vector :=
        setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
        setweight(to_tsvector('english',
          v_interests || ' ' || lexical_to_text(NEW.bio)), 'C');
      RETURN NEW;
    END;
    $$
  `)
  await db.execute(sql`DROP TRIGGER IF EXISTS trig_people_sv ON people`)
  await db.execute(sql`
    CREATE TRIGGER trig_people_sv
    BEFORE INSERT OR UPDATE ON people
    FOR EACH ROW EXECUTE FUNCTION build_people_sv()
  `)

  await db.execute(sql`
    CREATE OR REPLACE FUNCTION refresh_people_sv_from_interests()
    RETURNS trigger LANGUAGE plpgsql AS $$
    DECLARE pid integer;
    BEGIN
      pid := coalesce(NEW._parent_id, OLD._parent_id);
      IF pid IS NOT NULL THEN
        UPDATE people p
           SET search_vector =
                 setweight(to_tsvector('english', coalesce(p.name, '')), 'A') ||
                 setweight(to_tsvector('english',
                   coalesce(
                     (SELECT string_agg(i.interest, ' ')
                        FROM people_interests i
                       WHERE i._parent_id = pid),
                     ''
                   ) || ' ' || lexical_to_text(p.bio)), 'C')
         WHERE p.id = pid;
      END IF;
      RETURN NULL;
    END;
    $$
  `)
  await db.execute(sql`DROP TRIGGER IF EXISTS trig_people_interests ON people_interests`)
  await db.execute(sql`
    CREATE TRIGGER trig_people_interests
    AFTER INSERT OR UPDATE OR DELETE ON people_interests
    FOR EACH ROW EXECUTE FUNCTION refresh_people_sv_from_interests()
  `)

  // ══════════════════════════════════════════════════════════════════════════════
  // projects
  // ══════════════════════════════════════════════════════════════════════════════

  await db.execute(sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS search_vector tsvector`)
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS idx_projects_fts ON projects USING GIN(search_vector)`,
  )
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS idx_projects_title_trgm ON projects USING GIN(title gin_trgm_ops)`,
  )

  await db.execute(sql`
    CREATE OR REPLACE FUNCTION build_projects_sv()
    RETURNS trigger LANGUAGE plpgsql AS $$
    DECLARE v_objectives text;
    BEGIN
      SELECT coalesce(string_agg(o.objective, ' '), '')
        INTO v_objectives
        FROM projects_objectives o
       WHERE o._parent_id = NEW.id;

      NEW.search_vector :=
        setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', lexical_to_text(NEW.summary)), 'B') ||
        setweight(to_tsvector('english', v_objectives), 'C');
      RETURN NEW;
    END;
    $$
  `)
  await db.execute(sql`DROP TRIGGER IF EXISTS trig_projects_sv ON projects`)
  await db.execute(sql`
    CREATE TRIGGER trig_projects_sv
    BEFORE INSERT OR UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION build_projects_sv()
  `)

  await db.execute(sql`
    CREATE OR REPLACE FUNCTION refresh_projects_sv_from_objectives()
    RETURNS trigger LANGUAGE plpgsql AS $$
    DECLARE pid integer;
    BEGIN
      pid := coalesce(NEW._parent_id, OLD._parent_id);
      IF pid IS NOT NULL THEN
        UPDATE projects p
           SET search_vector =
                 setweight(to_tsvector('english', coalesce(p.title, '')), 'A') ||
                 setweight(to_tsvector('english', lexical_to_text(p.summary)), 'B') ||
                 setweight(to_tsvector('english',
                   coalesce(
                     (SELECT string_agg(o.objective, ' ')
                        FROM projects_objectives o
                       WHERE o._parent_id = pid),
                     ''
                   )), 'C')
         WHERE p.id = pid;
      END IF;
      RETURN NULL;
    END;
    $$
  `)
  await db.execute(sql`DROP TRIGGER IF EXISTS trig_projects_objectives ON projects_objectives`)
  await db.execute(sql`
    CREATE TRIGGER trig_projects_objectives
    AFTER INSERT OR UPDATE OR DELETE ON projects_objectives
    FOR EACH ROW EXECUTE FUNCTION refresh_projects_sv_from_objectives()
  `)

  // ══════════════════════════════════════════════════════════════════════════════
  // blog_posts
  // ══════════════════════════════════════════════════════════════════════════════

  await db.execute(sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS search_vector tsvector`)
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS idx_blog_posts_fts ON blog_posts USING GIN(search_vector)`,
  )
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS idx_blog_posts_title_trgm ON blog_posts USING GIN(title gin_trgm_ops)`,
  )

  await db.execute(sql`
    CREATE OR REPLACE FUNCTION build_blog_posts_sv()
    RETURNS trigger LANGUAGE plpgsql AS $$
    DECLARE v_tags text;
    BEGIN
      SELECT coalesce(string_agg(t.tag, ' '), '')
        INTO v_tags
        FROM blog_posts_tags t
       WHERE t._parent_id = NEW.id;

      NEW.search_vector :=
        setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', v_tags), 'B') ||
        setweight(to_tsvector('english', lexical_to_text(NEW.body)), 'C');
      RETURN NEW;
    END;
    $$
  `)
  await db.execute(sql`DROP TRIGGER IF EXISTS trig_blog_posts_sv ON blog_posts`)
  await db.execute(sql`
    CREATE TRIGGER trig_blog_posts_sv
    BEFORE INSERT OR UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION build_blog_posts_sv()
  `)

  await db.execute(sql`
    CREATE OR REPLACE FUNCTION refresh_blog_posts_sv_from_tags()
    RETURNS trigger LANGUAGE plpgsql AS $$
    DECLARE pid integer;
    BEGIN
      pid := coalesce(NEW._parent_id, OLD._parent_id);
      IF pid IS NOT NULL THEN
        UPDATE blog_posts p
           SET search_vector =
                 setweight(to_tsvector('english', coalesce(p.title, '')), 'A') ||
                 setweight(to_tsvector('english',
                   coalesce(
                     (SELECT string_agg(t.tag, ' ')
                        FROM blog_posts_tags t
                       WHERE t._parent_id = pid),
                     ''
                   )), 'B') ||
                 setweight(to_tsvector('english', lexical_to_text(p.body)), 'C')
         WHERE p.id = pid;
      END IF;
      RETURN NULL;
    END;
    $$
  `)
  await db.execute(sql`DROP TRIGGER IF EXISTS trig_blog_tags ON blog_posts_tags`)
  await db.execute(sql`
    CREATE TRIGGER trig_blog_tags
    AFTER INSERT OR UPDATE OR DELETE ON blog_posts_tags
    FOR EACH ROW EXECUTE FUNCTION refresh_blog_posts_sv_from_tags()
  `)

  // ══════════════════════════════════════════════════════════════════════════════
  // news_events
  // ══════════════════════════════════════════════════════════════════════════════

  await db.execute(sql`ALTER TABLE news_events ADD COLUMN IF NOT EXISTS search_vector tsvector`)
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS idx_news_events_fts ON news_events USING GIN(search_vector)`,
  )
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS idx_news_events_title_trgm ON news_events USING GIN(title gin_trgm_ops)`,
  )

  await db.execute(sql`
    CREATE OR REPLACE FUNCTION build_news_events_sv()
    RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN
      NEW.search_vector :=
        setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', lexical_to_text(NEW.body)), 'C');
      RETURN NEW;
    END;
    $$
  `)
  await db.execute(sql`DROP TRIGGER IF EXISTS trig_news_events_sv ON news_events`)
  await db.execute(sql`
    CREATE TRIGGER trig_news_events_sv
    BEFORE INSERT OR UPDATE ON news_events
    FOR EACH ROW EXECUTE FUNCTION build_news_events_sv()
  `)

  // ══════════════════════════════════════════════════════════════════════════════
  // Back-fill: compute search_vector for all pre-existing rows
  // (triggers only fire on future INSERT/UPDATE, not on existing data)
  // ══════════════════════════════════════════════════════════════════════════════

  await db.execute(sql`
    UPDATE publications p
       SET search_vector =
             setweight(to_tsvector('english', coalesce(p.title, '')), 'A') ||
             setweight(to_tsvector('english',
               coalesce(
                 (SELECT string_agg(a.author, ' ')
                    FROM publications_authors a
                   WHERE a._parent_id = p.id),
                 ''
               ) || ' ' || coalesce(p.journal, '')), 'B') ||
             setweight(to_tsvector('english', lexical_to_text(p.abstract)), 'C')
  `)

  await db.execute(sql`
    UPDATE people p
       SET search_vector =
             setweight(to_tsvector('english', coalesce(p.name, '')), 'A') ||
             setweight(to_tsvector('english',
               coalesce(
                 (SELECT string_agg(i.interest, ' ')
                    FROM people_interests i
                   WHERE i._parent_id = p.id),
                 ''
               ) || ' ' || lexical_to_text(p.bio)), 'C')
  `)

  await db.execute(sql`
    UPDATE projects p
       SET search_vector =
             setweight(to_tsvector('english', coalesce(p.title, '')), 'A') ||
             setweight(to_tsvector('english', lexical_to_text(p.summary)), 'B') ||
             setweight(to_tsvector('english',
               coalesce(
                 (SELECT string_agg(o.objective, ' ')
                    FROM projects_objectives o
                   WHERE o._parent_id = p.id),
                 ''
               )), 'C')
  `)

  await db.execute(sql`
    UPDATE blog_posts p
       SET search_vector =
             setweight(to_tsvector('english', coalesce(p.title, '')), 'A') ||
             setweight(to_tsvector('english',
               coalesce(
                 (SELECT string_agg(t.tag, ' ')
                    FROM blog_posts_tags t
                   WHERE t._parent_id = p.id),
                 ''
               )), 'B') ||
             setweight(to_tsvector('english', lexical_to_text(p.body)), 'C')
  `)

  await db.execute(sql`
    UPDATE news_events p
       SET search_vector =
             setweight(to_tsvector('english', coalesce(p.title, '')), 'A') ||
             setweight(to_tsvector('english', lexical_to_text(p.body)), 'C')
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Child triggers
  await db.execute(sql`DROP TRIGGER IF EXISTS trig_pub_authors ON publications_authors`)
  await db.execute(sql`DROP TRIGGER IF EXISTS trig_people_interests ON people_interests`)
  await db.execute(sql`DROP TRIGGER IF EXISTS trig_projects_objectives ON projects_objectives`)
  await db.execute(sql`DROP TRIGGER IF EXISTS trig_blog_tags ON blog_posts_tags`)

  // Parent triggers
  await db.execute(sql`DROP TRIGGER IF EXISTS trig_pub_sv ON publications`)
  await db.execute(sql`DROP TRIGGER IF EXISTS trig_people_sv ON people`)
  await db.execute(sql`DROP TRIGGER IF EXISTS trig_projects_sv ON projects`)
  await db.execute(sql`DROP TRIGGER IF EXISTS trig_blog_posts_sv ON blog_posts`)
  await db.execute(sql`DROP TRIGGER IF EXISTS trig_news_events_sv ON news_events`)

  // Trigger functions
  await db.execute(sql`DROP FUNCTION IF EXISTS build_pub_sv()`)
  await db.execute(sql`DROP FUNCTION IF EXISTS refresh_pub_sv_from_authors()`)
  await db.execute(sql`DROP FUNCTION IF EXISTS build_people_sv()`)
  await db.execute(sql`DROP FUNCTION IF EXISTS refresh_people_sv_from_interests()`)
  await db.execute(sql`DROP FUNCTION IF EXISTS build_projects_sv()`)
  await db.execute(sql`DROP FUNCTION IF EXISTS refresh_projects_sv_from_objectives()`)
  await db.execute(sql`DROP FUNCTION IF EXISTS build_blog_posts_sv()`)
  await db.execute(sql`DROP FUNCTION IF EXISTS refresh_blog_posts_sv_from_tags()`)
  await db.execute(sql`DROP FUNCTION IF EXISTS build_news_events_sv()`)

  // Indexes
  await db.execute(sql`DROP INDEX IF EXISTS idx_publications_fts`)
  await db.execute(sql`DROP INDEX IF EXISTS idx_publications_title_trgm`)
  await db.execute(sql`DROP INDEX IF EXISTS idx_people_fts`)
  await db.execute(sql`DROP INDEX IF EXISTS idx_people_name_trgm`)
  await db.execute(sql`DROP INDEX IF EXISTS idx_projects_fts`)
  await db.execute(sql`DROP INDEX IF EXISTS idx_projects_title_trgm`)
  await db.execute(sql`DROP INDEX IF EXISTS idx_blog_posts_fts`)
  await db.execute(sql`DROP INDEX IF EXISTS idx_blog_posts_title_trgm`)
  await db.execute(sql`DROP INDEX IF EXISTS idx_news_events_fts`)
  await db.execute(sql`DROP INDEX IF EXISTS idx_news_events_title_trgm`)

  // Columns
  await db.execute(sql`ALTER TABLE publications DROP COLUMN IF EXISTS search_vector`)
  await db.execute(sql`ALTER TABLE people DROP COLUMN IF EXISTS search_vector`)
  await db.execute(sql`ALTER TABLE projects DROP COLUMN IF EXISTS search_vector`)
  await db.execute(sql`ALTER TABLE blog_posts DROP COLUMN IF EXISTS search_vector`)
  await db.execute(sql`ALTER TABLE news_events DROP COLUMN IF EXISTS search_vector`)

  // Helper
  await db.execute(sql`DROP FUNCTION IF EXISTS lexical_to_text(jsonb)`)
}
