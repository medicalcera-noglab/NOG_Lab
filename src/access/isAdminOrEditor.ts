import type { Access } from 'payload'

export const isAdminOrEditor: Access = ({ req }) => {
  const role = (req.user as { role?: string } | null)?.role
  return role === 'super_admin' || role === 'editor'
}
