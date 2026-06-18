import type { Access } from 'payload'

export const isSuperAdmin: Access = ({ req }) => {
  return (req.user as { role?: string } | null)?.role === 'super_admin'
}
