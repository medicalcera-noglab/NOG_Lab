import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import { getSiteSettings, getPageSeo, resolvePageSeo, getPartnershipsPage } from '@/lib/data'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { FadeUp } from '@/components/FadeUp'
import { PageBanner } from '@/components/ui/PageBanner'
import { CollaboratorsGrid } from '@/components/collaborations/CollaboratorsGrid'
import { getAllCollaborators } from '@/lib/data/collaborators'
import { PartnershipsSubnav } from '@/components/collaborations/PartnershipsSubnav'
import { PartnershipInquiryForm } from '@/components/collaborations/PartnershipInquiryForm'
import {
  Users,
  Building2,
  Dna,
  Database,
  FlaskConical,
  Stethoscope,
  Microscope,
  Mail,
  ShieldCheck,
  CheckCircle2,
  LineChart,
  Globe2,
  Handshake,
  Award,
  Layers,
} from 'lucide-react'

export async function generateMetadata(): Promise<Metadata> {
  const [settings, pageSeo, partnershipsPage] = await Promise.all([
    getSiteSettings(),
    getPageSeo(),
    getPartnershipsPage(),
  ])
  const seo = resolvePageSeo(pageSeo, 'collaborations')
  return buildMetadata(
    {
      title: seo.title ?? partnershipsPage?.heroTitle ?? 'Partnerships — NOG Lab',
      description:
        seo.description ??
        partnershipsPage?.heroDescription ??
        'Partner with NOG Lab to access real-world population data, community cohorts, clinical trial support, and microbiome research in Pakistan.',
      canonical: '/collaborations',
      ogImage: seo.ogImageUrl,
    },
    settings,
  )
}

export const revalidate = 300

const STRENGTH_ICONS = [Users, Building2, Stethoscope, LineChart, Dna, ShieldCheck, Globe2, Award]
const OFFERING_ICONS = [Users, Stethoscope, LineChart, Building2, FlaskConical, Database, Handshake]
const INFRA_ICONS = [Users, Stethoscope, FlaskConical, Microscope, Dna]
const SECTOR_ICONS = [Building2, Users, Globe2]

export default async function CollaborationsPage() {
  const [collaborators, settings, partnershipsPage] = await Promise.all([
    getAllCollaborators(),
    getSiteSettings(),
    getPartnershipsPage(),
  ])

  const contactEmail =
    partnershipsPage?.ctaEmail || settings.contactEmail || 'research@noglabkmu.org'

  const heroEyebrow = partnershipsPage?.heroEyebrow ?? 'Research Partnerships'
  const heroTitle = partnershipsPage?.heroTitle ?? 'Access Real-World Population Data from Pakistan'
  const heroDescription =
    partnershipsPage?.heroDescription ??
    'Partner with our established community research network to generate high-quality real-world evidence. NOG Lab provides industry, academic, and global health partners with access to diverse populations in Pakistan including rural, underserved communities enabling population-based cohort studies, clinical trials, nutrition research, microbiome investigations and implementation research in authentic community settings.'

  const whyPartnerTitle = partnershipsPage?.whyPartnerTitle ?? 'Why Partner With Us?'
  const whyPartnerSubtitle =
    partnershipsPage?.whyPartnerSubtitle ??
    'Our multidisciplinary team combines expertise in nutrition, microbiome (oral and gut), public health and community-based implementation research to deliver high-quality evidence from real-world populations.'

  const strengths = partnershipsPage?.strengths?.length
    ? partnershipsPage.strengths
    : [
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
      ]

  const whatWeOfferTitle = partnershipsPage?.whatWeOfferTitle ?? 'What We Offer?'
  const whatWeOfferSubtitle =
    partnershipsPage?.whatWeOfferSubtitle ??
    'Comprehensive population-based platforms, clinical trial support, longitudinal cohorts, sample biobanking, and analytics.'

  const offerings = partnershipsPage?.offerings?.length
    ? partnershipsPage.offerings
    : [
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
      ]

  const infrastructureTitle = partnershipsPage?.infrastructureTitle ?? 'Our Research Infrastructure'
  const infrastructureTagline =
    partnershipsPage?.infrastructureTagline ?? 'From Community Research to Advanced Genomics'
  const infrastructureOverview =
    partnershipsPage?.infrastructureOverview ??
    'NOG Lab brings together a unique research ecosystem that combines community-based field research, clinical study infrastructure, laboratory sciences, and advanced genomic technologies. This integrated platform enables us to conduct high-quality research from participant recruitment and data collection in remote communities through to molecular analysis and next-generation sequencing.'

  const infrastructurePillars = partnershipsPage?.infrastructurePillars?.length
    ? partnershipsPage.infrastructurePillars
    : [
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
      ]

  const whoWeWorkWithTitle = partnershipsPage?.whoWeWorkWithTitle ?? 'Who We Work With'
  const whoWeWorkWithSubtitle =
    partnershipsPage?.whoWeWorkWithSubtitle ??
    'We welcome collaborative partnerships across industry, academia, global health organizations, and public health agencies.'

  const sectors = partnershipsPage?.sectors?.length
    ? partnershipsPage.sectors
    : [
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
      ]

  const projectsTitle = partnershipsPage?.projectsTitle ?? 'Example Collaboration Projects'
  const projectsSubtitle =
    partnershipsPage?.projectsSubtitle ??
    'Demonstrated experience delivering high-quality evidence across nutrition, clinical interventions, and microbiome analytics.'

  const exampleProjects = partnershipsPage?.exampleProjects?.length
    ? partnershipsPage.exampleProjects
    : [
        { title: 'Validation of nutrition products' },
        { title: 'Community-based intervention trials' },
        { title: 'Dietary supplement evaluation' },
        { title: 'Oral microbiome biomarker studies' },
        { title: 'Gut microbiome cohort studies' },
        { title: 'AI-enabled nutrition monitoring' },
        { title: 'Population health surveys' },
        { title: 'Biomarker validation' },
        { title: 'Digital health implementation studies' },
      ]

  const modelsTitle = partnershipsPage?.modelsTitle ?? 'Partnership Models'
  const modelsSubtitle =
    partnershipsPage?.modelsSubtitle ??
    'We offer collaborative frameworks designed to meet the strategic and operational goals of academic, industry, and international partners.'

  const models = partnershipsPage?.models?.length
    ? partnershipsPage.models
    : [
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
      ]

  const collaboratorsTitle = partnershipsPage?.collaboratorsTitle ?? 'Partner Institutions'
  const collaboratorsSubtitle =
    partnershipsPage?.collaboratorsSubtitle ??
    'driving interdisciplinary microbiome research at a global scale.'

  const ctaTitle = partnershipsPage?.ctaTitle ?? "Let's Build Evidence Together"
  const ctaDescription =
    partnershipsPage?.ctaDescription ??
    'Whether you are developing a new nutritional intervention, validating diagnostic technologies, evaluating health products, or designing population-based studies, we welcome opportunities to collaborate. We work with academic institutions, industry partners, non-governmental organisations, and public health agencies to generate high-quality evidence that improves health outcomes in low- and middle-income countries.'

  return (
    <>
      {/* Hero Banner */}
      <PageBanner
        eyebrow={heroEyebrow}
        title={heroTitle}
        description={heroDescription}
        tint="#0E6E6E"
      />

      {/* Why Partner With Us Section */}
      <Section className="border-border bg-surface border-b py-12 md:py-16">
        <Container>
          <FadeUp>
            <div className="mb-10 text-center">
              <p className="text-primary mb-2 text-xs font-semibold tracking-[0.15em] uppercase">
                Core Strengths
              </p>
              <h2 className="font-heading text-fg text-3xl font-bold md:text-4xl">
                {whyPartnerTitle}
              </h2>
              <p className="text-muted mx-auto mt-3 max-w-3xl text-base leading-relaxed md:text-lg">
                {whyPartnerSubtitle}
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {strengths.map((strength, i) => {
              const Icon = STRENGTH_ICONS[i % STRENGTH_ICONS.length]
              return (
                <FadeUp key={strength.title} delay={i * 0.04}>
                  <div className="border-border bg-bg flex h-full flex-col rounded-2xl border p-5 transition-shadow hover:shadow-sm">
                    <div className="bg-primary/10 text-primary mb-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                      <Icon size={20} />
                    </div>
                    <h3 className="font-heading text-fg mb-1.5 text-base font-bold">
                      {strength.title}
                    </h3>
                    <p className="text-muted text-xs leading-relaxed">{strength.desc}</p>
                  </div>
                </FadeUp>
              )
            })}
          </div>
        </Container>
      </Section>

      {/* Sticky Section Subnav */}
      <PartnershipsSubnav />

      {/* ── SECTION 1: WHAT WE OFFER ── */}
      <Section id="what-we-offer" className="bg-bg py-16 md:py-24">
        <Container>
          <FadeUp>
            <div className="mb-12">
              <p className="text-primary mb-2 text-xs font-semibold tracking-[0.15em] uppercase">
                Capabilities & Services
              </p>
              <h2 className="font-heading text-fg text-3xl font-bold md:text-4xl">
                {whatWeOfferTitle}
              </h2>
              <p className="text-muted mt-3 max-w-2xl leading-relaxed">{whatWeOfferSubtitle}</p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {offerings.map((item, i) => {
              const Icon = OFFERING_ICONS[i % OFFERING_ICONS.length]
              return (
                <FadeUp key={item.title} delay={i * 0.05}>
                  <div className="border-border bg-surface flex h-full flex-col rounded-2xl border p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="bg-primary/10 text-primary mb-4 flex h-12 w-12 items-center justify-center rounded-2xl">
                      <Icon size={24} />
                    </div>
                    <h3 className="font-heading text-fg mb-3 text-lg font-bold">{item.title}</h3>
                    <p className="text-muted text-sm leading-relaxed">{item.text}</p>
                  </div>
                </FadeUp>
              )
            })}
          </div>
        </Container>
      </Section>

      {/* ── SECTION 2: RESEARCH INFRASTRUCTURE ── */}
      <Section
        id="research-infrastructure"
        className="border-border bg-surface border-y py-16 md:py-24"
      >
        <Container>
          <FadeUp>
            <div className="mb-12">
              <p className="text-primary mb-2 text-xs font-semibold tracking-[0.15em] uppercase">
                Our Facilities & Networks
              </p>
              <h2 className="font-heading text-fg text-3xl font-bold md:text-4xl">
                {infrastructureTitle}
              </h2>
              <p className="text-accent mt-2 text-base font-semibold italic">
                {infrastructureTagline}
              </p>
              <p className="text-muted mt-4 max-w-3xl text-base leading-relaxed">
                {infrastructureOverview}
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {infrastructurePillars.map((infra, i) => {
              const Icon = INFRA_ICONS[i % INFRA_ICONS.length]
              return (
                <FadeUp key={infra.title} delay={i * 0.06}>
                  <div className="border-border bg-bg flex h-full flex-col rounded-2xl border p-6 shadow-sm">
                    <div className="bg-primary/10 text-primary mb-4 flex h-12 w-12 items-center justify-center rounded-2xl">
                      <Icon size={24} />
                    </div>
                    <h3 className="font-heading text-fg mb-3 text-lg font-bold">{infra.title}</h3>
                    <p className="text-muted text-sm leading-relaxed">{infra.text}</p>
                  </div>
                </FadeUp>
              )
            })}
          </div>
        </Container>
      </Section>

      {/* ── SECTION 3: WHO WE WORK WITH ── */}
      <Section id="who-we-work-with" className="bg-bg py-16 md:py-24">
        <Container>
          <FadeUp>
            <div className="mb-12 text-center">
              <p className="text-primary mb-2 text-xs font-semibold tracking-[0.15em] uppercase">
                Collaborative Ecosystem
              </p>
              <h2 className="font-heading text-fg text-3xl font-bold md:text-4xl">
                {whoWeWorkWithTitle}
              </h2>
              <p className="text-muted mx-auto mt-3 max-w-2xl leading-relaxed">
                {whoWeWorkWithSubtitle}
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {sectors.map((sector, i) => {
              const Icon = SECTOR_ICONS[i % SECTOR_ICONS.length]
              return (
                <FadeUp key={sector.title} delay={i * 0.08}>
                  <div className="border-border bg-surface flex h-full flex-col rounded-2xl border p-6 shadow-sm">
                    <div className="bg-primary/10 text-primary mb-4 flex h-12 w-12 items-center justify-center rounded-2xl">
                      <Icon size={24} />
                    </div>
                    <h3 className="font-heading text-fg mb-4 text-xl font-bold">{sector.title}</h3>
                    <ul className="space-y-2.5">
                      {(sector.items ?? []).map((item) => (
                        <li key={item.name} className="text-muted flex items-start gap-2 text-sm">
                          <CheckCircle2 size={16} className="text-primary mt-0.5 shrink-0" />
                          <span>{item.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </FadeUp>
              )
            })}
          </div>
        </Container>
      </Section>

      {/* ── SECTION 4: EXAMPLE PROJECTS ── */}
      <Section id="example-projects" className="border-border bg-surface border-t py-16 md:py-24">
        <Container>
          <FadeUp>
            <div className="mb-12">
              <p className="text-primary mb-2 text-xs font-semibold tracking-[0.15em] uppercase">
                Proven Track Record
              </p>
              <h2 className="font-heading text-fg text-3xl font-bold md:text-4xl">
                {projectsTitle}
              </h2>
              <p className="text-muted mt-3 max-w-2xl leading-relaxed">{projectsSubtitle}</p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {exampleProjects.map((project, i) => (
              <FadeUp key={project.title} delay={i * 0.04}>
                <div className="border-border bg-bg hover:border-primary/50 flex items-center gap-3 rounded-xl border p-4 shadow-xs transition-colors">
                  <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                    <CheckCircle2 size={16} />
                  </div>
                  <span className="font-heading text-fg text-sm font-semibold">
                    {project.title}
                  </span>
                </div>
              </FadeUp>
            ))}
          </div>
        </Container>
      </Section>

      {/* ── SECTION 5: PARTNERSHIP MODELS ── */}
      <Section id="partnership-models" className="bg-bg py-16 md:py-24">
        <Container>
          <FadeUp>
            <div className="mb-12 text-center">
              <p className="text-primary mb-2 text-xs font-semibold tracking-[0.15em] uppercase">
                Flexible Engagement
              </p>
              <h2 className="font-heading text-fg text-3xl font-bold md:text-4xl">{modelsTitle}</h2>
              <p className="text-muted mx-auto mt-3 max-w-2xl leading-relaxed">{modelsSubtitle}</p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {models.map((model, i) => (
              <FadeUp key={model.title} delay={i * 0.05}>
                <div className="border-border bg-surface flex h-full flex-col rounded-2xl border p-6 shadow-sm">
                  <div className="bg-primary/10 text-primary mb-3 flex h-9 w-9 items-center justify-center rounded-xl">
                    <Layers size={18} />
                  </div>
                  <h3 className="font-heading text-fg mb-2 text-base font-bold">{model.title}</h3>
                  <p className="text-muted text-xs leading-relaxed">{model.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </Container>
      </Section>

      {/* ── SECTION 6: PARTNER INSTITUTIONS ── */}
      <Section
        id="partner-institutions"
        className="border-border bg-surface border-t py-16 md:py-24"
      >
        <Container>
          <FadeUp>
            <div className="mb-12">
              <p className="text-primary mb-2 text-xs font-semibold tracking-[0.15em] uppercase">
                Global Network
              </p>
              <h2 className="font-heading text-fg text-3xl font-bold md:text-4xl">
                {collaboratorsTitle}
              </h2>
              <p className="text-muted mt-3 max-w-2xl leading-relaxed">
                {collaborators.length} institutions across{' '}
                {new Set(collaborators.map((c) => c.country).filter(Boolean)).size} countries —{' '}
                {collaboratorsSubtitle}
              </p>
            </div>
          </FadeUp>

          {collaborators.length > 0 && <CollaboratorsGrid collaborators={collaborators} />}
        </Container>
      </Section>

      {/* ── SECTION 7: CALL TO ACTION & ENQUIRY FORM ── */}
      <Section id="enquiry" className="bg-bg py-16 md:py-24">
        <Container className="max-w-5xl">
          <FadeUp>
            <div className="mb-12 text-center">
              <p className="text-primary mb-2 text-xs font-semibold tracking-[0.15em] uppercase">
                Get In Touch
              </p>
              <h2 className="font-heading text-fg text-3xl font-bold md:text-4xl">{ctaTitle}</h2>
              <p className="text-muted mx-auto mt-4 max-w-3xl text-base leading-relaxed md:text-lg">
                {ctaDescription}
              </p>

              <div className="mt-6 flex items-center justify-center gap-2">
                <Mail className="text-primary" size={18} />
                <a
                  href={`mailto:${contactEmail}`}
                  className="text-primary hover:text-accent font-semibold hover:underline"
                >
                  {contactEmail}
                </a>
              </div>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <PartnershipInquiryForm />
          </FadeUp>
        </Container>
      </Section>
    </>
  )
}
