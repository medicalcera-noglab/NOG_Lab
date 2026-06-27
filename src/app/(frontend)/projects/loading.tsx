import { Container } from '@/components/ui/Container'
import { Skeleton } from '@/components/ui/Skeleton'

export default function ProjectsLoading() {
  return (
    <div aria-busy="true" aria-label="Loading projects">
      <Container className="py-8 md:py-16">
        {/* Header */}
        <Skeleton className="mb-3 h-10 w-44" />
        <Skeleton className="mb-12 h-5 w-60" />

        {/* View toggle + filter row */}
        <div className="mb-8 flex flex-wrap gap-3">
          <Skeleton className="h-9 w-28 rounded-full" />
          <Skeleton className="h-9 w-28 rounded-full" />
          <Skeleton className="h-9 w-36 rounded-full" />
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface overflow-hidden rounded-xl">
              <Skeleton className="aspect-[16/9] w-full rounded-none" />
              <div className="space-y-2 p-5">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-2 pt-1">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  )
}
