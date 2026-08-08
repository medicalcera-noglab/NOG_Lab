import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import { getSiteSettings, getPageSeo, resolvePageSeo, getPartnershipsPage } from '@/lib/data'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { FadeUp } from '@/components/FadeUp'
import { PageBanner } from '@/components/ui/PageBanner'
import { CollaboratorsGrid } from '@/components/collaborations/CollaboratorsGrid'
import { getAllCollaborators } from '@/lib/data/collaborators'
import { PartnershipsSubnav, type NavItem } from '@/components/collaborations/PartnershipsSubnav'
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
  const heroDescription = partnershipsPage?.heroDescription ?? ''

  const whyPartnerTitle = partnershipsPage?.whyPartnerTitle
  const whyPartnerSubtitle = partnershipsPage?.whyPartnerSubtitle
  const strengths = partnershipsPage?.strengths ?? []

  const whatWeOfferTitle = partnershipsPage?.whatWeOfferTitle ?? 'What We Offer'
  const whatWeOfferSubtitle = partnershipsPage?.whatWeOfferSubtitle
  const offerings = partnershipsPage?.offerings ?? []

  const infrastructureTitle = partnershipsPage?.infrastructureTitle ?? 'Infrastructure'
  const infrastructureTagline = partnershipsPage?.infrastructureTagline
  const infrastructureOverview = partnershipsPage?.infrastructureOverview
  const infrastructurePillars = partnershipsPage?.infrastructurePillars ?? []

  const whoWeWorkWithTitle = partnershipsPage?.whoWeWorkWithTitle ?? 'Who We Work With'
  const whoWeWorkWithSubtitle = partnershipsPage?.whoWeWorkWithSubtitle
  const sectors = partnershipsPage?.sectors ?? []

  const projectsTitle = partnershipsPage?.projectsTitle ?? 'Example Projects'
  const projectsSubtitle = partnershipsPage?.projectsSubtitle
  const exampleProjects = partnershipsPage?.exampleProjects ?? []

  const modelsTitle = partnershipsPage?.modelsTitle ?? 'Partnership Models'
  const modelsSubtitle = partnershipsPage?.modelsSubtitle
  const models = partnershipsPage?.models ?? []

  const collaboratorsTitle = partnershipsPage?.collaboratorsTitle ?? 'Partner Institutions'
  const collaboratorsSubtitle = partnershipsPage?.collaboratorsSubtitle

  const ctaTitle = partnershipsPage?.ctaTitle ?? "Let's Build Evidence Together"
  const ctaDescription = partnershipsPage?.ctaDescription

  // Build dynamic navigation items driven by CMS data
  const navItems: NavItem[] = [
    (offerings.length > 0 || whatWeOfferTitle) && { id: 'what-we-offer', label: whatWeOfferTitle },
    (infrastructurePillars.length > 0 || infrastructureTitle) && {
      id: 'research-infrastructure',
      label: infrastructureTitle,
    },
    (sectors.length > 0 || whoWeWorkWithTitle) && {
      id: 'who-we-work-with',
      label: whoWeWorkWithTitle,
    },
    (exampleProjects.length > 0 || projectsTitle) && {
      id: 'example-projects',
      label: projectsTitle,
    },
    (models.length > 0 || modelsTitle) && {
      id: 'partnership-models',
      label: modelsTitle,
    },
    (collaborators.length > 0 || collaboratorsTitle) && {
      id: 'partner-institutions',
      label: collaboratorsTitle,
    },
    { id: 'enquiry', label: 'Get in Touch' },
  ].filter(Boolean) as NavItem[]

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
      {(whyPartnerTitle || whyPartnerSubtitle || strengths.length > 0) && (
        <Section className="border-border bg-surface border-b py-12 md:py-16">
          <Container>
            <FadeUp>
              <div className="mb-10 text-center">
                <p className="text-primary mb-2 text-xs font-semibold tracking-[0.15em] uppercase">
                  Core Strengths
                </p>
                {whyPartnerTitle && (
                  <h2 className="font-heading text-fg text-3xl font-bold md:text-4xl">
                    {whyPartnerTitle}
                  </h2>
                )}
                {whyPartnerSubtitle && (
                  <p className="text-muted mx-auto mt-3 max-w-3xl text-base leading-relaxed md:text-lg">
                    {whyPartnerSubtitle}
                  </p>
                )}
              </div>
            </FadeUp>

            {strengths.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {strengths.map((strength, i) => {
                  const Icon = STRENGTH_ICONS[i % STRENGTH_ICONS.length]
                  return (
                    <FadeUp key={strength.title || i} delay={i * 0.04}>
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
            )}
          </Container>
        </Section>
      )}

      {/* Dynamic Sticky Section Subnav */}
      <PartnershipsSubnav items={navItems} />

      {/* ── SECTION 1: WHAT WE OFFER ── */}
      {(whatWeOfferTitle || offerings.length > 0) && (
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
                {whatWeOfferSubtitle && (
                  <p className="text-muted mt-3 max-w-2xl leading-relaxed">{whatWeOfferSubtitle}</p>
                )}
              </div>
            </FadeUp>

            {offerings.length > 0 && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {offerings.map((item, i) => {
                  const Icon = OFFERING_ICONS[i % OFFERING_ICONS.length]
                  return (
                    <FadeUp key={item.title || i} delay={i * 0.05}>
                      <div className="border-border bg-surface flex h-full flex-col rounded-2xl border p-6 shadow-sm transition-all hover:shadow-md">
                        <div className="bg-primary/10 text-primary mb-4 flex h-12 w-12 items-center justify-center rounded-2xl">
                          <Icon size={24} />
                        </div>
                        <h3 className="font-heading text-fg mb-3 text-lg font-bold">
                          {item.title}
                        </h3>
                        <p className="text-muted text-sm leading-relaxed">{item.text}</p>
                      </div>
                    </FadeUp>
                  )
                })}
              </div>
            )}
          </Container>
        </Section>
      )}

      {/* ── SECTION 2: RESEARCH INFRASTRUCTURE ── */}
      {(infrastructureTitle || infrastructurePillars.length > 0) && (
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
                {infrastructureTagline && (
                  <p className="text-accent mt-2 text-base font-semibold italic">
                    {infrastructureTagline}
                  </p>
                )}
                {infrastructureOverview && (
                  <p className="text-muted mt-4 max-w-3xl text-base leading-relaxed">
                    {infrastructureOverview}
                  </p>
                )}
              </div>
            </FadeUp>

            {infrastructurePillars.length > 0 && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {infrastructurePillars.map((infra, i) => {
                  const Icon = INFRA_ICONS[i % INFRA_ICONS.length]
                  return (
                    <FadeUp key={infra.title || i} delay={i * 0.06}>
                      <div className="border-border bg-bg flex h-full flex-col rounded-2xl border p-6 shadow-sm">
                        <div className="bg-primary/10 text-primary mb-4 flex h-12 w-12 items-center justify-center rounded-2xl">
                          <Icon size={24} />
                        </div>
                        <h3 className="font-heading text-fg mb-3 text-lg font-bold">
                          {infra.title}
                        </h3>
                        <p className="text-muted text-sm leading-relaxed">{infra.text}</p>
                      </div>
                    </FadeUp>
                  )
                })}
              </div>
            )}
          </Container>
        </Section>
      )}

      {/* ── SECTION 3: WHO WE WORK WITH ── */}
      {(whoWeWorkWithTitle || sectors.length > 0) && (
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
                {whoWeWorkWithSubtitle && (
                  <p className="text-muted mx-auto mt-3 max-w-2xl leading-relaxed">
                    {whoWeWorkWithSubtitle}
                  </p>
                )}
              </div>
            </FadeUp>

            {sectors.length > 0 && (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {sectors.map((sector, i) => {
                  const Icon = SECTOR_ICONS[i % SECTOR_ICONS.length]
                  return (
                    <FadeUp key={sector.title || i} delay={i * 0.08}>
                      <div className="border-border bg-surface flex h-full flex-col rounded-2xl border p-6 shadow-sm">
                        <div className="bg-primary/10 text-primary mb-4 flex h-12 w-12 items-center justify-center rounded-2xl">
                          <Icon size={24} />
                        </div>
                        <h3 className="font-heading text-fg mb-4 text-xl font-bold">
                          {sector.title}
                        </h3>
                        <ul className="space-y-2.5">
                          {(sector.items ?? []).map((item, idx) => (
                            <li
                              key={item.name || idx}
                              className="text-muted flex items-start gap-2 text-sm"
                            >
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
            )}
          </Container>
        </Section>
      )}

      {/* ── SECTION 4: EXAMPLE PROJECTS ── */}
      {(projectsTitle || exampleProjects.length > 0) && (
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
                {projectsSubtitle && (
                  <p className="text-muted mt-3 max-w-2xl leading-relaxed">{projectsSubtitle}</p>
                )}
              </div>
            </FadeUp>

            {exampleProjects.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {exampleProjects.map((project, i) => (
                  <FadeUp key={project.title || i} delay={i * 0.04}>
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
            )}
          </Container>
        </Section>
      )}

      {/* ── SECTION 5: PARTNERSHIP MODELS ── */}
      {(modelsTitle || models.length > 0) && (
        <Section id="partnership-models" className="bg-bg py-16 md:py-24">
          <Container>
            <FadeUp>
              <div className="mb-12 text-center">
                <p className="text-primary mb-2 text-xs font-semibold tracking-[0.15em] uppercase">
                  Flexible Engagement
                </p>
                <h2 className="font-heading text-fg text-3xl font-bold md:text-4xl">
                  {modelsTitle}
                </h2>
                {modelsSubtitle && (
                  <p className="text-muted mx-auto mt-3 max-w-2xl leading-relaxed">
                    {modelsSubtitle}
                  </p>
                )}
              </div>
            </FadeUp>

            {models.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {models.map((model, i) => (
                  <FadeUp key={model.title || i} delay={i * 0.05}>
                    <div className="border-border bg-surface flex h-full flex-col rounded-2xl border p-6 shadow-sm">
                      <div className="bg-primary/10 text-primary mb-3 flex h-9 w-9 items-center justify-center rounded-xl">
                        <Layers size={18} />
                      </div>
                      <h3 className="font-heading text-fg mb-2 text-base font-bold">
                        {model.title}
                      </h3>
                      <p className="text-muted text-xs leading-relaxed">{model.desc}</p>
                    </div>
                  </FadeUp>
                ))}
              </div>
            )}
          </Container>
        </Section>
      )}

      {/* ── SECTION 6: PARTNER INSTITUTIONS ── */}
      {(collaboratorsTitle || collaborators.length > 0) && (
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
                {collaborators.length > 0 && (
                  <p className="text-muted mt-3 max-w-2xl leading-relaxed">
                    {collaborators.length} institutions across{' '}
                    {new Set(collaborators.map((c) => c.country).filter(Boolean)).size} countries
                    {collaboratorsSubtitle ? ` — ${collaboratorsSubtitle}` : ''}
                  </p>
                )}
              </div>
            </FadeUp>

            {collaborators.length > 0 && <CollaboratorsGrid collaborators={collaborators} />}
          </Container>
        </Section>
      )}

      {/* ── SECTION 7: CALL TO ACTION & ENQUIRY FORM ── */}
      <Section id="enquiry" className="bg-bg py-16 md:py-24">
        <Container className="max-w-5xl">
          <FadeUp>
            <div className="mb-12 text-center">
              <p className="text-primary mb-2 text-xs font-semibold tracking-[0.15em] uppercase">
                Get In Touch
              </p>
              <h2 className="font-heading text-fg text-3xl font-bold md:text-4xl">{ctaTitle}</h2>
              {ctaDescription && (
                <p className="text-muted mx-auto mt-4 max-w-3xl text-base leading-relaxed md:text-lg">
                  {ctaDescription}
                </p>
              )}

              {contactEmail && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <Mail className="text-primary" size={18} />
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-primary hover:text-accent font-semibold hover:underline"
                  >
                    {contactEmail}
                  </a>
                </div>
              )}
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
