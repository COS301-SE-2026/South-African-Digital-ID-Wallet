'use client'

import Image, { type StaticImageData } from 'next/image'
import { Text } from '@/components/atoms'
import flashid from '@/assets/images/flashid.png'
import FlashIdDark from '@/assets/images/FlashID-black.png'
import FlashIdDeepGreen from '@/assets/images/FlashID-green.png'
import FlashIdYellow from '@/assets/images/FlashID-yellow.png'
import { SectionHeading } from './section-heading'

const logoVariants: {
  src: StaticImageData
  alt: string
  label: string
  bg: string
  border: string
}[] = [
  {
    src: flashid,
    alt: 'Primary',
    label: 'Primary',
    bg: 'bg-background',
    border: 'border-black',
  },
  {
    src: FlashIdDark,
    alt: 'Black variant',
    label: 'Black variant',
    bg: 'bg-black',
    border: 'border-border',
  },
  {
    src: FlashIdDeepGreen,
    alt: 'Green variant',
    label: 'Green variant',
    bg: 'bg-deep-green',
    border: 'border-border',
  },
  {
    src: FlashIdYellow,
    alt: 'Gold variant',
    label: 'Gold variant',
    bg: 'bg-accent-gold',
    border: 'border-border',
  },
]

export function LogoSection() {
  return (
    <section id="logo" className="scroll-mt-24">
      <SectionHeading>Logo Specification</SectionHeading>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
        {logoVariants.map((v) => (
          <div key={v.label} className="flex flex-col items-center">
            <div
              className={`flex items-center justify-center rounded-3xl border ${v.border} ${v.bg} p-6`}
            >
              <Image src={v.src} alt={v.alt} width={150} height={60} />
            </div>
            <Text
              as="p"
              variant="sub-sm"
              className="mt-2 text-center text-[11px] text-black"
            >
              {v.label}
            </Text>
          </div>
        ))}
      </div>
    </section>
  )
}
