'use client'

import { Card } from '@/components/ui/card'
import { Text } from '@/components/atoms'
import { cn } from '@/lib/utils'
import { SectionHeading } from './section-heading'

const tokenGroups = [
  {
    category: 'Colour',
    tokens: [
      { name: '--primary', value: '#007A4D' },
      { name: '--accent', value: '#FFB81C' },
      { name: '--destructive', value: '#DC2626' },
      { name: '--background', value: '#F7F4EA' },
      { name: '--border', value: '#E5E7EB' },
    ],
  },
]

export function DesignTokensSection() {
  return (
    <section id="tokens" className="scroll-mt-24">
      <SectionHeading>Design Tokens</SectionHeading>
      <Text
        as="p"
        variant="sub-md"
        className="text-[14px] mb-6 text-muted-foreground"
      >
        These tokens are the single source of truth for colour.Codebases must
        references these, instead of hardcoded values.
      </Text>

      <div className="space-y-6">
        {tokenGroups.map((group) => (
          <Card key={group.category} className="p-0 overflow-hidden">
            <div className="px-4 py-2 text-[13px] font-semibold uppercase tracking-wide bg-primary text-primary-foreground">
              {group.category}
            </div>
            {group.tokens.map((t, i) => (
              <div
                key={t.name}
                className={cn(
                  'grid grid-cols-2 text-[14px] items-center',
                  i % 2 === 0 ? 'bg-card' : 'bg-muted/40'
                )}
              >
                <div className="px-4 py-3 font-mono text-muted-foreground">
                  {t.name}
                </div>
                <div className="px-4 py-3 text-foreground">{t.value}</div>
              </div>
            ))}
          </Card>
        ))}
      </div>
    </section>
  )
}
