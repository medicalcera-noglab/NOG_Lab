import type { AdminViewProps } from 'payload'
import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'

async function getCounts() {
  const payload = await getPayload({ config })
  const [publications, projects, people, collaborators, unreadInquiries] = await Promise.all([
    payload.count({ collection: 'publications', overrideAccess: true }),
    payload.count({ collection: 'projects', overrideAccess: true }),
    payload.count({ collection: 'people', overrideAccess: true }),
    payload.count({ collection: 'collaborators', overrideAccess: true }),
    payload.count({
      collection: 'inquiries',
      overrideAccess: true,
      where: { isRead: { equals: false } },
    }),
  ])
  return {
    publications: publications.totalDocs,
    projects: projects.totalDocs,
    people: people.totalDocs,
    collaborators: collaborators.totalDocs,
    unreadInquiries: unreadInquiries.totalDocs,
  }
}

async function getRecentActivity() {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'audit_log',
    overrideAccess: true,
    limit: 10,
    sort: '-id',
    depth: 1,
  })
  return result.docs
}

export async function Dashboard(_props: AdminViewProps) {
  const [counts, activity] = await Promise.all([getCounts(), getRecentActivity()])

  const kpis = [
    { label: 'Publications', value: counts.publications, href: '/admin/collections/publications' },
    { label: 'Projects', value: counts.projects, href: '/admin/collections/projects' },
    { label: 'People', value: counts.people, href: '/admin/collections/people' },
    {
      label: 'Collaborators',
      value: counts.collaborators,
      href: '/admin/collections/collaborators',
    },
    {
      label: 'Unread Inquiries',
      value: counts.unreadInquiries,
      href: '/admin/collections/inquiries',
      highlight: counts.unreadInquiries > 0,
    },
  ]

  const quickActions = [
    { label: 'New Publication', href: '/admin/collections/publications/create' },
    { label: 'New Blog Post', href: '/admin/collections/blog-posts/create' },
    { label: 'New Project', href: '/admin/collections/projects/create' },
    { label: 'View Inquiries', href: '/admin/collections/inquiries' },
  ]

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'inherit' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
        NOG Lab Admin
      </h1>
      <p
        style={{
          color: 'var(--theme-text-muted, #6b7280)',
          marginBottom: '2rem',
          fontSize: '0.9rem',
        }}
      >
        Site overview — live counts from the database.
      </p>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '1rem',
          marginBottom: '2.5rem',
        }}
      >
        {kpis.map((kpi) => (
          <Link
            key={kpi.label}
            href={kpi.href}
            style={{
              display: 'block',
              padding: '1.25rem',
              borderRadius: '0.5rem',
              border: kpi.highlight
                ? '1px solid var(--theme-error-500, #ef4444)'
                : '1px solid var(--theme-border-color, #e5e7eb)',
              background: kpi.highlight
                ? 'var(--theme-error-100, #fef2f2)'
                : 'var(--theme-elevation-50, #f9fafb)',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'box-shadow 0.15s',
            }}
          >
            <p
              style={{
                fontSize: '2rem',
                fontWeight: 700,
                lineHeight: 1,
                color: kpi.highlight ? 'var(--theme-error-500, #ef4444)' : 'inherit',
                marginBottom: '0.4rem',
              }}
            >
              {kpi.value}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--theme-text-muted, #6b7280)' }}>
              {kpi.label}
            </p>
          </Link>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: '2rem',
        }}
      >
        {/* Quick Actions */}
        <section>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                style={{
                  display: 'block',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.375rem',
                  border: '1px solid var(--theme-border-color, #e5e7eb)',
                  background: 'var(--theme-elevation-0, #fff)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'var(--theme-text, inherit)',
                }}
              >
                {action.label}
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
            Recent Activity
          </h2>
          {activity.length === 0 ? (
            <p style={{ fontSize: '0.875rem', color: 'var(--theme-text-muted, #6b7280)' }}>
              No activity yet.
            </p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {activity.map((entry) => {
                const user =
                  typeof entry.user === 'object' && entry.user !== null
                    ? ((entry.user as { email?: string }).email ?? 'Unknown')
                    : 'Unknown'
                const when = entry.createdAt
                  ? new Date(entry.createdAt).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : ''
                return (
                  <li
                    key={entry.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      gap: '0.5rem',
                      padding: '0.5rem 0',
                      borderBottom: '1px solid var(--theme-border-color, #e5e7eb)',
                      fontSize: '0.8rem',
                    }}
                  >
                    <span>
                      <strong>{user}</strong>{' '}
                      <span style={{ color: 'var(--theme-text-muted, #6b7280)' }}>
                        {entry.action} {entry.entityType}
                      </span>
                    </span>
                    <span
                      style={{
                        color: 'var(--theme-text-muted, #6b7280)',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      {when}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
