import type { CollectionConfig } from 'payload'
import { isAdminOrEditor, isAuthenticated } from '../access'

export const Publications: CollectionConfig = {
  slug: 'publications',
  admin: {
    useAsTitle: 'title',
    group: 'Research',
    defaultColumns: ['title', 'year', 'type', 'isOpenAccess'],
  },
  access: {
    read: isAuthenticated,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: 'doi',
      type: 'text',
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'Digital Object Identifier — must be unique.',
        components: {
          // Renders a "Fetch metadata from DOI" button that calls POST /api/doi-fetch
          // and populates the form fields from Crossref.
          afterInput: ['@/components/admin/DoiFetchButton#DoiFetchButton'],
        },
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'authors',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'author',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'authorLinks',
      type: 'relationship',
      relationTo: 'people',
      hasMany: true,
      label: 'Lab Members (linked)',
      admin: {
        description: 'Link to lab member profiles for those who appear in the authors list.',
      },
    },
    {
      name: 'journal',
      type: 'text',
    },
    {
      name: 'year',
      type: 'number',
      required: true,
      min: 1900,
      max: 2100,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Journal Article', value: 'journal_article' },
        { label: 'Conference Paper', value: 'conference' },
        { label: 'Preprint', value: 'preprint' },
        { label: 'Book Chapter', value: 'book_chapter' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'themeTags',
      type: 'relationship',
      relationTo: 'research_themes',
      hasMany: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'pdf',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'isOpenAccess',
      type: 'checkbox',
      defaultValue: false,
      label: 'Open Access',
      admin: { position: 'sidebar' },
    },
    {
      name: 'citationCount',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: { position: 'sidebar' },
    },
    {
      name: 'abstract',
      type: 'richText',
    },
    {
      name: 'crossrefRaw',
      type: 'json',
      admin: {
        readOnly: true,
        description: 'Raw Crossref API response. Auto-populated.',
      },
    },
  ],
}
