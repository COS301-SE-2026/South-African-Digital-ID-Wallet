'use client'

import { Text } from '@/components/atoms'
import { LandingPageNavbar } from '@/components/organisms/landing-page-navbar/landing-page-navbar'
import Image from 'next/image'
import FlashIdLogo from '@/assets/images/flashid.png'
import { LogoSection } from './logo-section'
import { ColorPaletteSection } from './colour-palette-section'
import { TypographySection } from './typography-section'
import { ComponentLibrarySection } from './component-library-section'
import { ComponentOrganisationSection } from './component-organisation-section'
import { VoiceToneSection } from './voice-tone-section'
import { DesignTokensSection } from './design-tokens-section'
// import { AccessibilitySection } from './accessibility-section'
import { ChangelogSection } from './change-log'
import { LandingPageFooter } from '@/components/organisms/landing-page-footer/landing-page-footer'

export default function BrandStyleGuidePage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <LandingPageNavbar />
      <main className="max-w-6xl mx-auto px-6 pb-24 space-y-16 mt-10">
        <div className="relative overflow-hidden  border-border p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
            <div className="w-full md:w-4/7 flex-shrink-0">
              <div className="relative group">
                <div></div>
                <div className="relative bg-white/5 rounded-2xl p-4 ">
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

        <LogoSection />
        <ColorPaletteSection />
        <TypographySection />
        <ComponentLibrarySection />
        <ComponentOrganisationSection />
        <VoiceToneSection />
        <DesignTokensSection />
        {/* <AccessibilitySection /> */}
        <ChangelogSection />
      </main>
      <LandingPageFooter />
    </div>
  )
}
