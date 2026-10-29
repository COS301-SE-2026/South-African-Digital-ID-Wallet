'use client'
import { MobilePreview } from './mobile-preview'
import { MobileAppSection } from './mobile-app-section'
import { SecuritySection } from './security-section'
import { PrinciplesSection } from './principles-section'
import { ProductShowcase } from './product-showcase'
import borderStyles from '@/styles/landing-effects.module.css'
import { LandingPageNavbar } from '../../organisms/landing-page-navbar/landing-page-navbar'
import { LandingPageFooter } from '../../organisms/landing-page-footer/landing-page-footer'
import { Text } from '@/components/atoms'
import { HelpMenuSection } from '../../molecules/help-menu-section/help-menu-section'
import {
  ArrowRight,
  Building2,
  Check,
  FileBadge,
  Fingerprint,
  KeyRound,
  Landmark,
  LockKeyhole,
  QrCode,
  Shield,
  UserCheck,
} from 'lucide-react'
import Link from 'next/link'

const FEATURES = [
  {
    icon: Shield,
    title: 'Digital identity wallet',
    description:
      'Keep supported official credentials organised in one secure place.',
  },
  {
    icon: LockKeyhole,
    title: 'Selective disclosure',
    description:
      'Share only the information needed for a particular verification.',
  },
  {
    icon: QrCode,
    title: 'Trusted verification',
    description:
      'Use secure QR-based flows backed by digitally signed credentials.',
  },
  {
    icon: FileBadge,
    title: 'Verified credentials',
    description:
      'Receive credentials from trusted government and institutional issuers.',
  },
  {
    icon: KeyRound,
    title: 'Account protection',
    description:
      'Use multi-factor authentication, trusted devices, and activity monitoring.',
  },
  {
    icon: Fingerprint,
    title: 'Privacy by design',
    description: 'Stay in control of what you share and who can verify it.',
  },
]
const AUDIENCES = [
  {
    icon: UserCheck,
    tone: 'green' as const,
    title: 'Citizens',
    description:
      'Carry your trusted credentials with you and share only what is needed.',
    points: [
      'Store official credentials securely',
      'Share only necessary information',
      'Access your wallet wherever you are',
    ],
  },
  {
    icon: Landmark,
    tone: 'gold' as const,
    title: 'Government',
    description:
      'Issue and manage credentials through a more connected digital ecosystem.',
    points: [
      'Issue verified digital credentials',
      'Support faster service delivery',
      'Help reduce document fraud',
    ],
  },
  {
    icon: Building2,
    tone: 'blue' as const,
    title: 'Organisations',
    description:
      'Verify trusted identity information without relying on repetitive paperwork.',
    points: [
      'Verify identities more quickly',
      'Trust digitally signed credentials',
      'Reduce onboarding friction',
    ],
  },
]
const HOW_IT_WORKS = [
  {
    actor: 'Government or an authorised issuer',
    action: 'issues a verified credential',
  },
  { actor: 'You', action: 'store the credential in your wallet' },
  { actor: 'You', action: 'choose what information to share' },
  {
    actor: 'A trusted organisation',
    action: 'verifies the credential in seconds',
  },
]
const TONE_STYLES = {
  green: {
    icon: 'bg-primary-green/10 text-primary-green',
  },
  gold: {
    icon: 'bg-accent-gold/15 text-deep-green',
  },
  blue: {
    icon: 'bg-national-blue/10 text-national-blue',
  },
} as const
export function LandingPage() {
  return (
    <div className="min-h-screen bg-cream-background">
      <LandingPageNavbar />
      <LandingPageContent />
      <LandingPageFooter />
    </div>
  )
}
export function LandingPageContent() {
  return (
    <main>
      <HeroSection />
      <PrinciplesSection />
      <ProblemAndAudienceSection />
      <FeaturesAndHowItWorksSection />
      <PreviewSection />
      <MobileAppSection />
      <HelpMenuSection />
    </main>
  )
}
function HeroSection() {
  return (
    <section
      id="home"
      className={`${borderStyles.ambientSection} relative overflow-hidden bg-cream-background`}
    >
      <div className="pointer-events-none absolute -right-32 -top-24 h-80 w-80 rounded-full bg-accent-gold/10 blur-3xl" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -left-24 top-12 h-64 w-64 rounded-full border border-primary-green/15 sm:-left-20 sm:h-80 sm:w-80" />
        <div className="absolute -left-12 top-24 h-40 w-40 rounded-full border border-primary-green/10 sm:h-56 sm:w-56" />
        <div className="absolute left-3 top-[38%] h-40 w-16 opacity-40 [background-image:radial-gradient(circle,rgba(0,122,77,0.45)_1.5px,transparent_1.5px)] [background-size:14px_14px] sm:left-6 lg:w-20" />
        <div className="absolute bottom-8 left-[18%] h-20 w-32 opacity-35 [background-image:radial-gradient(circle,rgba(0,122,77,0.4)_1.5px,transparent_1.5px)] [background-size:14px_14px]" />
        <div className="absolute bottom-16 -left-8 h-32 w-32 rotate-45 rounded-3xl border border-accent-gold/30 sm:h-40 sm:w-40" />
        <div className="absolute left-[40%] top-12 h-10 w-10 rounded-full border-2 border-accent-gold/30" />
        <div className="absolute bottom-[18%] left-[44%] h-5 w-5 rotate-12 border border-primary-green/20" />
        <div className="absolute left-[30%] top-8 h-2 w-2 rounded-full bg-primary-green/20" />
      </div>
      <div className="mx-auto grid w-full max-w-none items-center gap-12 px-6 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:px-10 lg:py-24">
        <div className="relative z-10 lg:pl-16 xl:pl-28">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-green/15 bg-primary-green/5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-deep-green">
            <Shield className="h-4 w-4 shrink-0" aria-hidden="true" />
            Your identity. In a flash.
          </div>
          <h1 className="max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight text-secure-night sm:text-5xl">
            <span className="inline-block bg-gradient-to-r from-primary-green to-accent-gold bg-clip-text text-transparent">
              Your official identity,
            </span>
            <span className="block w-fit bg-gradient-to-r from-primary-green to-accent-gold bg-clip-text text-transparent">
              ready when you are.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted-text">
            FlashID helps you securely store, share, and verify supported
            digital credentials, so identity checks take seconds instead of
            paperwork.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary-green px-6 py-3 text-base font-bold text-clean-white shadow-lg transition hover:bg-deep-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-green focus-visible:ring-offset-2"
            >
              Create your FlashID
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-primary-green/30 bg-clean-white px-6 py-3 text-base font-bold text-deep-green transition hover:border-primary-green hover:bg-primary-green/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-green focus-visible:ring-offset-2"
            >
              See how it works
            </a>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-muted-text">
            <span className="inline-flex items-center gap-2">
              <Check
                className="h-4 w-4 text-primary-green"
                aria-hidden="true"
              />
              Built around trusted credentials
            </span>
            <span className="inline-flex items-center gap-2">
              <Check
                className="h-4 w-4 text-primary-green"
                aria-hidden="true"
              />
              Designed for everyday verification
            </span>
          </div>
        </div>
        <MobilePreview />
      </div>
    </section>
  )
}
function ProblemAndAudienceSection() {
  return (
    <section
      id="about"
      className={`${borderStyles.ambientSection} scroll-mt-24 bg-cream-background py-20 sm:py-24`}
    >
      <div className="mx-auto w-full max-w-none px-6 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <Text
            as="p"
            variant="label"
            className="text-sm uppercase tracking-[0.18em]"
          >
            Identity, without the friction
          </Text>
          <Text as="h2" variant="h2" className="mt-3 text-3xl sm:text-4xl">
            <span className="inline-block text-deep-green">
              Make every verification feel simpler.
            </span>
          </Text>
          <p className="mt-5 text-lg leading-8 text-muted-text">
            Identity checks can be slow, repetitive, and difficult to trust.
            FlashID brings trusted credentials and controlled sharing into one
            clear digital experience.
          </p>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {AUDIENCES.map(({ icon: Icon, tone, title, description, points }) => {
            const styles = TONE_STYLES[tone]
            return (
              <article
                key={title}
                className={`${borderStyles.flowBorder} ${borderStyles.smallCardSwipe} ${borderStyles.cardSurface} group rounded-2xl bg-clean-white p-6 shadow-sm motion-safe:transition-[transform,box-shadow] motion-safe:duration-300 motion-safe:hover:-translate-y-2 hover:shadow-[0_20px_45px_-15px_rgba(5,59,44,0.35)]`}
              >
                <Icon
                  className={borderStyles.cardWatermark}
                  strokeWidth={1}
                  aria-hidden="true"
                />
                <div
                  className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl motion-safe:transition-transform motion-safe:group-hover:scale-110 ${styles.icon}`}
                >
                  <Icon
                    className="h-6 w-6"
                    strokeWidth={2.1}
                    aria-hidden="true"
                  />
                </div>
                <Text as="h3" variant="h3" className="text-xl">
                  {title}
                </Text>
                <p className="mt-3 text-sm leading-7 text-muted-text">
                  {description}
                </p>
                <ul className="mt-6 space-y-3 rounded-xl border border-deep-green/[0.06] bg-cream-background/65 p-4">
                  {points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2 text-sm text-text-primary"
                    >
                      <Check
                        className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-green"
                        aria-hidden="true"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
function FeaturesAndHowItWorksSection() {
  return (
    <section
      id="features"
      className={`${borderStyles.ambientSection} scroll-mt-24 bg-cream-background py-20 sm:py-24`}
    >
      <div className="mx-auto w-full max-w-none px-6 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <Text
            as="p"
            variant="label"
            className="text-sm uppercase tracking-[0.18em]"
          >
            One wallet, clearer control
          </Text>
          <Text as="h2" variant="h2" className="mt-3 text-3xl sm:text-4xl">
            <span className="inline-block text-deep-green">
              Everything you need to prove who you are.
            </span>
          </Text>
        </div>
        <div className="mt-14 grid gap-8 lg:grid-cols-[1.12fr_0.88fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className={`${borderStyles.flowBorder} ${borderStyles.smallCardSwipe} ${borderStyles.cardSurface} group rounded-2xl bg-cream-background p-5 shadow-sm motion-safe:transition-[transform,box-shadow] motion-safe:duration-300 motion-safe:hover:-translate-y-2 hover:shadow-[0_20px_45px_-15px_rgba(5,59,44,0.35)]`}
              >
                <Icon
                  className={borderStyles.cardWatermark}
                  strokeWidth={1}
                  aria-hidden="true"
                />
                <div className="relative flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-clean-white/80 text-primary-green shadow-sm ring-1 ring-deep-green/10">
                    <Icon
                      className="h-5 w-5"
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  </span>
                  <Text as="h3" variant="h4" className="pt-1 text-lg leading-6">
                    {title}
                  </Text>
                </div>
                <p className="relative mt-4 border-t border-deep-green/10 pt-4 text-sm leading-7 text-muted-text">
                  {description}
                </p>
              </article>
            ))}
          </div>
          <div
            id="how-it-works"
            className="scroll-mt-28 rounded-3xl bg-deep-green p-6 text-clean-white shadow-xl sm:p-8"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-accent-gold text-deep-green">
                <QrCode className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent-gold">
                  How it works
                </p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight">
                  A simpler path from credential to verification.
                </h3>
              </div>
            </div>
            <div className="mt-8 space-y-6">
              {HOW_IT_WORKS.map((step, index) => (
                <div
                  key={`${step.actor}-${step.action}`}
                  className="relative flex gap-4"
                >
                  {index < HOW_IT_WORKS.length - 1 && (
                    <div className="absolute left-5 top-11 h-[calc(100%+0.25rem)] w-px bg-clean-white/20" />
                  )}
                  <div className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-green text-sm font-bold text-clean-white ring-4 ring-deep-green">
                    {index + 1}
                  </div>
                  <div className="pt-1">
                    <p className="font-bold text-clean-white">{step.actor}</p>
                    <p className="mt-1 text-sm leading-6 text-clean-white/70">
                      {step.action}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 border-t border-clean-white/15 pt-6">
              <p className="text-sm leading-6 text-clean-white/75">
                You stay in control of what is shared at every step.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
function PreviewSection() {
  return (
    <section
      id="preview"
      className={`${borderStyles.ambientSection} scroll-mt-24 bg-cream-background py-20 sm:py-24`}
    >
      <div className="mx-auto w-full max-w-none px-6 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <Text
            as="p"
            variant="label"
            className="text-sm uppercase tracking-[0.18em] text-primary-green"
          >
            A clear experience
          </Text>
          <Text as="h2" variant="h2" className="mt-3 text-3xl sm:text-4xl">
            <span className="inline-block text-deep-green">
              Designed to make trusted identity feel easy.
            </span>
          </Text>
          <p className="mt-5 text-lg leading-8 text-muted-text">
            From your dashboard to your credential wallet, FlashID keeps
            important identity actions visible, understandable, and close at
            hand.
          </p>
        </div>
        <div className="mt-10 sm:mt-12">
          <ProductShowcase />
        </div>
        <SecuritySection />
      </div>
    </section>
  )
}
