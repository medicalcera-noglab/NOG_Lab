import type { GlobalConfig } from 'payload'
import { isSuperAdmin } from '../access'
import { revalidateSiteSettings } from '../hooks/revalidateCache'
import { makeGlobalAuditChangeHook } from '../hooks/auditLog'

export const SiteSettings: GlobalConfig = {
  slug: 'site_settings',
  label: 'Site Settings',
  admin: {
    hideAPIURL: true,
    group: 'Site Config',
    description: 'Global site configuration — lab name, branding, footer, SEO, CTAs.',
    hidden: ({ user }) => {
      const role = (user as { role?: string } | null)?.role
      return role !== 'super_admin'
    },
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
    },
    {
      name: 'tagline',
      type: 'text',
      label: 'Hero Headline',
      admin: { description: 'Bold statement displayed as the hero H1 (5–8 words).' },
    },
    {
      name: 'heroSubline',
      type: 'text',
      label: 'Hero Subline',
      admin: {
        description:
          'One-line descriptor shown below the headline — e.g. "Institute of Basic Medical Science, KMU Peshawar".',
      },
    },
    {
      name: 'heroMotto',
      type: 'text',
      label: 'Hero Motto',
      admin: {
        description:
          'Second line shown below the subline in teal italic — e.g. "Advancing Microbiome Science for Better Health".',
      },
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
      name: 'heroMedia',
      type: 'group',
      label: 'Hero Background',
      admin: {
        description:
          'Control the home-page hero background. "Particles" = animated SVG blobs (default). "Video" = looping video. "Image" = static photo.',
      },
      fields: [
        {
          name: 'style',
          type: 'select',
          label: 'Style',
          defaultValue: 'particles',
          options: [
            { label: 'Animated Particles (default)', value: 'particles' },
            { label: 'Looping Video', value: 'video' },
            { label: 'Static Image', value: 'image' },
          ],
        },
        {
          name: 'video',
          type: 'upload',
          relationTo: 'media',
          label: 'Hero Video (MP4)',
          admin: { condition: (data) => data?.heroMedia?.style === 'video' },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Hero Image',
          admin: { condition: (data) => data?.heroMedia?.style === 'image' },
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
      name: 'roleLabels',
      type: 'group',
      label: 'People Role Labels',
      admin: {
        description: 'Display labels for each role on the /people page tabs.',
      },
      fields: [
        { name: 'all', type: 'text', defaultValue: 'All', label: 'All (active)' },
        {
          name: 'pi',
          type: 'text',
          defaultValue: 'Principal Investigators',
          label: 'PI',
        },
        {
          name: 'postdoc',
          type: 'text',
          defaultValue: 'Postdoctoral Researchers',
          label: 'Postdoc',
        },
        { name: 'phd', type: 'text', defaultValue: 'PhD Students', label: 'PhD' },
        { name: 'ms', type: 'text', defaultValue: 'MS Students', label: 'MS' },
        { name: 'staff', type: 'text', defaultValue: 'Staff', label: 'Staff' },
        { name: 'alumni', type: 'text', defaultValue: 'Alumni', label: 'Alumni' },
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
    {
      name: 'foundingYear',
      type: 'number',
      label: 'Lab Founding Year',
      admin: {
        description: 'Used to compute "Years Active" in the hero stat counters (e.g. 2019).',
      },
    },
    {
      name: 'cookieConsent',
      type: 'group',
      label: 'Cookie Consent Banner',
      admin: {
        description: 'Configure the cookie consent banner shown to new visitors.',
      },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          label: 'Show cookie consent banner',
          defaultValue: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Banner description text',
          admin: { description: 'Leave blank to use the default privacy-first analytics text.' },
        },
        {
          name: 'acceptLabel',
          type: 'text',
          label: 'Accept button label',
          admin: { placeholder: 'Accept analytics' },
        },
        {
          name: 'declineLabel',
          type: 'text',
          label: 'Decline button label',
          admin: { placeholder: 'Decline — no tracking' },
        },
      ],
    },
  ],
}
