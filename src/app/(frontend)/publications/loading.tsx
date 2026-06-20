import { Container } from '@/components/ui/Container'
import { Skeleton } from '@/components/ui/Skeleton'

export default function PublicationsLoading() {
  return (
    <div aria-busy="true" aria-label="Loading publications">
      <Container className="py-16 md:py-24">
        {/* Page header */}
        <Skeleton className="mb-3 h-10 w-56" />
        <Skeleton className="mb-12 h-5 w-40" />

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr]">
          {/* Sidebar filter skeleton */}
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-8 w-full rounded-lg" />
                ))}
              </div>
            ))}
          </div>

          {/* Publication list skeleton */}
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="border-border space-y-2 rounded-xl border p-5">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  )
}
