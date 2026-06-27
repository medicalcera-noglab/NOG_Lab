import { Container } from '@/components/ui/Container'
import { Skeleton } from '@/components/ui/Skeleton'

export default function PeopleLoading() {
  return (
    <div aria-busy="true" aria-label="Loading people">
      <Container className="py-8 md:py-16">
        {/* Page header */}
        <Skeleton className="mb-3 h-10 w-48" />
        <Skeleton className="mb-12 h-5 w-64" />

        {/* Tab row */}
        <div className="mb-10 flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-full" />
          ))}
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface overflow-hidden rounded-xl">
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
              <div className="space-y-2 p-5">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  )
}
