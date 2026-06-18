import type { GlobalConfig } from 'payload'
import { isSuperAdmin } from '../access'

export const SiteSettings: GlobalConfig = {
  slug: 'site_settings',
  label: 'Site Settings',
  admin: {
    group: 'Admin',
    description: 'Global site configuration — lab name, branding, footer, SEO, CTAs.',
  },
  versions: {
    drafts: true,
    max: 20,
  },
  access: {
    read: isSuperAdmin,
    update: isSuperAdmin,
  },
  fields: [
    {
      name: 'labName',
      type: 'text',
      required: true,
      label: 'Lab Name',
    },
    {
      name: 'tagline',
      type: 'text',
      label: 'Tagline',
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'footerText',
      type: 'richText',
      label: 'Footer Text',
    },
    {
      name: 'copyright',
      type: 'text',
      label: 'Copyright Line',
    },
    {
      name: 'social',
      type: 'group',
      label: 'Social Links',
      fields: [
        { name: 'twitter', type: 'text', label: 'Twitter/X URL' },
        { name: 'linkedin', type: 'text', label: 'LinkedIn URL' },
        { name: 'researchgate', type: 'text', label: 'ResearchGate URL' },
        { name: 'github', type: 'text', label: 'GitHub URL' },
      ],
    },
    {
      name: 'contactAddress',
      type: 'textarea',
      label: 'Contact / Mailing Address',
    },
    {
      name: 'analyticsId',
      type: 'text',
      label: 'Analytics ID (GA4 / Plausible)',
      admin: { description: 'e.g. G-XXXXXXXXXX' },
    },
    {
      name: 'recaptchaSiteKey',
      type: 'text',
      label: 'reCAPTCHA Site Key',
    },
    {
      name: 'seoDefaults',
      type: 'group',
      label: 'SEO Defaults',
      fields: [
        {
          name: 'titleSuffix',
          type: 'text',
          label: 'Title Suffix',
          admin: { description: 'Appended to every page title, e.g. "| NOG Lab".' },
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Default OG Image',
        },
      ],
    },
    {
      name: 'heroCtaPrimary',
      type: 'group',
      label: 'Hero CTA — Primary',
      fields: [
        { name: 'label', type: 'text' },
        { name: 'href', type: 'text' },
      ],
    },
    {
      name: 'heroCtaSecondary',
      type: 'group',
      label: 'Hero CTA — Secondary',
      fields: [
        { name: 'label', type: 'text' },
        { name: 'href', type: 'text' },
      ],
    },
    {
      name: 'bigQuestions',
      type: 'array',
      label: 'Big Questions',
      admin: {
        description: 'Key research questions displayed on the home page.',
      },
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'newsletterEmbedUrl',
      type: 'text',
      label: 'Newsletter Embed URL',
    },
    {
      name: 'brochure',
      type: 'upload',
      relationTo: 'media',
      label: 'Lab Brochure (PDF)',
    },
  ],
}
