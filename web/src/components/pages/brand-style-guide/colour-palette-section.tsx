'use client'

import { SectionHeading } from './section-heading'

const ColorPalette = [
  {
    name: 'Primary Green',
    hex: '#007A4D',
    usage: 'Primary actions, trusted states, secure accents.',
  },
  {
    name: 'Deep Green',
    hex: '#053B2C',
    usage: 'Headers, dark surfaces, hover states.',
  },
  {
    name: 'Accent Gold',
    hex: '#FFB81C',
    usage: 'Speed, emphasis, primary highlight, QR accents.',
  },
  {
    name: 'National Red',
    hex: '#DE3831',
    usage: 'Secondary identity accent and SA palette support.',
  },
  {
    name: 'National Blue',
    hex: '#002395',
    usage: 'Tertiary identity accent and SA palette support.',
  },
  {
    name: 'Clean White',
    hex: '#FFFFFF',
    usage: 'Cards, elevated surfaces, content containers.',
  },
  { name: 'Cream Background', hex: '#F7F4EA', usage: 'App background.' },
  {
    name: 'Text Primary',
    hex: '#111827',
    usage: 'Main body text on light backgrounds.',
  },
  {
    name: 'Muted Text',
    hex: '#6B7280',
    usage: 'Captions, helper text, secondary labels.',
  },
  {
    name: 'Border Grey',
    hex: '#E5E7EB',
    usage: 'Borders, dividers, input outlines.',
  },
  {
    name: 'Neutral Mid Grey',
    hex: '#9CA3AF',
    usage: 'Disabled or inactive interface elements.',
  },
  { name: 'Success Green', hex: '#16A34A', usage: 'Success feedback.' },
  { name: 'Warning Amber', hex: '#D97706', usage: 'Warning states.' },
  {
    name: 'Danger Red',
    hex: '#DC2626',
    usage: 'Destructive actions, high-risk warnings.',
  },
]

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace('#', ''), 16)
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`
}

function ColorSwatch({
  name,
  hex,
  usage,
}: {
  name: string
  hex: string
  usage: string
}) {
  return (
    <div className="flex items-start gap-4 rounded-3xl border border-border bg-card p-4">
      <div
        className="w-16 h-16 rounded-2xl shrink-0 ring-1 ring-foreground/5"
        style={{ backgroundColor: hex }}
        aria-hidden
      />
      <div>
        <p className="font-medium text-foreground text-[15px]">{name}</p>
        <p className="font-mono text-[12px] text-muted-foreground">
          {hex} · rgb({hexToRgb(hex)})
        </p>
        <p className="text-[13px] text-muted-foreground mt-1">{usage}</p>
      </div>
    </div>
  )
}

export function ColorPaletteSection() {
  return (
    <section id="color" className="scroll-mt-24 mt-25">
      <SectionHeading>Colour Palette</SectionHeading>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 mt-8">
        {ColorPalette.map((c) => (
          <ColorSwatch key={c.hex} {...c} />
        ))}
      </div>
    </section>
  )
}
