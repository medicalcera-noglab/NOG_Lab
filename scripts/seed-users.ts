/**
 * Seeds the three default admin accounts (super_admin, editor, contributor).
 * Idempotent — safe to run multiple times.
 *
 * Credentials come from env or fall back to safe defaults shown below.
 * Override via .env.local:
 *   SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD
 *   SEED_EDITOR_EMAIL / SEED_EDITOR_PASSWORD
 *   SEED_CONTRIBUTOR_EMAIL / SEED_CONTRIBUTOR_PASSWORD
 */

import { getPayload } from 'payload'
import configPromise from '../payload.config'

async function main() {
  const payload = await getPayload({ config: configPromise })

  const accounts: Array<{
    email: string
    password: string
    role: 'super_admin' | 'editor' | 'contributor'
  }> = [
    {
      email: process.env.SEED_ADMIN_EMAIL ?? 'admin@noglab.org',
      password: process.env.SEED_ADMIN_PASSWORD ?? 'changeme-in-prod!',
      role: 'super_admin',
    },
    {
      email: process.env.SEED_EDITOR_EMAIL ?? 'editor@noglab.org',
      password: process.env.SEED_EDITOR_PASSWORD ?? 'editor-changeme!',
      role: 'editor',
    },
    {
      email: process.env.SEED_CONTRIBUTOR_EMAIL ?? 'contributor@noglab.org',
      password: process.env.SEED_CONTRIBUTOR_PASSWORD ?? 'contributor-changeme!',
      role: 'contributor',
    },
  ]

  for (const account of accounts) {
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: account.email } },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      console.log(`[seed:users] already exists — ${account.email} (${account.role})`)
    } else {
      await payload.create({ collection: 'users', data: account })
      console.log(`[seed:users] created — ${account.email} (${account.role})`)
    }
  }

  console.log('[seed:users] done')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
