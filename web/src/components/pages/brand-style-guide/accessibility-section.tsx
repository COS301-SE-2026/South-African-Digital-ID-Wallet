'use client'

import { Text } from '@/components/atoms'
import { Card, CardContent } from '@/components/ui/card'
import { Eye, Keyboard, Focus, Volume2, Move } from 'lucide-react'
import { SectionHeading } from './section-heading'

const guidelines = [
  {
    icon: Keyboard,
    title: 'Keyboard Navigation',
    points: [
      'Every interactive element is reachable using the Tab key in a logical navigation order',
      'Dashboard dialogs and modals trap keyboard focus while open and restore focus to the triggering element when closed',
    ],
  },
  {
    icon: Focus,
    title: 'Focus Indicators',
    points: [
      'All interactive elements display a visible focus indicator during keyboard navigation',
      'Focus indicators meet WCAG 2.2 AA contrast requirements',
    ],
  },
  {
    icon: Volume2,
    title: 'Screen Reader Support',
    points: [
      'All form controls have associated labels or accessible names',
      'Buttons, icons, and navigation controls include meaningful aria-label attributes where required',
    ],
  },
  {
    icon: Move,
    title: 'Reduced Motion',
    points: [
      'The application respects the prefers-reduced-motion system setting',
      'Essential transitions remain brief and do not interfere with user interaction',
    ],
  },
]

export function AccessibilitySection() {
  return (
    <section id="accessibility" className="scroll-mt-24">
      <SectionHeading icon={Eye}>Accessibility Standards</SectionHeading>
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {guidelines.map(({ icon: Icon, title, points }) => (
          <Card key={title}>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-1.5">
                  <Icon size={18} className="text-primary" />
                </div>

                <Text
                  as="p"
                  variant="sub-md"
                  className="font-semibold text-foreground"
                >
                  {title}
                </Text>
              </div>

              <ul className="space-y-2">
                {points.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="mt-0.5 text-primary">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
