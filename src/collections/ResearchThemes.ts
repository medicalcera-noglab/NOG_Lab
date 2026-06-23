import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access'
import { makeSlugHook } from '../hooks/makeSlug'
import {
  revalidateResearchThemes,
  revalidateResearchThemesOnDelete,
} from '../hooks/revalidateCache'
import { makeAuditChangeHook, makeAuditDeleteHook } from '../hooks/auditLog'

export const ResearchThemes: CollectionConfig = {
  slug: 'research_themes',
  labels: { singular: 'Research Theme', plural: 'Research Themes' },
  admin: {
    useAsTitle: 'name',
    group: 'Research',
    defaultColumns: ['name', 'color', 'displayOrder'],
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
    beforeValidate: [makeSlugHook('name')],
    afterChange: [revalidateResearchThemes, makeAuditChangeHook('research_themes')],
    afterDelete: [revalidateResearchThemesOnDelete, makeAuditDeleteHook('research_themes')],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'Auto-generated from name. Edit only when intentionally changing the URL.',
      },
    },
    {
      name: 'description',
      type: 'richText',
      admin: {
        description: 'Aim for 100–150 words.',
      },
    },
    {
      name: 'icon',
      type: 'text',
      admin: {
        description: 'Lucide icon name, e.g. "microscope" or "activity".',
      },
    },
    {
      name: 'color',
      type: 'text',
      required: true,
      admin: {
        description: "Hex color for this theme's map marker, e.g. #0E6E6E",
      },
    },
    {
      name: 'themeImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Theme Image',
      admin: {
        description: 'Illustration displayed in the research theme section.',
      },
    },
    {
      name: 'methods',
      type: 'array',
      fields: [
        {
          name: 'method',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'displayOrder',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar' },
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
