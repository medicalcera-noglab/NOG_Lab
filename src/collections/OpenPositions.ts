import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { isAdminOrEditor } from '../access'
import { revalidateOpenPositions, revalidateOpenPositionsOnDelete } from '../hooks/revalidateCache'
import { makeAuditChangeHook, makeAuditDeleteHook } from '../hooks/auditLog'

export const OpenPositions: CollectionConfig = {
  slug: 'open_positions',
  labels: { singular: 'Open Position', plural: 'Open Positions' },
  admin: {
    hideAPIURL: true,
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'type', 'is_active', 'updatedAt'],
    hidden: ({ user }) => {
      const role = (user as { role?: string } | null)?.role
      return !role || role === 'contributor'
    },
  },
  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    afterChange: [revalidateOpenPositions, makeAuditChangeHook('open_positions')],
    afterDelete: [revalidateOpenPositionsOnDelete, makeAuditDeleteHook('open_positions')],
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
      editor: lexicalEditor({
        features: ({ defaultFeatures }) =>
          defaultFeatures.filter((f) =>
            ['bold', 'italic', 'underline', 'paragraph', 'link'].includes(f.key ?? ''),
          ),
      }),
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
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Position Cover / Feature Image',
      admin: {
        description: 'Image displayed on the Join Us page for this open position.',
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
