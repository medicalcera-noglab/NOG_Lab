// Field and collection schema definitions for the custom admin portal.
// No Payload imports — pure TypeScript types and data.

export type SelectOption = { label: string; value: string }

export type FieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'number'
  | 'select'
  | 'checkbox'
  | 'date'
  | 'richtext'
  | 'array'
  | 'relationship'
  | 'group'

export type FieldDef = {
  name: string
  label: string
  type: FieldType
  required?: boolean
  readOnly?: boolean
  options?: SelectOption[]
  fields?: FieldDef[] // for array and group
  relationTo?: string // for relationship
  hasMany?: boolean
  hint?: string
}

export type CollectionDef = {
  apiSlug: string // Payload REST API slug  e.g. 'blog_posts'
  label: string
  titleField: string // field to use as row title in list
  listFields: string[] // column names shown in list view
  fields: FieldDef[]
}

export type GlobalDef = {
  apiSlug: string
  label: string
  fields: FieldDef[]
}

// ── COLLECTIONS ────────────────────────────────────────────────

export const COLLECTION_SCHEMAS: Record<string, CollectionDef> = {
  publications: {
    apiSlug: 'publications',
    label: 'Publications',
    titleField: 'title',
    listFields: ['title', 'year', 'type', 'updatedAt'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'doi', label: 'DOI', type: 'text', hint: 'e.g. 10.1000/xyz123' },
      { name: 'journal', label: 'Journal', type: 'text' },
      { name: 'year', label: 'Year', type: 'number', required: true },
      {
        name: 'type',
        label: 'Type',
        type: 'select',
        required: true,
        options: [
          { label: 'Journal Article', value: 'journal_article' },
          { label: 'Conference Paper', value: 'conference' },
          { label: 'Preprint', value: 'preprint' },
          { label: 'Book Chapter', value: 'book_chapter' },
        ],
      },
      {
        name: 'authors',
        label: 'Authors',
        type: 'array',
        fields: [{ name: 'author', label: 'Author name', type: 'text', required: true }],
      },
      {
        name: 'authorLinks',
        label: 'Lab Members (linked)',
        type: 'relationship',
        relationTo: 'people',
        hasMany: true,
      },
      {
        name: 'themeTags',
        label: 'Research Themes',
        type: 'relationship',
        relationTo: 'research_themes',
        hasMany: true,
      },
      { name: 'abstract', label: 'Abstract', type: 'richtext' },
      { name: 'isOpenAccess', label: 'Open Access', type: 'checkbox' },
      { name: 'citationCount', label: 'Citation Count', type: 'number' },
    ],
  },

  people: {
    apiSlug: 'people',
    label: 'People',
    titleField: 'name',
    listFields: ['name', 'role', 'displayOrder', 'updatedAt'],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      {
        name: 'role',
        label: 'Role',
        type: 'select',
        required: true,
        options: [
          { label: 'Principal Investigator', value: 'pi' },
          { label: 'Postdoctoral Researcher', value: 'postdoc' },
          { label: 'PhD Student', value: 'phd' },
          { label: 'MS Student', value: 'ms' },
          { label: 'Staff', value: 'staff' },
          { label: 'Alumni', value: 'alumni' },
        ],
      },
      { name: 'academicTitle', label: 'Academic Title', type: 'text', hint: 'e.g. Professor, Dr.' },
      { name: 'institution', label: 'Primary Institution', type: 'text' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'orcid', label: 'ORCID', type: 'text', hint: 'e.g. 0000-0002-1825-0097' },
      { name: 'googleScholar', label: 'Google Scholar URL', type: 'text' },
      { name: 'linkedin', label: 'LinkedIn URL', type: 'text' },
      { name: 'researchgate', label: 'ResearchGate URL', type: 'text' },
      { name: 'scopus', label: 'Scopus Profile URL', type: 'text' },
      { name: 'bio', label: 'Biography', type: 'richtext' },
      {
        name: 'interests',
        label: 'Research Interests',
        type: 'array',
        fields: [{ name: 'interest', label: 'Interest', type: 'text', required: true }],
      },
      {
        name: 'education',
        label: 'Education',
        type: 'array',
        fields: [
          { name: 'degree', label: 'Degree', type: 'text', required: true },
          { name: 'institution', label: 'Institution', type: 'text', required: true },
          { name: 'country', label: 'Country', type: 'text' },
          { name: 'startYear', label: 'Start Year', type: 'text' },
          { name: 'endYear', label: 'End Year', type: 'text' },
        ],
      },
      {
        name: 'experience',
        label: 'Experience',
        type: 'array',
        fields: [
          { name: 'role', label: 'Position / Role', type: 'text', required: true },
          { name: 'institution', label: 'Institution', type: 'text', required: true },
          { name: 'country', label: 'Country', type: 'text' },
          { name: 'startYear', label: 'Start Year', type: 'text' },
          { name: 'endYear', label: 'End Year', type: 'text' },
        ],
      },
      {
        name: 'grants',
        label: 'Grants & Funding',
        type: 'array',
        fields: [
          { name: 'title', label: 'Grant Title', type: 'text', required: true },
          { name: 'funder', label: 'Funder', type: 'text' },
          { name: 'year', label: 'Year(s)', type: 'text' },
        ],
      },
      { name: 'joinedDate', label: 'Joined Date', type: 'date' },
      { name: 'leftDate', label: 'Left Date', type: 'date', hint: 'Set to auto-mark as alumni.' },
      { name: 'displayOrder', label: 'Display Order', type: 'number' },
      { name: 'is_active', label: 'Active (shown on site)', type: 'checkbox' },
    ],
  },

  blog_posts: {
    apiSlug: 'blog_posts',
    label: 'Blog Posts',
    titleField: 'title',
    listFields: ['title', 'status', 'publishedAt', 'updatedAt'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text' },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        options: [
          { label: 'Draft', value: 'draft' },
          { label: 'In Review', value: 'review' },
          { label: 'Published', value: 'published' },
        ],
      },
      { name: 'body', label: 'Body', type: 'richtext', required: true },
      { name: 'author', label: 'Author', type: 'relationship', relationTo: 'people' },
      {
        name: 'tags',
        label: 'Tags',
        type: 'array',
        fields: [{ name: 'tag', label: 'Tag', type: 'text', required: true }],
      },
      { name: 'scheduledPublishAt', label: 'Scheduled Publish Date', type: 'date' },
    ],
  },

  news_events: {
    apiSlug: 'news_events',
    label: 'News & Events',
    titleField: 'title',
    listFields: ['title', 'category', 'date', 'status'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text' },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        options: [
          { label: 'Draft', value: 'draft' },
          { label: 'In Review', value: 'review' },
          { label: 'Published', value: 'published' },
        ],
      },
      {
        name: 'category',
        label: 'Category',
        type: 'select',
        required: true,
        options: [
          { label: 'Award', value: 'award' },
          { label: 'Grant', value: 'grant' },
          { label: 'Talk', value: 'talk' },
          { label: 'Conference', value: 'conference' },
          { label: 'Press', value: 'press' },
        ],
      },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'body', label: 'Body', type: 'richtext', required: true },
      { name: 'venue', label: 'Venue', type: 'text' },
      { name: 'registerUrl', label: 'Registration URL', type: 'text' },
      { name: 'isFeaturedHome', label: 'Featured on Home Page', type: 'checkbox' },
    ],
  },

  projects: {
    apiSlug: 'projects',
    label: 'Projects',
    titleField: 'title',
    listFields: ['title', 'status', 'isFeaturedHome', 'updatedAt'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text' },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        options: [
          { label: 'Ongoing', value: 'ongoing' },
          { label: 'Completed', value: 'completed' },
        ],
      },
      {
        name: 'theme',
        label: 'Research Theme',
        type: 'relationship',
        relationTo: 'research_themes',
      },
      { name: 'summary', label: 'Summary', type: 'richtext', hint: 'Aim for ~150 words.' },
      {
        name: 'objectives',
        label: 'Objectives',
        type: 'array',
        fields: [{ name: 'objective', label: 'Objective', type: 'text', required: true }],
      },
      {
        name: 'methods',
        label: 'Methods',
        type: 'array',
        fields: [{ name: 'method', label: 'Method', type: 'text', required: true }],
      },
      { name: 'funder', label: 'Funder', type: 'text' },
      { name: 'funderAmount', label: 'Funding Amount', type: 'text' },
      { name: 'startDate', label: 'Start Date', type: 'date' },
      { name: 'endDate', label: 'End Date', type: 'date' },
      {
        name: 'team',
        label: 'Team Members',
        type: 'relationship',
        relationTo: 'people',
        hasMany: true,
      },
      {
        name: 'partners',
        label: 'Partner Organizations',
        type: 'relationship',
        relationTo: 'collaborators',
        hasMany: true,
      },
      {
        name: 'relatedPublications',
        label: 'Related Publications',
        type: 'relationship',
        relationTo: 'publications',
        hasMany: true,
      },
      { name: 'isFeaturedHome', label: 'Featured on Home Page', type: 'checkbox' },
    ],
  },

  research_themes: {
    apiSlug: 'research_themes',
    label: 'Research Themes',
    titleField: 'name',
    listFields: ['name', 'color', 'displayOrder'],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text' },
      { name: 'description', label: 'Description', type: 'richtext' },
      { name: 'icon', label: 'Icon', type: 'text', hint: 'Lucide icon name e.g. "microscope"' },
      {
        name: 'color',
        label: 'Color',
        type: 'text',
        required: true,
        hint: 'Hex color e.g. #0E6E6E',
      },
      {
        name: 'methods',
        label: 'Methods',
        type: 'array',
        fields: [{ name: 'method', label: 'Method', type: 'text', required: true }],
      },
      { name: 'displayOrder', label: 'Display Order', type: 'number' },
    ],
  },

  study_sites: {
    apiSlug: 'study_sites',
    label: 'Study Sites',
    titleField: 'name',
    listFields: ['name', 'district', 'province', 'updatedAt'],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'district', label: 'District', type: 'text', required: true },
      { name: 'province', label: 'Province', type: 'text', required: true },
      {
        name: 'project',
        label: 'Project',
        type: 'relationship',
        relationTo: 'projects',
        required: true,
      },
    ],
  },

  collaborators: {
    apiSlug: 'collaborators',
    label: 'Collaborators',
    titleField: 'name',
    listFields: ['name', 'type', 'country', 'displayOrder'],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      {
        name: 'type',
        label: 'Type',
        type: 'select',
        required: true,
        options: [
          { label: 'Academic', value: 'academic' },
          { label: 'Industry', value: 'industry' },
          { label: 'Government', value: 'government' },
        ],
      },
      { name: 'country', label: 'Country', type: 'text', required: true },
      { name: 'website', label: 'Website URL', type: 'text' },
      { name: 'displayOrder', label: 'Display Order', type: 'number' },
    ],
  },

  impact_stories: {
    apiSlug: 'impact_stories',
    label: 'Impact Stories',
    titleField: 'title',
    listFields: ['title', 'status', 'publishedAt', 'updatedAt'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text' },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        options: [
          { label: 'Draft', value: 'draft' },
          { label: 'Published', value: 'published' },
        ],
      },
      { name: 'body', label: 'Body', type: 'richtext', required: true },
      {
        name: 'relatedProjects',
        label: 'Related Projects',
        type: 'relationship',
        relationTo: 'projects',
        hasMany: true,
      },
    ],
  },

  media_coverage: {
    apiSlug: 'media_coverage',
    label: 'Media Coverage',
    titleField: 'title',
    listFields: ['outlet', 'title', 'date'],
    fields: [
      { name: 'outlet', label: 'Media Outlet', type: 'text', required: true },
      { name: 'title', label: 'Article Title', type: 'text', required: true },
      { name: 'url', label: 'Article URL', type: 'text', required: true },
      { name: 'date', label: 'Date', type: 'date', required: true },
    ],
  },

  open_positions: {
    apiSlug: 'open_positions',
    label: 'Open Positions',
    titleField: 'title',
    listFields: ['title', 'type', 'is_active', 'updatedAt'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      {
        name: 'type',
        label: 'Type',
        type: 'text',
        required: true,
        hint: 'e.g. PhD Fellowship, Postdoc',
      },
      { name: 'description', label: 'Description', type: 'richtext', required: true },
      { name: 'is_active', label: 'Active (visible on site)', type: 'checkbox' },
    ],
  },

  inquiries: {
    apiSlug: 'inquiries',
    label: 'Inquiries',
    titleField: 'name',
    listFields: ['name', 'email', 'formType', 'isRead', 'createdAt'],
    fields: [
      { name: 'name', label: 'Name', type: 'text', readOnly: true },
      { name: 'email', label: 'Email', type: 'email', readOnly: true },
      {
        name: 'formType',
        label: 'Form Type',
        type: 'select',
        readOnly: true,
        options: [
          { label: 'Contact', value: 'contact' },
          { label: 'Join the Lab', value: 'join' },
        ],
      },
      { name: 'message', label: 'Message', type: 'textarea', readOnly: true },
      { name: 'positionTitle', label: 'Position Applied For', type: 'text', readOnly: true },
      {
        name: 'cvUrl',
        label: 'CV Download URL',
        type: 'text',
        readOnly: true,
        hint: 'Right-click → Open in new tab to download.',
      },
      { name: 'sopUrl', label: 'Statement of Purpose URL', type: 'text', readOnly: true },
      { name: 'replyText', label: 'Reply / Response', type: 'textarea' },
      { name: 'isRead', label: 'Marked as Read', type: 'checkbox' },
      { name: 'repliedAt', label: 'Replied At', type: 'date' },
    ],
  },

  applicant_files: {
    apiSlug: 'applicant_files',
    label: 'Applicant Files',
    titleField: 'filename',
    listFields: ['filename', 'mimeType', 'filesize', 'createdAt'],
    fields: [
      { name: 'filename', label: 'Filename', type: 'text', readOnly: true },
      { name: 'mimeType', label: 'MIME Type', type: 'text', readOnly: true },
      { name: 'filesize', label: 'File Size (bytes)', type: 'number', readOnly: true },
      { name: 'submittedBy', label: 'Submitted By', type: 'email', readOnly: true },
    ],
  },

  users: {
    apiSlug: 'users',
    label: 'Users',
    titleField: 'email',
    listFields: ['email', 'role', 'updatedAt'],
    fields: [
      { name: 'email', label: 'Email', type: 'email' },
      {
        name: 'role',
        label: 'Role',
        type: 'select',
        options: [
          { label: 'Super Admin', value: 'super_admin' },
          { label: 'Editor', value: 'editor' },
          { label: 'Contributor', value: 'contributor' },
        ],
      },
    ],
  },
}

// ── GLOBALS ────────────────────────────────────────────────────

export const GLOBAL_SCHEMAS: Record<string, GlobalDef> = {
  site_settings: {
    apiSlug: 'site_settings',
    label: 'Site Settings',
    fields: [
      { name: 'labName', label: 'Lab Name', type: 'text', required: true },
      { name: 'tagline', label: 'Hero Headline', type: 'text' },
      { name: 'heroSubline', label: 'Hero Subline', type: 'text' },
      { name: 'heroMotto', label: 'Hero Motto', type: 'text' },
      { name: 'copyright', label: 'Copyright Line', type: 'text' },
      { name: 'contactEmail', label: 'Public Contact Email', type: 'email' },
      { name: 'contactAddress', label: 'Contact Address', type: 'textarea' },
      { name: 'foundingYear', label: 'Lab Founding Year', type: 'number' },
      { name: 'noOpenPositionsMessage', label: 'No Open Positions Message', type: 'text' },
      { name: 'googleMapsEmbedUrl', label: 'Google Maps Embed URL', type: 'text' },
      { name: 'newsletterEmbedUrl', label: 'Newsletter Embed URL', type: 'text' },
      { name: 'analyticsId', label: 'Analytics ID', type: 'text', hint: 'e.g. G-XXXXXXXXXX' },
      {
        name: 'heroCtaPrimary',
        label: 'Hero CTA — Primary',
        type: 'group',
        fields: [
          { name: 'label', label: 'Button Label', type: 'text' },
          { name: 'href', label: 'URL / Path', type: 'text' },
        ],
      },
      {
        name: 'heroCtaSecondary',
        label: 'Hero CTA — Secondary',
        type: 'group',
        fields: [
          { name: 'label', label: 'Button Label', type: 'text' },
          { name: 'href', label: 'URL / Path', type: 'text' },
        ],
      },
      {
        name: 'bigQuestions',
        label: 'Big Questions',
        type: 'array',
        fields: [{ name: 'question', label: 'Question', type: 'text', required: true }],
      },
      {
        name: 'social',
        label: 'Social Links',
        type: 'group',
        fields: [
          { name: 'twitter', label: 'Twitter/X URL', type: 'text' },
          { name: 'linkedin', label: 'LinkedIn URL', type: 'text' },
          { name: 'researchgate', label: 'ResearchGate URL', type: 'text' },
          { name: 'github', label: 'GitHub URL', type: 'text' },
        ],
      },
    ],
  },

  navigation: {
    apiSlug: 'navigation',
    label: 'Navigation',
    fields: [
      {
        name: 'headerLinks',
        label: 'Header Navigation Links',
        type: 'array',
        fields: [
          { name: 'label', label: 'Label', type: 'text', required: true },
          { name: 'href', label: 'Path / URL', type: 'text', required: true },
          { name: 'isExternal', label: 'Opens in new tab', type: 'checkbox' },
          { name: 'isVisible', label: 'Visible', type: 'checkbox' },
        ],
      },
    ],
  },

  about: {
    apiSlug: 'about',
    label: 'About Page',
    fields: [
      { name: 'mission', label: 'Mission Statement', type: 'richtext' },
      { name: 'directorMessage', label: "Director's Message", type: 'richtext' },
      { name: 'kmuAffiliation', label: 'KMU Affiliation Block', type: 'richtext' },
      {
        name: 'testimonials',
        label: 'Testimonials',
        type: 'array',
        fields: [
          { name: 'quote', label: 'Quote', type: 'textarea', required: true },
          { name: 'name', label: 'Name', type: 'text', required: true },
          { name: 'role', label: 'Role / Title', type: 'text', required: true },
        ],
      },
    ],
  },

  page_seo: {
    apiSlug: 'page_seo',
    label: 'Page SEO',
    fields: [
      {
        name: 'home',
        label: 'Home (/)',
        type: 'group',
        fields: [
          { name: 'title', label: 'Page Title', type: 'text' },
          { name: 'description', label: 'Meta Description', type: 'textarea' },
        ],
      },
      {
        name: 'about',
        label: 'About (/about)',
        type: 'group',
        fields: [
          { name: 'title', label: 'Page Title', type: 'text' },
          { name: 'description', label: 'Meta Description', type: 'textarea' },
        ],
      },
      {
        name: 'research',
        label: 'Research (/research)',
        type: 'group',
        fields: [
          { name: 'title', label: 'Page Title', type: 'text' },
          { name: 'description', label: 'Meta Description', type: 'textarea' },
        ],
      },
      {
        name: 'projects',
        label: 'Projects (/projects)',
        type: 'group',
        fields: [
          { name: 'title', label: 'Page Title', type: 'text' },
          { name: 'description', label: 'Meta Description', type: 'textarea' },
        ],
      },
      {
        name: 'publications',
        label: 'Publications (/publications)',
        type: 'group',
        fields: [
          { name: 'title', label: 'Page Title', type: 'text' },
          { name: 'description', label: 'Meta Description', type: 'textarea' },
        ],
      },
      {
        name: 'blog',
        label: 'Blog (/blog)',
        type: 'group',
        fields: [
          { name: 'title', label: 'Page Title', type: 'text' },
          { name: 'description', label: 'Meta Description', type: 'textarea' },
        ],
      },
      {
        name: 'news',
        label: 'News (/news)',
        type: 'group',
        fields: [
          { name: 'title', label: 'Page Title', type: 'text' },
          { name: 'description', label: 'Meta Description', type: 'textarea' },
        ],
      },
      {
        name: 'join',
        label: 'Join (/join)',
        type: 'group',
        fields: [
          { name: 'title', label: 'Page Title', type: 'text' },
          { name: 'description', label: 'Meta Description', type: 'textarea' },
        ],
      },
      {
        name: 'contact',
        label: 'Contact (/contact)',
        type: 'group',
        fields: [
          { name: 'title', label: 'Page Title', type: 'text' },
          { name: 'description', label: 'Meta Description', type: 'textarea' },
        ],
      },
    ],
  },

  legal_pages: {
    apiSlug: 'legal_pages',
    label: 'Legal Pages',
    fields: [
      { name: 'privacyPolicyTitle', label: 'Privacy Policy Title', type: 'text' },
      { name: 'privacyPolicy', label: 'Privacy Policy Body', type: 'richtext' },
      { name: 'termsOfUseTitle', label: 'Terms of Use Title', type: 'text' },
      { name: 'termsOfUse', label: 'Terms of Use Body', type: 'richtext' },
    ],
  },
}
