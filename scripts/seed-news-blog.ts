/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Seeds News & Events and Blog Posts for the NOG Lab.
 * Idempotent — skips records that already exist by slug.
 * Run: tsx --require ./scripts/load-env.cjs scripts/seed-news-blog.ts
 */

import { getPayload } from 'payload'
import configPromise from '../payload.config'

function log(msg: string) {
  console.log(`[seed-news-blog] ${msg}`)
}

function makeBody(...paragraphs: string[]) {
  return {
    root: {
      type: 'root',
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        children: [{ type: 'text', text, version: 1 }],
        version: 1,
      })),
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  }
}

async function main() {
  const payload = await getPayload({ config: configPromise })
  log('Connected to Payload CMS')

  // ── 1. News & Events ────────────────────────────────────────────────────────

  const newsItems = [
    {
      slug: 'hec-nrpu-grant-2024',
      title: 'NOG Lab Awarded HEC NRPU Grant for Gut Microbiome Study in Malnourished Children',
      category: 'grant',
      date: '2024-09-01',
      status: 'published',
      publishedAt: '2024-09-01',
      body: makeBody(
        'The NOG Lab has been awarded a competitive National Research Programme for Universities (NRPU) grant by the Higher Education Commission of Pakistan to investigate gut microbiome alterations in malnourished children in Khyber Pakhtunkhwa.',
        'The two-year project will recruit 200 children aged 6–24 months across urban and rural settings in Peshawar. Using 16S rRNA amplicon sequencing and shotgun metagenomics, the team will characterise microbial community shifts associated with stunting, wasting, and underweight status.',
        'Principal Investigator Professor Qasim Khan expressed gratitude to HEC for supporting this work, noting that the findings will help identify microbiome-based biomarkers to guide early nutritional interventions.',
      ),
      isFeaturedHome: true,
    },
    {
      slug: 'world-microbiome-congress-award-2024',
      title: 'NOG Lab PhD Student Wins Best Oral Presentation at World Microbiome Congress 2024',
      category: 'award',
      date: '2024-06-15',
      status: 'published',
      publishedAt: '2024-06-15',
      body: makeBody(
        'A PhD student from the NOG Lab received the Best Oral Presentation Award at the World Microbiome Congress held in Dublin, Ireland. The presentation, titled "Oral Microbiome Signatures in Stunted versus Non-Stunted Pakistani Children", drew significant attention from international delegates.',
        'The study revealed distinct oral microbial profiles in growth-stunted children, with reduced microbial diversity and enrichment of pro-inflammatory taxa compared to age-matched controls. Delegates from over 30 countries attended the congress.',
      ),
      isFeaturedHome: false,
      venue: 'World Microbiome Congress, Dublin, Ireland',
    },
    {
      slug: 'pakistan-society-microbiology-conference-2024',
      title: 'NOG Lab Presents Three Papers at Pakistan Society for Microbiology Annual Conference',
      category: 'conference',
      date: '2024-03-20',
      status: 'published',
      publishedAt: '2024-03-20',
      body: makeBody(
        'Members of the NOG Lab presented three research papers at the Pakistan Society for Microbiology Annual Conference held in Islamabad. The presentations covered gut microbiome profiling in Afghan refugee children, the oral microbiome in naswar users, and the gut barrier function in malnourished infants.',
        'The conference, attended by over 400 microbiologists from across Pakistan, provided an important platform for sharing findings and establishing new collaborations with research groups at Aga Khan University, University of Health Sciences Lahore, and Quaid-i-Azam University.',
      ),
      isFeaturedHome: false,
      venue: 'Pakistan Society for Microbiology, Islamabad',
    },
    {
      slug: 'aku-invited-talk-2023',
      title: 'Professor Qasim Khan Delivers Invited Talk at Aga Khan University',
      category: 'talk',
      date: '2023-11-10',
      status: 'published',
      publishedAt: '2023-11-10',
      body: makeBody(
        'Professor Qasim Khan was invited to deliver a seminar at the Aga Khan University Department of Biological and Biomedical Sciences in Karachi. His talk, "Microbiome Research in Pakistan: From Field Studies to Mechanistic Insights", highlighted the unique challenges and opportunities of conducting microbiome research in low-and-middle income country settings.',
        'The seminar was well-attended by faculty, postdoctoral researchers, and graduate students, sparking productive discussions on potential collaborative projects between the two institutions.',
      ),
      isFeaturedHome: false,
      venue: 'Aga Khan University, Karachi',
    },
    {
      slug: 'dawn-naswar-oral-cancer-press-2023',
      title: 'NOG Lab Research on Naswar and Oral Cancer Featured in Dawn',
      category: 'press',
      date: '2023-08-22',
      status: 'published',
      publishedAt: '2023-08-22',
      body: makeBody(
        "The NOG Lab's research linking smokeless tobacco use (naswar) to oral microbiome dysbiosis and elevated oral cancer risk was featured in a Dawn newspaper investigation on cancer trends in Khyber Pakhtunkhwa.",
        'The article highlighted how regular naswar use significantly alters oral bacterial communities, reducing protective species and enriching bacteria associated with pro-carcinogenic inflammation. The research team called for public health campaigns targeting naswar use among young men in KPK.',
      ),
      isFeaturedHome: false,
      venue: 'Dawn Newspaper',
    },
  ]

  for (const item of newsItems) {
    const existing = await payload.find({
      collection: 'news_events',
      where: { slug: { equals: item.slug } },
      limit: 1,
      overrideAccess: true,
    })
    if (existing.docs.length > 0) {
      log(`  SKIP news: "${item.title}" (already exists)`)
      continue
    }
    await payload.create({
      collection: 'news_events',
      data: item as any,
      overrideAccess: true,
    })
    log(`  CREATE news: "${item.title}"`)
  }

  // ── 2. Blog Posts ────────────────────────────────────────────────────────────

  // Find PI for author field
  const piResult = await payload.find({
    collection: 'people',
    where: { role: { equals: 'pi' } },
    limit: 1,
    overrideAccess: true,
  })
  const piId = piResult.docs[0]?.id ?? null
  if (!piId) log('  WARN: No PI found — blog posts will have no author')

  const blogPosts = [
    {
      slug: 'gut-microbiome-malnourished-children-pakistan',
      title: 'Decoding the Gut Microbiome in Malnourished Pakistani Children: What We Are Learning',
      status: 'published',
      publishedAt: '2024-10-15',
      readingTimeMinutes: 7,
      tags: [
        { tag: 'gut microbiome' },
        { tag: 'malnutrition' },
        { tag: 'child health' },
        { tag: 'Pakistan' },
      ],
      seoMeta: {
        title: 'Gut Microbiome in Malnourished Pakistani Children | NOG Lab',
        description:
          'How microbiome science is illuminating the hidden drivers of childhood malnutrition in Pakistan.',
      },
      body: makeBody(
        'Childhood malnutrition remains one of the most significant public health challenges in Pakistan, with nearly 40% of children under five affected by stunting. While poor diet and infections are well-recognised drivers, emerging evidence suggests the gut microbiome — the trillions of bacteria inhabiting the intestinal tract — plays a far more central role than previously understood.',
        'Our group has been characterising gut microbial communities in children from urban Peshawar and rural Khyber Pakhtunkhwa over the past five years. Using 16S rRNA amplicon sequencing on faecal samples, we have consistently found that stunted children harbour less diverse gut microbiomes compared to age-matched, adequately-nourished controls.',
        'Specifically, we observe reduced abundance of short-chain fatty acid (SCFA)-producing bacteria such as Faecalibacterium prausnitzii, Roseburia intestinalis, and Bifidobacterium longum — all of which support intestinal barrier integrity, immune maturation, and nutrient absorption. In their place, we find enrichment of Proteobacteria and Enterobacteriaceae, which are associated with gut inflammation and increased intestinal permeability.',
        'An intriguing finding from our Afghan refugee cohort is that gut microbial diversity is further reduced in children who experienced early displacement, independent of current dietary intake. This points to psychosocial stress and disrupted early-life colonisation as compounding factors that may require dedicated microbiome-targeted interventions beyond nutritional supplementation alone.',
        'Our ongoing HEC-funded study aims to follow children from birth through two years of age, correlating microbiome trajectories with growth outcomes, dietary diversity scores, and biomarkers of intestinal inflammation. We hope these insights will eventually inform probiotic and prebiotic strategies tailored to the microbial deficits most predictive of growth faltering in Pakistani children.',
      ),
    },
    {
      slug: 'naswar-oral-microbiome-cancer-risk',
      title:
        "Naswar, Oral Bacteria, and Cancer: How Smokeless Tobacco Reshapes the Mouth's Microbial World",
      status: 'published',
      publishedAt: '2024-07-08',
      readingTimeMinutes: 6,
      tags: [
        { tag: 'oral microbiome' },
        { tag: 'oral cancer' },
        { tag: 'naswar' },
        { tag: 'tobacco' },
      ],
      seoMeta: {
        title: 'Naswar, Oral Microbiome & Cancer Risk | NOG Lab',
        description:
          'Research from the NOG Lab linking naswar smokeless tobacco use to oral microbial dysbiosis and elevated cancer risk.',
      },
      body: makeBody(
        "Naswar — a moist smokeless tobacco product made from tobacco leaf, ash, and various additives — is widely used among men in Khyber Pakhtunkhwa and other parts of Pakistan. Despite its prevalence, its effects on the oral microbiome and cancer biology have been largely understudied. Our lab's research is beginning to paint a clear and concerning picture.",
        'Using 16S rRNA sequencing of oral rinse and buccal swab samples from regular naswar users compared to non-users, we have demonstrated significant shifts in the oral bacterial community. Notably, regular naswar use is associated with a marked decrease in protective commensal organisms such as Streptococcus sanguinis and an enrichment of Fusobacterium nucleatum — a bacterium increasingly recognised as a co-driver of head and neck squamous cell carcinomas.',
        'Fusobacterium nucleatum promotes tumour progression through several mechanisms: it activates E-cadherin signalling pathways that stimulate cancer cell proliferation, suppresses local immune surveillance, and creates a pro-inflammatory microenvironment that facilitates invasion and metastasis. The enrichment of this organism in naswar users with premalignant oral lesions is a particularly alarming finding from our study.',
        'We also measured salivary levels of proinflammatory cytokines IL-6, IL-8, and TNF-α, finding significantly elevated levels in naswar users with dysplastic oral mucosa compared to those without lesions. This immune activation appears to be, at least partly, mediated by the altered microbial communities rather than the chemical carcinogens in tobacco alone.',
        'Our findings advocate for the inclusion of oral microbiome screening as part of early cancer detection programmes in KPK, and support targeted public health messaging about naswar use that goes beyond the chemical toxicology to highlight the microbial disruption it causes. We are now exploring whether probiotic interventions can partially restore normal oral bacterial communities in heavy naswar users.',
      ),
    },
    {
      slug: 'champ-study-lessons-childhood-microbiome',
      title:
        'Five Key Lessons from the CHAMP Study: Childhood Microbiome Health Across Pakistani Populations',
      status: 'published',
      publishedAt: '2024-04-22',
      readingTimeMinutes: 5,
      tags: [
        { tag: 'CHAMP study' },
        { tag: 'child health' },
        { tag: 'gut microbiome' },
        { tag: 'research update' },
      ],
      seoMeta: {
        title: 'CHAMP Study Key Findings | NOG Lab',
        description:
          'Five insights from the CHAMP childhood microbiome study conducted by the NOG Lab in Pakistan.',
      },
      body: makeBody(
        'The Childhood Health and Microbiome Programme (CHAMP) has been one of our most comprehensive research endeavours to date, enrolling over 300 children across three sites in KPK. Here we share five findings that have shaped how we think about childhood microbiome health in Pakistan.',
        '1. Rural-urban differences are stark. Children from rural communities showed markedly different gut microbiome compositions compared to urban Peshawar children of the same age. Rural children had higher overall microbial diversity — a pattern that held even after adjusting for diet and breastfeeding practices — suggesting environmental exposure and reduced antibiotic use play important roles in early microbiome formation.',
        '2. Breastfeeding duration predicts Bifidobacterium abundance. Among our CHAMP infants, every additional month of exclusive breastfeeding was associated with higher relative abundance of Bifidobacterium species at 12 months of age. This protective effect persisted even after complementary feeding was introduced, underscoring the lasting value of prolonged breastfeeding in shaping healthy infant microbiomes.',
        '3. Antibiotic use leaves a detectable signature. Children who received three or more antibiotic courses in the first year of life showed significantly reduced microbial richness and lower counts of Lachnospiraceae family members at 18 months. Encouragingly, children who had a longer antibiotic-free period after their last course showed partial recovery, suggesting the microbiome has meaningful resilience.',
        '4. Microbiome diversity at 6 months predicts weight-for-age at 18 months. One of our most striking longitudinal findings is that gut microbial diversity at 6 months — before growth divergence becomes obvious — is predictive of weight-for-age Z-score at 18 months. This positions early microbiome assessment as a potential screening tool to identify children at risk of future growth faltering.',
        "5. The maternal microbiome matters. Stool microbiome profiles from mothers at delivery were moderately correlated with their infants' gut microbiome at 3 months, even after caesarean births. This suggests maternal-to-infant microbial transmission occurs through multiple routes and that maternal microbiome health during pregnancy should be considered part of any early-life nutrition intervention programme.",
      ),
    },
    {
      slug: 'afghan-refugee-gut-microbiome-research',
      title:
        'Studying the Gut Microbiome in Afghan Refugee Children: Challenges, Insights, and Implications',
      status: 'published',
      publishedAt: '2024-01-30',
      readingTimeMinutes: 6,
      tags: [
        { tag: 'refugee health' },
        { tag: 'gut microbiome' },
        { tag: 'Afghanistan' },
        { tag: 'displacement' },
      ],
      seoMeta: {
        title: 'Gut Microbiome in Afghan Refugee Children | NOG Lab',
        description:
          'What the gut microbiome of Afghan refugee children in Pakistan reveals about the biology of displacement and malnutrition.',
      },
      body: makeBody(
        "Pakistan hosts one of the largest refugee populations in the world, with over 1.3 million registered Afghan refugees — a significant proportion of whom are children under five. While the health challenges of displacement are well-documented at the epidemiological level, the microbiological effects of forced migration on children's gut health remain poorly characterised. Our lab set out to address this gap.",
        'Working in partnership with UNHCR health partners and community health workers in the Peshawar refugee settlements, we recruited 120 Afghan refugee children aged 6–36 months for gut microbiome profiling using shotgun metagenomics. Their profiles were compared to age- and sex-matched Pakistani urban and rural children from our existing CHAMP cohort.',
        'The refugee children showed the lowest gut microbial diversity of any group in our study — even lower than Pakistani urban children living in high-density, sanitation-compromised areas. This was characterised by extreme enrichment of Escherichia-Shigella species (accounting for over 25% of relative abundance in some samples), near-absence of Akkermansia muciniphila (a key mucus-layer protector), and severely depleted Bacteroidetes populations.',
        'Strikingly, even refugee children who were not acutely malnourished showed these microbial patterns, suggesting that displacement per se — through mechanisms including psychosocial stress, disrupted sleep, monotonous diet, and frequent infections — drives microbiome dysbiosis independent of nutritional status.',
        'These findings have important implications for how we design nutritional interventions for displaced children. Standard therapeutic food protocols address caloric and micronutrient deficits but do not specifically target the gut microbiome. Our data suggest that adjunctive microbiome-targeted strategies — such as fermented food provision or targeted prebiotic supplements — may be important components of care for refugee children, particularly in the early post-displacement period.',
      ),
    },
  ]

  for (const post of blogPosts) {
    const existing = await payload.find({
      collection: 'blog_posts',
      where: { slug: { equals: post.slug } },
      limit: 1,
      overrideAccess: true,
    })
    if (existing.docs.length > 0) {
      log(`  SKIP blog: "${post.title}" (already exists)`)
      continue
    }
    const data: any = { ...post }
    if (piId) data.author = piId
    await payload.create({
      collection: 'blog_posts',
      data,
      overrideAccess: true,
    })
    log(`  CREATE blog: "${post.title}"`)
  }

  log('Done!')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
