import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access'
import { makeSlugHook } from '../hooks/makeSlug'
import { setPublishedAtHook } from '../hooks/setPublishedAt'
import { revalidateImpactStories } from '../hooks/revalidateCache'
import { makeAuditChangeHook, makeAuditDeleteHook } from '../hooks/auditLog'

export const ImpactStories: CollectionConfig = {
  slug: 'impact_stories',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'status', 'publishedAt'],
  },
  versions: {
    drafts: true,
    maxPerDoc: 20,
  },
  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    beforeValidate: [makeSlugHook('title')],
    beforeChange: [setPublishedAtHook],
    afterChange: [revalidateImpactStories, makeAuditChangeHook('impact_stories')],
    afterDelete: [makeAuditDeleteHook('impact_stories')],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
        date: { displayFormat: 'dd MMM yyyy' },
        description: 'Auto-set on first publish.',
      },
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'body',
      type: 'richText',
      required: true,
      localized: true,
    },
    {
      name: 'relatedProjects',
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
    },
  ],
}
