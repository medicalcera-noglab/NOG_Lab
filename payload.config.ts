import path from 'path'
import { fileURLToPath } from 'url'
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
import { SiteSettings } from './src/globals/SiteSettings'
import { About } from './src/globals/About'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  localization: {
    locales: [
      { label: 'English', code: 'en' },
      { label: 'اردو', code: 'ur' },
    ],
    defaultLocale: 'en',
    fallback: true,
  },
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' — NOG Lab Admin',
    },
  },
  collections: [
    Users,
    Media,
    ApplicantFiles,
    // Research
    ResearchThemes,
    People,
    Publications,
    Projects,
    StudySites,
    Collaborators,
    // Content
    BlogPosts,
    NewsEvents,
    OpenPositions,
    ImpactStories,
    MediaCoverage,
    // Forms
    Inquiries,
    // Admin / audit
    AuditLog,
  ],
  plugins: buildStoragePlugin(),
  globals: [SiteSettings, About],
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
