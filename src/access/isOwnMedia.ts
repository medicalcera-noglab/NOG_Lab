import type { Access } from 'payload'

/**
 * Media: super_admin/editor full access; contributor can manage their own uploads.
 */
export const isOwnMediaOrAdmin: Access = ({ req }) => {
  if (!req.user) return false
  const role = (req.user as { role?: string }).role
  if (role === 'super_admin' || role === 'editor') return true
  if (role === 'contributor') {
    return { createdBy: { equals: req.user.id } }
  }
  return false
}
