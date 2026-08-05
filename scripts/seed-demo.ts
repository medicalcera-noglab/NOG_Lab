/**
 * Idempotent demo seed — populates the site with real NOG Lab copy.
 * Re-running updates existing records; never duplicates.
 * All collection records are flagged isDemo:true for easy removal.
 *
 * Usage:
 *   DATABASE_URI=... PAYLOAD_SECRET=... npm run seed:demo
 */

import { getPayload } from 'payload'
import configPromise from '../payload.config'

function log(msg: string) {
  console.log(`[seed:demo] ${msg}`)
}

function richText(...paragraphs: string[]) {
  return {
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      version: 1,
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        format: '' as const,
        indent: 0,
        version: 1,
        children: [
          { type: 'text', format: 0, style: '', mode: 'normal', detail: 0, text, version: 1 },
        ],
        direction: 'ltr' as const,
        textFormat: 0,
        textStyle: '',
      })),
      direction: 'ltr' as const,
    },
  }
}

type Payload = Awaited<ReturnType<typeof getPayload>>
type Collection = Parameters<Payload['find']>[0]['collection']
type Where = Parameters<Payload['find']>[0]['where']

async function upsert(
  payload: Payload,
  collection: Collection,
  where: Where,
  data: Record<string, unknown>,
): Promise<{ id: string | number }> {
  const existing = await payload.find({ collection, where, limit: 1, depth: 0 })
  if (existing.docs.length > 0) {
    const id = (existing.docs[0] as { id: string | number }).id
    return (await payload.update({ collection, id, data })) as unknown as { id: string | number }
  }
  return (await payload.create({ collection, data })) as unknown as { id: string | number }
}

async function main() {
  const payload = await getPayload({ config: configPromise })
  log('Connected to Payload CMS')

  // ── 1. Research themes ───────────────────────────────────────────────────────
  const themes: Record<string, { id: string | number }> = {}

  const themeRows = [
    {
      key: 'oral',
      name: 'Oral Microbiome',
      slug: 'oral-microbiome',
      color: '#0E6E6E',
      icon: 'scan-face',
      displayOrder: 1,
      description: richText(
        "The mouth is home to one of the body's most diverse microbial communities, and its balance is closely tied to both oral and systemic health. We study how the oral microbiome develops, how it shifts in disease and malnutrition, and how it interacts with nutrition and the rest of the body — work that can reveal early, accessible markers of broader health problems.",
      ),
      methods: [
        { method: '16S rRNA sequencing' },
        { method: 'saliva and plaque sampling' },
        { method: 'clinical correlation studies' },
      ],
    },
    {
      key: 'gut',
      name: 'Gut Microbiome',
      slug: 'gut-microbiome',
      color: '#2A7A3B',
      icon: 'activity',
      displayOrder: 2,
      description: richText(
        'The gut microbiome sits at the intersection of diet, immunity, growth, and disease. We investigate how gut microbial communities form and change across the life course, how they are disrupted in malnutrition and gastrointestinal disease, and how they might be restored — with the aim of improving outcomes for children and adults alike.',
      ),
      methods: [
        { method: 'shotgun metagenomics' },
        { method: 'stool sample biobanking' },
        { method: 'longitudinal cohort analysis' },
      ],
    },
    {
      key: 'nutrition',
      name: 'Nutrition–Microbiome–Host Interactions',
      slug: 'nutrition-microbiome-host',
      color: '#E8A317',
      icon: 'apple',
      displayOrder: 3,
      description: richText(
        "Food doesn't just feed us — it feeds our microbes, and they feed back. This theme explores the two-way relationship between nutrition, the microbiome, and the human host: how diet reshapes microbial communities, how microbes influence how we absorb and use nutrients, and what that means for malnutrition and recovery.",
      ),
      methods: [
        { method: 'dietary assessment' },
        { method: 'metabolomics' },
        { method: 'host–microbiome interaction modelling' },
      ],
    },
    {
      key: 'bioinformatics',
      name: 'Microbiome Bioinformatics',
      slug: 'microbiome-bioinformatics',
      color: '#5B3A8E',
      icon: 'cpu',
      displayOrder: 4,
      description: richText(
        'Microbiome science generates vast, complex datasets. Our bioinformatics work builds and applies the computational pipelines needed to turn raw sequence data into biological insight — identifying microbial signatures, mapping pathways, and integrating microbiome data with clinical and nutritional information.',
      ),
      methods: [
        { method: 'sequence processing pipelines' },
        { method: 'statistical and machine-learning analysis' },
        { method: 'data integration' },
      ],
    },
    {
      key: 'translational',
      name: 'Translational & Community Health',
      slug: 'translational-community-health',
      color: '#C0392B',
      icon: 'heart-pulse',
      displayOrder: 5,
      description: richText(
        "Discovery only matters if it reaches people. This theme connects our laboratory findings to real-world impact — working with communities, clinicians, and policymakers to translate microbiome science into practical, equitable strategies for nutrition and health in Pakistan's most vulnerable populations.",
      ),
      methods: [
        { method: 'community-based studies' },
        { method: 'intervention design' },
        { method: 'knowledge translation and policy engagement' },
      ],
    },
  ]

  for (const { key, ...data } of themeRows) {
    themes[key] = await upsert(
      payload,
      'research_themes',
      { slug: { equals: data.slug } },
      { ...data, isDemo: true },
    )
    log(`Theme: ${data.name}`)
  }

  // ── 2. People ────────────────────────────────────────────────────────────────
  const people: Record<string, { id: string | number }> = {}

  const peopleRows = [
    {
      key: 'shahzad',
      name: 'Dr. Muhammad Shahzad',
      slug: 'muhammad-shahzad',
      role: 'pi',
      displayOrder: 1,
      is_active: true,
      joinedDate: '2015-01-01',
      bio: richText(
        'Dr. Muhammad Shahzad leads the NOG Lab at Khyber Medical University, where his research focuses on the role of the oral and gut microbiome in nutrition, health, and disease. He brings together microbiology, genomics, and clinical research to investigate host–microbiome interactions, with a particular commitment to addressing malnutrition in vulnerable populations.',
      ),
      interests: [
        { interest: 'oral and gut microbiome' },
        { interest: 'nutrition' },
        { interest: 'host–microbiome interactions' },
        { interest: 'translational health' },
      ],
    },
    {
      key: 'ayesha',
      name: 'Dr. Ayesha Khan',
      slug: 'ayesha-khan',
      role: 'postdoc',
      displayOrder: 2,
      is_active: true,
      joinedDate: '2021-09-01',
      bio: richText(
        'Ayesha studies how the gut microbiome changes during nutritional rehabilitation, combining metagenomics with longitudinal clinical data to identify markers of recovery.',
      ),
    },
    {
      key: 'bilal',
      name: 'Bilal Ahmed',
      slug: 'bilal-ahmed',
      role: 'phd',
      displayOrder: 3,
      is_active: true,
      joinedDate: '2022-01-01',
      bio: richText(
        "Bilal's doctoral work focuses on the oral microbiome as a window into systemic and nutritional health.",
      ),
    },
    {
      key: 'sana',
      name: 'Sana Tariq',
      slug: 'sana-tariq',
      role: 'ms',
      displayOrder: 4,
      is_active: true,
      joinedDate: '2023-01-01',
      bio: richText(
        'Sana works on microbiome bioinformatics, developing analysis pipelines for local sequencing datasets.',
      ),
    },
    {
      key: 'imran',
      name: 'Imran Ali',
      slug: 'imran-ali',
      role: 'staff',
      displayOrder: 5,
      is_active: true,
      joinedDate: '2020-03-01',
      bio: richText(
        "Imran supports sample processing, biobanking, and day-to-day operations across the lab's projects.",
      ),
    },
    {
      key: 'hina',
      name: 'Dr. Hina Yousaf',
      slug: 'hina-yousaf',
      role: 'alumni',
      displayOrder: 6,
      is_active: true,
      joinedDate: '2018-01-01',
      leftDate: '2023-06-30',
      bio: richText(
        "Former MS student whose work on dietary patterns and the gut microbiome contributed to the lab's nutrition theme; now pursuing further research abroad.",
      ),
    },
  ]

  for (const { key, ...data } of peopleRows) {
    people[key] = await upsert(
      payload,
      'people',
      { slug: { equals: data.slug } },
      { ...data, isDemo: true },
    )
    log(`Person: ${data.name} (${data.role})`)
  }

  // ── 3. Collaborators ─────────────────────────────────────────────────────────
  const collabs: { id: string | number }[] = []

  const collabRows = [
    { name: 'Partner University', type: 'academic', country: 'United Kingdom', displayOrder: 1 },
    {
      name: 'Partner Research Institute',
      type: 'academic',
      country: 'Pakistan',
      displayOrder: 2,
    },
    {
      name: 'Partner Health Organization',
      type: 'government',
      country: 'Pakistan',
      displayOrder: 3,
    },
  ]

  for (const data of collabRows) {
    const rec = await upsert(
      payload,
      'collaborators',
      { name: { equals: data.name } },
      { ...data, isDemo: true },
    )
    collabs.push(rec)
    log(`Collaborator: ${data.name}`)
  }

  // ── 4. Projects ──────────────────────────────────────────────────────────────
  const projects: Record<string, { id: string | number }> = {}

  const projectRows = [
    {
      key: 'gut',
      title: 'Gut Microbiome Signatures of Childhood Malnutrition',
      slug: 'gut-microbiome-childhood-malnutrition',
      status: 'ongoing',
      funder: 'Higher Education Commission (HEC)',
      startDate: '2022-01-01',
      isFeaturedHome: true,
      theme: themes['gut'].id,
      team: [people['shahzad'].id, people['ayesha'].id],
      partners: [collabs[1].id],
      summary: richText(
        'A longitudinal study profiling the gut microbiome of children affected by malnutrition across Khyber Pakhtunkhwa, aiming to identify microbial signatures associated with poor growth and recovery.',
      ),
      objectives: [
        {
          objective: 'Characterise gut microbial communities in malnourished vs. healthy children',
        },
        { objective: 'Track changes during nutritional rehabilitation' },
        { objective: 'Identify candidate microbial biomarkers of recovery' },
      ],
      methods: [
        { method: 'Stool sample collection' },
        { method: 'Shotgun metagenomics' },
        { method: 'Longitudinal clinical follow-up' },
      ],
    },
    {
      key: 'oral',
      title: 'The Oral Microbiome as an Early Marker of Systemic Health',
      slug: 'oral-microbiome-early-marker',
      status: 'ongoing',
      funder: 'KMU Internal Research Grant',
      startDate: '2023-01-01',
      isFeaturedHome: false,
      theme: themes['oral'].id,
      team: [people['shahzad'].id, people['bilal'].id],
      partners: [] as (string | number)[],
      summary: richText(
        'Investigating whether shifts in the oral microbiome can serve as an early, non-invasive indicator of nutritional status and systemic disease.',
      ),
      objectives: [
        { objective: 'Map oral microbial diversity across nutritional states' },
        { objective: 'Correlate oral findings with systemic markers' },
        { objective: 'Assess feasibility as a screening tool' },
      ],
      methods: [
        { method: 'Saliva and plaque sampling' },
        { method: '16S rRNA sequencing' },
        { method: 'Clinical correlation' },
      ],
    },
    {
      key: 'pipeline',
      title: 'Building a Microbiome Bioinformatics Pipeline for Pakistan',
      slug: 'microbiome-bioinformatics-pipeline',
      status: 'completed',
      funder: 'International collaborative grant',
      startDate: '2020-01-01',
      endDate: '2022-12-31',
      isFeaturedHome: false,
      theme: themes['bioinformatics'].id,
      team: [people['shahzad'].id, people['sana'].id],
      partners: [collabs[0].id],
      summary: richText(
        'Development of a reproducible bioinformatics pipeline tailored to local microbiome datasets, strengthening regional capacity for microbiome research.',
      ),
      objectives: [
        { objective: 'Build and validate analysis pipelines' },
        { objective: 'Train local researchers' },
        { objective: 'Publish open methods' },
      ],
      methods: [
        { method: 'Pipeline development' },
        { method: 'Benchmarking' },
        { method: 'Capacity-building workshops' },
      ],
    },
  ]

  for (const { key, ...data } of projectRows) {
    projects[key] = await upsert(
      payload,
      'projects',
      { slug: { equals: data.slug } },
      { ...data, isDemo: true },
    )
    log(`Project: ${data.title}`)
  }

  // ── 5. Study sites (KPK) ─────────────────────────────────────────────────────
  const siteRows = [
    {
      name: 'Peshawar Urban Site',
      district: 'Peshawar',
      province: 'Khyber Pakhtunkhwa',
      project: projects['gut'].id,
      location: [71.5249, 34.0151],
    },
    {
      name: 'Mardan Community Centre',
      district: 'Mardan',
      province: 'Khyber Pakhtunkhwa',
      project: projects['gut'].id,
      location: [72.0497, 34.1983],
    },
    {
      name: 'Abbottabad Clinical Site',
      district: 'Abbottabad',
      province: 'Khyber Pakhtunkhwa',
      project: projects['gut'].id,
      location: [73.2215, 34.1463],
    },
  ]

  for (const data of siteRows) {
    await upsert(payload, 'study_sites', { name: { equals: data.name } }, { ...data, isDemo: true })
    log(`Study site: ${data.name}`)
  }

  // ── 6. Blog posts ────────────────────────────────────────────────────────────
  const blogRows = [
    {
      title: 'Why your gut microbes care about what you eat',
      slug: 'gut-microbes-and-diet',
      status: 'published',
      publishedAt: '2025-03-10T09:00:00.000Z',
      author: people['shahzad'].id,
      tags: [{ tag: 'gut microbiome' }, { tag: 'nutrition' }],
      readingTimeMinutes: 4,
      body: richText(
        'A plain-language introduction to how diet and the gut microbiome shape each other, and why it matters for malnutrition.',
        'The trillions of microbes living in your gut are not passive passengers — they actively respond to what you eat, and in turn influence how your body absorbs nutrients, mounts immune responses, and even regulates mood and growth.',
        'For children affected by malnutrition, this relationship is especially critical. Research from our lab and others is beginning to show that disruptions to the gut microbiome can perpetuate malnutrition even when food is available — and that restoring a healthy microbial community may be as important as restoring calories.',
      ),
      seoMeta: {
        title: 'Why your gut microbes care about what you eat | NOG Lab',
        description:
          'How diet and the gut microbiome shape each other, and why it matters for malnutrition research.',
      },
    },
    {
      title: 'From swab to signal: how we read the oral microbiome',
      slug: 'oral-microbiome-swab-to-signal',
      status: 'published',
      publishedAt: '2025-05-01T09:00:00.000Z',
      author: people['bilal'].id,
      tags: [{ tag: 'oral microbiome' }, { tag: 'methods' }],
      readingTimeMinutes: 5,
      body: richText(
        'A behind-the-scenes look at how a simple saliva sample becomes biological insight in our lab.',
        "It starts with a swab and a sample tube. Within hours, that sample has been processed, DNA extracted, and sequenced — generating millions of reads that paint a picture of the microbial community living in a person's mouth.",
        "In this post, we walk through the steps from sample collection to bioinformatic analysis, and explain what we're looking for when we sequence the oral microbiome.",
      ),
      seoMeta: {
        title: 'From swab to signal: how we read the oral microbiome | NOG Lab',
        description:
          'A behind-the-scenes look at how a saliva sample becomes biological insight in our lab.',
      },
    },
  ]

  for (const data of blogRows) {
    await upsert(payload, 'blog_posts', { slug: { equals: data.slug } }, { ...data, isDemo: true })
    log(`Blog: ${data.title}`)
  }

  // ── 7. News & events ─────────────────────────────────────────────────────────
  const newsRows = [
    {
      title:
        'NOG Lab presents new findings on childhood malnutrition at national microbiome symposium',
      slug: 'nog-lab-microbiome-symposium-2025',
      status: 'published',
      publishedAt: '2025-04-15T09:00:00.000Z',
      category: 'talk',
      date: '2025-04-15',
      isFeaturedHome: true,
      body: richText(
        'Our team shared early results linking gut microbial signatures to recovery from malnutrition.',
        'At the National Microbiome Symposium, Dr. Shahzad presented longitudinal data from our KPK cohort study, showing distinct microbial profiles in children who recovered versus those who did not respond to nutritional intervention.',
      ),
    },
    {
      title: 'New collaborative grant to expand microbiome research across Khyber Pakhtunkhwa',
      slug: 'collaborative-grant-kpk-microbiome',
      status: 'published',
      publishedAt: '2025-02-01T09:00:00.000Z',
      category: 'grant',
      date: '2025-02-01',
      isFeaturedHome: false,
      body: richText(
        'Funding will support longitudinal sampling and local bioinformatics capacity.',
        'The new grant enables us to expand our sampling network across three additional districts in KPK, and to invest in local bioinformatics infrastructure — reducing our dependence on external sequencing facilities and building long-term capacity for microbiome research in the region.',
      ),
    },
    {
      title: 'NOG Lab welcomes new PhD and MS students for the 2026 cohort',
      slug: 'nog-lab-2026-cohort-welcome',
      status: 'published',
      publishedAt: '2026-01-10T09:00:00.000Z',
      category: 'award',
      date: '2026-01-10',
      isFeaturedHome: false,
      body: richText(
        "We're delighted to welcome new researchers joining our nutrition and microbiome themes.",
        "This year's cohort brings expertise in clinical nutrition, molecular biology, and data science — exactly the interdisciplinary mix our research demands. We look forward to growing together.",
      ),
    },
  ]

  for (const data of newsRows) {
    await upsert(payload, 'news_events', { slug: { equals: data.slug } }, { ...data, isDemo: true })
    log(`News: ${data.title.slice(0, 65)}`)
  }

  // ── 8. Impact story ──────────────────────────────────────────────────────────
  await upsert(
    payload,
    'impact_stories',
    { slug: { equals: 'microbiome-data-to-nutrition-insight' } },
    {
      title: 'Turning microbiome data into nutrition insight for local children',
      slug: 'microbiome-data-to-nutrition-insight',
      status: 'published',
      publishedAt: '2025-06-01T09:00:00.000Z',
      relatedProjects: [projects['gut'].id],
      body: richText(
        "A case study describing how the lab's gut microbiome work is beginning to inform how clinicians and communities understand and respond to childhood malnutrition in the region.",
        "When a child in our cohort study failed to respond to standard nutritional rehabilitation, clinicians typically had few tools to understand why. Our microbiome data revealed a pattern of dysbiosis — a disrupted gut microbial community — that appeared to prevent the child's gut from absorbing nutrients effectively.",
        'Working with paediatric nutrition teams at KMU, we translated this finding into a practical screening protocol, piloted at two district health centres. Early results suggest that microbiome profiling can help identify children who need targeted intervention — turning laboratory science into a tool that reaches children at the point of care.',
      ),
      isDemo: true,
    },
  )
  log('Impact story: microbiome data to nutrition insight')

  // ── 9. Open position ─────────────────────────────────────────────────────────
  await upsert(
    payload,
    'open_positions',
    { title: { equals: 'PhD Fellowship in Gut Microbiome and Child Nutrition' } },
    {
      title: 'PhD Fellowship in Gut Microbiome and Child Nutrition',
      type: 'PhD Fellowship',
      is_active: true,
      description: richText(
        'We are seeking a motivated doctoral researcher to join our ongoing longitudinal study of the gut microbiome in malnourished children across Khyber Pakhtunkhwa.',
        'The successful candidate will contribute to sample collection, sequencing, and bioinformatics analysis, and will have the opportunity to work within a collaborative national and international network.',
        'Applicants should have a strong background in microbiology, molecular biology, nutrition, or a related field. Experience with next-generation sequencing or bioinformatics is an advantage but not required — training will be provided.',
      ),
      isDemo: true,
    },
  )
  log('Open position: PhD Fellowship in Gut Microbiome and Child Nutrition')

  // ── 10. site_settings global ─────────────────────────────────────────────────
  try {
    await payload.updateGlobal({
      slug: 'site_settings',
      data: {
        labName: 'NOG Lab',
        tagline: 'Advancing microbiome science for better health',
        footerText: richText(
          'The NOG Lab at Khyber Medical University investigates host–microbiome interactions in nutrition, oral and gut health, with a focus on malnutrition and vulnerable populations in Pakistan.',
        ),
        copyright: `© ${new Date().getFullYear()} NOG Lab, Khyber Medical University. All rights reserved.`,
        contactAddress: 'Khyber Medical University, Peshawar, Khyber Pakhtunkhwa, Pakistan.',
        noOpenPositionsMessage:
          "No open positions at this time. We're always glad to hear from motivated researchers — check back soon, or reach out via our contact page.",
        heroCtaPrimary: { label: 'Explore our research', href: '/research' },
        heroCtaSecondary: { label: 'Join the lab', href: '/join' },
        bigQuestions: [
          {
            question:
              'How do the microbes in our mouth and gut influence growth, nutrition, and disease?',
          },
          {
            question:
              "Why do some children recover from malnutrition while others don't — and is the microbiome part of the answer?",
          },
          {
            question:
              'Can we find microbial signatures that predict disease before symptoms appear?',
          },
          {
            question:
              'How does what we eat reshape our microbiome, and our health, over a lifetime?',
          },
          {
            question:
              "How do we turn microbiome discoveries into care that reaches Pakistan's most vulnerable communities?",
          },
        ],
        seoDefaults: { titleSuffix: ' | NOG Lab' },
      },
    })
    log('site_settings: updated')
  } catch (e) {
    log(`site_settings: skipped (${String(e)})`)
  }

  // ── 11. about global ─────────────────────────────────────────────────────────
  try {
    await payload.updateGlobal({
      slug: 'about',
      data: {
        mission: richText(
          'The Nutrition, Oral and Gut Microbiome (NOG) Lab at Khyber Medical University is dedicated to understanding how nutrition and microbial communities shape human health throughout the life course.',
          'We focus on the oral and gut microbiomes and their roles in health, disease, growth, and development, with particular emphasis on malnutrition and related disorders.',
          'Combining microbiology, molecular biology, genomics, bioinformatics, and clinical research, we investigate host–microbiome interactions and the mechanisms through which microbial ecosystems influence health outcomes.',
          'Our goal is to identify microbial biomarkers of disease, uncover the pathways linking nutrition and the microbiome, and develop evidence-based strategies that improve health and well-being.',
          'Through national and international collaborations, we work to translate microbiome science into meaningful solutions for global health challenges — especially for communities at risk of malnutrition.',
        ),
        directorMessage: richText(
          'When we look closely at human health, we keep finding the same truth: we are never alone. Trillions of microbes in our mouths and guts live alongside us, shaping how we grow, how we fight disease, and how our bodies use the food we eat.',
          'At the NOG Lab, our work asks how these invisible communities can be understood — and harnessed — to protect the people who are most vulnerable, particularly children affected by malnutrition here in Pakistan.',
          'We bring together microbiology, genomics, bioinformatics, and clinical insight, and we train the next generation of scientists to carry this work forward. I invite you to explore our research, meet our team, and consider joining us.',
          '— Dr. Muhammad Shahzad, Principal Investigator',
        ),
        kmuAffiliation: richText(
          "The NOG Lab is part of Khyber Medical University (KMU) in Peshawar, one of Pakistan's leading institutions for medical and health-sciences research and education.",
          "Our work is supported by KMU's research infrastructure and its commitment to addressing the health challenges facing Khyber Pakhtunkhwa and the wider region.",
        ),
      },
    })
    log('about: updated')
  } catch (e) {
    log(`about: skipped (${String(e)})`)
  }

  // ── 12. navigation global ────────────────────────────────────────────────────
  try {
    await payload.updateGlobal({
      slug: 'navigation',
      data: {
        headerLinks: [
          { label: 'Research', href: '/research', isExternal: false, isVisible: true },
          { label: 'Projects', href: '/projects', isExternal: false, isVisible: true },
          { label: 'Publications', href: '/publications', isExternal: false, isVisible: true },
          { label: 'Outreach', href: '/outreach', isExternal: false, isVisible: true },
          { label: 'People', href: '/people', isExternal: false, isVisible: true },
          { label: 'News', href: '/news', isExternal: false, isVisible: true },
          { label: 'Blog', href: '/blog', isExternal: false, isVisible: true },
          { label: 'About', href: '/about', isExternal: false, isVisible: true },
          { label: 'Contact', href: '/contact', isExternal: false, isVisible: true },
          { label: 'Join Us', href: '/join', isExternal: false, isVisible: true },
        ],
        footerGroups: [
          {
            title: 'Research',
            links: [
              { label: 'Themes', href: '/research' },
              { label: 'Projects', href: '/projects' },
              { label: 'Publications', href: '/publications' },
              { label: 'Impact', href: '/impact' },
            ],
          },
          {
            title: 'Lab',
            links: [
              { label: 'People', href: '/people' },
              { label: 'Collaborations', href: '/collaborations' },
              { label: 'Join Us', href: '/join' },
            ],
          },
          {
            title: 'Updates',
            links: [
              { label: 'News & Events', href: '/news' },
              { label: 'Blog', href: '/blog' },
            ],
          },
          {
            title: 'Info',
            links: [
              { label: 'About', href: '/about' },
              { label: 'Contact', href: '/contact' },
            ],
          },
        ],
      },
    })
    log('navigation: updated')
  } catch (e) {
    log(`navigation: skipped (${String(e)})`)
  }

  log('Demo seed complete ✓')
  process.exit(0)
}

main().catch((err) => {
  console.error('[seed:demo] Fatal error:', err)
  process.exit(1)
})
