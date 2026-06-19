import { FadeUp } from '@/components/FadeUp'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { MolecularDots } from '@/components/motifs/MolecularDots'
import type { SiteSetting } from '../../../payload-types'

interface BigQuestionsStripProps {
  questions: NonNullable<SiteSetting['bigQuestions']>
}

export function BigQuestionsStrip({ questions }: BigQuestionsStripProps) {
  if (!questions.length) return null

  return (
    <Section className="bg-surface relative overflow-hidden py-16 md:py-20">
      {/* Faint dot grid background */}
      <MolecularDots className="absolute inset-0" />

      <Container className="relative z-10">
        <FadeUp>
          <p className="text-primary mb-10 text-xs font-semibold tracking-[0.15em] uppercase">
            What we ask
          </p>
        </FadeUp>

        <ol role="list" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {questions.map((item, i) => (
            <FadeUp key={item.id ?? i} delay={i * 0.08}>
              <li className="group border-border bg-bg relative flex gap-4 rounded-xl border p-6 transition-shadow duration-200 hover:shadow-md">
                {/* Index number */}
                <span
                  className="font-heading text-primary/20 text-4xl leading-none font-bold select-none"
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-fg pt-1 text-base leading-snug font-medium">{item.question}</p>
              </li>
            </FadeUp>
          ))}
        </ol>
      </Container>
    </Section>
  )
}
