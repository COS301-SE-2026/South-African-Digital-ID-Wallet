'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Text } from '@/components/atoms'
import { SectionHeading } from './section-heading'

const principles = [
  {
    title: 'Clear & Direct',
    body: 'Say what happened and what to do next. No filler.',
  },
  {
    title: 'Reassuring & Secure',
    body: 'Sound calm and in control, especially around identity and security actions.',
  },
  {
    title: 'Plain Language',
    body: 'Avoid technical or legal jargon citizens would not use themselves.',
  },
  {
    title: 'Encouraging, Not Alarming',
    body: 'Errors are framed as fixable, not as failures on the part of the user.',
  },
]

export function VoiceToneSection() {
  return (
    <section id="voice" className="scroll-mt-24">
      <SectionHeading>Voice & Tone</SectionHeading>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {principles.map((p) => (
          <Card key={p.title}>
            <CardContent>
              <Text
                as="p"
                variant="sub-md"
                className="font-semibold text-foreground mb-1"
              >
                {p.title}
              </Text>
              <Text as="p" variant="sub-sm" className="text-muted-foreground">
                {p.body}
              </Text>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
