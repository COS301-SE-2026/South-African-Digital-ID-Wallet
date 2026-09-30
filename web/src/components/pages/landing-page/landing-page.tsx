'use client'
import { useState } from 'react'
import { LandingPageNavbar } from '../../organisms/landing-page-navbar/landing-page-navbar'
import { LandingPageFooter } from '../../organisms/landing-page-footer/landing-page-footer'
import { Text } from '@/components/atoms'
import { HelpMenuSection } from '../../molecules/help-menu-section/help-menu-section'
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  FileBadge,
  Fingerprint,
  KeyRound,
  Landmark,
  LockKeyhole,
  QrCode,
  Shield,
  ShieldCheck,
  Smartphone,
  UserCheck,
  Users,
  Zap,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import citizenDashboardPic from '@/assets/images/citizen-dashboard-pic.jpeg'
import manageUserAccountPic from '@/assets/images/manage-user-account-pic.jpeg'
import credentialWalletPic from '@/assets/images/credential-wallet-pic.jpeg'
import verifyIdentityPic from '@/assets/images/verify-identity-pic.jpeg'

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
const SECURITY_POINTS = [
  'Government-issued credentials',
  'Digital signatures',
  'Selective disclosure',
  'Trusted device management',
  'Protected communication',
]
const TONE_STYLES = {
  green: {
    border: 'border-t-primary-green',
    icon: 'bg-primary-green/10 text-primary-green',
  },
  gold: {
    border: 'border-t-accent-gold',
    icon: 'bg-accent-gold/15 text-deep-green',
  },
  blue: {
    border: 'border-t-national-blue',
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
      <TrustStrip />
      <ProblemAndAudienceSection />
      <FeaturesAndHowItWorksSection />
      <PreviewSection />
      <HelpMenuSection />
    </main>
  )
}
function HeroSection() {
  return (
    <section id="home" className="relative overflow-hidden bg-cream-background">
      <div className="pointer-events-none absolute -right-32 -top-24 h-80 w-80 rounded-full bg-accent-gold/10 blur-3xl" />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:px-10 lg:py-24">
        <div className="relative z-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-green/20 bg-clean-white px-4 py-2 text-sm font-semibold text-deep-green shadow-sm">
            <BadgeCheck
              className="h-4 w-4 text-primary-green"
              aria-hidden="true"
            />
            A secure digital identity wallet for South Africa
          </div>
          <h1 className="max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight text-secure-night sm:text-5xl">
            Your official identity,
            <span className="block text-primary-green">
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
            <Link
              href="#how-it-works"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-primary-green/30 bg-clean-white px-6 py-3 text-base font-bold text-deep-green transition hover:border-primary-green hover:bg-primary-green/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-green focus-visible:ring-offset-2"
            >
              See how it works
            </Link>
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
        <div className="relative">
          <div className="absolute -inset-5 rounded-[2rem] bg-primary-green/10 blur-2xl" />
          <div className="relative rounded-[2rem] bg-gradient-to-br from-secure-night via-deep-green to-primary-green p-3 shadow-2xl sm:p-5">
            <div className="mb-3 flex items-center justify-between px-2 text-clean-white">
              <div className="flex items-center gap-2 text-sm font-bold">
                <Smartphone
                  className="h-4 w-4 text-accent-gold"
                  aria-hidden="true"
                />
                FlashID wallet
              </div>
              <span className="rounded-full bg-clean-white/10 px-3 py-1 text-xs text-clean-white/80">
                Secure preview
              </span>
            </div>
            <div className="relative overflow-hidden rounded-2xl bg-clean-white shadow-xl">
              <Image
                src={citizenDashboardPic}
                alt="FlashID citizen dashboard preview"
                className="h-auto w-full object-cover"
                priority
              />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-xl border border-clean-white/40 bg-secure-night/90 px-3 py-2 text-xs text-clean-white backdrop-blur-sm">
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck
                    className="h-4 w-4 text-accent-gold"
                    aria-hidden="true"
                  />
                  Credentials protected
                </span>
                <span className="text-clean-white/60">FlashID</span>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-5 -left-3 hidden items-center gap-2 rounded-xl border border-border-grey bg-clean-white px-4 py-3 text-xs font-bold text-deep-green shadow-xl sm:flex">
            <QrCode className="h-5 w-5 text-primary-green" aria-hidden="true" />
            Verify in seconds
          </div>
          <div className="absolute -right-3 top-16 hidden items-center gap-2 rounded-xl border border-border-grey bg-clean-white px-4 py-3 text-xs font-bold text-deep-green shadow-xl sm:flex">
            <LockKeyhole
              className="h-5 w-5 text-accent-gold"
              aria-hidden="true"
            />
            Share selectively
          </div>
        </div>
      </div>
    </section>
  )
}
function TrustStrip() {
  const items = [
    { icon: ShieldCheck, label: 'Secure by design' },
    { icon: Zap, label: 'Instant verification' },
    { icon: Fingerprint, label: 'Privacy protected' },
    { icon: Users, label: 'Built for South Africa' },
  ]
  return (
    <section
      aria-label="FlashID principles"
      className="border-y border-border-grey bg-clean-white"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-border-grey px-6 sm:grid-cols-4 sm:px-8 lg:px-10">
        {items.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex min-h-20 items-center justify-center gap-2 px-3 py-4 text-center text-xs font-bold uppercase tracking-wide text-deep-green sm:gap-3 sm:text-sm"
          >
            <Icon
              className="h-5 w-5 flex-shrink-0 text-accent-gold"
              aria-hidden="true"
            />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
function ProblemAndAudienceSection() {
  return (
    <section id="about" className="bg-cream-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <Text
            as="p"
            variant="label"
            className="text-sm uppercase tracking-[0.18em]"
          >
            Identity, without the friction
          </Text>
          <Text as="h2" variant="h2" className="mt-3 text-3xl sm:text-4xl">
            Make every verification feel simpler.
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
                className={`border border-border-grey border-t-4 ${styles.border} rounded-2xl bg-clean-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg`}
              >
                <div
                  className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${styles.icon}`}
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
                <p className="mt-3 min-h-14 text-sm leading-6 text-muted-text">
                  {description}
                </p>
                <ul className="mt-5 space-y-3 border-t border-border-grey pt-5">
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
    <section id="features" className="bg-clean-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <Text
            as="p"
            variant="label"
            className="text-sm uppercase tracking-[0.18em]"
          >
            One wallet, clearer control
          </Text>
          <Text as="h2" variant="h2" className="mt-3 text-3xl sm:text-4xl">
            Everything you need to prove who you are.
          </Text>
        </div>
        <div className="mt-14 grid gap-8 lg:grid-cols-[1.12fr_0.88fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-2xl border border-border-grey bg-cream-background p-5 transition hover:border-primary-green/40 hover:bg-clean-white hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-green/10 text-primary-green">
                  <Icon
                    className="h-5 w-5"
                    strokeWidth={2.1}
                    aria-hidden="true"
                  />
                </div>
                <Text as="h3" variant="h4" className="mt-4 text-lg">
                  {title}
                </Text>
                <p className="mt-2 text-sm leading-6 text-muted-text">
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
  const [featuredScreen, setFeaturedScreen] = useState({
    label: 'Citizen dashboard',
    description: 'Your identity overview at a glance.',
    src: citizenDashboardPic,
    accent: 'bg-primary-green',
    accentText: 'text-primary-green',
  })
  const [supportingScreens, setSupportingScreens] = useState([
    {
      label: 'Manage your account',
      description: 'Control your account details and trusted devices.',
      src: manageUserAccountPic,
      accent: 'bg-national-blue',
      accentText: 'text-national-blue',
    },
    {
      label: 'View your credentials',
      description: 'Keep your supported credentials organised.',
      src: credentialWalletPic,
      accent: 'bg-accent-gold',
      accentText: 'text-deep-green',
    },
    {
      label: 'Verify your identity',
      description: 'Complete trusted verification when you need it.',
      src: verifyIdentityPic,
      accent: 'bg-national-red',
      accentText: 'text-national-red',
    },
  ])
  const swapPreview = (
    selectedScreen: (typeof supportingScreens)[number],
    selectedIndex: number
  ) => {
    const previousFeaturedScreen = featuredScreen
    setFeaturedScreen(selectedScreen)
    setSupportingScreens((currentScreens) =>
      currentScreens.map((screen, index) =>
        index === selectedIndex ? previousFeaturedScreen : screen
      )
    )
  }
  return (
    <section id="preview" className="bg-cream-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <Text
            as="p"
            variant="label"
            className="text-sm uppercase tracking-[0.18em] text-primary-green"
          >
            A clear experience
          </Text>
          <Text as="h2" variant="h2" className="mt-3 text-3xl sm:text-4xl">
            Designed to make trusted identity feel easy.
          </Text>
          <p className="mt-5 text-lg leading-8 text-muted-text">
            From your dashboard to your credential wallet, FlashID keeps
            important identity actions visible, understandable, and close at
            hand.
          </p>
        </div>
        <div className="relative mt-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-5 -top-5 hidden h-20 w-20 rounded-tr-3xl border-r-2 border-t-2 border-accent-gold/60 sm:block"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-5 -left-5 hidden h-20 w-20 rounded-bl-3xl border-b-2 border-l-2 border-national-blue/40 sm:block"
          />
          <div className="relative rounded-3xl border-2 border-deep-green/20 bg-clean-white p-3 shadow-xl sm:p-5">
            <div className="mb-4 flex flex-col gap-3 px-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className={`mt-1.5 h-3 w-3 flex-shrink-0 rounded-full ${featuredScreen.accent} ring-4 ring-cream-background`}
                />
                <div>
                  <p className="text-sm font-bold text-deep-green">
                    {featuredScreen.label}
                  </p>
                  <p className="mt-1 text-sm text-muted-text">
                    {featuredScreen.description}
                  </p>
                </div>
              </div>
              <span className="self-start rounded-full bg-cream-background px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-primary-green sm:self-auto">
                Featured view
              </span>
            </div>
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border-2 border-deep-green/15 bg-cream-background">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-3 rounded-xl border border-clean-white/80"
              />
              <Image
                src={featuredScreen.src}
                alt={`${featuredScreen.label} preview`}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 1200px"
                className="object-contain p-3 sm:p-5"
              />
            </div>
          </div>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {supportingScreens.map((screen, index) => (
            <button
              key={screen.label}
              type="button"
              onClick={() => swapPreview(screen, index)}
              aria-label={`Show ${screen.label} in the large preview`}
              className="group relative overflow-hidden rounded-2xl border-2 border-deep-green/20 bg-clean-white text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-deep-green hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-green focus-visible:ring-offset-2"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-cream-background">
                <Image
                  src={screen.src}
                  alt={`${screen.label} preview`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-contain p-3 transition duration-500 group-hover:scale-[1.04] sm:p-4"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-br from-clean-white/10 via-transparent to-deep-green/10"
                />
                <div
                  aria-hidden="true"
                  className={`absolute bottom-3 right-3 h-3 w-3 rounded-full ${screen.accent} opacity-80 shadow-sm ring-4 ring-clean-white/80`}
                />
              </div>
              <div className="border-t border-border-grey p-5">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={`h-2 w-2 rounded-full ${screen.accent}`}
                  />
                  <p
                    className={`text-[0.68rem] font-bold uppercase tracking-[0.14em] ${screen.accentText}`}
                  >
                    Explore view
                  </p>
                </div>
                <h3 className="mt-3 font-bold text-deep-green">
                  {screen.label}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-text">
                  {screen.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary-green transition group-hover:text-deep-green">
                  View preview
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </div>
            </button>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 font-bold text-primary-green transition hover:text-deep-green"
          >
            Explore FlashID
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>
        <div className="mt-16 rounded-3xl border-2 border-primary-green/30 bg-deep-green p-6 text-clean-white shadow-lg sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-gold text-deep-green shadow-sm">
                <ShieldCheck className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-2xl font-bold">
                Security that supports confidence.
              </h3>
              <p className="mt-3 max-w-md text-sm leading-6 text-clean-white/70">
                FlashID is designed around verified credentials, controlled
                sharing, and protection for the devices you trust.
              </p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {SECURITY_POINTS.map((point) => (
                <li
                  key={point}
                  // stronger border and fill so pills separate from the card
                  className="flex items-center gap-3 rounded-xl border border-clean-white/25 bg-clean-white/10 px-4 py-3 text-sm font-medium text-clean-white shadow-sm transition hover:border-accent-gold/60 hover:bg-clean-white/15"
                >
                  {/* gold on green is readable; national-blue was nearly invisible */}
                  <Check
                    className="h-4 w-4 flex-shrink-0 text-accent-gold"
                    aria-hidden="true"
                  />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
