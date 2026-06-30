import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import Link from 'next/link'
import { List, Map, Microscope, FolderOpen } from 'lucide-react'
import {
  getSiteSettings,
  getResearchPageData,
  getPageSeo,
  resolvePageSeo,
  getAllResearchThemes,
  getFilteredProjects,
  getProjectFilterOptions,
} from '@/lib/data'
import { getAbout } from '@/lib/data/about'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { PageBanner } from '@/components/ui/PageBanner'
import { FadeUp } from '@/components/FadeUp'
import { RichText } from '@/components/RichText'
import { ResearchInPageNav } from '@/components/research/ResearchInPageNav'
import { ThemeSection, deriveLeads } from '@/components/research/ThemeSection'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { ProjectFilters } from '@/components/projects/ProjectFilters'
import { FilterSheet } from '@/components/ui/FilterSheet'
import { ProjectsMap } from '@/components/projects/ProjectsMap'
import { EmptyState } from '@/components/placeholders'
import { cn } from '@/lib/utils'
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

interface ResearchPageProps {
  searchParams: Promise<{
    theme?: string
    status?: string
    funder?: string
    province?: string
    view?: string
  }>
}

function makeToggleHref(
  current: Record<string, string | undefined>,
  key: string,
  value: string,
): string {
  const p = new URLSearchParams()
  Object.entries(current).forEach(([k, v]) => {
    if (v && k !== key) p.set(k, v)
  })
  if (value) p.set(key, value)
  const qs = p.toString()
  return qs ? `/research?${qs}` : '/research'
}

export default async function ResearchPage({ searchParams }: ResearchPageProps) {
  const sp = await searchParams
  const viewParam = sp.view === 'map' ? 'map' : 'list'

  const [{ themes, projects: themeProjects, publications }, about, filterOptions, allProjects] =
    await Promise.all([
      getResearchPageData(),
      getAbout(),
      getProjectFilterOptions(),
      getFilteredProjects({
        themeSlug: sp.theme,
        status: sp.status,
        funder: sp.funder,
        province: sp.province,
      }),
    ])

  // We also need the full theme list for the filter sidebar
  const allThemes = themes as ResearchTheme[]

  const view = viewParam
  const active = {
    theme: sp.theme,
    status: sp.status,
    funder: sp.funder,
    province: sp.province,
    view,
  }

  const listHref = makeToggleHref(active, 'view', 'list')
  const mapHref = makeToggleHref(active, 'view', 'map')

  const hasFilters = Boolean(sp.theme || sp.status || sp.funder || sp.province)
  const activeFilterCount = [sp.theme, sp.status, sp.funder, sp.province].filter(Boolean).length

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

      {/* Top navigation — choose between Research Themes and Research Projects */}
      <section className="bg-bg border-border border-b py-8 md:py-12">
        <Container>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
            <a
              href="#themes"
              className={cn(
                'group flex items-center gap-4 rounded-2xl border-2 border-[#0E6E6E]/30 bg-white p-6',
                'transition-all duration-200 hover:border-[#0E6E6E] hover:shadow-md',
                'focus-visible:ring-2 focus-visible:ring-[#0E6E6E] focus-visible:outline-none',
              )}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0E6E6E]/10">
                <Microscope size={24} className="text-[#0E6E6E]" aria-hidden="true" />
              </span>
              <div>
                <p className="font-heading text-fg text-lg font-bold">Research Themes</p>
                <p className="text-muted mt-0.5 text-sm">Explore our core scientific focus areas</p>
              </div>
            </a>
            <a
              href="#projects"
              className={cn(
                'group flex items-center gap-4 rounded-2xl border-2 border-[#E2725B]/30 bg-white p-6',
                'transition-all duration-200 hover:border-[#E2725B] hover:shadow-md',
                'focus-visible:ring-2 focus-visible:ring-[#E2725B] focus-visible:outline-none',
              )}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E2725B]/10">
                <FolderOpen size={24} className="text-[#E2725B]" aria-hidden="true" />
              </span>
              <div>
                <p className="font-heading text-fg text-lg font-bold">Research Projects</p>
                <p className="text-muted mt-0.5 text-sm">
                  Browse all active and completed projects
                </p>
              </div>
            </a>
          </div>
        </Container>
      </section>

      {/* Sticky in-page nav */}
      {themes.length > 0 && <ResearchInPageNav themes={allThemes} />}

      {/* One section per theme */}
      <div id="themes" className="scroll-mt-20" />
      {themes.length === 0 ? (
        <div className="bg-bg py-10 text-center">
          <p className="text-muted text-sm">No research themes found.</p>
        </div>
      ) : (
        themes.map((theme, i) => {
          const typedTheme = theme as ResearchTheme

          const themeProjectItems = themeProjects.filter((p) => {
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

          const leads = deriveLeads(themeProjectItems) as Person[]

          return (
            <ThemeSection
              key={typedTheme.id}
              theme={typedTheme}
              projects={themeProjectItems}
              publications={themePublications}
              leads={leads}
              alternate={i % 2 === 1}
            />
          )
        })
      )}

      {/* ── All Projects filterable grid ── */}
      <Section id="projects" className="bg-bg py-8 md:py-20">
        <Container>
          <FadeUp>
            <div className="mb-8">
              <p className="text-primary mb-2 text-xs font-semibold tracking-[0.15em] uppercase">
                Browse all
              </p>
              <h2 className="font-heading text-fg text-3xl font-bold md:text-4xl">
                Research Projects
              </h2>
            </div>
          </FadeUp>

          {/* Mobile filter trigger */}
          <div className="mb-4 lg:hidden">
            <FilterSheet activeCount={activeFilterCount}>
              <ProjectFilters
                themes={allThemes}
                funders={filterOptions.funders}
                provinces={filterOptions.provinces}
                active={active}
                basePath="/research"
              />
            </FilterSheet>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:gap-12">
            {/* Sidebar filters — desktop only */}
            <FadeUp delay={0.05} className="hidden lg:block lg:w-56 lg:shrink-0">
              <ProjectFilters
                themes={allThemes}
                funders={filterOptions.funders}
                provinces={filterOptions.provinces}
                active={active}
                basePath="/research"
              />
            </FadeUp>

            {/* Main content */}
            <div className="min-w-0 flex-1">
              {/* View toggle + result count */}
              <FadeUp delay={0.08}>
                <div className="mb-6 flex items-center justify-between gap-4">
                  <p className="text-muted text-sm">
                    {allProjects.length === 0
                      ? 'No projects found'
                      : `${allProjects.length} project${allProjects.length !== 1 ? 's' : ''}`}
                  </p>

                  <div
                    role="group"
                    aria-label="Switch between list and map view"
                    className="border-border flex overflow-hidden rounded-lg border"
                  >
                    <Link
                      href={listHref}
                      aria-current={view === 'list' ? 'page' : undefined}
                      aria-label="List view"
                      className={cn(
                        'inline-flex h-9 w-9 items-center justify-center',
                        'transition-colors duration-150',
                        'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset',
                        view === 'list'
                          ? 'bg-primary text-white'
                          : 'text-muted hover:bg-surface-raised',
                      )}
                    >
                      <List size={16} aria-hidden="true" />
                    </Link>
                    <Link
                      href={mapHref}
                      aria-current={view === 'map' ? 'page' : undefined}
                      aria-label="Map view"
                      className={cn(
                        'inline-flex h-9 w-9 items-center justify-center',
                        'border-border border-l transition-colors duration-150',
                        'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset',
                        view === 'map'
                          ? 'bg-primary text-white'
                          : 'text-muted hover:bg-surface-raised',
                      )}
                    >
                      <Map size={16} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </FadeUp>

              {view === 'map' ? (
                <FadeUp delay={0.1}>
                  <ProjectsMap
                    searchParams={{
                      theme: sp.theme,
                      status: sp.status,
                      funder: sp.funder,
                      province: sp.province,
                    }}
                  />
                </FadeUp>
              ) : allProjects.length === 0 ? (
                <FadeUp delay={0.1}>
                  <EmptyState
                    variant={3}
                    heading={
                      !hasFilters ? 'Projects coming soon' : 'No projects match these filters'
                    }
                    body={
                      !hasFilters
                        ? 'Research projects will appear here once they are published.'
                        : 'Try adjusting or clearing the active filters to see more projects.'
                    }
                    action={
                      hasFilters
                        ? { label: 'Clear all filters', href: '/research#projects' }
                        : undefined
                    }
                  />
                </FadeUp>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {allProjects.map((project, i) => (
                    <FadeUp key={project.id} delay={i * 0.04} className="h-full">
                      <ProjectCard project={project} />
                    </FadeUp>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
