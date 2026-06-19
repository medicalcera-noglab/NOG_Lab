# Backup and Restore — NOG Lab

## Primary fast-restore path: Neon PITR

Neon PostgreSQL provides **Point-in-Time Recovery (PITR)** on all paid plans.

| Neon Plan | History window | PITR granularity |
| --------- | -------------- | ---------------- |
| Launch    | 7 days         | ~5 minutes       |
| Scale     | 30 days        | ~5 minutes       |
| Business  | 30 days        | ~1 minute        |

**To restore via PITR (Neon console):**

1. Open the Neon console → your project → **Branches**.
2. Click **Restore** on the main branch.
3. Choose the target timestamp (UTC) and confirm.
4. The branch rolls back; the pooled/direct connection strings remain unchanged.
5. Verify data integrity with a Payload admin login and a spot-check query.

> PITR is the **first choice for recent mistakes** (accidental bulk delete, bad migration).
> Use the logical backup (below) for older than the PITR window or for off-platform recovery.

---

## Independent daily logical backup (GitHub Actions → R2)

The `.github/workflows/scheduled.yml` `backup` job runs at **02:30 UTC daily**:

1. `pg_dump` via `NEON_DIRECT_URL` (connection string in GitHub Actions secrets)
   — produces a pg_dump custom-format archive (binary, efficient, restores with `pg_restore`)
2. Encrypted with GPG using the lab's backup public key (`BACKUP_GPG_KEY_ID` secret)
3. Uploaded to `s3://R2_BUCKET/backups/noglab-YYYYMMDDTHHMMSSZ.pgdump.gpg`
4. Objects older than **30 days** are pruned in the same job

### GitHub Actions secrets required for backup

| Secret                  | Description                                                              |
| ----------------------- | ------------------------------------------------------------------------ |
| `NEON_DIRECT_URL`       | Direct (non-pooled) Neon connection string                               |
| `R2_ACCOUNT_ID`         | Cloudflare account ID                                                    |
| `R2_ACCESS_KEY_ID`      | R2 API key with read/write on the bucket                                 |
| `R2_SECRET_ACCESS_KEY`  | R2 API secret                                                            |
| `R2_BUCKET`             | Bucket name (same as `R2_BUCKET` env var)                                |
| `BACKUP_GPG_PUBLIC_KEY` | ASCII-armoured GPG public key (export with `gpg --armor --export KEYID`) |
| `BACKUP_GPG_KEY_ID`     | Key fingerprint or email that identifies the recipient                   |

---

## Restore procedure (logical backup)

### Prerequisites

- `pg_restore` matching the PostgreSQL version used by Neon (currently 16)
- Private GPG key corresponding to `BACKUP_GPG_KEY_ID` (kept offline / in a secure vault)
- AWS CLI configured with R2 credentials

### Steps

```bash
# 1. List available backups
aws s3 ls s3://<BUCKET>/backups/ \
  --endpoint-url "https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com"

# 2. Download the backup you want to restore
BACKUP=noglab-20260620T023012Z.pgdump.gpg
aws s3 cp "s3://<BUCKET>/backups/${BACKUP}" ./ \
  --endpoint-url "https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com"

# 3. Decrypt
gpg --output "${BACKUP%.gpg}" --decrypt "${BACKUP}"

# 4. Restore to a NEW Neon branch (never restore directly to production)
#    Create the branch first via the Neon console or CLI, then:
pg_restore \
  --dbname "postgresql://user:pass@ep-NEW-BRANCH.neon.tech/noglab?sslmode=require" \
  --no-owner \
  --no-privileges \
  --clean \
  "${BACKUP%.gpg}"

# 5. Verify data integrity
psql "postgresql://user:pass@ep-NEW-BRANCH.neon.tech/noglab?sslmode=require" \
  -c "SELECT count(*) FROM users; SELECT count(*) FROM publications;"

# 6. If satisfied, promote the branch to main in the Neon console
#    (or update the DATABASE_URL / DIRECT_URL in Vercel to point to the restored branch)

# 7. Shred the local plaintext dump
shred -u "${BACKUP%.gpg}"
```

### After restore

- Re-run `npx payload migrate` against the restored branch if the restore predates a migration.
- Trigger a full ISR revalidation: `curl -X POST https://noglab.org/api/revalidate` (or redeploy).
- Smoke-test: login to `/admin`, verify latest content, check the public site.

---

## Smoke-test checklist after any restore

- [ ] Admin login succeeds (TOTP if enabled)
- [ ] `/api/cron/citations` returns `{ ok: true }` (with correct `CRON_SECRET`)
- [ ] `/people`, `/publications`, `/projects` pages load with expected data
- [ ] File uploads (media) still resolve via R2 CDN URL (files are in R2, not the DB)
- [ ] Sitemap (`/sitemap.xml`) lists expected slugs
- [ ] No 500 errors in Vercel function logs for 10 minutes post-restore
