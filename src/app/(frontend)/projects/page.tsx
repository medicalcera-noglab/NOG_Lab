import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import Link from 'next/link'
import { List, Map } from 'lucide-react'
import {
  getSiteSettings,
  getAllResearchThemes,
  getFilteredProjects,
  getProjectFilterOptions,
  getPageSeo,
  resolvePageSeo,
} from '@/lib/data'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { FadeUp } from '@/components/FadeUp'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { ProjectFilters } from '@/components/projects/ProjectFilters'
import { ProjectsMap } from '@/components/projects/ProjectsMap'
import { EmptyState } from '@/components/placeholders'
import { cn } from '@/lib/utils'

/**
 * URL state for the projects page:
 *
 * ?theme=<slug>        — filter by research theme slug
 * ?status=ongoing|completed
 * ?funder=<name>       — exact-match funder name (derived from DB)
 * ?province=<name>     — filter via study_sites.province (derived from DB)
 * ?view=list|map       — toggle between card grid (default) and map placeholder
 *
 * All params are server-read — no client state. Back-button safe; shareable.
 * Step 9 reads these same params to populate the map view.
 */

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const [settings, pageSeo] = await Promise.all([getSiteSettings(), getPageSeo()])
  const seo = resolvePageSeo(pageSeo, 'projects')
  return buildMetadata(
    {
      title: seo.title ?? 'Projects',
      canonical: '/projects',
      description: seo.description,
      ogImage: seo.ogImageUrl,
    },
    settings,
  )
}

interface ProjectsPageProps {
  searchParams: Promise<{
    theme?: string
    status?: string
    funder?: string
    province?: string
    view?: string
  }>
}

/** Preserve all current params but override one key. */
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
  return qs ? `/projects?${qs}` : '/projects'
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const sp = await searchParams
  const view = sp.view === 'map' ? 'map' : 'list'

  const [themes, filterOptions, projects] = await Promise.all([
    getAllResearchThemes(),
    getProjectFilterOptions(),
    getFilteredProjects({
      themeSlug: sp.theme,
      status: sp.status,
      funder: sp.funder,
      province: sp.province,
    }),
  ])

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

  return (
    <Section className="bg-bg py-8 md:py-20">
      <Container>
        {/* Page header */}
        <FadeUp>
          <div className="mb-5 md:mb-10">
            <p className="text-primary mb-1.5 text-xs font-semibold tracking-[0.15em] uppercase">
              Our work
            </p>
            <h1 className="font-heading text-fg text-2xl font-bold sm:text-4xl">Projects</h1>
          </div>
        </FadeUp>

        <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
          {/* ── Sidebar filters ── */}
          <FadeUp delay={0.05} className="lg:w-56 lg:shrink-0">
            <ProjectFilters
              themes={themes}
              funders={filterOptions.funders}
              provinces={filterOptions.provinces}
              active={active}
            />
          </FadeUp>

          {/* ── Main content ── */}
          <div className="min-w-0 flex-1">
            {/* View toggle + result count */}
            <FadeUp delay={0.08}>
              <div className="mb-6 flex items-center justify-between gap-4">
                <p className="text-muted text-sm">
                  {projects.length === 0
                    ? 'No projects found'
                    : `${projects.length} project${projects.length !== 1 ? 's' : ''}`}
                </p>

                {/* List ⇄ Map toggle */}
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

            {/* Content area: list or map */}
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
            ) : projects.length === 0 ? (
              <FadeUp delay={0.1}>
                <EmptyState
                  variant={3}
                  heading={
                    projects.length === 0 && !hasFilters
                      ? 'Projects coming soon'
                      : 'No projects match these filters'
                  }
                  body={
                    !hasFilters
                      ? 'Research projects will appear here once they are published.'
                      : 'Try adjusting or clearing the active filters to see more projects.'
                  }
                  action={
                    hasFilters ? { label: 'Clear all filters', href: '/projects' } : undefined
                  }
                />
              </FadeUp>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {projects.map((project, i) => (
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
  )
}
