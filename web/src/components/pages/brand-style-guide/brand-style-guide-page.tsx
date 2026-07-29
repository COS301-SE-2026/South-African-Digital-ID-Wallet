'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Text } from '@/components/atoms'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  Shield,
  Zap,
  Users,
  Fingerprint,
  ShieldCheck,
  Palette,
  Type,
  LayoutGrid,
  Component,
  Eye,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react'
import { LandingPageNavbar } from '@/components/organisms/landing-page-navbar/landing-page-navbar'
import Image from 'next/image'
import FlashIdLogo from '@/assets/images/flashid.png'
import FlashIdPrimary from '@/assets/images/FlashID-white.png'
import FlashIdDark from '@/assets/images/FlashID-black.png'
import FlashIdDeepGreen from '@/assets/images/FlashID-green.png'
import FlashIdYellow from '@/assets/images/FlashID-yellow.png'

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

const typeScale = [
  { name: 'H1', size: '40-48px', usage: 'Page titles' },
  { name: 'H2', size: '32px', usage: 'Section titles' },
  { name: 'H3', size: '24px', usage: 'Subsection titles' },
  { name: 'Body', size: '16px', usage: 'Paragraph text' },
  { name: 'Small', size: '14px', usage: 'Helper text' },
]

const folderTree = `src/
├── app/          # Next.js app router pages/layouts
├── assets/       # Static assets and exports
├── components/
│   ├── atoms/       # Small reusable UI elements
│   ├── molecules/   # Combined UI groups
│   ├── organisms/   # Large composed sections
│   ├── templates/   # Shared page layouts/shells
│   ├── pages/       # Page-specific compositions
│   └── ui/          # shadcn/ui base primitives
└── lib/          # Shared utilities/helpers`

const usageRules = [
  'shadcn/ui is the canonical component foundation.',
  'Shared colours must use semantic CSS variables.',
  'Hardcoded colours should be avoided where possible.',
  'Shared layouts belong in organisms/templates.',
  'Business logic should not live inside UI primitives.',
  'Components should remain composable and reusable.',
]

const featureBadges = [
  { label: 'Secure by design', icon: Shield },
  { label: 'Instant verification', icon: Zap },
  { label: 'Privacy protected', icon: ShieldCheck },
  { label: 'Nationally scalable', icon: Users },
]

const navItems = [
  { id: 'logo', label: 'Logo' },
  { id: 'color', label: 'Colour' },
  { id: 'typography', label: 'Typography' },
  { id: 'components', label: 'Components' },
  { id: 'icons', label: 'Iconography' },
  { id: 'accessibility', label: 'Accessibility' },
]

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace('#', ''), 16)
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`
}

function SectionHeading({
  icon: Icon,
  children,
}: {
  icon?: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2 mb-2">
      {Icon && <Icon size={22} className="text-primary" />}
      <h2 className="font-heading text-[32px] leading-tight font-semibold text-foreground">
        {children}
      </h2>
    </div>
  )
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

export default function BrandStyleGuidePage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <LandingPageNavbar />
      <main className="max-w-6xl mx-auto px-6 pb-24 space-y-16 mt-10">
        <div className="relative overflow-hidden  border-border p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
            <div className="w-full md:w-4/7 flex-shrink-0">
              <div className="relative group">
                <div className="absolute -inset-4 bg-primary/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
                <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
                  <Image
                    src={FlashIdLogo}
                    alt="FlashID"
                    width={500}
                    height={250}
                    className="w-full h-auto rounded-2xl"
                    priority
                  />
                </div>
              </div>
            </div>

            <div className="w-full md:w-3/5 space-y-4">
              <Text
                as="h1"
                variant="h1"
                className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-foreground"
              >
                Purpose of the <br />
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Design System
                </span>
              </Text>

              <Text
                as="p"
                variant="sub-md"
                className="text-base md:text-lg text-muted-foreground leading-relaxed"
              >
                This page defines the FlashID design system to ensure
                consistency across all user interfaces including the citizen
                dashboard and administrator portals. This provides consistency
                with one centralized source of truth.
              </Text>
            </div>
          </div>
        </div>

        <section id="logo" className="scroll-mt-24">
          <SectionHeading>Logo Specification</SectionHeading>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            <div className="rounded-3xl border border-border p-6 flex flex-col items-center gap-3 bg-white">
              <Image
                src={FlashIdPrimary}
                alt="Primary"
                width={150}
                height={60}
              />
              <Text
                as="p"
                variant="sub-sm"
                className="text-[11px] text-[#053B2C]"
              >
                Primary
              </Text>
            </div>
            <div className="rounded-3xl border border-border p-6 flex flex-col items-center gap-3 bg-black">
              <Image
                src={FlashIdDark}
                alt="Black variant"
                width={150}
                height={60}
              />
              <Text as="p" variant="sub-sm" className="text-[11px] text-white">
                Black variant
              </Text>
            </div>
            <div className="rounded-3xl border border-border p-6 flex flex-col items-center gap-3 bg-[#053B2C]">
              <Image
                src={FlashIdDeepGreen}
                alt="Green variant"
                width={150}
                height={60}
              />
              <Text as="p" variant="sub-sm" className="text-[11px] text-white">
                Green variant
              </Text>
            </div>
            <div className="rounded-3xl border border-border p-6 flex flex-col items-center gap-3 bg-[#FFB81C]">
              <Image
                src={FlashIdYellow}
                alt="Gold variant"
                width={150}
                height={60}
              />
              <Text
                as="p"
                variant="sub-sm"
                className="text-[11px] text-[#111827]"
              >
                Gold variant
              </Text>
            </div>
          </div>
        </section>

        <section id="color" className="scroll-mt-24 mt-25">
          <SectionHeading>Colour Palette</SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 mt-8">
            {ColorPalette.map((c) => (
              <ColorSwatch key={c.hex} {...c} />
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-[12px] text-muted-foreground">
        FlashID Design System · Tech Titans · COS301 Capstone 2026 · v2
      </footer>
    </div>
  )
}
