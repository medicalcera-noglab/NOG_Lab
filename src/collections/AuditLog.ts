import type { CollectionConfig } from 'payload'
import { isSuperAdmin } from '../access'

export const AuditLog: CollectionConfig = {
  slug: 'audit_log',
  admin: {
    useAsTitle: 'action',
    group: 'Admin',
    defaultColumns: ['user', 'action', 'entityType', 'createdAt'],
  },
  access: {
    read: isSuperAdmin,
    create: () => false, // populated only by hooks
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'action',
      type: 'select',
      required: true,
      options: ['create', 'update', 'delete', 'publish', 'login'],
    },
    {
      name: 'entityType',
      type: 'text',
      required: true,
    },
    {
      name: 'entityId',
      type: 'text',
    },
    {
      name: 'diff',
      type: 'json',
    },
    {
      name: 'createdAt',
      type: 'date',
      admin: {
        readOnly: true,
        date: {
          displayFormat: 'dd MMM yyyy HH:mm',
        },
      },
    },
  ],
  timestamps: false,
}
