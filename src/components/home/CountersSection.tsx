import { FadeUp } from '@/components/FadeUp'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { AnimatedCounter } from './AnimatedCounter'
import type { HomeCounts } from '@/lib/data'

interface CountersSectionProps {
  counts: HomeCounts
}

const COUNTER_DEFS = [
  { key: 'publications', label: 'Publications' },
  { key: 'projects', label: 'Active Projects' },
  { key: 'teamMembers', label: 'Team Members' },
  { key: 'collaborators', label: 'Collaborators' },
] as const

export function CountersSection({ counts }: CountersSectionProps) {
  return (
    <Section className="bg-bg py-16 md:py-20">
      <Container>
        <div
          role="list"
          aria-label="Lab statistics"
          className="grid grid-cols-2 gap-10 md:grid-cols-4"
        >
          {COUNTER_DEFS.map(({ key, label }, i) => (
            <FadeUp key={key} delay={i * 0.1}>
              <div role="listitem">
                <AnimatedCounter target={counts[key]} label={label} />
              </div>
            </FadeUp>
          ))}
        </div>
      </Container>
    </Section>
  )
}
