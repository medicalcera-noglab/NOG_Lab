import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

/**
 * Adds TOTP two-factor authentication columns to the users table:
 *   - totp_secret           TEXT         — AES-256-GCM ciphertext of the TOTP secret
 *   - totp_enabled          BOOLEAN      — whether 2FA is active for this user
 *   - backup_codes          JSONB        — array of SHA-256-hashed single-use codes
 *   - totp_failed_attempts  INTEGER      — consecutive failed 2FA attempts (for lockout)
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS totp_secret           TEXT,
      ADD COLUMN IF NOT EXISTS totp_enabled          BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS backup_codes          JSONB,
      ADD COLUMN IF NOT EXISTS totp_failed_attempts  INTEGER NOT NULL DEFAULT 0
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE users
      DROP COLUMN IF EXISTS totp_secret,
      DROP COLUMN IF EXISTS totp_enabled,
      DROP COLUMN IF EXISTS backup_codes,
      DROP COLUMN IF EXISTS totp_failed_attempts
  `)
}
