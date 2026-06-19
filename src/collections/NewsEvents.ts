import type { CollectionConfig } from 'payload'
import { isAdminOrEditor, isAuthenticated, isOwnerDraftOnly, canCreateContent } from '../access'
import { setPublishedAtHook } from '../hooks/setPublishedAt'
import { setCreatedByHook } from '../hooks/setCreatedBy'
import { makeEnsureUniqueFeaturedHook } from '../hooks/ensureUniqueFeature'
import { makeSlugHook } from '../hooks/makeSlug'

const preventContributorPublish = ({
  data,
  req,
  originalDoc,
}: {
  data: Record<string, unknown>
  req: { user: { role?: string } | null }
  originalDoc?: Record<string, unknown>
}) => {
  if (!req.user) return data
  const role = (req.user as { role?: string }).role
  if (role === 'contributor') {
    if (data.status === 'published') {
      throw new Error('Contributors cannot publish news/events.')
    }
    if (originalDoc?.status === 'published') {
      throw new Error('Contributors cannot edit published content.')
    }
  }
  return data
}

export const NewsEvents: CollectionConfig = {
  slug: 'news_events',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'category', 'date', 'isFeaturedHome'],
  },
  versions: {
    drafts: true,
  },
  access: {
    read: isAuthenticated,
    create: canCreateContent,
    update: isOwnerDraftOnly,
    delete: isAdminOrEditor,
  },
  hooks: {
    beforeValidate: [makeSlugHook('title')],
    beforeChange: [
      setCreatedByHook,
      setPublishedAtHook,
      makeEnsureUniqueFeaturedHook('news_events'),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      preventContributorPublish as any,
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'body',
      type: 'richText',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'In Review', value: 'review' },
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
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Award', value: 'award' },
        { label: 'Grant', value: 'grant' },
        { label: 'Talk', value: 'talk' },
        { label: 'Conference', value: 'conference' },
        { label: 'Press', value: 'press' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: {
        date: { displayFormat: 'dd MMM yyyy' },
      },
    },
    {
      name: 'venue',
      type: 'text',
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'isFeaturedHome',
      type: 'checkbox',
      defaultValue: false,
      label: 'Featured on Home Page',
      admin: {
        position: 'sidebar',
        description: 'Only one news/event can be featured at a time.',
      },
    },
    {
      name: 'registerUrl',
      type: 'text',
      label: 'Registration URL',
    },
    {
      name: 'scheduledPublishAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { displayFormat: 'dd MMM yyyy HH:mm' },
        description: 'Schedule future publication (requires a cron job — wired in a later step).',
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
        readOnly: true,
        condition: (_, siblingData) => Boolean(siblingData?.id),
      },
    },
  ],
}
