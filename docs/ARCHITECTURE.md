# NOG Lab — Architecture

## Overview

Single-repo, single-deploy application. The public website and the CMS admin
panel share the same Next.js process and Postgres database.

```
┌──────────────────────────────────────────────────────────────────────┐
│  Browser                                                             │
│  ┌──────────────┐   ┌──────────────────────────────────────────┐    │
│  │ Public site  │   │ /admin (Payload CMS admin panel)         │    │
│  │ noglab.org/  │   │ noglab.org/admin                         │    │
│  └──────┬───────┘   └────────────────┬─────────────────────────┘    │
└─────────┼──────────────────────────────┼───────────────────────────┘
          │ HTTPS                        │ HTTPS
          ▼                              ▼
┌──────────────────────────────────────────────────────────────────────┐
│  Vercel Edge / CDN                                                   │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  Next.js 16 App (Node 22)                                      │  │
│  │                                                                │  │
│  │  src/app/                                                      │  │
│  │  ├─ (frontend)/    ← public site (Server Components default)   │  │
│  │  └─ (payload)/     ← /admin + REST API routes                  │  │
│  │                                                                │  │
│  │  src/middleware.ts → security headers, rate-limit headers      │  │
│  │  src/proxy.ts      → Payload auth + admin redirect             │  │
│  │                                                                │  │
│  │  API routes (all under /api):                                  │  │
│  │  ├─ health            → liveness + DB ping                     │  │
│  │  ├─ doi-fetch         → Crossref metadata autofill             │  │
│  │  ├─ search            → FTS + trigram fallback (Postgres)      │  │
│  │  ├─ map-sites         → PostGIS study site query               │  │
│  │  ├─ totp              → 2FA enroll/verify                      │  │
│  │  └─ cron/             → citations + scheduled publish          │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────┬────────────────────────────┬──────────────┘
                           │                            │
              ┌────────────▼────────────┐   ┌──────────▼──────────┐
              │  Neon PostgreSQL        │   │  Cloudflare R2       │
              │  + PostGIS extension    │   │  media + applicant   │
              │                         │   │  files (S3-compat)   │
              │  Tables (key):          │   └─────────────────────┘
              │  • people               │
              │  • publications         │
              │  • projects             │
              │  • study_sites (geo)    │
              │  • blog_posts           │
              │  • news_events          │
              │  • users (with TOTP)    │
              │  • site_settings        │
              │  • navigation           │
              └─────────────────────────┘
```

---

## Request Flow

### Public page (Server Component)

```
Browser → Vercel Edge (CDN cache hit?) → Next.js Server
  → Payload data query (Drizzle → Neon)
  → React Server Component renders HTML
  → streamed to browser
```

### Admin page

```
Browser → Next.js Server
  → proxy.ts checks Payload session cookie
  → if not admin role → redirect to /admin/login
  → Payload RootLayout + RootPage rendered server-side
```

### Search query (`/api/search`)

```
Browser (NavSearch or /search page)
  → GET /api/search?q=<query>&type=<optional>
  → PostgresSearchProvider:
      1. websearch_to_tsquery FTS (fast, exact match)
      2. pg_trgm similarity fallback (fuzzy, if FTS returns 0)
  → deduplicated, ranked results
  → JSON response
```

---

## Key Architectural Decisions

### Why embedded CMS?

Payload CMS runs inside the Next.js process — no separate CMS server to deploy or
maintain. Admin and public site share one database connection pool and one deploy.

### Why Drizzle / Postgres only?

Drizzle gives typed query results without an ORM abstraction layer. PostGIS is
only available in Postgres, and it gives us accurate geographic queries for the
Pakistan study site map (distance in metres on a spheroid, not planar degrees).

### Why Server Components by default?

Server Components keep Payload queries on the server — no client-side data
fetching, no API exposure for content that is just rendered HTML. `'use client'`
is added only where interactivity genuinely requires it (map, search, 2FA flow).

### Why no next-intl / i18n?

The lab's content is English-only. next-intl was scaffolded but removed to
eliminate the locale routing layer and locale-table joins. If Urdu is added
in the future, run `npm run payload generate:migration` after re-enabling
`localization` in `payload.config.ts` and adding the `ur` locale.

### TOTP 2FA (not a package)

AES-256-GCM encrypted TOTP secrets stored in the `users` table. Backup codes
are hashed (bcrypt) and single-use. Implemented without an external auth package
to avoid supply-chain dependencies on authentication code.

---

## Data Model (abbreviated)

```
users
  id, email, password, role, totp_enabled, totp_secret,
  totp_backup_codes, created_at, updated_at

people
  id, name, title, bio (richText), photo → media, role,
  research_interests, affiliation, display_order, status, slug

publications
  id, title, authors[], year, journal, doi, type,
  abstract (richText), pdf_url, citation_count

projects
  id, title, slug, summary, description (richText),
  status, featured_image → media, team_members → people[]

study_sites
  id, name, district, province, location geography(Point,4326),
  project_id → projects

blog_posts
  id, title, slug, content (richText), cover_image → media,
  author → users, status, published_at, scheduled_publish_at,
  tags[]

media
  id, filename, url, alt, width, height, sizes{},
  mime_type, is_demo, source_url, source_author, source_license
```

---

## CI / CD Pipeline

```
git push main
  → GitHub Actions: ci.yml
      • typecheck (tsc --noEmit)
      • lint (eslint)
      • unit tests (vitest)
      • npm audit --audit-level=high
  → GitHub Actions: deploy.yml
      • vercel deploy --prod
          → payload migrate (runs pending migrations first)
          → next build
          → swap production deployment
  → GitHub Actions: codeql.yml (weekly + on push)
      • CodeQL JS/TS security scan
```

Scheduled jobs:

```
  cron/citations         → daily 02:00 UTC via scheduled.yml
  cron/publish-scheduled → hourly via scheduled.yml
```

---

## Security Posture

| Control             | Implementation                                                           |
| ------------------- | ------------------------------------------------------------------------ |
| Auth                | Payload JWT + optional TOTP 2FA                                          |
| RBAC                | `super_admin` / `editor` / `contributor` roles on every collection       |
| SSRF                | `parseDoi()` validates DOI format before building Crossref URL           |
| Rate limiting       | `@upstash/ratelimit` on all public API routes                            |
| Security headers    | `next.config.ts` + `src/middleware.ts`: CSP, HSTS, X-Frame-Options, etc. |
| Secret scanning     | GitHub secret scanning + `.github/secret_scanning.yml`                   |
| Dependency scanning | `npm audit --audit-level=high` in CI                                     |
| Error tracking      | Sentry (client + server) with PII scrubbing                              |
| Timeouts            | `AbortSignal.timeout(8000)` on all third-party fetches                   |
