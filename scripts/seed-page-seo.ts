/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Seeds the Page SEO global with titles and meta descriptions for all static pages.
 *
 * Run: tsx --env-file=.env.local scripts/seed-page-seo.ts
 */
import { getPayload } from 'payload'
import configPromise from '../payload.config'

const SEO_DATA = {
  home: {
    title: 'NOG Lab — Nutrition, Oral & Gut Microbiome Research | KMU Peshawar',
    description:
      'NOG Lab at Khyber Medical University investigates the links between nutrition, oral health, and gut microbiome. Advancing microbiome science for better health in Pakistan and beyond.',
  },
  about: {
    title: 'About NOG Lab | Microbiome Research at KMU Peshawar',
    description:
      'Learn about the Nutrition, Oral and Gut (NOG) Microbiome Research Lab at the Institute of Basic Medical Sciences, Khyber Medical University, Peshawar.',
  },
  research: {
    title: 'Research | NOG Lab — Microbiome, Nutrition & Oral Health',
    description:
      "Explore NOG Lab's research themes: gut microbiome, oral microbiome, nutrition science, and their intersection with human health at KMU Peshawar.",
  },
  projects: {
    title: 'Research Projects | NOG Lab, KMU',
    description:
      'Active and completed research projects at NOG Lab covering gut microbiota, oral microbiome, dietary interventions, and microbiome–disease interactions.',
  },
  publications: {
    title: 'Publications | NOG Lab Research Output',
    description:
      'Peer-reviewed publications from NOG Lab researchers on microbiome science, nutrition, oral health, and related clinical studies at Khyber Medical University.',
  },
  collaborations: {
    title: 'Collaborations | NOG Lab Research Partnerships',
    description:
      "NOG Lab's national and international research collaborations advancing microbiome science, nutrition, and oral health research in Pakistan and beyond.",
  },
  impact: {
    title: 'Impact | NOG Lab — Translating Microbiome Science to Health',
    description:
      "Discover the real-world impact of NOG Lab's research on public health, clinical practice, and microbiome-based therapies in Pakistan.",
  },
  news: {
    title: 'News & Events | NOG Lab',
    description:
      'Latest news, events, and announcements from the Nutrition, Oral and Gut Microbiome Research Lab at Khyber Medical University, Peshawar.',
  },
  blog: {
    title: 'Blog | NOG Lab — Microbiome Science Insights',
    description:
      'Articles, commentary, and insights from NOG Lab researchers on gut microbiome, oral health, nutrition science, and microbiome medicine.',
  },
  join: {
    title: 'Join NOG Lab | Research Positions at KMU Peshawar',
    description:
      'Open positions and opportunities to join the NOG Lab research team at Khyber Medical University. Apply for research, internship, and PhD positions.',
  },
  contact: {
    title: 'Contact NOG Lab | Institute of Basic Medical Sciences, KMU',
    description:
      'Get in touch with NOG Lab at the Institute of Basic Medical Sciences, Khyber Medical University, Hayat Abad Phase 5, Peshawar 25100, Pakistan.',
  },
}

async function main() {
  const payload = await getPayload({ config: configPromise })

  await payload.updateGlobal({
    slug: 'page_seo',
    data: SEO_DATA as any,
  })

  console.log('Page SEO updated for all pages:')
  for (const [page, data] of Object.entries(SEO_DATA)) {
    console.log(`  /${page === 'home' ? '' : page} — "${data.title}"`)
  }
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
