/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Seeds all real NOG Lab content into the database.
 * Run once: npm run seed:nog
 *
 * Idempotent — skips records that already exist by slug/title.
 */

import { getPayload } from 'payload'
import configPromise from '../payload.config'

function log(msg: string) {
  console.log(`[seed-nog] ${msg}`)
}

async function main() {
  const payload = await getPayload({ config: configPromise })
  log('Connected to Payload CMS')

  // ── 1. Site Settings ────────────────────────────────────────────────────────
  log('Updating SiteSettings...')
  await payload.updateGlobal({
    slug: 'site_settings',
    data: {
      labName: 'NOG Lab',
      tagline: 'Nutrition, Oral & Gut Microbiome',
      contactAddress:
        'Institute of Basic Medical Sciences, Khyber Medical University, Hayat Abad Phase 5, Peshawar 25100, Pakistan',
      contactEmail: '', // client will provide
      heroCtaPrimary: { label: 'Explore our research', href: '/research' },
      heroCtaSecondary: { label: 'Meet the team', href: '/people' },
      bigQuestions: [
        {
          question:
            'How does early-life malnutrition alter the oral and gut microbiome in Pakistani children?',
        },
        {
          question:
            'Can microbiome signatures predict stunting and growth outcomes in undernourished populations?',
        },
        {
          question:
            'How does smokeless tobacco use reshape the oral microbial ecosystem and increase cancer risk?',
        },
        {
          question:
            'What dietary interventions can restore healthy microbiome diversity in at-risk children?',
        },
        {
          question:
            'How do host–microbiome interactions connect nutritional status to systemic health outcomes?',
        },
      ],
    },
  })
  log('SiteSettings updated')

  // ── 2. Navigation ───────────────────────────────────────────────────────────
  log('Updating Navigation...')
  await payload.updateGlobal({
    slug: 'navigation',
    data: {
      headerLinks: [
        { label: 'Home', href: '/', isExternal: false, isVisible: true },
        { label: 'Research', href: '/research', isExternal: false, isVisible: true },
        { label: 'People', href: '/people', isExternal: false, isVisible: true },
        { label: 'Research Projects', href: '/projects', isExternal: false, isVisible: true },
        {
          label: 'International Collaborations',
          href: '/collaborations',
          isExternal: false,
          isVisible: true,
        },
        { label: 'Publication', href: '/publications', isExternal: false, isVisible: true },
        { label: 'News and Events', href: '/news', isExternal: false, isVisible: true },
        { label: 'Blogs', href: '/blog', isExternal: false, isVisible: true },
        { label: 'Join Us', href: '/join', isExternal: false, isVisible: true },
      ],
    },
  })
  log('Navigation updated')

  // ── 3. About — research overview as mission ─────────────────────────────────
  log('Updating About global (research overview)...')
  const researchOverviewDoc = {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              text: 'The Nutrition, Oral and Gut Microbiome (NOG) Lab at Khyber Medical University investigates how nutrition and microbial communities influence human health across the life course. Our research focuses on the oral and gut microbiomes, nutrition–microbiome interactions, and their roles in health and disease with particular emphasis on malnutrition and vulnerable populations.',
              version: 1,
            },
          ],
          version: 1,
        },
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              text: 'Using interdisciplinary approaches integrating microbiology, molecular biology, genomics, bioinformatics, and clinical research, we explore host–microbiome interactions and how diet and nutritional status shape microbial ecosystems. Our work aims to identify microbiome signatures associated with health and disease and develop evidence-based strategies to improve health outcomes, especially among children at risk of malnutrition.',
              version: 1,
            },
          ],
          version: 1,
        },
      ],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  }
  // Fetch existing About to merge (avoids clobbering existing array fields)
  const existingAbout = await payload.findGlobal({ slug: 'about' })
  await payload.updateGlobal({
    slug: 'about',
    data: {
      ...existingAbout,
      mission: researchOverviewDoc,
      // Clear out any empty facilities that cause validation errors
      facilities: [],
    },
  })
  log('About updated')

  // ── 4. Research Themes ──────────────────────────────────────────────────────
  log('Creating Research Themes...')

  const themesData: {
    name: string
    slug: string
    color: string
    description: string
    displayOrder: number
  }[] = [
    {
      name: 'Oral Microbiome',
      slug: 'oral-microbiome',
      color: '#0E6E6E',
      description:
        "The human mouth harbours one of the body's most diverse microbial ecosystems, playing a vital role in both oral and systemic health. Our research explores how oral microbial communities develop, function, and interact with the host across health and disease. We are particularly interested in oral microbiome development in children at risk of malnutrition and its implications for oral health, growth, and development. We also investigate how smokeless tobacco use, particularly naswar, alters the oral microbiome and contributes to disease risk, including oral cancer.",
      displayOrder: 1,
    },
    {
      name: 'Gut Microbiome',
      slug: 'gut-microbiome',
      color: '#1A9090',
      description:
        'The gut microbiome plays a fundamental role in nutrition, metabolism, immune function, and healthy development. Our research focuses on how gut microbial communities develop during early life, particularly among children at risk of malnutrition. We investigate how alterations in the gut microbiome influence growth, development, and health outcomes, with the goal of identifying microbiome-based strategies to support child health and reduce the burden of malnutrition.',
      displayOrder: 2,
    },
    {
      name: 'Nutrition–Microbiome Interactions',
      slug: 'nutrition-microbiome-interactions',
      color: '#E8C9A0',
      description:
        'Nutrition and the microbiome are closely interconnected, with diet shaping microbial communities and, in turn, the microbiome influencing nutrient metabolism, growth, and health. Our research explores how dietary intake and nutrition influences microbiome development and function, and how microbiome alterations may contribute to impaired growth, development, and health outcomes. Through this work, we aim to identify pathways and interventions that can support healthy growth and improve nutritional health.',
      displayOrder: 3,
    },
    {
      name: 'Public Health',
      slug: 'public-health',
      color: '#E2725B',
      description:
        'Our public health research focuses on understanding the factors that shape health and well-being across the life course, with particular emphasis on oral health, growth, and development. We investigate how dietary intake, nutritional status, and other social and environmental determinants influence health outcomes, especially among vulnerable populations. Through population-based research, we aim to generate evidence that informs effective interventions, policies, and programs to improve health and reduce health disparities.',
      displayOrder: 4,
    },
  ]

  const themeIds: Record<string, number> = {}

  for (const t of themesData) {
    const existing = await payload.find({
      collection: 'research_themes',
      where: { slug: { equals: t.slug } },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      log(`  theme already exists: ${t.name}`)
      themeIds[t.slug] = existing.docs[0].id as number
      continue
    }
    const created = await payload.create({
      collection: 'research_themes',
      data: {
        name: t.name,
        slug: t.slug,
        color: t.color,
        description: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [{ type: 'text', text: t.description, version: 1 }],
                version: 1,
              },
            ],
            direction: 'ltr' as const,
            format: '' as const,
            indent: 0,
            version: 1,
          },
        },
        displayOrder: t.displayOrder,
      },
    })
    themeIds[t.slug] = created.id as number
    log(`  created theme: ${t.name}`)
  }

  // ── 5. People ───────────────────────────────────────────────────────────────
  log('Creating People...')

  const peopleData = [
    {
      name: 'Muhammad Shahzad',
      slug: 'muhammad-shahzad',
      role: 'pi' as const,
      email: 'shahzad.ibms@kmu.edu.pk',
      orcid: 'https://orcid.org/0000-0001-6565-1777',
      googleScholar: 'https://scholar.google.com/citations?hl=en&user=reiWXMMAAAAJ',
      bio: 'Dr. Muhammad Shahzad is Professor at the Institute of Basic Medical Sciences (IBMS), Khyber Medical University, and Founder and Lab Lead of the Nutrition, Oral and Gut Microbiome (NOG) Lab. He holds a PhD from the University of Glasgow and completed a postdoctoral fellowship at the University of Reading, UK. His research focuses on understanding the role of the oral and gut microbiomes in human health and disease, with particular interest in nutrition–microbiome interactions, malnutrition, and vulnerable populations.',
      interests: [
        'Oral microbiome and oral-systemic health',
        'Gut microbiome development in early life',
        'Nutrition–microbiome–host interactions',
        'Public Health nutrition',
      ],
      displayOrder: 1,
    },
    {
      name: 'Maria Ishaq Khattak',
      slug: 'maria-ishaq-khattak',
      role: 'staff' as const,
      email: 'maria.iph@kmu.edu.pk',
      orcid: '',
      googleScholar: '',
      bio: 'Associate Professor, Dental Public Health, Khyber Medical University.',
      interests: [],
      displayOrder: 2,
    },
    {
      name: 'Dr Bibi Hajira',
      slug: 'bibi-hajira',
      role: 'postdoc' as const,
      email: '',
      orcid: '',
      googleScholar: '',
      bio: '',
      interests: [],
      displayOrder: 3,
    },
    {
      name: 'Ahsan Saidal',
      slug: 'ahsan-saidal',
      role: 'phd' as const,
      email: '',
      orcid: '',
      googleScholar: '',
      bio: '',
      interests: [],
      displayOrder: 4,
    },
  ]

  const personIds: Record<string, number> = {}

  for (const p of peopleData) {
    const existing = await payload.find({
      collection: 'people',
      where: { slug: { equals: p.slug } },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      log(`  person already exists: ${p.name}`)
      personIds[p.slug] = existing.docs[0].id as number
      continue
    }
    const data: Record<string, unknown> = {
      name: p.name,
      slug: p.slug,
      role: p.role,
      is_active: true,
      displayOrder: p.displayOrder,
    }
    if (p.email) data.email = p.email
    if (p.orcid) data.orcid = p.orcid
    if (p.googleScholar) data.googleScholar = p.googleScholar
    if (p.bio) {
      data.bio = {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [{ type: 'text', text: p.bio, version: 1 }],
              version: 1,
            },
          ],
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          version: 1,
        },
      }
    }
    if (p.interests.length > 0) {
      data.interests = p.interests.map((i) => ({ interest: i }))
    }
    const created = await payload.create({ collection: 'people', data } as any)
    personIds[p.slug] = created.id as number
    log(`  created person: ${p.name}`)
  }

  // ── 6. Collaborators ────────────────────────────────────────────────────────
  log('Creating Collaborators...')

  const collaboratorsData = [
    {
      name: 'School of Biological Sciences, University of Reading',
      country: 'United Kingdom',
      website: 'https://www.reading.ac.uk/biologicalsciences',
      displayOrder: 1,
    },
    {
      name: 'Department for Biomedical Research, University of Bern',
      country: 'Switzerland',
      website: 'https://www.dbmr.unibe.ch',
      displayOrder: 2,
    },
    {
      name: 'School of Nursing, Emory University',
      country: 'USA',
      website: 'https://nursing.emory.edu',
      displayOrder: 3,
    },
    {
      name: 'Faculty of Dentistry, King Abdul Aziz University',
      country: 'Saudi Arabia',
      website: 'https://dentistry.kau.edu.sa',
      displayOrder: 4,
    },
    {
      name: 'Centre for Dental Medicine, University of Zurich',
      country: 'Switzerland',
      website: 'https://www.zzm.uzh.ch',
      displayOrder: 5,
    },
    {
      name: 'College of Food and Agriculture, Qassim University',
      country: 'Saudi Arabia',
      website: 'https://qu.edu.sa',
      displayOrder: 6,
    },
  ]

  for (const c of collaboratorsData) {
    const existing = await payload.find({
      collection: 'collaborators',
      where: { name: { equals: c.name } },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      log(`  collaborator already exists: ${c.name}`)
      continue
    }
    await payload.create({
      collection: 'collaborators',
      data: {
        name: c.name,
        type: 'academic',
        country: c.country,
        website: c.website,
        displayOrder: c.displayOrder,
      },
    })
    log(`  created collaborator: ${c.name}`)
  }

  // ── 7. Projects ─────────────────────────────────────────────────────────────
  log('Creating Research Projects...')

  const projectsData = [
    {
      title:
        'Mechanistic insights into microbial drivers of gut barrier dysfunctions in malnourished infants',
      slug: 'gut-barrier-dysfunctions-malnourished-infants',
      status: 'ongoing' as const,
      themeSlug: 'gut-microbiome',
      summary:
        'Early childhood malnutrition, a leading cause of morbidity and mortality, is widespread in Pakistan. While gut microbiome dysbiosis and intestinal barrier dysfunction are linked to poor growth in children, the interplay between specific microbial factors and intestinal barrier integrity remains poorly understood in malnourished infants. This project aims to identify gut microbiome functions specifically associated with nutritional status and gut barrier dysfunctions in vulnerable infants.',
      funder: 'Nestlé Foundation, Switzerland',
    },
    {
      title: 'CHAMP-2: Child Health And Microbiome Study Pakistan – Phase 2',
      slug: 'champ-2',
      status: 'ongoing' as const,
      themeSlug: 'gut-microbiome',
      summary:
        'The first five years of life are a critical period for the development of the oral and gut microbiomes, which interact with nutrition, immunity, growth, and disease risk. CHAMP-2 is an extension of the Child Health And Microbiome Development Study, a longitudinal birth cohort established in rural Pakistan. The study follows approximately 220 mother-children pairs across multiple rural communities in District Swat, Pakistan, integrating microbiome, nutrition, health, and developmental data. Findings from CHAMP-2 will support evidence-based approaches to improve child health in resource-limited settings.',
      funder: 'Swiss National Science Foundation, Switzerland',
    },
    {
      title:
        'Exploring the hidden microbiome of high-altitude pastoral communities of the Hindu Kush Himalayan region, Pakistan',
      slug: 'hindu-kush-pastoral-microbiome',
      status: 'ongoing' as const,
      themeSlug: 'gut-microbiome',
      summary:
        'Modern lifestyles, changing diets, urbanization, and increased antibiotic exposure are rapidly transforming the human microbiome. However, the composition and functional potential of the microbiome in traditional communities, such as pastoral herders, remain largely unexplored. This project explores the gut microbiome of high-altitude pastoral communities living in the Hindu Kush Himalayan region of Pakistan. By studying these unique communities, we hope to expand knowledge of the relationship between humans, their environment, and the invisible microbial world that lives within us.',
      funder: '',
    },
    {
      title: 'Smokeless tobacco (Naswar) induced oral cancer in Pakistan, mechanistic insights',
      slug: 'naswar-oral-cancer-pakistan',
      status: 'ongoing' as const,
      themeSlug: 'oral-microbiome',
      summary:
        'Smokeless tobacco (Naswar) use is an issue of public health concern in Khyber Pakhtunkhwa (KP) province of Pakistan. Epidemiological evidence suggests a strong causal association between Naswar use and incidence of oral cancer. This study aims to unravel the biological mechanism underlying naswar-induced oral carcinogenesis by focusing on (1) changes in oral microbiome diversity and functions, (2) inflammation, and (3) oxidative stress in Naswar users.',
      funder: '',
    },
    {
      title: 'CHAMP – Child Health And Microbiome Development Study, Pakistan',
      slug: 'champ-1',
      status: 'completed' as const,
      themeSlug: 'gut-microbiome',
      summary:
        'The CHAMP study aimed to longitudinally assess oral and gut microbiome development and associated factors during early childhood in populations residing in malnutrition-endemic communities in Pakistan. This was a prospective cohort of mother-infant pairs (n=70) conducted in remote rural communities of District Swat, Pakistan from May–June 2024–26.',
      funder: '',
    },
    {
      title: 'Dietary intake, nutritional status and gut microbiome of adolescent Afghan refugees',
      slug: 'afghan-refugees-gut-microbiome',
      status: 'completed' as const,
      themeSlug: 'nutrition-microbiome-interactions',
      summary:
        'In this project, we investigated the gut microbiome of adolescent Afghan refugees to understand how nutrition and health shape microbial communities in vulnerable populations. Our study identified links between gut microbial diversity, body weight, age, and micronutrient status, providing important insights into the role of the microbiome in nutrition and health.',
      funder: '',
    },
  ]

  for (const proj of projectsData) {
    const existing = await payload.find({
      collection: 'projects',
      where: { slug: { equals: proj.slug } },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      log(`  project already exists: ${proj.title}`)
      continue
    }
    const data: Record<string, unknown> = {
      title: proj.title,
      slug: proj.slug,
      status: proj.status,
      summary: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [{ type: 'text', text: proj.summary, version: 1 }],
              version: 1,
            },
          ],
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          version: 1,
        },
      },
    }
    if (proj.funder) data.funder = proj.funder
    if (themeIds[proj.themeSlug]) data.theme = themeIds[proj.themeSlug]
    await payload.create({ collection: 'projects', data } as any)
    log(`  created project: ${proj.title.substring(0, 60)}...`)
  }

  // ── 8. Publications ─────────────────────────────────────────────────────────
  log('Creating Publications...')

  type PubData = {
    title: string
    authors: string[]
    journal: string
    year: number
    doi?: string
    url?: string
    type: 'journal_article' | 'conference'
  }

  const publications: PubData[] = [
    // 2026
    {
      title:
        'Dietary habits and school type as predictors of dental caries among adolescents: A cross-sectional study',
      authors: ['Khan Z', 'Aman T', 'Saidal A', 'Melhem AL', 'Khattak MI', 'Shahzad M'],
      journal: 'Pediatric Dental Journal',
      year: 2026,
      doi: '10.1016/j.pdj.2026.100377',
      type: 'journal_article',
    },
    {
      title:
        'Exploring clinical workplace learning among oral and maxillofacial surgery residents: a qualitative audio diary study',
      authors: ['Ahmad T', 'Jamil B', 'Khan', 'Shahzad M'],
      journal: 'Global Surgical Education',
      year: 2026,
      doi: '10.1007/s44186-026-00549-9',
      type: 'journal_article',
    },
    {
      title:
        'Global burden of enteric infectious diseases, diarrhoeal diseases, and corresponding aetiologies, 1990-2023: a systematic analysis for the Global Burden of Disease Study 2023',
      authors: ['GBD 2023 Diarrhoeal Disease and Enteric Infectious Diseases Collaborators'],
      journal: 'The Lancet Infectious Diseases',
      year: 2026,
      doi: '10.1016/S1473-3099(26)00194-5',
      type: 'journal_article',
    },
    {
      title:
        'Dietary intake, nutritional status and healthcare characteristics of mothers and newborn infants in a prospective cohort study (CHAMP) from a malnutrition-endemic region of Pakistan',
      authors: [
        'Shahzad M',
        'Saidal A',
        'Ismail M',
        'Tariq K',
        'Melhem AL',
        'Iqbal K',
        'Khattak MI',
        'Ahmad HA',
        'Saeed M',
        'Ghani M',
        'Al Nabhani Z',
        'Andrews SC',
      ],
      journal: 'Frontiers in Nutrition',
      year: 2026,
      doi: '10.3389/fnut.2026.1785862',
      type: 'journal_article',
    },
    {
      title:
        'Prevalence of dental caries and its association with nutritional status among school-going children from remote, rural communities of Pakistan',
      authors: ['Shahzad M', 'Khan Z', 'Aman ST', 'Iqbal K', 'Saidal A'],
      journal: 'Khyber Medical University Journal',
      year: 2026,
      doi: '10.35845/kmuj.2026.24087',
      type: 'journal_article',
    },
    {
      title:
        'Traditional Oral Hygiene Practices and Their Effectiveness: A Systematic Review of the Evidence',
      authors: ['Shahzad M', 'Ahmad HA', 'Ambadi S', 'Peterson S', 'Yang I'],
      journal: 'Oral Health & Preventive Dentistry',
      year: 2026,
      doi: '10.3290/j.ohpd.c_2475',
      type: 'journal_article',
    },
    {
      title: 'Editorial: From diet to dental health: harnessing data and digital health records',
      authors: ['Felix Gomez GG', 'Shahzad M'],
      journal: 'Frontiers in Oral Health',
      year: 2026,
      doi: '10.3389/froh.2025.1773659',
      type: 'journal_article',
    },
    {
      title:
        'The oral microbiome profile of Pakistani infants characterized by 16S rRNA amplicon sequencing',
      authors: ['Shahzad M', 'Ismail M', 'Islam MJ ul', 'Sarfaraz Y', 'Taj I', 'Khan M'],
      journal: 'Data in Brief',
      year: 2026,
      type: 'journal_article',
    },
    // 2025
    {
      title:
        'Programmed death-ligand 1 (PDL-1) expression in the oral mucosa of smokeless tobacco users from a low and middle-income country',
      authors: ['Shella S', 'Baseer N', 'Shahzad M', 'Safi S'],
      journal: 'Journal of Stomatology Oral and Maxillofacial Surgery',
      year: 2025,
      doi: '10.1016/j.jormas.2025.102665',
      type: 'journal_article',
    },
    {
      title:
        'Experiences of transwomen individuals in accessing oral health care in a low and middle-income country: a qualitative study from Pakistan',
      authors: ['Jadoon AH', 'Shahzad M', 'Khattak SI', 'Ali A', 'Jennings HM', 'Khattak MI'],
      journal: 'BMC Public Health',
      year: 2025,
      doi: '10.1186/s12889-025-22073-z',
      type: 'journal_article',
    },
    {
      title:
        'Nutritional status reshapes gut microbiota composition in adolescent Afghan refugees in Peshawar, Pakistan',
      authors: [
        'Shahzad M',
        'Arshad M',
        'Ahmad HA',
        'Iddrissu I',
        'Bailey EH',
        'Dru N',
        'Khan S',
        'Khan H',
        'Andrews SC',
      ],
      journal: 'Nutrition Research',
      year: 2025,
      doi: '10.1016/j.nutres.2025.04.004',
      type: 'journal_article',
    },
    {
      title: 'Animal models for understanding the mechanisms of malnutrition: a literature review',
      authors: ['Shahzad M', 'Ahmad HA', 'Ghani M', 'Al Nabhani Z'],
      journal: 'Frontiers in Nutrition',
      year: 2025,
      doi: '10.3389/fnut.2025.1655811',
      type: 'journal_article',
    },
    {
      title:
        'Environmental Pathways and Drivers of Antimicrobial Resistance in Waterborne Escherichia coli in Pakistan: A One Health Perspective',
      authors: ['Khan A', 'Zakki SA', 'Haq I ul', 'Shahzad M'],
      journal: 'Journal of Biosafety and Biosecurity',
      year: 2025,
      url: 'https://www.sciencedirect.com/science/article/pii/S2588933825000251',
      type: 'journal_article',
    },
    {
      title:
        'Association of micronutrient status with thyroid function in adolescent Afghan refugees; a cross-sectional study',
      authors: ['Shaheen S', 'Shahzad M', 'Sher N'],
      journal: 'Thyroid Research',
      year: 2025,
      doi: '10.1186/s13044-025-00239-6',
      type: 'journal_article',
    },
    // 2024
    {
      title:
        'Child health, nutrition and gut microbiota development during the first two years of life; study protocol of a prospective cohort study from the Khyber Pakhtunkhwa, Pakistan',
      authors: ['Shahzad M', 'Ismail M', 'Misselwitz B', 'Saidal A', 'Andrews SC', 'Iqbal K'],
      journal: 'F1000Research',
      year: 2024,
      type: 'journal_article',
    },
    {
      title: 'The oral microbiome of newly diagnosed tuberculosis patients; a pilot study',
      authors: ['Shahzad M', 'Saeed M', 'Amin H', 'Binmadi N', 'Ullah Z', 'Bibi S', 'Andrew SC'],
      journal: 'Genomics',
      year: 2024,
      doi: '10.1016/j.ygeno.2024.110816',
      type: 'journal_article',
    },
    {
      title:
        'Oral Candidal Carriage and its Correlation with Salivary Oxidative Stress in Smokeless Tobacco Users',
      authors: ['Zeeshan Kamal', 'Muhammad Shahzad', 'Tahir Ali Khan', 'Falak Niaz', 'Kajal Hayat'],
      journal: 'Pakistan Journal of Medical & Health Sciences',
      year: 2024,
      doi: '10.53350/pjmhs2023175534',
      type: 'journal_article',
    },
    {
      title:
        'Gender-based differences in the representation and experiences of academic leaders in medicine and dentistry: a mixed method study from Pakistan',
      authors: ['Shahzad M', 'Jamil B', 'Bushra M'],
      journal: 'BMC Medical Education',
      year: 2024,
      doi: '10.1186/s12909-024-05811-6',
      type: 'journal_article',
    },
    {
      title:
        '16S rRNA gene amplicon sequencing data from the gut microbiota of adolescent Afghan refugees',
      authors: [
        'Shahzad M',
        'Saeedullah A',
        'Shabbir Khan M',
        'Ali Ahmad H',
        'Iddrissu I',
        'Andrews SC',
      ],
      journal: 'Data in Brief',
      year: 2024,
      doi: '10.1016/j.dib.2024.110636',
      type: 'journal_article',
    },
    {
      title: 'Biochemical composition of a smokeless tobacco product (NASWAR) used in Pakistan',
      authors: ['Saeed M', 'Asad M', 'Shahzad M', 'Akram M', 'Khan Z'],
      journal: 'Journal of King Saud University – Science',
      year: 2024,
      doi: '10.1016/j.jksus.2024.103168',
      type: 'journal_article',
    },
    {
      title:
        'Effects of Zinc-Biofortified Wheat Intake on Plasma Markers of Fatty Acid Metabolism and Oxidative Stress Among Adolescents',
      authors: ['Shahzad B', 'Holt RR', 'Gupta S', 'Zaman M', 'Shahzad M', 'Lowe NM', 'Hall AG'],
      journal: 'Nutrients',
      year: 2024,
      doi: '10.3390/nu16244265',
      type: 'journal_article',
    },
    {
      title:
        'A review of the effect of iron supplementation on the gut microbiota of children in developing countries and the impact of prebiotics',
      authors: [
        'Iddrisu I',
        'Monteagudo-Mera A',
        'Poveda C',
        'Shahzad M',
        'Walton GE',
        'Andrews SC',
      ],
      journal: 'Nutrition Research Reviews',
      year: 2024,
      doi: '10.1017/S0954422424000118',
      type: 'journal_article',
    },
    // 2023
    {
      title:
        'Salivary Oxidative Stress and Antioxidant Capacity in Smokeless Tobacco (Naswar) Users',
      authors: [
        'Ahmad I',
        'Binmadi N',
        'Afridi SG',
        'Aljohani S',
        'Shah I',
        'Saidal A',
        'Shahzad M',
      ],
      journal: 'Clinical, Cosmetic and Investigational Dentistry',
      year: 2023,
      doi: '10.2147/CCIDE.S415827',
      type: 'journal_article',
    },
    {
      title:
        'Sports and Energy Drink Consumption, Oral Health Problems and Performance Impact among Elite Athletes',
      authors: [
        'Khan K',
        'Qadir A',
        'Trakman G',
        'Aziz T',
        'Khattak MI',
        'Nabi G',
        'Alharbi M',
        'Alshammari A',
        'Shahzad M',
      ],
      journal: 'Nutrients',
      year: 2023,
      doi: '10.3390/nu14235089',
      type: 'journal_article',
    },
    {
      title:
        'Perineural Invasion Is a Significant Prognostic Factor in Oral Squamous Cell Carcinoma: A Systematic Review and Meta-Analysis',
      authors: [
        'Binmadi N',
        'Alsharif M',
        'Almazrooa S',
        'Aljohani S',
        'Akeel S',
        'Osailan S',
        'Shahzad M',
        'Elias W',
        'Mair Y',
      ],
      journal: 'Diagnostics',
      year: 2023,
      doi: '10.3390/diagnostics13213339',
      type: 'journal_article',
    },
    {
      title:
        'Evaluating the bacterial diversity of smokeless tobacco product using shotgun metagenomic analysis',
      authors: [
        'Ullah H',
        'Aziz T',
        'Sarwar A',
        'Khan Z',
        'Shahzad M',
        'Alharbi M',
        'Alsahammari A',
      ],
      journal: 'Applied Ecology and Environmental Research',
      year: 2023,
      type: 'journal_article',
    },
    {
      title:
        'Assessing the probiotic potential, antioxidant, and antibacterial activities of oat and soy milk fermented with Lactiplantibacillus plantarum strains isolated from Tibetan Kefir',
      authors: [
        'Aziz T',
        'Xingyu H',
        'Sarwar A',
        'Naveed M',
        'Shabbir MA',
        'Khan AA',
        'Ulhaq T',
        'Shahzad M',
        'Zhennai Y',
      ],
      journal: 'Frontiers in Microbiology',
      year: 2023,
      doi: '10.3389/fmicb.2023.1265188',
      type: 'journal_article',
    },
    {
      title:
        "Role of supervisor as clinical teacher – residents' perspectives of postgraduate medical institute",
      authors: ['Raees M', 'Jamil B', 'Khan S', 'Shahzad M'],
      journal: 'Professional Medical Journal',
      year: 2023,
      doi: '10.29309/TPMJ/2023.30.09.5466',
      type: 'journal_article',
    },
    {
      title:
        'Genome Investigation and Functional Annotation of Lactiplantibacillus plantarum YW11 Revealing Streptin and Ruminococcin-A as Potent Nutritive Bacteriocins against Gut Symbiotic Pathogens',
      authors: [
        'Aziz T',
        'Naveed M',
        'Makhdoom SI',
        'Ali U',
        'Mughal MS',
        'Sarwar A',
        'Khan AA',
        'Zhennai Y',
        'Sameeh MY',
        'Dablool AS',
        'Alharbi AA',
        'Shahzad M',
      ],
      journal: 'Molecules',
      year: 2023,
      doi: '10.3390/molecules28020491',
      type: 'journal_article',
    },
    // 2022
    {
      title:
        'Exploring the role of Microbiome in Susceptibility, Treatment Response and Outcome among Tuberculosis Patients from Pakistan: study protocol for a prospective cohort study (Micro-STOP)',
      authors: ['Shahzad M', 'Andrews SC', 'Ul-Haq Z'],
      journal: 'BMJ Open',
      year: 2022,
      doi: '10.1136/bmjopen-2021-058463',
      type: 'journal_article',
    },
    {
      title:
        'Adolescent Afghan Refugees Display a High Prevalence of Hyperhomocysteinemia and Associated Micronutrients Deficiencies Indicating an Enhanced Risk of Cardiovascular Disease in Later Life',
      authors: [
        'Khan MS',
        'Saeedullah A',
        'Andrews SC',
        'Iqbal K',
        'Qadir SA',
        'Shahzad B',
        'Ahmed Z',
        'Shahzad M',
      ],
      journal: 'Nutrients',
      year: 2022,
      doi: '10.3390/nu14091751',
      type: 'journal_article',
    },
    {
      title:
        'HPLC, FTIR and GC-MS Analyses of Thymus vulgaris Phytochemicals Executing In Vitro and In Vivo Biological Activities and Effects on COX-1, COX-2 and Gastric Cancer Genes Computationally',
      authors: [
        'Saleem A',
        'Afzal M',
        'Naveed M',
        'Makhdoom SI',
        'Mazhar M',
        'Aziz T',
        'Khan AA',
        'Kamal Z',
        'Shahzad M',
        'Alharbi M',
        'Alshammari A',
      ],
      journal: 'Molecules',
      year: 2022,
      doi: '10.3390/molecules27238512',
      type: 'journal_article',
    },
    {
      title:
        'Functional Annotation of Lactiplantibacillus plantarum 13-3 as a Potential Starter Probiotic Involved in the Food Safety of Fermented Products',
      authors: [
        'Aziz T',
        'Naveed M',
        'Sarwar A',
        'Makhdoom SI',
        'Mughal MS',
        'Ali U',
        'Yang Z',
        'Shahzad M',
      ],
      journal: 'Molecules',
      year: 2022,
      doi: '10.3390/molecules27175399',
      type: 'journal_article',
    },
    {
      title:
        'Designing a Novel Peptide-Based Multi-Epitope Vaccine to Evoke a Robust Immune Response against Pathogenic Multidrug-Resistant Providencia heimbachae',
      authors: [
        'Naveed M',
        'Sheraz M',
        'Amin A',
        'Waseem M',
        'Aziz T',
        'Khan AA',
        'Ghani M',
        'Shahzad M',
      ],
      journal: 'Vaccines',
      year: 2022,
      doi: '10.3390/vaccines10081300',
      type: 'journal_article',
    },
    {
      title:
        'Immunoinformatics Approach to Design Multi-Epitope-Based Vaccine against Machupo Virus Taking Viral Nucleocapsid as a Potential Candidate',
      authors: [
        'Naveed M',
        'Makhdoom SI',
        'Ali U',
        'Jabeen K',
        'Aziz T',
        'Khan AA',
        'Jamil S',
        'Shahzad M',
      ],
      journal: 'Vaccines',
      year: 2022,
      doi: '10.3390/vaccines10101732',
      type: 'journal_article',
    },
    {
      title:
        'Green Synthesis of Silver Nanoparticles Using the Plant Extract of Acer oblongifolium and Study of Its Antibacterial and Antiproliferative Activity via Mathematical Approaches',
      authors: ['Naveed M', 'Bukhari B', 'Aziz T', 'Zaib S', 'Mansoor MA', 'Khan AA', 'Shahzad M'],
      journal: 'Molecules',
      year: 2022,
      doi: '10.3390/molecules27134226',
      type: 'journal_article',
    },
    {
      title:
        'Conjugated fatty acids (CFAs) production via various bacterial strains and their applications: a review',
      authors: [
        'Tariq Aziz',
        'Abid Sarwar',
        'Zubaida Daudzai',
        'Jasra Naseeb',
        'Jalal Ud Din',
        'Urooj Aftab',
        'Ahsan Saidal',
        'Mustajab Ghani',
        'Ayaz Ali Khan',
        'Sumaira Naz',
        'Muhammad Shahzad',
      ],
      journal: 'Journal of the Chilean Chemical Society',
      year: 2022,
      type: 'journal_article',
    },
    {
      title:
        'Bio-Molecular analysis of selected food derived Lactiplantibacillus strains for CLA production reveals possibly a complex mechanism',
      authors: ['Aziz T', 'Sarwar A', 'Naveed M', 'Shahzad M', 'Aqib Shabbir M'],
      journal: 'Food Research International',
      year: 2022,
      doi: '10.1016/j.foodres.2022.111031',
      type: 'journal_article',
    },
    {
      title:
        'In-vitro AND In-vivo Assessment of Toxic effects of Parthenium hysterophorus leaves extract',
      authors: [
        'Adil Hussain',
        'Ayaz Ali Khan',
        'Muhammad Ali',
        'Ghazala Yasmin Zamani',
        'Zafar Iqbal',
        'Qarib Ullah',
        'Javid Iqbal',
        'Muhammad Shahzad',
        'Tariq Aziz',
      ],
      journal: 'Journal of the Chilean Chemical Society',
      year: 2022,
      type: 'journal_article',
    },
    // 2021
    {
      title:
        'Suspected reinfections of SARS-COV-2 in Khyber Pakhtunkhwa, Pakistan – analysis of province-wide testing database',
      authors: ['Ahmad HA', 'Khan H', 'Shahzad M', 'Haq Z ul', 'Harake S', 'Yousafzai YM'],
      journal: 'Journal of Infection',
      year: 2021,
      doi: '10.1016/j.jinf.2021.10.005',
      type: 'journal_article',
    },
    {
      title:
        'Microbial Biofilm Diversity and Prevalence of Antibiotic Resistance Genes in Drinking Water Distribution System of Peshawar, Pakistan',
      authors: [
        'Ullah H',
        'Shahzad M',
        'Saleem F',
        'Ali T',
        'Azim MK',
        'Khan H',
        'Ali J',
        'Ahmed J',
      ],
      journal: 'Water',
      year: 2021,
      type: 'journal_article',
    },
    {
      title: 'Malnutrition and Gut Microbiota in Children',
      authors: [
        'Iddrisu I',
        'Monteagudo-Mera A',
        'Poveda C',
        'Pyle S',
        'Shahzad M',
        'Andrews S',
        'Walton GE',
      ],
      journal: 'Nutrients',
      year: 2021,
      doi: '10.3390/nu13082727',
      type: 'journal_article',
    },
    {
      title: 'Nutritional Status of Adolescent Afghan Refugees Living in Peshawar, Pakistan',
      authors: [
        'Saeedullah A',
        'Khan MS',
        'Andrews SC',
        'Iqbal K',
        'Ul-Haq Z',
        'Qadir SA',
        'Haris Khan',
        'Ishawu Iddrisu',
        'Muhammad Shahzad',
      ],
      journal: 'Nutrients',
      year: 2021,
      doi: '10.3390/nu13093072',
      type: 'journal_article',
    },
    // 2020
    {
      title:
        'Access and Use Experience of Personal Protective Equipment Among Frontline Healthcare Workers in Pakistan During the COVID-19 Emergency: A Cross-Sectional Study',
      authors: [
        'Hakim M',
        'Khattak FA',
        'Muhammad S',
        'Ismail M',
        'Ullah N',
        'Atiq Orakzai M',
        'Ulislam S',
        'Ul-Haq Z',
      ],
      journal: 'Health Security',
      year: 2020,
      doi: '10.1089/hs.2020.0142',
      type: 'journal_article',
    },
    {
      title:
        'Self-reported oral health status and associated factors among Afghan refugees in Peshawar Pakistan; a pilot study',
      authors: [
        'Syed Abdul Qadir',
        'Shahzad Muhammad',
        'Maria Ishaq Khattak',
        'Zohaib Khan',
        'Muslim Khan',
        'Zia Ul Haq',
      ],
      journal: 'Rehman Journal of Health Sciences',
      year: 2020,
      type: 'journal_article',
    },
    // 2019
    {
      title:
        'Plasma vitamin D status and associated factors among pregnant women of Peshawar, Khyber Pakhtunkhwa, Pakistan: a pilot study',
      authors: ['Shahzad B', 'Shahzad M', 'Khan MJ', 'Khan S', 'Bibi H'],
      journal: 'Khyber Medical University Journal',
      year: 2019,
      doi: '10.35845/kmuj.2019.19274',
      type: 'journal_article',
    },
    {
      title:
        'Assessment of plasma iron and zinc status and its relationship with dietary intake and body mass index in antenatal women',
      authors: ['Khan S', 'Shahzad M', 'Khan MJ', 'Shahzad B'],
      journal: 'Rawal Medical Journal',
      year: 2019,
      type: 'journal_article',
    },
    // 2018
    {
      title: 'Phytochemical Profile of Brown Rice and Its Nutrigenomic Implications',
      authors: ['Ravichanthiran K', 'Ma ZF', 'Zhang H', 'Cao Y', 'Wang CW', 'Muhammad S'],
      journal: 'Antioxidants',
      year: 2018,
      doi: '10.3390/antiox7060071',
      type: 'journal_article',
    },
    // 2017
    {
      title:
        'The anti-adhesive effect of curcumin on Candida albicans biofilms on denture materials',
      authors: [
        'Alalwan H',
        'Rajendran R',
        'Lappin DF',
        'Combet E',
        'Shahzad M',
        'Robertson D',
        'Nile CJ',
        'Williams C',
        'Ramage G',
      ],
      journal: 'Frontiers in Microbiology',
      year: 2017,
      type: 'journal_article',
    },
    {
      title: 'Utilising polyphenols for the clinical management of Candida albicans biofilms',
      authors: ['Shahzad M', 'Sherry L', 'Rajendran R', 'Edwards CA', 'Combet E', 'Ramage G'],
      journal: 'International Journal of Antimicrobial Agents',
      year: 2014,
      type: 'journal_article',
    },
    {
      title:
        'Selected dietary (poly)phenols inhibit periodontal pathogen growth and biofilm formation',
      authors: ['Shahzad M', 'Millhouse E', 'Culshaw S', 'Edwards CA', 'Ramage G', 'Combet E'],
      journal: 'Food & Function',
      year: 2015,
      doi: '10.1039/c4fo01087f',
      type: 'journal_article',
    },
  ]

  let pubCreated = 0
  let pubSkipped = 0

  for (const pub of publications) {
    const where = (
      pub.doi
        ? { doi: { equals: pub.doi } }
        : { and: [{ title: { equals: pub.title } }, { year: { equals: pub.year } }] }
    ) as import('payload').Where

    const existing = await payload.find({
      collection: 'publications',
      where,
      limit: 1,
    })
    if (existing.docs.length > 0) {
      pubSkipped++
      continue
    }
    const data: Record<string, unknown> = {
      title: pub.title,
      authors: pub.authors.map((a) => ({ author: a })),
      year: pub.year,
      type: pub.type,
    }
    if (pub.doi) data.doi = pub.doi
    if (pub.journal) data.journal = pub.journal
    await payload.create({ collection: 'publications', data } as any)
    pubCreated++
  }
  log(`  publications: created ${pubCreated}, skipped ${pubSkipped} existing`)

  log(`\nAll done!`)
  process.exit(0)
}

main().catch((err) => {
  console.error('[seed-nog] Fatal error:', err?.message ?? err)
  process.exit(1)
})
