import type { Access, Where } from 'payload'

/**
 * Used for blog_posts and news_events update/delete.
 * - super_admin / editor: unrestricted
 * - contributor: can only access their own docs whose status is NOT published
 * - everyone else: denied
 */
export const isOwnerDraftOnly: Access = ({ req }) => {
  if (!req.user) return false
  const role = (req.user as { role?: string }).role
  if (role === 'super_admin' || role === 'editor') return true
  if (role === 'contributor') {
    const clause: Where = {
      and: [
        { createdBy: { equals: req.user.id } } as Where,
        { status: { not_in: ['published'] } } as Where,
      ],
    }
    return clause
  }
  return false
}

/**
 * Create access for contributor-eligible collections.
 * Contributors can create; super_admin/editor can create.
 */
export const canCreateContent: Access = ({ req }) => {
  const role = (req.user as { role?: string } | null)?.role
  return role === 'super_admin' || role === 'editor' || role === 'contributor'
}
