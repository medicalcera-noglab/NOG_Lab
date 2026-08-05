import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { migrations } from './migrations/index'
import { buildEmailAdapter } from './src/lib/email'
import { buildStoragePlugin } from './src/lib/storage'

import { Users } from './src/collections/Users'
import { Media } from './src/collections/Media'
import { ApplicantFiles } from './src/collections/ApplicantFiles'
import { ResearchThemes } from './src/collections/ResearchThemes'
import { People } from './src/collections/People'
import { Publications } from './src/collections/Publications'
import { Projects } from './src/collections/Projects'
import { StudySites } from './src/collections/StudySites'
import { Collaborators } from './src/collections/Collaborators'
import { BlogPosts } from './src/collections/BlogPosts'
import { NewsEvents } from './src/collections/NewsEvents'
import { OpenPositions } from './src/collections/OpenPositions'
import { Inquiries } from './src/collections/Inquiries'
import { AuditLog } from './src/collections/AuditLog'
import { ImpactStories } from './src/collections/ImpactStories'
import { MediaCoverage } from './src/collections/MediaCoverage'
import { OutreachActivities } from './src/collections/OutreachActivities'
import { SiteSettings } from './src/globals/SiteSettings'
import { About } from './src/globals/About'
import { LegalPages } from './src/globals/LegalPages'
import { OutreachPage } from './src/globals/OutreachPage'
import { PartnershipsPage } from './src/globals/PartnershipsPage'
import { Navigation } from './src/globals/Navigation'
import { PageSeo } from './src/globals/PageSeo'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  sharp,
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL ?? 'https://noglabkmu.org',
  debug: process.env.NODE_ENV !== 'production',
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' — NOG Lab Admin',
    },
    avatar: {
      Component: '@/components/admin/AdminAvatar#AdminAvatar',
    },
    components: {
      graphics: {
        Logo: '@/components/admin/AdminLogo#AdminLogo',
        Icon: '@/components/admin/AdminIcon#AdminIcon',
      },
      beforeNavLinks: ['@/components/admin/NavRoleBadge#NavRoleBadge'],
      afterNavLinks: ['@/components/admin/NavBackToSite#NavBackToSite'],
      views: {
        dashboard: {
          Component: '@/components/admin/Dashboard#Dashboard',
        },
      },
    },
  },
  collections: [
    // Content — most-used group, appears first in sidebar
    BlogPosts,
    NewsEvents,
    OpenPositions,
    ImpactStories,
    MediaCoverage,
    OutreachActivities,
    // Research
    Publications,
    Projects,
    ResearchThemes,
    StudySites,
    // Team
    People,
    Collaborators,
    // Media (uploads)
    Media,
    // Forms
    Inquiries,
    ApplicantFiles,
    // Admin — user management + audit, always last
    Users,
    AuditLog,
  ],
  plugins: buildStoragePlugin(),
  globals: [
    // Pages — static site content
    About,
    LegalPages,
    OutreachPage,
    PartnershipsPage,
    // Site Config — nav, SEO, branding
    Navigation,
    PageSeo,
    SiteSettings,
  ],
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI ?? '',
    },
    // Never auto-push schema — we manage schema exclusively through explicit migrations.
    push: false,
    prodMigrations: migrations,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  email: buildEmailAdapter(),
  secret: process.env.PAYLOAD_SECRET ?? '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
