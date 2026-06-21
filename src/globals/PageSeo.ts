import type { GlobalConfig, Field } from 'payload'
import { isAdminOrEditor } from '../access'
import { makeGlobalRevalidateHook } from '../hooks/revalidateCache'

const seoFields: Field[] = [
  {
    name: 'title',
    type: 'text',
    label: 'Page Title',
    admin: {
      description: 'Overrides the default page title. Leave blank to use the hardcoded page title.',
    },
  },
  {
    name: 'description',
    type: 'textarea',
    label: 'Meta Description',
    admin: { description: 'Overrides the meta description. Aim for 150–160 characters.' },
  },
  {
    name: 'ogImage',
    type: 'upload',
    relationTo: 'media',
    label: 'OG Image',
    admin: {
      description: 'Overrides the default OG image for social sharing (1200×630 recommended).',
    },
  },
]

const pageGroup = (name: string, label: string): Field => ({
  name,
  type: 'group',
  label,
  fields: seoFields,
})

export const PageSeo: GlobalConfig = {
  slug: 'page_seo',
  label: 'Page SEO',
  admin: {
    group: 'Site Config',
    description:
      'Per-page SEO overrides — title, description, and OG image for each static page. All fields are optional; blank = use global defaults.',
    hidden: ({ user }) => {
      const role = (user as { role?: string } | null)?.role
      return !role || role === 'contributor'
    },
  },
  access: {
    read: isAdminOrEditor,
    update: isAdminOrEditor,
  },
  hooks: {
    afterChange: [makeGlobalRevalidateHook(['page_seo'])],
  },
  fields: [
    pageGroup('home', 'Home (/)'),
    pageGroup('about', 'About (/about)'),
    pageGroup('research', 'Research (/research)'),
    pageGroup('projects', 'Projects (/projects)'),
    pageGroup('publications', 'Publications (/publications)'),
    pageGroup('collaborations', 'Collaborations (/collaborations)'),
    pageGroup('impact', 'Impact (/impact)'),
    pageGroup('news', 'News (/news)'),
    pageGroup('blog', 'Blog (/blog)'),
    pageGroup('join', 'Join (/join)'),
    pageGroup('contact', 'Contact (/contact)'),
  ],
}
