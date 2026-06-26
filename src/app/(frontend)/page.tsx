import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import {
  getSiteSettings,
  getCounts,
  getFeaturedProject,
  getLatestNews,
  getCollaborators,
  getStudySiteCount,
  getPageSeo,
  resolvePageSeo,
  getAllPeople,
  getAbout,
  getAllResearchThemes,
  getHomeProjects,
  getLatestPublications,
} from '@/lib/data'
import { HeroSection } from '@/components/home/HeroSection'
import { BigQuestionsStrip } from '@/components/home/BigQuestionsStrip'
import { AboutTeaser } from '@/components/home/AboutTeaser'
import { CountersSection } from '@/components/home/CountersSection'
import { FeaturedProject } from '@/components/home/FeaturedProject'
import { ProjectsGrid } from '@/components/home/ProjectsGrid'
import { PublicationsTeaser } from '@/components/home/PublicationsTeaser'
import { PakistanMapTeaser } from '@/components/home/PakistanMapTeaser'
import { TeamTeaser } from '@/components/home/TeamTeaser'
import { LatestNews } from '@/components/home/LatestNews'
import { PartnerStrip } from '@/components/home/PartnerStrip'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const [settings, pageSeo] = await Promise.all([getSiteSettings(), getPageSeo()])
  const seo = resolvePageSeo(pageSeo, 'home')
  return buildMetadata(
    { canonical: '/', title: seo.title, description: seo.description, ogImage: seo.ogImageUrl },
    settings,
  )
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://noglab.org'

export default async function HomePage() {
  // All data fetched in parallel — each is individually cached by unstable_cache
  const [
    settings,
    counts,
    featuredProject,
    latestNews,
    collaborators,
    siteCount,
    about,
    people,
    themes,
    homeProjects,
    latestPublications,
  ] = await Promise.all([
    getSiteSettings(),
    getCounts(),
    getFeaturedProject(),
    getLatestNews(),
    getCollaborators(),
    getStudySiteCount(),
    getAbout(),
    getAllPeople(),
    getAllResearchThemes(),
    getHomeProjects(),
    getLatestPublications(),
  ])

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ResearchOrganization',
    name: settings.labName,
    description: settings.tagline ?? undefined,
    url: SITE_URL,
    ...(settings.contactAddress ? { address: settings.contactAddress } : {}),
    ...(settings.social?.twitter
      ? {
          sameAs: [
            settings.social.twitter,
            settings.social.linkedin,
            settings.social.github,
            settings.social.researchgate,
          ].filter(Boolean),
        }
      : {}),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <HeroSection
        labName={settings.labName}
        tagline={settings.tagline}
        ctaPrimary={settings.heroCtaPrimary}
        ctaSecondary={settings.heroCtaSecondary}
        heroMedia={settings.heroMedia}
      />

      {settings.bigQuestions?.length ? (
        <BigQuestionsStrip questions={settings.bigQuestions} />
      ) : null}

      <AboutTeaser about={about} themes={themes} />

      <CountersSection counts={counts} />

      <FeaturedProject project={featuredProject} />

      <ProjectsGrid projects={homeProjects} />

      <PakistanMapTeaser siteCount={siteCount} />

      <PublicationsTeaser publications={latestPublications} />

      <TeamTeaser people={people} />

      <LatestNews items={latestNews} />

      <PartnerStrip collaborators={collaborators} />
    </>
  )
}
