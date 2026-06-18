import type { CollectionConfig } from 'payload'
import { isAdminOrEditor, isAuthenticated, isOwnerDraftOnly, canCreateContent } from '../access'
import { makeSlugHook } from '../hooks/makeSlug'
import { computeReadingTimeHook } from '../hooks/computeReadingTime'
import { setPublishedAtHook } from '../hooks/setPublishedAt'
import { setCreatedByHook } from '../hooks/setCreatedBy'

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
      throw new Error('Contributors cannot publish content. Set status to draft or review.')
    }
    if (originalDoc?.status === 'published') {
      throw new Error('Contributors cannot edit published content.')
    }
  }
  return data
}

export const BlogPosts: CollectionConfig = {
  slug: 'blog_posts',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'author', 'status', 'publishedAt'],
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
      computeReadingTimeHook,
      setPublishedAtHook,
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
        description: 'Auto-set on first publish.',
      },
    },
    {
      name: 'body',
      type: 'richText',
      required: true,
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'people',
      required: true,
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'readingTimeMinutes',
      type: 'number',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Auto-computed from body word count.',
      },
    },
    {
      name: 'seoMeta',
      type: 'group',
      label: 'SEO',
      fields: [
        {
          name: 'title',
          type: 'text',
          admin: { description: 'Defaults to post title if empty.' },
        },
        {
          name: 'description',
          type: 'textarea',
          admin: { description: '120–160 characters recommended.' },
        },
      ],
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
