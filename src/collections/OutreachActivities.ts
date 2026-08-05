import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access'
import { makeSlugHook } from '../hooks/makeSlug'
import { setPublishedAtHook } from '../hooks/setPublishedAt'
import { revalidateOutreach, revalidateOutreachOnDelete } from '../hooks/revalidateCache'
import { makeAuditChangeHook, makeAuditDeleteHook } from '../hooks/auditLog'

export const OutreachActivities: CollectionConfig = {
  slug: 'outreach_activities',
  labels: { singular: 'Outreach Activity', plural: 'Outreach Activities' },
  admin: {
    hideAPIURL: true,
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'date', 'location', 'status'],
    hidden: ({ user }) => {
      const role = (user as { role?: string } | null)?.role
      return !role || role === 'contributor'
    },
  },
  versions: {
    drafts: true,
    maxPerDoc: 20,
  },
  access: {
    read: ({ req }) => (req.user ? true : { status: { equals: 'published' } }),
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    beforeValidate: [makeSlugHook('title')],
    beforeChange: [setPublishedAtHook],
    afterChange: [revalidateOutreach, makeAuditChangeHook('outreach_activities')],
    afterDelete: [revalidateOutreachOnDelete, makeAuditDeleteHook('outreach_activities')],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', unique: true, admin: { position: 'sidebar' } },
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: { description: 'Date of the outreach activity.' },
    },
    {
      name: 'location',
      type: 'text',
      required: true,
      admin: { description: 'e.g. Peshawar, KP' },
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      required: true,
      maxLength: 300,
      admin: { description: 'Brief summary shown on the card.' },
    },
    { name: 'body', type: 'richText', label: 'Full Description' },
    { name: 'coverImage', type: 'upload', relationTo: 'media', label: 'Cover Image' },
    {
      name: 'gallery',
      type: 'array',
      label: 'Photo Gallery',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text' },
      ],
    },
    {
      name: 'relatedProject',
      type: 'relationship',
      relationTo: 'projects',
      label: 'Related Project',
      admin: { description: 'Optional link to a related research project.' },
    },
    {
      name: 'partnerOrgs',
      type: 'array',
      label: 'Partner Organisations',
      fields: [{ name: 'name', type: 'text', required: true }],
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
    { name: 'isDemo', type: 'checkbox', defaultValue: false, admin: { hidden: true } },
  ],
}
