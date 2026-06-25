import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import { getSiteSettings, getResearchPageData, getPageSeo, resolvePageSeo } from '@/lib/data'
import { getAbout } from '@/lib/data/about'
import { Container } from '@/components/ui/Container'
import { PageBanner } from '@/components/ui/PageBanner'
import { FadeUp } from '@/components/FadeUp'
import { RichText } from '@/components/RichText'
import { ResearchInPageNav } from '@/components/research/ResearchInPageNav'
import { ThemeSection, deriveLeads } from '@/components/research/ThemeSection'
import type { Project, Publication, Person, ResearchTheme } from '../../../../payload-types'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const [settings, pageSeo] = await Promise.all([getSiteSettings(), getPageSeo()])
  const seo = resolvePageSeo(pageSeo, 'research')
  return buildMetadata(
    {
      title: seo.title ?? 'Research',
      canonical: '/research',
      description: seo.description,
      ogImage: seo.ogImageUrl,
    },
    settings,
  )
}

export default async function ResearchPage() {
  const [{ themes, projects, publications }, about] = await Promise.all([
    getResearchPageData(),
    getAbout(),
  ])

  return (
    <>
      <PageBanner
        eyebrow="What we study"
        title="Research"
        description={
          about?.mission ? (
            <RichText data={about.mission} className="text-base leading-relaxed sm:text-lg" />
          ) : undefined
        }
        tint="#0E6E6E"
      />

      {/* Sticky in-page nav */}
      {themes.length > 0 && <ResearchInPageNav themes={themes as ResearchTheme[]} />}

      {/* One section per theme */}
      {themes.length === 0 ? (
        <div className="bg-bg py-24 text-center">
          <p className="text-muted text-sm">No research themes found.</p>
        </div>
      ) : (
        themes.map((theme, i) => {
          const typedTheme = theme as ResearchTheme

          const themeProjects = projects.filter((p) => {
            const t = p as Project
            const themeRef = t.theme
            const id =
              themeRef && typeof themeRef === 'object' ? (themeRef as ResearchTheme).id : themeRef
            return id === typedTheme.id
          }) as Project[]

          const themePublications = publications.filter((pub) => {
            const p = pub as Publication
            return (p.themeTags ?? []).some((t) => {
              const id = typeof t === 'object' ? (t as ResearchTheme).id : t
              return id === typedTheme.id
            })
          }) as Publication[]

          const leads = deriveLeads(themeProjects) as Person[]

          return (
            <ThemeSection
              key={typedTheme.id}
              theme={typedTheme}
              projects={themeProjects}
              publications={themePublications}
              leads={leads}
              alternate={i % 2 === 1}
            />
          )
        })
      )}
    </>
  )
}
