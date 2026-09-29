'use client'

import { Card } from '@/components/ui/card'
import { Text } from '@/components/atoms'
import { cn } from '@/lib/utils'
import { SectionHeading } from './section-heading'

const typeScale = [
  {
    name: 'Display',
    size: '48px',
    weight: '700 (Bold)',
    usage: 'Hero sections, landing pages',
    className:
      'font-heading font-bold text-foreground text-[48px] leading-[1.1]',
  },
  {
    name: 'H1',
    size: '40px',
    weight: '700 (Bold)',
    usage: 'Page titles',
    className:
      'font-heading font-bold text-foreground text-[40px] leading-[1.1]',
  },
  {
    name: 'H2',
    size: '32px',
    weight: '600 (Semibold)',
    usage: 'Section titles',
    className: 'font-heading font-semibold text-foreground text-[32px]',
  },
  {
    name: 'H3',
    size: '24px',
    weight: '500 (Medium)',
    usage: 'Subsection titles',
    className: 'font-heading font-medium text-foreground text-[24px]',
  },
  {
    name: 'H4',
    size: '20px',
    weight: '500 (Medium)',
    usage: 'Small headings',
    className: 'font-heading font-medium text-foreground text-[20px]',
  },
  {
    name: 'Body',
    size: '16px',
    weight: '400 (Regular)',
    usage: 'Paragraph text',
    className: 'text-foreground text-[16px] leading-[1.6]',
  },
  {
    name: 'Caption',
    size: '14px',
    weight: '400 (Regular)',
    usage: 'For captions',
    className: 'text-muted-foreground text-[14px]',
  },
  {
    name: 'Label',
    size: '18px',
    weight: '600 (Semibold)',
    usage: 'Form and interface labels',
    className: 'text-primary-green text-[18px]',
  },
]

export function TypographySection() {
  return (
    <section id="typography" className="scroll-mt-24">
      <SectionHeading>Typography System</SectionHeading>

      <div className="mb-6">
        <Text as="p" variant="sub-md" className="font-semibold text-foreground">
          Font Source
        </Text>
        <Text as="p" variant="sub-sm" className="text-muted-foreground">
          <strong>Inter</strong> - css custom property
        </Text>
      </div>

      <Text
        as="p"
        variant="sub-sm"
        className="text-[13px] font-semibold uppercase tracking-wide mb-3 text-muted-foreground"
      >
        Typographic Scale
      </Text>
      <Card className="p-0 overflow-hidden">
        <div className="grid grid-cols-5 text-[13px] font-semibold uppercase tracking-wide bg-primary text-primary-foreground">
          <div className="px-4 py-2">Name</div>
          <div className="px-4 py-2">Size</div>
          <div className="px-4 py-2">Weight</div>
          <div className="px-4 py-2">Usage</div>
          <div className="px-4 py-2">Example</div>
        </div>
        {typeScale.map((t, i) => (
          <div
            key={t.name}
            className={cn(
              'grid grid-cols-5 text-[14px] items-center',
              i % 2 === 0 ? 'bg-card' : 'bg-muted/40'
            )}
          >
            <div className="px-4 py-3 font-mono text-muted-foreground">
              {t.name}
            </div>
            <div className="px-4 py-3 text-foreground">{t.size}</div>
            <div className="px-4 py-3 text-foreground">{t.weight}</div>
            <div className="px-4 py-3 text-muted-foreground">{t.usage}</div>
            <div className="px-4 py-3 overflow-hidden">
              <p className={cn(t.className, 'truncate')}>{t.name}</p>
            </div>
          </div>
        ))}
      </Card>
    </section>
  )
}
