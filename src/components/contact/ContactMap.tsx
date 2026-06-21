import dynamic from 'next/dynamic'

const ContactMapClient = dynamic(
  () => import('./ContactMapClient').then((m) => m.ContactMapClient),
  {
    ssr: false,
    loading: () => (
      <div className="border-border bg-surface aspect-video w-full animate-pulse rounded-xl border" />
    ),
  },
)

export function ContactMap() {
  return <ContactMapClient />
}
