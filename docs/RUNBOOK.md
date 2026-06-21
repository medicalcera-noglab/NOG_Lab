# NOG Lab — Operations Runbook

Procedures for the engineer on call.

---

## Health Check

```bash
# Quick check — expects {"status":"ok"}
curl https://noglab.org/api/health

# With latency
curl -w "\nTotal: %{time_total}s\n" https://noglab.org/api/health
```

Alerted? Check in this order: Vercel status → Neon DB status → Cloudflare R2 status.

---

## Deployments

Deployments are automatic on push to `main`:

```
git push origin main
```

Vercel runs migrations (`payload migrate`) before starting the new instance.
Monitor progress in the [Vercel dashboard](https://vercel.com/dashboard).

### Roll back a deployment

```bash
# Via Vercel CLI
vercel rollback

# Or in the dashboard: Deployments → previous deployment → "Promote to Production"
```

Rollback is safe as long as the database schema is backward-compatible.
If the rolled-back version has a schema dependency on a newer migration, restore
the DB from backup first (see below).

---

## Database

Connection string is in `DATABASE_URI` (Vercel env vars). For Neon:

```
postgresql://<user>:<password>@<host>.neon.tech/<dbname>?sslmode=require
```

### Run a migration manually

```bash
npm run payload migrate
```

### Check pending migrations

```bash
npm run payload migrate:status
```

### Connect via psql

```bash
psql "$DATABASE_URI"
```

---

## Backup & Restore Drill

Neon provides automatic PITR (point-in-time restore) for 7 days on paid plans.

### Verify backup exists

In the Neon console → your project → **Branches** → confirm the branch
`main` has a recent restore point.

### Restore from PITR

1. In the Neon console, click **Restore** on the `main` branch.
2. Select the restore point (date/time).
3. Neon creates a new branch at that point — test it against staging.
4. If confirmed good, swap the `DATABASE_URI` in Vercel to point to the
   restored branch and redeploy.

### Manual pg_dump

```bash
pg_dump "$DATABASE_URI" --format=custom --no-acl --no-owner -f backup-$(date +%Y%m%d).dump
```

### Restore from pg_dump

```bash
pg_restore --clean --no-acl --no-owner -d "$DATABASE_URI" backup-20260101.dump
```

> **Important:** After restoring the DB, redeploy the app so Payload's migration
> table (`payload_migrations`) matches the actual schema.

---

## Cron Jobs

Two cron jobs run via GitHub Actions (`.github/workflows/scheduled.yml`):

| Job               | Schedule        | Secret header                        |
| ----------------- | --------------- | ------------------------------------ |
| Citation update   | Daily 02:00 UTC | `x-cron-secret: $CRON_SECRET`        |
| Scheduled publish | Hourly          | `Authorization: Bearer $CRON_SECRET` |

### Trigger manually

```bash
# Citations
curl -X GET https://noglab.org/api/cron/citations \
  -H "x-cron-secret: $CRON_SECRET"

# Publish scheduled posts
curl -X GET https://noglab.org/api/cron/publish-scheduled \
  -H "Authorization: Bearer $CRON_SECRET"
```

### Cron job fails (401)

`CRON_SECRET` GitHub secret is missing or mismatched with the Vercel env var.
Verify both match in GitHub Secrets and Vercel env vars.

---

## Media / R2 Storage

- Public media is served from `R2_PUBLIC_URL` (Cloudflare CDN).
- Applicant CV files are private, served via Payload's signed-URL proxy (15 min).
- If `R2_*` env vars are missing, Payload falls back to local disk — not suitable
  for production.

### Check R2 credentials are set

```bash
vercel env pull .env.vercel.local
grep R2_ .env.vercel.local
```

---

## Sentry

Error tracking is live when `NEXT_PUBLIC_SENTRY_DSN` is set.
Check [sentry.io](https://sentry.io) → NOG Lab project for recent errors.

### Trigger a test error (verify Sentry is wired)

```bash
# In the browser console on the live site:
# Open DevTools → Console → paste:
throw new Error('Sentry test from runbook')
```

The error should appear in Sentry within ~30 seconds.

### Source maps

Source maps are uploaded to Sentry during CI when `SENTRY_AUTH_TOKEN`,
`SENTRY_ORG`, and `SENTRY_PROJECT` are set as GitHub secrets.

---

## Rotating Secrets

| Secret                                      | Where to rotate                 | Steps                                                                        |
| ------------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------- |
| `PAYLOAD_SECRET`                            | Vercel env vars                 | Rotate → redeploy → existing sessions invalidated (users re-log in)          |
| `CRON_SECRET`                               | Vercel + GitHub secrets         | Rotate both at the same time; update GitHub secret before next scheduled run |
| `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` | Cloudflare R2 → API tokens      | Create new key → update Vercel → delete old key                              |
| `SENTRY_AUTH_TOKEN`                         | Sentry → Settings → Auth Tokens | Revoke old → create new → update GitHub secret                               |

---

## Incident Response

1. **Check `/api/health`** — if 503, database is unreachable.
2. **Check Vercel logs** — `vercel logs --follow` or dashboard.
3. **Check Neon console** — connection limits, compute suspended.
4. **Roll back** if a recent deploy caused the issue.
5. **Open a post-mortem** within 24 hours — add to `docs/postmortems/`.

---

## Common Errors

### "Cannot find module '@payload-config'"

Migration or build was run with the wrong Node version. Ensure Node 22 is active:

```bash
nvm use 22
npm run payload migrate
```

### Admin panel stuck on "Initializing…"

Clear the browser's local storage for the admin origin, or open in incognito.
Usually caused by a stale Payload cookie from a different secret.

### Map shows no tiles

OpenStreetMap or CARTO tile servers may be rate-limiting. The map shows a
"tiles unavailable" banner but site markers remain functional. No action needed
unless the outage persists > 1 hour.
