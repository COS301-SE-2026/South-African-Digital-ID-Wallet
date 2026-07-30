'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Text } from '@/components/atoms'
import { History } from 'lucide-react'
import { SectionHeading } from './section-heading'

const changes = [
  {
    change: 'Added a dedicated Accessibility section',
    rationale:
      'WCAG 2.2 AA conformance, keyboard/focus rules, and audit scores were not documented in Demo 1.',
  },
  {
    change: 'Added Voice & Tone guidelines',
    rationale:
      'Copy across error states and buttons was inconsistent between contributors.',
  },
  {
    change: 'Added Design Tokens section',
    rationale:
      'Formalises colour, spacing, radius, shadow, and motion tokens so the guide matches the codebase.',
  },
  {
    change: 'Split large sections into standalone components',
    rationale: 'The page had grown too large to maintain as a single file.',
  },
]

export function ChangelogSection() {
  return (
    <section id="changelog" className="scroll-mt-24">
      <SectionHeading>Changelog from Demo 1</SectionHeading>
      <Text
        as="p"
        variant="sub-md"
        className="text-[14px] mb-6 text-muted-foreground"
      >
        What changed since the Demo 1 guide, and why.
      </Text>

      <div className="space-y-3">
        {changes.map((c) => (
          <Card key={c.change}>
            <CardContent>
              <Text
                as="p"
                variant="sub-md"
                className="font-semibold text-foreground mb-1"
              >
                {c.change}
              </Text>
              <Text as="p" variant="sub-sm" className="text-muted-foreground">
                {c.rationale}
              </Text>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
