import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import { getSiteSettings, getAllPeople, isAlumni } from '@/lib/data'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { FadeUp } from '@/components/FadeUp'
import { PersonCard } from '@/components/people/PersonCard'
import { RoleTabNav, type RoleTab } from '@/components/people/RoleTabNav'
import { EmptyState } from '@/components/placeholders'
import type { Person } from '../../../../payload-types'

type RoleKey = 'pi' | 'postdoc' | 'phd' | 'ms' | 'staff'

const ROLE_ORDER: RoleKey[] = ['pi', 'postdoc', 'phd', 'ms', 'staff']

const DEFAULT_ROLE_LABELS: Record<string, string> = {
  all: 'All',
  pi: 'Principal Investigators',
  postdoc: 'Postdoctoral Researchers',
  phd: 'PhD Students',
  ms: 'MS Students',
  staff: 'Staff',
  alumni: 'Alumni',
}

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return buildMetadata({ title: 'People', canonical: '/people' }, settings)
}

interface PeoplePageProps {
  searchParams: Promise<{ role?: string }>
}

export default async function PeoplePage({ searchParams }: PeoplePageProps) {
  const { role: roleParam } = await searchParams
  const activeRole = roleParam ?? 'all'

  const [settings, allPeople] = await Promise.all([getSiteSettings(), getAllPeople()])

  const rl = settings.roleLabels
  const roleLabels: Record<string, string> = {
    all: rl?.all || DEFAULT_ROLE_LABELS.all,
    pi: rl?.pi || DEFAULT_ROLE_LABELS.pi,
    postdoc: rl?.postdoc || DEFAULT_ROLE_LABELS.postdoc,
    phd: rl?.phd || DEFAULT_ROLE_LABELS.phd,
    ms: rl?.ms || DEFAULT_ROLE_LABELS.ms,
    staff: rl?.staff || DEFAULT_ROLE_LABELS.staff,
    alumni: rl?.alumni || DEFAULT_ROLE_LABELS.alumni,
  }

  // Partition into alumni and active-by-role
  const alumni = allPeople.filter(isAlumni)
  const active = allPeople.filter((p) => !isAlumni(p))

  const byRole: Record<string, Person[]> = {}
  for (const p of active) {
    const r = p.role as string
    if (!byRole[r]) byRole[r] = []
    byRole[r].push(p)
  }

  // Build tabs (only for non-empty groups)
  const tabs: RoleTab[] = [
    { role: 'all', label: roleLabels.all, count: active.length },
    ...ROLE_ORDER.filter((r) => byRole[r]?.length).map((r) => ({
      role: r,
      label: roleLabels[r],
      count: byRole[r].length,
    })),
    ...(alumni.length ? [{ role: 'alumni', label: roleLabels.alumni, count: alumni.length }] : []),
  ]

  // Select people for current tab
  let displayPeople: Person[]
  if (activeRole === 'alumni') {
    displayPeople = alumni
  } else if (activeRole === 'all') {
    displayPeople = active
  } else {
    displayPeople = byRole[activeRole] ?? []
  }

  const activeRoleLabel = tabs.find((t) => t.role === activeRole)?.label ?? roleLabels.all

  return (
    <Section className="bg-bg py-8 md:py-20">
      <Container>
        {/* Page header */}
        <FadeUp>
          <div className="mb-4 md:mb-8">
            <p className="text-primary mb-1.5 text-xs font-semibold tracking-[0.15em] uppercase">
              Our team
            </p>
            <h1 className="font-heading text-fg text-2xl font-bold sm:text-4xl">People</h1>
          </div>
        </FadeUp>

        {/* Role tabs */}
        <FadeUp delay={0.05}>
          <div className="mb-5 md:mb-10">
            <RoleTabNav tabs={tabs} activeRole={activeRole} />
          </div>
        </FadeUp>

        {/* Grid or empty state */}
        {displayPeople.length === 0 ? (
          <FadeUp delay={0.1}>
            <EmptyState
              variant={0}
              heading={
                allPeople.length === 0
                  ? 'Team profiles coming soon'
                  : 'No team members in this category'
              }
              body={
                allPeople.length === 0
                  ? 'Researcher profiles will appear here once they are added to the site.'
                  : `No ${activeRoleLabel.toLowerCase()} are currently listed. Try another filter.`
              }
              action={
                allPeople.length > 0 && activeRole !== 'all'
                  ? { label: 'Show all members', href: '/people' }
                  : undefined
              }
            />
          </FadeUp>
        ) : (
          <div
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            aria-label={`${activeRoleLabel} — ${displayPeople.length} ${displayPeople.length === 1 ? 'person' : 'people'}`}
          >
            {displayPeople.map((person, i) => {
              const personRoleLabel = isAlumni(person)
                ? roleLabels.alumni
                : (roleLabels[person.role] ?? person.role)

              return (
                <FadeUp key={person.id} delay={i * 0.04} className="h-full">
                  <PersonCard person={person} roleLabel={personRoleLabel} />
                </FadeUp>
              )
            })}
          </div>
        )}
      </Container>
    </Section>
  )
}
