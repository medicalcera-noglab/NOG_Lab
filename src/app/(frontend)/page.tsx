import type { Metadata } from 'next'
import {
  getSiteSettings,
  getCounts,
  getFeaturedProject,
  getLatestNews,
  getCollaborators,
  getStudySiteCount,
} from '@/lib/data'
import { HeroSection } from '@/components/home/HeroSection'
import { BigQuestionsStrip } from '@/components/home/BigQuestionsStrip'
import { CountersSection } from '@/components/home/CountersSection'
import { FeaturedProject } from '@/components/home/FeaturedProject'
import { PakistanMapTeaser } from '@/components/home/PakistanMapTeaser'
import { LatestNews } from '@/components/home/LatestNews'
import { PartnerStrip } from '@/components/home/PartnerStrip'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return {
    title: settings.labName,
    description: settings.tagline ?? undefined,
    openGraph: {
      title: settings.labName,
      description: settings.tagline ?? undefined,
    },
  }
}

export default async function HomePage() {
  // All data fetched in parallel — each is individually cached by unstable_cache
  const [settings, counts, featuredProject, latestNews, collaborators, siteCount] =
    await Promise.all([
      getSiteSettings(),
      getCounts(),
      getFeaturedProject(),
      getLatestNews(),
      getCollaborators(),
      getStudySiteCount(),
    ])

  return (
    <>
      <HeroSection
        labName={settings.labName}
        tagline={settings.tagline}
        ctaPrimary={settings.heroCtaPrimary}
        ctaSecondary={settings.heroCtaSecondary}
      />

      {settings.bigQuestions?.length ? (
        <BigQuestionsStrip questions={settings.bigQuestions} />
      ) : null}

      <CountersSection counts={counts} />

      <FeaturedProject project={featuredProject} />

      <PakistanMapTeaser siteCount={siteCount} />

      <LatestNews items={latestNews} />

      <PartnerStrip collaborators={collaborators} />
    </>
  )
}
