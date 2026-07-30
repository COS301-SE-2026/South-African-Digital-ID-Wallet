'use client'

import Image from 'next/image'
import { Text } from '@/components/atoms'
import {
  Shield,
  Zap,
  Users,
  Fingerprint,
  ShieldCheck,
  Palette,
  Type,
  Component,
  Eye,
  CheckCircle2,
} from 'lucide-react'
import FileStructure from '@/assets/images/file-structure.png'
import { SectionHeading } from './section-heading'

const icons = [
  Shield,
  Zap,
  Users,
  Fingerprint,
  ShieldCheck,
  Palette,
  Type,
  Component,
  Eye,
  CheckCircle2,
]

export function ComponentOrganisationSection() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <SectionHeading>Component Organisation</SectionHeading>
        <div className="mt-4">
          <Image
            src={FileStructure}
            alt="FileStructure"
            width={800}
            height={400}
            className="w-full h-auto rounded-3xl border border-border"
          />
        </div>
      </div>

      <div id="icons" className="scroll-mt-24">
        <SectionHeading>Iconography</SectionHeading>
        <Text
          as="p"
          variant="sub-md"
          className="text-[14px] mb-4 text-muted-foreground"
        >
          FlashID uses Lucide for modern icon systems paired well with
          shadcn/ui:{' '}
          <code className="font-mono text-[13px] bg-muted px-1.5 py-0.5 rounded">
            {`import { IconName } from "lucide-react"`}
          </code>
          . A few of which are:
        </Text>
        <div className="flex flex-wrap gap-3">
          {icons.map((Icon, i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-xl border border-border bg-card flex items-center justify-center"
            >
              <Icon size={18} className="text-muted-foreground" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
