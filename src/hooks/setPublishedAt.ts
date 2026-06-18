import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Automatically sets `publishedAt` to now the first time a document's
 * status transitions to 'published'. Subsequent saves don't overwrite it
 * so the original publication date is preserved.
 */
export const setPublishedAtHook: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  if (!data) return data

  if (data.status === 'published' && !originalDoc?.publishedAt) {
    data.publishedAt = new Date().toISOString()
  }

  return data
}
