import type { CollectionConfig } from 'payload'
import { isAdminOrEditor, isAuthenticated } from '../access'
import { revalidateOpenPositions } from '../hooks/revalidateCache'
import { makeAuditChangeHook, makeAuditDeleteHook } from '../hooks/auditLog'

export const OpenPositions: CollectionConfig = {
  slug: 'open_positions',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'type', 'is_active', 'updatedAt'],
  },
  access: {
    read: isAuthenticated,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    afterChange: [revalidateOpenPositions, makeAuditChangeHook('open_positions')],
    afterDelete: [makeAuditDeleteHook('open_positions')],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'description',
      type: 'richText',
      required: true,
      localized: true,
    },
    {
      name: 'type',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'e.g. PhD Fellowship, Postdoc, Research Assistant',
      },
    },
    {
      name: 'is_active',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Uncheck to hide from the public site.',
      },
    },
    {
      name: 'isDemo',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Demo content — remove with npm run seed:clear-demo.',
      },
    },
  ],
}
