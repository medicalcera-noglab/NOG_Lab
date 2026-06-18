/**
 * Idempotent seed script — populates realistic data so public-facing UI
 * renders immediately in development.
 *
 * Usage:
 *   DATABASE_URI=... PAYLOAD_SECRET=... SEED_ADMIN_EMAIL=... SEED_ADMIN_PASSWORD=... npm run seed
 *
 * All values come from env or safe defaults — no hardcoded secrets.
 */

import { getPayload } from 'payload'
import configPromise from '../payload.config'

// ─── helpers ──────────────────────────────────────────────────────────────────

function log(msg: string) {
  console.log(`[seed] ${msg}`)
}

async function findOrCreate(
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: Parameters<typeof payload.find>[0]['collection'],
  where: Parameters<typeof payload.find>[0]['where'],
  data: Record<string, unknown>,
): Promise<{ id: string | number }> {
  const existing = await payload.find({ collection, where, limit: 1 })
  if (existing.docs.length > 0) {
    return existing.docs[0] as unknown as { id: string | number }
  }
  return (await payload.create({ collection, data })) as unknown as { id: string | number }
}

// ─── main ─────────────────────────────────────────────────────────────────────

async function seed() {
  const payload = await getPayload({ config: configPromise })
  log('Connected to Payload CMS')

  // ── 1. Super-admin user ────────────────────────────────────────────────────
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@noglab.org'
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'changeme-in-prod!'

  const adminUser = await findOrCreate(
    payload,
    'users',
    { email: { equals: adminEmail } },
    { email: adminEmail, password: adminPassword, role: 'super_admin' },
  )
  log(`Super-admin user: ${adminEmail} (id=${adminUser.id})`)

  // ── 2. Research themes ────────────────────────────────────────────────────
  const themeData = [
    {
      name: 'Oral Microbiome',
      slug: 'oral-microbiome',
      color: '#0E6E6E',
      icon: 'scan-face',
      displayOrder: 1,
    },
    {
      name: 'Gut Microbiome',
      slug: 'gut-microbiome',
      color: '#2A7A3B',
      icon: 'activity',
      displayOrder: 2,
    },
    {
      name: 'Nutrition–Microbiome–Host Interactions',
      slug: 'nutrition-microbiome-host',
      color: '#E8A317',
      icon: 'apple',
      displayOrder: 3,
    },
    {
      name: 'Microbiome Bioinformatics',
      slug: 'microbiome-bioinformatics',
      color: '#5B3A8E',
      icon: 'cpu',
      displayOrder: 4,
    },
    {
      name: 'Translational & Community Health',
      slug: 'translational-community-health',
      color: '#C0392B',
      icon: 'heart-pulse',
      displayOrder: 5,
    },
  ]

  const themes: Record<string, { id: string | number }> = {}
  for (const t of themeData) {
    const theme = await findOrCreate(payload, 'research_themes', { slug: { equals: t.slug } }, t)
    themes[t.slug] = theme
    log(`Theme: ${t.name}`)
  }

  // ── 3. People ─────────────────────────────────────────────────────────────
  const peopleData = [
    {
      name: 'Dr. Muhammad Shahzad',
      slug: 'muhammad-shahzad',
      role: 'pi',
      email: 'mshahzad@kmu.edu.pk',
      displayOrder: 1,
      is_active: true,
      joinedDate: '2015-01-01',
    },
    {
      name: 'Dr. Aisha Khan',
      slug: 'aisha-khan',
      role: 'postdoc',
      email: 'akhan@kmu.edu.pk',
      displayOrder: 2,
      is_active: true,
      joinedDate: '2021-09-01',
    },
    {
      name: 'Ali Hassan',
      slug: 'ali-hassan',
      role: 'phd',
      email: 'ahassan@kmu.edu.pk',
      displayOrder: 3,
      is_active: true,
      joinedDate: '2022-01-01',
    },
    {
      name: 'Fatima Noor',
      slug: 'fatima-noor',
      role: 'phd',
      email: 'fnoor@kmu.edu.pk',
      displayOrder: 4,
      is_active: true,
      joinedDate: '2023-01-01',
    },
    {
      name: 'Usman Tariq',
      slug: 'usman-tariq',
      role: 'ms',
      email: 'utariq@kmu.edu.pk',
      displayOrder: 5,
      is_active: true,
      joinedDate: '2023-09-01',
    },
    {
      name: 'Sana Malik',
      slug: 'sana-malik',
      role: 'staff',
      email: 'smalik@kmu.edu.pk',
      displayOrder: 6,
      is_active: true,
      joinedDate: '2020-03-01',
    },
    {
      name: 'Dr. Bilal Ahmed',
      slug: 'bilal-ahmed',
      role: 'alumni',
      email: 'bahmed@alumni.kmu.edu.pk',
      displayOrder: 7,
      is_active: true,
      joinedDate: '2018-01-01',
      leftDate: '2022-06-30',
    },
  ]

  const people: Record<string, { id: string | number }> = {}
  for (const p of peopleData) {
    const person = await findOrCreate(payload, 'people', { slug: { equals: p.slug } }, p)
    people[p.slug] = person
    log(`Person: ${p.name} (${p.role})`)
  }

  // ── 4. Collaborators ──────────────────────────────────────────────────────
  const collabData = [
    { name: 'Aga Khan University', type: 'academic', country: 'Pakistan', displayOrder: 1 },
    { name: 'University of Copenhagen', type: 'academic', country: 'Denmark', displayOrder: 2 },
    {
      name: 'National Institute of Health, Pakistan',
      type: 'government',
      country: 'Pakistan',
      displayOrder: 3,
    },
  ]

  const collabs: { id: string | number }[] = []
  for (const c of collabData) {
    const collab = await findOrCreate(payload, 'collaborators', { name: { equals: c.name } }, c)
    collabs.push(collab)
    log(`Collaborator: ${c.name}`)
  }

  // ── 5. Projects ───────────────────────────────────────────────────────────
  const projectData = [
    {
      title: 'Oral Microbiome in Periodontal Disease',
      slug: 'oral-microbiome-periodontal',
      status: 'ongoing',
      funder: 'Higher Education Commission Pakistan',
      startDate: '2022-01-01',
      isFeaturedHome: true,
      theme: themes['oral-microbiome'].id,
      team: [people['muhammad-shahzad'].id, people['aisha-khan'].id, people['ali-hassan'].id],
      partners: [collabs[0].id],
    },
    {
      title: 'Gut Microbiota & Childhood Malnutrition in KPK',
      slug: 'gut-microbiota-malnutrition-kpk',
      status: 'ongoing',
      funder: 'UNICEF Pakistan',
      startDate: '2023-06-01',
      isFeaturedHome: false,
      theme: themes['gut-microbiome'].id,
      team: [people['muhammad-shahzad'].id, people['fatima-noor'].id, people['usman-tariq'].id],
      partners: [collabs[2].id],
    },
    {
      title: '16S rRNA Bioinformatics Pipeline for Pakistani Cohorts',
      slug: 'bioinformatics-pipeline-pakistan',
      status: 'completed',
      funder: 'Self-funded',
      startDate: '2020-01-01',
      endDate: '2022-12-31',
      isFeaturedHome: false,
      theme: themes['microbiome-bioinformatics'].id,
      team: [people['muhammad-shahzad'].id, people['bilal-ahmed'].id],
      partners: [collabs[1].id],
    },
  ]

  const projects: Record<string, { id: string | number }> = {}
  for (const p of projectData) {
    const project = await findOrCreate(payload, 'projects', { slug: { equals: p.slug } }, p)
    projects[p.slug] = project
    log(`Project: ${p.title}`)
  }

  // ── 6. Study sites ────────────────────────────────────────────────────────
  // location stored as [longitude, latitude] (GeoJSON / EWKT order)
  const siteData = [
    {
      name: 'Peshawar Urban Clinic',
      district: 'Peshawar',
      province: 'Khyber Pakhtunkhwa',
      project: projects['oral-microbiome-periodontal'].id,
      location: [71.5249, 34.0151] as [number, number],
    },
    {
      name: 'Islamabad Community Health Centre',
      district: 'Islamabad',
      province: 'Islamabad Capital Territory',
      project: projects['gut-microbiota-malnutrition-kpk'].id,
      location: [73.0479, 33.6844] as [number, number],
    },
    {
      name: 'Lahore Teaching Hospital',
      district: 'Lahore',
      province: 'Punjab',
      project: projects['gut-microbiota-malnutrition-kpk'].id,
      location: [74.3587, 31.5204] as [number, number],
    },
    {
      name: 'Karachi Primary Care Centre',
      district: 'Karachi',
      province: 'Sindh',
      project: projects['oral-microbiome-periodontal'].id,
      location: [67.0011, 24.8607] as [number, number],
    },
    {
      name: 'Abbottabad Rural Site',
      district: 'Abbottabad',
      province: 'Khyber Pakhtunkhwa',
      project: projects['bioinformatics-pipeline-pakistan'].id,
      location: [73.2215, 34.1463] as [number, number],
    },
  ]

  for (const s of siteData) {
    await findOrCreate(payload, 'study_sites', { name: { equals: s.name } }, s)
    log(`Study site: ${s.name} (${s.location[1]}, ${s.location[0]})`)
  }

  // ── 7. Publications ───────────────────────────────────────────────────────
  const pubData = [
    {
      doi: '10.1038/s41598-021-00001-1',
      title: 'Characterization of oral microbiome in Pakistani adults with periodontitis',
      authors: [{ author: 'Shahzad M' }, { author: 'Khan A' }, { author: 'Hassan A' }],
      journal: 'Scientific Reports',
      year: 2022,
      type: 'journal_article',
      isOpenAccess: true,
      citationCount: 14,
      themeTags: [themes['oral-microbiome'].id],
      authorLinks: [people['muhammad-shahzad'].id, people['aisha-khan'].id],
    },
    {
      doi: '10.1016/j.clnu.2023.01.004',
      title: 'Gut microbiota dysbiosis in undernourished children under 5 in KPK province',
      authors: [{ author: 'Noor F' }, { author: 'Shahzad M' }],
      journal: 'Clinical Nutrition',
      year: 2023,
      type: 'journal_article',
      isOpenAccess: false,
      citationCount: 7,
      themeTags: [themes['gut-microbiome'].id, themes['nutrition-microbiome-host'].id],
      authorLinks: [people['fatima-noor'].id, people['muhammad-shahzad'].id],
    },
    {
      doi: '10.1101/2024.03.10.584312',
      title: 'An open-source 16S rRNA pipeline optimised for South Asian cohort diversity',
      authors: [{ author: 'Ahmed B' }, { author: 'Shahzad M' }],
      journal: 'bioRxiv',
      year: 2024,
      type: 'preprint',
      isOpenAccess: true,
      citationCount: 2,
      themeTags: [themes['microbiome-bioinformatics'].id],
      authorLinks: [people['bilal-ahmed'].id, people['muhammad-shahzad'].id],
    },
    {
      doi: '10.1017/S1368980022000500',
      title: 'Dietary diversity and gut microbiome composition in rural Khyber Pakhtunkhwa',
      authors: [{ author: 'Tariq U' }, { author: 'Shahzad M' }, { author: 'Malik S' }],
      journal: 'Public Health Nutrition',
      year: 2023,
      type: 'journal_article',
      isOpenAccess: false,
      citationCount: 5,
      themeTags: [
        themes['nutrition-microbiome-host'].id,
        themes['translational-community-health'].id,
      ],
      authorLinks: [people['usman-tariq'].id, people['muhammad-shahzad'].id],
    },
  ]

  for (const p of pubData) {
    await findOrCreate(payload, 'publications', { doi: { equals: p.doi } }, p)
    log(`Publication: "${p.title.slice(0, 60)}…"`)
  }

  // ── 8. Blog post ──────────────────────────────────────────────────────────
  await findOrCreate(
    payload,
    'blog_posts',
    { slug: { equals: 'welcome-to-nog-lab' } },
    {
      title: 'Welcome to NOG Lab',
      slug: 'welcome-to-nog-lab',
      status: 'published',
      publishedAt: '2024-01-15T09:00:00.000Z',
      author: people['muhammad-shahzad'].id,
      body: {
        root: {
          type: 'root',
          format: '',
          indent: 0,
          version: 1,
          children: [
            {
              type: 'paragraph',
              format: '',
              indent: 0,
              version: 1,
              children: [
                {
                  type: 'text',
                  format: 0,
                  style: '',
                  mode: 'normal',
                  detail: 0,
                  text: 'We are excited to launch the NOG Lab website. Our research into the oral and gut microbiome aims to improve health outcomes across Pakistan.',
                  version: 1,
                },
              ],
              direction: 'ltr',
              textFormat: 0,
              textStyle: '',
            },
          ],
          direction: 'ltr',
        },
      },
      readingTimeMinutes: 1,
      tags: [{ tag: 'announcement' }, { tag: 'microbiome' }],
    },
  )
  log('Blog post: Welcome to NOG Lab')

  // ── 9. News / event ───────────────────────────────────────────────────────
  await findOrCreate(
    payload,
    'news_events',
    { title: { equals: 'NOG Lab receives HEC grant for oral microbiome study' } },
    {
      title: 'NOG Lab receives HEC grant for oral microbiome study',
      status: 'published',
      publishedAt: '2024-02-01T09:00:00.000Z',
      category: 'grant',
      date: '2024-02-01',
      body: {
        root: {
          type: 'root',
          format: '',
          indent: 0,
          version: 1,
          children: [
            {
              type: 'paragraph',
              format: '',
              indent: 0,
              version: 1,
              children: [
                {
                  type: 'text',
                  format: 0,
                  style: '',
                  mode: 'normal',
                  detail: 0,
                  text: 'We are proud to announce that NOG Lab has been awarded a research grant by the Higher Education Commission of Pakistan to study oral microbiome in periodontal disease.',
                  version: 1,
                },
              ],
              direction: 'ltr',
              textFormat: 0,
              textStyle: '',
            },
          ],
          direction: 'ltr',
        },
      },
      isFeaturedHome: true,
    },
  )
  log('News event: HEC grant announcement')

  // ── 10. Open position ─────────────────────────────────────────────────────
  await findOrCreate(
    payload,
    'open_positions',
    { title: { equals: 'PhD Fellowship — Gut Microbiome & Nutrition' } },
    {
      title: 'PhD Fellowship — Gut Microbiome & Nutrition',
      type: 'PhD Fellowship',
      is_active: true,
      description: {
        root: {
          type: 'root',
          format: '',
          indent: 0,
          version: 1,
          children: [
            {
              type: 'paragraph',
              format: '',
              indent: 0,
              version: 1,
              children: [
                {
                  type: 'text',
                  format: 0,
                  style: '',
                  mode: 'normal',
                  detail: 0,
                  text: 'We are seeking a motivated PhD student to join our gut microbiome and nutrition research program. Candidates with a background in microbiology, nutrition, or bioinformatics are encouraged to apply.',
                  version: 1,
                },
              ],
              direction: 'ltr',
              textFormat: 0,
              textStyle: '',
            },
          ],
          direction: 'ltr',
        },
      },
    },
  )
  log('Open position: PhD Fellowship')

  // ── 11. Site settings ─────────────────────────────────────────────────────
  try {
    const existing = await payload.findGlobal({ slug: 'site_settings' })
    if (!existing?.labName) {
      await payload.updateGlobal({
        slug: 'site_settings',
        data: {
          labName: 'NOG Lab',
          tagline: 'Advancing microbiome science for better health',
          copyright: `© ${new Date().getFullYear()} NOG Lab, Khyber Medical University. All rights reserved.`,
          contactAddress:
            'Department of Microbiology\nKhyber Medical University\nPeshawar, Khyber Pakhtunkhwa\nPakistan',
          social: {
            twitter: 'https://twitter.com/noglab',
            linkedin: 'https://linkedin.com/company/noglab',
            researchgate: 'https://researchgate.net/lab/noglab',
            github: 'https://github.com/noglab',
          },
          heroCtaPrimary: { label: 'Our Research', href: '/research' },
          heroCtaSecondary: { label: 'Meet the Team', href: '/people' },
          bigQuestions: [
            { question: 'How does the oral microbiome contribute to systemic disease?' },
            {
              question:
                'Can dietary interventions reshape gut microbiota in malnourished children?',
            },
            {
              question:
                'What computational tools best capture microbiome diversity in South Asian populations?',
            },
          ],
          seoDefaults: {
            titleSuffix: ' | NOG Lab',
          },
        },
      })
      log('Site settings: populated')
    } else {
      log('Site settings: already set, skipping')
    }
  } catch (e) {
    log(`Site settings: skipped (${String(e)})`)
  }

  log('Seed complete ✓')
  process.exit(0)
}

seed().catch((err) => {
  console.error('[seed] Fatal error:', err)
  process.exit(1)
})
