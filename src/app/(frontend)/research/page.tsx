import type { Metadata } from 'next'
import { getSiteSettings, getResearchPageData } from '@/lib/data'
import { Container } from '@/components/ui/Container'
import { FadeUp } from '@/components/FadeUp'
import { ResearchInPageNav } from '@/components/research/ResearchInPageNav'
import { ThemeSection, deriveLeads } from '@/components/research/ThemeSection'
import type { Project, Publication, Person, ResearchTheme } from '../../../../payload-types'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const title = `Research | ${settings.labName}`
  return {
    title,
    openGraph: { title },
  }
}

export default async function ResearchPage() {
  const { themes, projects, publications } = await getResearchPageData()

  return (
    <>
      {/* Page hero */}
      <div className="bg-bg border-border border-b py-16 md:py-20">
        <Container>
          <FadeUp>
            <p className="text-primary mb-2 text-xs font-semibold tracking-[0.15em] uppercase">
              What we study
            </p>
            <h1 className="font-heading text-fg text-4xl font-bold md:text-5xl">Research</h1>
          </FadeUp>
        </Container>
      </div>

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
