import type { AdminViewProps } from 'payload'
import { getPayload, type Payload } from 'payload'
import Link from 'next/link'

async function getCounts(payload: Payload) {
  const [publications, projects, people, collaborators, unreadInquiries, blogPosts, newsEvents] =
    await Promise.all([
      payload.count({ collection: 'publications', overrideAccess: true }),
      payload.count({ collection: 'projects', overrideAccess: true }),
      payload.count({ collection: 'people', overrideAccess: true }),
      payload.count({ collection: 'collaborators', overrideAccess: true }),
      payload.count({
        collection: 'inquiries',
        overrideAccess: true,
        where: { isRead: { equals: false } },
      }),
      payload.count({ collection: 'blog_posts', overrideAccess: true }),
      payload.count({ collection: 'news_events', overrideAccess: true }),
    ])
  return {
    publications: publications.totalDocs,
    projects: projects.totalDocs,
    people: people.totalDocs,
    collaborators: collaborators.totalDocs,
    unreadInquiries: unreadInquiries.totalDocs,
    blogPosts: blogPosts.totalDocs,
    newsEvents: newsEvents.totalDocs,
  }
}

async function getRecentActivity(payload: Payload) {
  const result = await payload.find({
    collection: 'audit_log',
    overrideAccess: true,
    limit: 10,
    sort: '-id',
    depth: 1,
  })
  return result.docs
}

export async function Dashboard(props: AdminViewProps) {
  const { default: config } = await import('@payload-config')
  const payload = await getPayload({ config })

  const user = (props as { initPageResult?: { req?: { user?: { role?: string } } } })
    ?.initPageResult?.req?.user
  const role = user?.role ?? 'contributor'

  const isSuperAdmin = role === 'super_admin'
  const isEditor = role === 'editor'

  const [counts, activity] = await Promise.all([
    getCounts(payload),
    isSuperAdmin ? getRecentActivity(payload) : Promise.resolve([]),
  ])

  // KPIs scoped to role
  const allKpis = [
    {
      label: 'Publications',
      value: counts.publications,
      href: '/admin/collections/publications',
      roles: ['super_admin', 'editor'],
    },
    {
      label: 'Projects',
      value: counts.projects,
      href: '/admin/collections/projects',
      roles: ['super_admin', 'editor'],
    },
    {
      label: 'People',
      value: counts.people,
      href: '/admin/collections/people',
      roles: ['super_admin', 'editor'],
    },
    {
      label: 'Collaborators',
      value: counts.collaborators,
      href: '/admin/collections/collaborators',
      roles: ['super_admin', 'editor'],
    },
    {
      label: 'Unread Inquiries',
      value: counts.unreadInquiries,
      href: '/admin/collections/inquiries',
      highlight: counts.unreadInquiries > 0,
      roles: ['super_admin', 'editor'],
    },
    {
      label: 'Blog Posts',
      value: counts.blogPosts,
      href: '/admin/collections/blog-posts',
      roles: ['super_admin', 'editor', 'contributor'],
    },
    {
      label: 'News & Events',
      value: counts.newsEvents,
      href: '/admin/collections/news-events',
      roles: ['super_admin', 'editor', 'contributor'],
    },
  ]

  const kpis = allKpis.filter((k) => k.roles.includes(role))

  // Quick actions scoped to role
  const allActions = [
    {
      label: 'New Publication',
      href: '/admin/collections/publications/create',
      roles: ['super_admin', 'editor'],
    },
    {
      label: 'New Project',
      href: '/admin/collections/projects/create',
      roles: ['super_admin', 'editor'],
    },
    {
      label: 'New Blog Post',
      href: '/admin/collections/blog-posts/create',
      roles: ['super_admin', 'editor', 'contributor'],
    },
    {
      label: 'New News & Event',
      href: '/admin/collections/news-events/create',
      roles: ['super_admin', 'editor', 'contributor'],
    },
    {
      label: 'View Inquiries',
      href: '/admin/collections/inquiries',
      roles: ['super_admin', 'editor'],
    },
    {
      label: 'Manage Users',
      href: '/admin/collections/users',
      roles: ['super_admin'],
    },
  ]

  const quickActions = allActions.filter((a) => a.roles.includes(role))

  const roleLabel = isSuperAdmin ? 'Super Admin' : isEditor ? 'Editor' : 'Contributor'

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
        Welcome back —{' '}
        <span
          style={{
            display: 'inline-block',
            padding: '0.1rem 0.5rem',
            borderRadius: '0.25rem',
            background: 'var(--theme-elevation-100, #f3f4f6)',
            fontSize: '0.8rem',
            fontWeight: 600,
          }}
        >
          {roleLabel}
        </span>
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
          gridTemplateColumns: isSuperAdmin ? 'minmax(0, 1fr) minmax(0, 1fr)' : '1fr',
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

        {/* Recent Activity — super_admin only */}
        {isSuperAdmin && (
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
                  const userLabel =
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
                        <strong>{userLabel}</strong>{' '}
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
        )}
      </div>
    </div>
  )
}
