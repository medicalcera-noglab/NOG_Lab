/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Populates the partnerships_page global in Payload CMS with initial default data.
 *
 * Run: tsx --require ./scripts/load-env.cjs scripts/seed-partnerships-page.ts
 */
import { getPayload } from 'payload'
import configPromise from '../payload.config'

async function main() {
  const payload = await getPayload({ config: configPromise })

  console.log('Seeding Partnerships Page global...')

  const data = {
    heroEyebrow: 'Research Partnerships',
    heroTitle: 'Access Real-World Population Data from Pakistan',
    heroDescription:
      'Partner with our established community research network to generate high-quality real-world evidence. NOG Lab provides industry, academic, and global health partners with access to diverse populations in Pakistan including rural, underserved communities enabling population-based cohort studies, clinical trials, nutrition research, microbiome investigations and implementation research in authentic community settings.',

    whyPartnerTitle: 'Why Partner With Us?',
    whyPartnerSubtitle:
      'Our multidisciplinary team combines expertise in nutrition, microbiome (oral and gut), public health and community-based implementation research to deliver high-quality evidence from real-world populations.',
    strengths: [
      {
        title: 'Large Population Cohorts',
        desc: 'Access to large, well-characterised, community-based population cohorts across Khyber Pakhtunkhwa.',
      },
      {
        title: 'Rural Research Infrastructure',
        desc: 'Established research infrastructure and long-standing trust in rural and remote communities.',
      },
      {
        title: 'Clinical & Cohort Trial Expertise',
        desc: 'Deep operational expertise in conducting clinical trials and longitudinal cohort studies.',
      },
      {
        title: 'Statistics & Bioinformatics',
        desc: 'High-level biostatistical modeling, epidemiology, and multi-omics bioinformatic analysis.',
      },
      {
        title: 'Oral & Gut Microbiome Research',
        desc: 'Specialised sampling, high-throughput metagenomics, and host-microbiome research capabilities.',
      },
      {
        title: 'Regulatory & Ethical Expertise',
        desc: 'Local regulatory compliance, institutional ethics approvals, and community engagement protocols.',
      },
      {
        title: 'Global Consortia Experience',
        desc: 'Proven track record of international consortia partnerships and co-funded research programs.',
      },
      {
        title: 'LMIC Evidence Generation',
        desc: 'Uniquely positioned to generate authentic evidence from underrepresented LMIC populations.',
      },
    ],

    whatWeOfferTitle: 'What We Offer?',
    whatWeOfferSubtitle:
      'Comprehensive population-based platforms, clinical trial support, longitudinal cohorts, sample biobanking, and analytics.',
    offerings: [
      {
        title: 'Population-Based Research Platforms',
        text: "Leverage access to diverse populations through NOG Lab's established community research networks. We support the design and implementation of population-based studies that generate high-quality evidence on nutrition, health, disease, and microbiome-related outcomes in real-world settings across Khyber Pakhtunkhwa, Pakistan.",
      },
      {
        title: 'Clinical Research & Trial Support',
        text: 'NOG Lab provides end-to-end support for clinical and community-based research studies. From study design and participant recruitment to field implementation, data collection, and monitoring, we help partners deliver scientifically rigorous and operationally efficient research projects.',
      },
      {
        title: 'Cohort Studies & Longitudinal Research',
        text: 'Our team has extensive experience conducting longitudinal cohort studies that track health, nutrition, growth, and microbiome development over time. We specialise in maintaining long-term participant engagement and generating robust evidence on life-course health outcomes.',
      },
      {
        title: 'Rural & Remote Community Research',
        text: 'NOG Lab offers unique access to underserved rural and remote populations that are often underrepresented in global research. Through strong community partnerships and local expertise, we facilitate high-quality data collection in challenging field environments while ensuring cultural sensitivity and participant trust.',
      },
      {
        title: 'Biological Sample Collection & Biobanking',
        text: 'We support the collection, processing, and management of a wide range of biological samples (oral, fecal, blood) for clinical and translational research. Our expertise includes microbiome sampling, biospecimen handling, and standardised protocols to ensure data quality and scientific integrity.',
      },
      {
        title: 'Data & Analytics',
        text: 'Transform data into actionable insights with our multidisciplinary expertise in epidemiology, biostatistics, bioinformatics, and microbiome analytics. We provide comprehensive analytical support to help researchers and industry partners maximise the value and impact of their studies.',
      },
      {
        title: 'Research Partnerships & Collaborative Opportunities',
        text: 'We partner with universities, industry, NGOs, and global health organisations seeking access to real-world populations and research expertise in low- and middle-income country settings. Whether supporting a single project or a long-term programme, we work collaboratively to generate evidence that informs science, policy, and practice.',
      },
    ],

    infrastructureTitle: 'Our Research Infrastructure',
    infrastructureTagline: 'From Community Research to Advanced Genomics',
    infrastructureOverview:
      'NOG Lab brings together a unique research ecosystem that combines community-based field research, clinical study infrastructure, laboratory sciences, and advanced genomic technologies. This integrated platform enables us to conduct high-quality research from participant recruitment and data collection in remote communities through to molecular analysis and next-generation sequencing.',
    infrastructurePillars: [
      {
        title: 'Community Research Network',
        text: 'Our established community research network provides access to diverse populations across rural, remote, and underserved regions of Pakistan. Through long-standing community partnerships and experienced field teams, we facilitate large-scale population studies, cohort research, and community-based interventions with strong participant engagement and retention.',
      },
      {
        title: 'Clinical Trial Unit',
        text: 'The Clinical Trial Unit supports the design and implementation of clinical and community-based intervention studies. We provide expertise in participant recruitment, study coordination, regulatory compliance, data collection, monitoring, and follow-up, ensuring the highest standards of research quality and integrity.',
      },
      {
        title: 'Human Nutrition Laboratory',
        text: 'Our Human Nutrition Laboratory supports nutritional assessment and research across the life course. The facility enables comprehensive evaluation of dietary intake, nutritional status, anthropometry, and nutrition-related health outcomes, providing critical insights for public health and intervention research.',
      },
      {
        title: 'Molecular Biology Laboratory',
        text: 'Our Molecular Biology Laboratory is equipped for a wide range of molecular and microbiological analyses. Facilities include PCR-based technologies and laboratory infrastructure for DNA extraction, amplification, and molecular characterisation, supporting research in nutrition, infectious diseases, oral health, and microbiome science.',
      },
      {
        title: 'Advanced Centre for Genomic Technologies (ACGT)',
        text: 'Through the Advanced Centre for Genomic Technologies (ACGT), researchers have access to state-of-the-art sequencing and genomics facilities. The centre houses Sanger sequencing and Illumina MiSeq platforms, enabling high-throughput genomic, metagenomic, and microbiome analyses that support cutting-edge translational and population health research.',
      },
    ],

    whoWeWorkWithTitle: 'Who We Work With',
    whoWeWorkWithSubtitle:
      'We welcome collaborative partnerships across industry, academia, global health organizations, and public health agencies.',
    sectors: [
      {
        title: 'Industry Partners',
        items: [
          { name: 'Nutrition companies' },
          { name: 'Food and beverage sector' },
          { name: 'Probiotic and microbiome companies' },
          { name: 'Pharmaceutical industry' },
          { name: 'Oral healthcare companies' },
          { name: 'Digital health companies' },
        ],
      },
      {
        title: 'Academic & Research Institutions',
        items: [
          { name: 'Universities & medical schools' },
          { name: 'Specialised research centres' },
          { name: 'Global health programmes' },
          { name: 'International research consortia' },
          { name: 'Postdoctoral & graduate fellowships' },
        ],
      },
      {
        title: 'NGOs & Development Organisations',
        items: [
          { name: 'UNICEF initiatives' },
          { name: 'WHO research programmes' },
          { name: 'Global nutrition initiatives' },
          { name: 'Maternal & child health projects' },
          { name: 'Public health policy interventions' },
        ],
      },
    ],

    projectsTitle: 'Example Collaboration Projects',
    projectsSubtitle:
      'Demonstrated experience delivering high-quality evidence across nutrition, clinical interventions, and microbiome analytics.',
    exampleProjects: [
      { title: 'Validation of nutrition products' },
      { title: 'Community-based intervention trials' },
      { title: 'Dietary supplement evaluation' },
      { title: 'Oral microbiome biomarker studies' },
      { title: 'Gut microbiome cohort studies' },
      { title: 'AI-enabled nutrition monitoring' },
      { title: 'Population health surveys' },
      { title: 'Biomarker validation' },
      { title: 'Digital health implementation studies' },
    ],

    modelsTitle: 'Partnership Models',
    modelsSubtitle:
      'We offer collaborative frameworks designed to meet the strategic and operational goals of academic, industry, and international partners.',
    models: [
      {
        title: 'Collaborative Grant-Funded Research',
        desc: 'Joint proposals for international funding bodies (NIH, Wellcome Trust, MRC, EU Horizon).',
      },
      {
        title: 'Contract Research',
        desc: 'Targeted research services, clinical evaluation, and analytical deliverables for industry clients.',
      },
      {
        title: 'Multi-Centre Clinical Studies',
        desc: 'Serving as the LMIC study site or regional hub for global multi-centre trials.',
      },
      {
        title: 'Data Analysis Partnerships',
        desc: 'Joint epidemiological, statistical, and bioinformatic analysis of complex datasets.',
      },
      {
        title: 'Student Exchange & Training',
        desc: 'Capacity-building, doctoral exchanges, and technical training in microbiome genomics.',
      },
      {
        title: 'Industry-Sponsored Research',
        desc: 'Co-designed studies evaluating novel nutritional, diagnostic, or digital health solutions.',
      },
      {
        title: 'Technology Validation Studies',
        desc: 'Field-testing and validation of point-of-care diagnostics and monitoring tools.',
      },
    ],

    collaboratorsTitle: 'Partner Institutions',
    collaboratorsSubtitle: 'driving interdisciplinary microbiome research at a global scale.',

    ctaTitle: "Let's Build Evidence Together",
    ctaDescription:
      'Whether you are developing a new nutritional intervention, validating diagnostic technologies, evaluating health products, or designing population-based studies, we welcome opportunities to collaborate. We work with academic institutions, industry partners, non-governmental organisations, and public health agencies to generate high-quality evidence that improves health outcomes in low- and middle-income countries.',
    ctaEmail: 'research@noglabkmu.org',
    _status: 'published',
  }

  await payload.updateGlobal({
    slug: 'partnerships_page',
    data: data as any,
  })

  console.log('Partnerships Page global seeded successfully!')
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
