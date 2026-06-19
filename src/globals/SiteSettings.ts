import type { GlobalConfig } from 'payload'
import { isSuperAdmin } from '../access'
import { revalidateSiteSettings } from '../hooks/revalidateCache'
import { makeGlobalAuditChangeHook } from '../hooks/auditLog'

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
  hooks: {
    afterChange: [revalidateSiteSettings, makeGlobalAuditChangeHook('site_settings')],
  },
  fields: [
    {
      name: 'labName',
      type: 'text',
      required: true,
      label: 'Lab Name',
      localized: true,
    },
    {
      name: 'tagline',
      type: 'text',
      label: 'Tagline',
      localized: true,
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: 'Logo (light mode)',
    },
    {
      name: 'logoDark',
      type: 'upload',
      relationTo: 'media',
      label: 'Logo — dark / reversed (white version for dark mode)',
      admin: {
        description:
          'Upload the white/reversed logo variant. Shown automatically when the site is in dark mode.',
      },
    },
    {
      name: 'footerText',
      type: 'richText',
      label: 'Footer Text',
      localized: true,
    },
    {
      name: 'copyright',
      type: 'text',
      label: 'Copyright Line',
      localized: true,
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
      localized: true,
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
        { name: 'label', type: 'text', localized: true },
        { name: 'href', type: 'text' },
      ],
    },
    {
      name: 'heroCtaSecondary',
      type: 'group',
      label: 'Hero CTA — Secondary',
      fields: [
        { name: 'label', type: 'text', localized: true },
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
          localized: true,
        },
      ],
    },
    {
      name: 'roleLabels',
      type: 'group',
      label: 'People Role Labels',
      admin: {
        description: 'Display labels for each role on the /people page tabs.',
      },
      fields: [
        { name: 'all', type: 'text', defaultValue: 'All', label: 'All (active)', localized: true },
        {
          name: 'pi',
          type: 'text',
          defaultValue: 'Principal Investigators',
          label: 'PI',
          localized: true,
        },
        {
          name: 'postdoc',
          type: 'text',
          defaultValue: 'Postdoctoral Researchers',
          label: 'Postdoc',
          localized: true,
        },
        { name: 'phd', type: 'text', defaultValue: 'PhD Students', label: 'PhD', localized: true },
        { name: 'ms', type: 'text', defaultValue: 'MS Students', label: 'MS', localized: true },
        { name: 'staff', type: 'text', defaultValue: 'Staff', label: 'Staff', localized: true },
        { name: 'alumni', type: 'text', defaultValue: 'Alumni', label: 'Alumni', localized: true },
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
    {
      name: 'googleMapsEmbedUrl',
      type: 'text',
      label: 'Google Maps Embed URL',
      admin: {
        description:
          'Paste the src URL from Google Maps "Embed a map". Shown on /contact with click-to-load.',
      },
    },
    {
      name: 'noOpenPositionsMessage',
      type: 'text',
      label: 'No Open Positions Message',
      localized: true,
      admin: {
        description: 'Shown on /join when no active positions exist.',
      },
      defaultValue:
        'We have no open positions at this time. Check back soon or send a general inquiry.',
    },
    {
      name: 'contactEmail',
      type: 'email',
      label: 'Public Contact Email',
      admin: {
        description: 'Displayed on the /contact page.',
      },
    },
  ],
}
