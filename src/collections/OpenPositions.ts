import type { CollectionConfig } from 'payload'
import { isAdminOrEditor, isAuthenticated } from '../access'

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
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'richText',
      required: true,
    },
    {
      name: 'type',
      type: 'text',
      required: true,
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
  ],
}
