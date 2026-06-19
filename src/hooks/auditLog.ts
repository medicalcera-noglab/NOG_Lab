/**
 * Audit log hooks — write a row to `audit_log` on every content change/delete.
 *
 * Usage:
 *   hooks: {
 *     afterChange: [revalidatePeople, makeAuditChangeHook('people')],
 *     afterDelete: [makeAuditDeleteHook('people')],
 *   }
 *
 * System operations (cron, overrideAccess without a user) are skipped silently.
 * Errors are swallowed so a logging failure never breaks the primary operation.
 */
import { getPayload } from 'payload'
import config from '@payload-config'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'

// Fields excluded from diffs — timestamps, internal Payload prefixes, slug
const NOISY: ReadonlySet<string> = new Set([
  'id',
  'createdAt',
  'updatedAt',
  '_status',
  'publishedAt',
  'scheduledPublishAt',
])

type JsonObj = Record<string, unknown>

function computeDiff(
  prev: JsonObj,
  next: JsonObj,
): Record<string, { from: unknown; to: unknown }> | null {
  const diff: Record<string, { from: unknown; to: unknown }> = {}
  const keys = new Set([...Object.keys(prev), ...Object.keys(next)])
  for (const k of keys) {
    if (NOISY.has(k) || k.startsWith('_')) continue
    const a = JSON.stringify(prev[k])
    const b = JSON.stringify(next[k])
    if (a !== b) diff[k] = { from: prev[k], to: next[k] }
  }
  return Object.keys(diff).length ? diff : null
}

function summarize(doc: JsonObj): JsonObj {
  const out: JsonObj = {}
  for (const [k, v] of Object.entries(doc)) {
    if (NOISY.has(k) || k.startsWith('_')) continue
    // Truncate large strings/objects to keep the snapshot readable
    if (typeof v === 'string' && v.length > 200) out[k] = v.slice(0, 200) + '…'
    else if (v !== null && typeof v === 'object' && !Array.isArray(v)) out[k] = '[object]'
    else out[k] = v
  }
  return out
}

async function write(data: {
  userId: string | number
  action: 'create' | 'update' | 'delete'
  entityType: string
  entityId: string
  diff: JsonObj | null
}) {
  try {
    const payload = await getPayload({ config })
    await payload.create({
      collection: 'audit_log',
      data: {
        user: Number(data.userId),
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        diff: data.diff,
        createdAt: new Date().toISOString(),
      },
      overrideAccess: true,
    })
  } catch {
    // Audit log failure must never disrupt the primary operation.
  }
}

export function makeAuditChangeHook(entityType: string): CollectionAfterChangeHook {
  return async ({ doc, previousDoc, req, operation }) => {
    const userId = (req.user as { id?: string | number } | null)?.id
    if (!userId) return // Skip system / cron operations

    const diff =
      operation === 'update' && previousDoc
        ? computeDiff(previousDoc as JsonObj, doc as JsonObj)
        : { snapshot: summarize(doc as JsonObj) }

    await write({
      userId,
      action: operation === 'create' ? 'create' : 'update',
      entityType,
      entityId: String(doc.id),
      diff,
    })
  }
}

export function makeAuditDeleteHook(entityType: string): CollectionAfterDeleteHook {
  return async ({ doc, req }) => {
    const userId = (req.user as { id?: string | number } | null)?.id
    if (!userId) return

    await write({
      userId,
      action: 'delete',
      entityType,
      entityId: String(doc.id),
      diff: { deleted: summarize(doc as JsonObj) },
    })
  }
}

export function makeGlobalAuditChangeHook(entityType: string): GlobalAfterChangeHook {
  return async ({ doc, previousDoc, req }) => {
    const userId = (req.user as { id?: string | number } | null)?.id
    if (!userId) return

    const diff = previousDoc
      ? computeDiff(previousDoc as JsonObj, doc as JsonObj)
      : { snapshot: summarize(doc as JsonObj) }

    await write({
      userId,
      action: 'update',
      entityType,
      entityId: 'global',
      diff,
    })
  }
}
