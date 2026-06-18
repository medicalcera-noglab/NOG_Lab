import type { CollectionBeforeChangeHook, Where } from 'payload'

/**
 * Ensures only one document in the collection can have `isFeaturedHome: true`
 * at a time. When a new document is featured, all others are un-featured.
 */
export const makeEnsureUniqueFeaturedHook =
  (collectionSlug: string): CollectionBeforeChangeHook =>
  async (args) => {
    const { data, req, originalDoc } = args
    if (data?.isFeaturedHome !== true) return data

    const existingId = (originalDoc as { id?: string | number } | undefined)?.id

    const whereClause: Where = existingId
      ? {
          and: [
            { isFeaturedHome: { equals: true } } as Where,
            { id: { not_equals: existingId } } as Where,
          ],
        }
      : { isFeaturedHome: { equals: true } }

    const existing = await req.payload.find({
      collection: collectionSlug as Parameters<typeof req.payload.find>[0]['collection'],
      where: whereClause,
      limit: 100,
      depth: 0,
    })

    await Promise.all(
      existing.docs.map((doc) =>
        req.payload.update({
          collection: collectionSlug as Parameters<typeof req.payload.update>[0]['collection'],
          id: doc.id,
          data: { isFeaturedHome: false },
          depth: 0,
        }),
      ),
    )

    return data
  }
