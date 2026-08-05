import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import { getSiteSettings, getPageSeo, resolvePageSeo } from '@/lib/data'
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
  const [settings, pageSeo] = await Promise.all([getSiteSettings(), getPageSeo()])
  const seo = resolvePageSeo(pageSeo, 'collaborations')
  return buildMetadata(
    {
      title: seo.title ?? 'Partnerships — NOG Lab',
      description:
        seo.description ??
        'Partner with NOG Lab to access real-world population data, community cohorts, clinical trial support, and microbiome research in Pakistan.',
      canonical: '/collaborations',
      ogImage: seo.ogImageUrl,
    },
    settings,
  )
}

export const revalidate = 300

export default async function CollaborationsPage() {
  const [collaborators, settings] = await Promise.all([getAllCollaborators(), getSiteSettings()])

  const contactEmail = settings.contactEmail ?? 'research@noglabkmu.org'

  return (
    <>
      {/* Hero Banner */}
      <PageBanner
        eyebrow="Research Partnerships"
        title="Access Real-World Population Data from Pakistan"
        description="Partner with our established community research network to generate high-quality real-world evidence. NOG Lab provides industry, academic, and global health partners with access to diverse populations in Pakistan including rural, underserved communities enabling population-based cohort studies, clinical trials, nutrition research, microbiome investigations and implementation research in authentic community settings."
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
                Why Partner With Us?
              </h2>
              <p className="text-muted mx-auto mt-3 max-w-3xl text-base leading-relaxed md:text-lg">
                Our multidisciplinary team combines expertise in nutrition, microbiome (oral and
                gut), public health and community-based implementation research to deliver
                high-quality evidence from real-world populations.
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Users,
                title: 'Large Population Cohorts',
                desc: 'Access to large, well-characterised, community-based population cohorts across Khyber Pakhtunkhwa.',
              },
              {
                icon: Building2,
                title: 'Rural Research Infrastructure',
                desc: 'Established research infrastructure and long-standing trust in rural and remote communities.',
              },
              {
                icon: Stethoscope,
                title: 'Clinical & Cohort Trial Expertise',
                desc: 'Deep operational expertise in conducting clinical trials and longitudinal cohort studies.',
              },
              {
                icon: LineChart,
                title: 'Statistics & Bioinformatics',
                desc: 'High-level biostatistical modeling, epidemiology, and multi-omics bioinformatic analysis.',
              },
              {
                icon: Dna,
                title: 'Oral & Gut Microbiome Research',
                desc: 'Specialised sampling, high-throughput metagenomics, and host-microbiome research capabilities.',
              },
              {
                icon: ShieldCheck,
                title: 'Regulatory & Ethical Expertise',
                desc: 'Local regulatory compliance, institutional ethics approvals, and community engagement protocols.',
              },
              {
                icon: Globe2,
                title: 'Global Consortia Experience',
                desc: 'Proven track record of international consortia partnerships and co-funded research programs.',
              },
              {
                icon: Award,
                title: 'LMIC Evidence Generation',
                desc: 'Uniquely positioned to generate authentic evidence from underrepresented LMIC populations.',
              },
            ].map((strength, i) => {
              const Icon = strength.icon
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
                What We Offer?
              </h2>
              <p className="text-muted mt-3 max-w-2xl leading-relaxed">
                Comprehensive research platforms, field trial support, biobanking, and data
                analytics tailored for academic, NGO, and industry partners.
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Users,
                title: 'Population-Based Research Platforms',
                text: "Leverage access to diverse populations through NOG Lab's established community research networks. We support the design and implementation of population-based studies that generate high-quality evidence on nutrition, health, disease, and microbiome-related outcomes in real-world settings across Khyber Pakhtunkhwa, Pakistan.",
              },
              {
                icon: Stethoscope,
                title: 'Clinical Research & Trial Support',
                text: 'NOG Lab provides end-to-end support for clinical and community-based research studies. From study design and participant recruitment to field implementation, data collection, and monitoring, we help partners deliver scientifically rigorous and operationally efficient research projects.',
              },
              {
                icon: LineChart,
                title: 'Cohort Studies & Longitudinal Research',
                text: 'Our team has extensive experience conducting longitudinal cohort studies that track health, nutrition, growth, and microbiome development over time. We specialise in maintaining long-term participant engagement and generating robust evidence on life-course health outcomes.',
              },
              {
                icon: Building2,
                title: 'Rural & Remote Community Research',
                text: 'NOG Lab offers unique access to underserved rural and remote populations that are often underrepresented in global research. Through strong community partnerships and local expertise, we facilitate high-quality data collection in challenging field environments while ensuring cultural sensitivity and participant trust.',
              },
              {
                icon: FlaskConical,
                title: 'Biological Sample Collection & Biobanking',
                text: 'We support the collection, processing, and management of a wide range of biological samples (oral, fecal, blood) for clinical and translational research. Our expertise includes microbiome sampling, biospecimen handling, and standardised protocols to ensure data quality and scientific integrity.',
              },
              {
                icon: Database,
                title: 'Data & Analytics',
                text: 'Transform data into actionable insights with our multidisciplinary expertise in epidemiology, biostatistics, bioinformatics, and microbiome analytics. We provide comprehensive analytical support to help researchers and industry partners maximise the value and impact of their studies.',
              },
              {
                icon: Handshake,
                title: 'Research Partnerships & Collaborative Opportunities',
                text: 'We partner with universities, industry, NGOs, and global health organisations seeking access to real-world populations and research expertise in low- and middle-income country settings. Whether supporting a single project or a long-term programme, we work collaboratively to generate evidence that informs science, policy, and practice.',
              },
            ].map((item, i) => {
              const Icon = item.icon
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
                Our Research Infrastructure
              </h2>
              <p className="text-accent mt-2 text-base font-semibold italic">
                From Community Research to Advanced Genomics
              </p>
              <p className="text-muted mt-4 max-w-3xl text-base leading-relaxed">
                NOG Lab brings together a unique research ecosystem that combines community-based
                field research, clinical study infrastructure, laboratory sciences, and advanced
                genomic technologies. This integrated platform enables us to conduct high-quality
                research from participant recruitment and data collection in remote communities
                through to molecular analysis and next-generation sequencing.
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Users,
                title: 'Community Research Network',
                text: 'Our established community research network provides access to diverse populations across rural, remote, and underserved regions of Pakistan. Through long-standing community partnerships and experienced field teams, we facilitate large-scale population studies, cohort research, and community-based interventions with strong participant engagement and retention.',
              },
              {
                icon: Stethoscope,
                title: 'Clinical Trial Unit',
                text: 'The Clinical Trial Unit supports the design and implementation of clinical and community-based intervention studies. We provide expertise in participant recruitment, study coordination, regulatory compliance, data collection, monitoring, and follow-up, ensuring the highest standards of research quality and integrity.',
              },
              {
                icon: FlaskConical,
                title: 'Human Nutrition Laboratory',
                text: 'Our Human Nutrition Laboratory supports nutritional assessment and research across the life course. The facility enables comprehensive evaluation of dietary intake, nutritional status, anthropometry, and nutrition-related health outcomes, providing critical insights for public health and intervention research.',
              },
              {
                icon: Microscope,
                title: 'Molecular Biology Laboratory',
                text: 'Our Molecular Biology Laboratory is equipped for a wide range of molecular and microbiological analyses. Facilities include PCR-based technologies and laboratory infrastructure for DNA extraction, amplification, and molecular characterisation, supporting research in nutrition, infectious diseases, oral health, and microbiome science.',
              },
              {
                icon: Dna,
                title: 'Advanced Centre for Genomic Technologies (ACGT)',
                text: 'Through the Advanced Centre for Genomic Technologies (ACGT), researchers have access to state-of-the-art sequencing and genomics facilities. The centre houses Sanger sequencing and Illumina MiSeq platforms, enabling high-throughput genomic, metagenomic, and microbiome analyses that support cutting-edge translational and population health research.',
              },
            ].map((infra, i) => {
              const Icon = infra.icon
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
                Who We Work With
              </h2>
              <p className="text-muted mx-auto mt-3 max-w-2xl leading-relaxed">
                We welcome collaborative partnerships across industry, academia, global health
                organizations, and public health agencies.
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                title: 'Industry Partners',
                icon: Building2,
                items: [
                  'Nutrition companies',
                  'Food and beverage sector',
                  'Probiotic and microbiome companies',
                  'Pharmaceutical industry',
                  'Oral healthcare companies',
                  'Digital health companies',
                ],
              },
              {
                title: 'Academic & Research Institutions',
                icon: Users,
                items: [
                  'Universities & medical schools',
                  'Specialised research centres',
                  'Global health programmes',
                  'International research consortia',
                  'Postdoctoral & graduate fellowships',
                ],
              },
              {
                title: 'NGOs & Development Organisations',
                icon: Globe2,
                items: [
                  'UNICEF initiatives',
                  'WHO research programmes',
                  'Global nutrition initiatives',
                  'Maternal & child health projects',
                  'Public health policy interventions',
                ],
              },
            ].map((sector, i) => {
              const Icon = sector.icon
              return (
                <FadeUp key={sector.title} delay={i * 0.08}>
                  <div className="border-border bg-surface flex h-full flex-col rounded-2xl border p-6 shadow-sm">
                    <div className="bg-primary/10 text-primary mb-4 flex h-12 w-12 items-center justify-center rounded-2xl">
                      <Icon size={24} />
                    </div>
                    <h3 className="font-heading text-fg mb-4 text-xl font-bold">{sector.title}</h3>
                    <ul className="space-y-2.5">
                      {sector.items.map((item) => (
                        <li key={item} className="text-muted flex items-start gap-2 text-sm">
                          <CheckCircle2 size={16} className="text-primary mt-0.5 shrink-0" />
                          <span>{item}</span>
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
                Example Collaboration Projects
              </h2>
              <p className="text-muted mt-3 max-w-2xl leading-relaxed">
                Demonstrated experience delivering high-quality evidence across nutrition, clinical
                interventions, and microbiome analytics.
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              'Validation of nutrition products',
              'Community-based intervention trials',
              'Dietary supplement evaluation',
              'Oral microbiome biomarker studies',
              'Gut microbiome cohort studies',
              'AI-enabled nutrition monitoring',
              'Population health surveys',
              'Biomarker validation',
              'Digital health implementation studies',
            ].map((project, i) => (
              <FadeUp key={project} delay={i * 0.04}>
                <div className="border-border bg-bg hover:border-primary/50 flex items-center gap-3 rounded-xl border p-4 shadow-xs transition-colors">
                  <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                    <CheckCircle2 size={16} />
                  </div>
                  <span className="font-heading text-fg text-sm font-semibold">{project}</span>
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
              <h2 className="font-heading text-fg text-3xl font-bold md:text-4xl">
                Partnership Models
              </h2>
              <p className="text-muted mx-auto mt-3 max-w-2xl leading-relaxed">
                We offer collaborative frameworks designed to meet the strategic and operational
                goals of academic, industry, and international partners.
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
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
            ].map((model, i) => (
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
                Partner Institutions
              </h2>
              <p className="text-muted mt-3 max-w-2xl leading-relaxed">
                {collaborators.length} institutions across{' '}
                {new Set(collaborators.map((c) => c.country).filter(Boolean)).size} countries —
                driving interdisciplinary microbiome research at a global scale.
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
              <h2 className="font-heading text-fg text-3xl font-bold md:text-4xl">
                Let&apos;s Build Evidence Together
              </h2>
              <p className="text-muted mx-auto mt-4 max-w-3xl text-base leading-relaxed md:text-lg">
                Whether you are developing a new nutritional intervention, validating diagnostic
                technologies, evaluating health products, or designing population-based studies, we
                welcome opportunities to collaborate. We work with academic institutions, industry
                partners, non-governmental organisations, and public health agencies to generate
                high-quality evidence that improves health outcomes in low- and middle-income
                countries.
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
