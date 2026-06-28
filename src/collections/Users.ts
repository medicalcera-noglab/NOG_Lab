import type { CollectionConfig } from 'payload'
import { isSuperAdmin } from '../access'
import { afterLoginTotpChallenge } from '../hooks/afterLoginTotpChallenge'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 1800, // 30 min — matches idle timeout
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000, // 15 min in ms
    useAPIKey: false,
    // Payload handles forgot-password / reset-password via built-in endpoints:
    // POST /api/users/forgot-password  →  POST /api/users/reset-password
    // Email delivery goes through the adapter in payload.config.ts.
  },
  admin: {
    hideAPIURL: true,
    useAsTitle: 'email',
    group: 'Admin',
    defaultColumns: ['email', 'role', 'totpEnabled', 'updatedAt'],
    hidden: ({ user }) => {
      // Contributors and editors cannot browse the Users list.
      const role = (user as { role?: string } | null)?.role
      return role !== 'super_admin'
    },
  },
  hooks: {
    afterLogin: [afterLoginTotpChallenge],
  },
  access: {
    read: isSuperAdmin,
    create: isSuperAdmin,
    update: isSuperAdmin,
    delete: isSuperAdmin,
    unlock: isSuperAdmin,
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'contributor',
      options: [
        { label: 'Super Admin', value: 'super_admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Contributor', value: 'contributor' },
      ],
      admin: { position: 'sidebar' },
    },
    // ── TOTP fields — managed exclusively via /api/totp/* endpoints ───────────
    {
      name: 'totpSecret',
      type: 'text',
      // AES-256-GCM ciphertext (hex). Field access blocks it from every API response.
      admin: { hidden: true },
      access: {
        read: () => false,
        update: () => false,
      },
    },
    {
      name: 'totpEnabled',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Two-factor authentication status',
      },
      access: {
        // Only the TOTP endpoints flip this via direct DB write (bypass access).
        update: () => false,
      },
    },
    {
      name: 'backupCodes',
      type: 'json',
      // Array of bcrypt-hashed single-use codes. Never returned to the client.
      admin: { hidden: true },
      access: {
        read: () => false,
        update: () => false,
      },
    },
    {
      name: 'totpFailedAttempts',
      type: 'number',
      defaultValue: 0,
      admin: { hidden: true },
      access: { read: () => false, update: () => false },
    },
  ],
}
