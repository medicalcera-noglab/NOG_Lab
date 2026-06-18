import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { migrations } from './migrations/index'

import { Users } from './src/collections/Users'
import { Media } from './src/collections/Media'
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
import { SiteSettings } from './src/globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
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
    // Forms
    Inquiries,
    // Admin / audit
    AuditLog,
  ],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI ?? '',
    },
    // All environments use explicit migrations — no auto-push schema drift.
    prodMigrations: migrations,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  secret: process.env.PAYLOAD_SECRET ?? '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
