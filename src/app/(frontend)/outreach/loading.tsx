import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'

export default function Loading() {
  return (
    <>
      <div className="bg-surface-raised h-48 w-full animate-pulse md:h-64 lg:h-80" />

      <Section className="bg-bg py-12 md:py-20">
        <Container>
          <div className="mb-16 flex flex-col items-center">
            <div className="bg-surface-raised mx-auto mb-4 h-6 w-2/3 max-w-3xl animate-pulse rounded" />
            <div className="bg-surface-raised mx-auto h-4 w-1/2 max-w-xl animate-pulse rounded" />
          </div>

          <div className="mb-12">
            <div className="bg-surface-raised mb-4 h-8 w-1/3 animate-pulse rounded" />
            <div className="bg-surface-raised h-4 w-2/3 animate-pulse rounded" />
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="border-border bg-surface flex flex-col overflow-hidden rounded-2xl border"
              >
                <div className="bg-surface-raised aspect-video animate-pulse" />
                <div className="flex flex-col gap-4 p-6">
                  <div className="bg-surface-raised h-4 w-1/4 animate-pulse rounded" />
                  <div className="bg-surface-raised h-6 w-3/4 animate-pulse rounded" />
                  <div className="bg-surface-raised h-4 w-full animate-pulse rounded" />
                  <div className="bg-surface-raised h-4 w-2/3 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </>
  )
}
