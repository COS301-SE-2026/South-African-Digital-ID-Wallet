import { LandingPageNavbar } from '../../organisms/landing-page-navbar/landing-page-navbar'
import { LandingPageFooter } from '../../organisms/landing-page-footer/landing-page-footer'
import {
  Check,
  ShieldCheck,
  Zap,
  ArrowRight,
  Shield,
  Lock,
  QrCode,
  FileBadge,
  UserCheck,
  Building2,
  Landmark,
  FileWarning,
  KeyRound,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Shield,
    title: 'Digital Identity Wallet',
    description: 'Securely store your South African digital credentials.',
  },
  {
    icon: Lock,
    title: 'Selective Disclosure',
    description: 'Share only the information required for verification.',
  },
  {
    icon: QrCode,
    title: 'Trusted Verification',
    description: 'QR-based verification backed by digital signatures.',
  },
  {
    icon: FileBadge,
    title: 'Government-Issued Credentials',
    description: 'Receive official documents directly from trusted issuers.',
  },
  {
    icon: KeyRound,
    title: 'Account Security',
    description:
      'Multi-factor authentication, trusted devices and activity monitoring.',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy First',
    description: 'Your information remains under your control.',
  },
]

const AUDIENCES = [
  {
    icon: UserCheck,
    tone: 'green' as const,
    title: 'Citizens',
    points: [
      'Store official credentials securely',
      'Share only necessary information',
      'Access credentials anywhere',
    ],
  },
  {
    icon: Landmark,
    tone: 'gold' as const,
    title: 'Government',
    points: [
      'Issue verified digital credentials',
      'Reduce document fraud',
      'Improve service delivery',
    ],
  },
  {
    icon: Building2,
    tone: 'red' as const,
    title: 'Institutions & Businesses',
    points: [
      'Verify identities instantly',
      'Trust government-issued credentials',
      'Reduce onboarding time',
    ],
  },
]

const HOW_IT_WORKS = [
  { actor: 'Government', action: 'issues credential' },
  { actor: 'Citizen', action: 'stores credential' },
  { actor: 'Citizen', action: 'shares credential' },
  { actor: 'Organisation', action: 'verifies credential instantly' },
]

const SECURITY_POINTS = [
  'Government-issued credentials',
  'Digital signatures',
  'Selective disclosure',
  'End-to-end encrypted communication',
  'Trusted device management',
]

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Features and How it works', href: '#features&how-it-works' },
  { label: 'Preview', href: '#preview' },
]

const TONE_BORDER = {
  green: 'border-t-emerald-600',
  gold: 'border-t-yellow-500',
  red: 'border-t-red-600',
} as const

const TONE_ICON_BG = {
  green: 'bg-emerald-50 text-emerald-700',
  gold: 'bg-yellow-50 text-yellow-600',
  red: 'bg-red-50 text-red-600',
} as const

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingPageNavbar />
      <LandingPageContent />
      <LandingPageFooter />
    </div>
  )
}

export function LandingPageContent() {
  return (
    <main className="flex-1">
      <HeroSection />
      <ProblemAndAudienceSection />
      <FeaturesAndHowItWorksSection />
      <PreviewSection />
    </main>
  )
}

function HeroSection() {
  return (
    <section
      id="home"
      className="relative w-full overflow-hidden min-h-[calc(100vh-80px)] flex items-center"
    >
      <div className="relative w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-3xl space-y-6 text-center sm:space-y-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-gray-200 bg-white px-5 py-2.5 shadow-sm">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white">
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
            </span>
            <span className="text-sm sm:text-base font-medium text-gray-900">
              Secure Identity. Smarter Decisions.
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight text-gray-900">
            Secure Digital Identity for Every{' '}
            <span className="text-emerald-600">South African</span>
          </h1>

          <div className="mx-auto flex h-1.5 w-56 overflow-hidden rounded-full">
            <span className="h-full flex-1 bg-emerald-600" />
            <span className="h-full flex-1 bg-yellow-400" />
            <span className="h-full flex-1 bg-black" />
            <span className="h-full flex-1 bg-red-600" />
            <span className="h-full flex-1 bg-blue-600" />
          </div>

          <p className="mx-auto max-w-xl text-lg sm:text-xl leading-relaxed text-gray-600">
            Access, verify and share your official credentials securely with
            government institutions, employers, universities and businesses.
          </p>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="/register"
              className="rounded-full bg-emerald-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
            >
              Get Started
            </a>

            <a
              href="#about"
              className="rounded-full border border-gray-300 px-8 py-3.5 text-base font-semibold text-gray-700 transition-colors hover:border-emerald-600 hover:text-emerald-600"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

function ProblemAndAudienceSection() {
  return (
    <section id="about" className=" py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mt-5">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Why FlashID?
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-gray-600">
            Today&apos;s identity verification is often slow, repetitive and
            vulnerable to fraud. FlashID provides a secure digital identity
            wallet that enables trusted, instant verification while giving
            citizens full control over their personal information.
          </p>
        </div>

        <h2 className="text-3xl font-bold text-center tracking-tight text-gray-900 sm:text-4xl mt-25">
          Who is involved?
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3 mt-10">
          {AUDIENCES.map(({ icon: Icon, tone, title, points }) => (
            <div
              key={title}
              className={`rounded-xl border-t-4 bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${TONE_BORDER[tone]}`}
            >
              <div
                className={`mb-3 flex h-11 w-11 items-center justify-center rounded-full ${TONE_ICON_BG[tone]}`}
              >
                <Icon className="h-5 w-5" strokeWidth={2.25} />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                {title}
              </h3>
              <ul className="space-y-1.5">
                {points.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturesAndHowItWorksSection() {
  return (
    <section id="features&how-it-works" className="py-12 sm:py-16">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="mb-12 text-3xl font-extrabold text-center tracking-tight text-gray-900 sm:text-4xl">
          Features & How It Works
        </h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border-2 border-emerald-600 bg-white p-6">
            <h2 className="mb-4 text-xl font-extrabold tracking-tight text-gray-900">
              Features
            </h2>
            <ul className="divide-y divide-gray-100">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <li
                  key={title}
                  className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                    <Icon className="h-4 w-4" strokeWidth={2.25} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      {title}
                    </h3>
                    <p className="mt-0.5 text-xs leading-relaxed text-gray-600">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border-2 border-emerald-600 bg-white p-6">
              <h2 className="mb-4 text-xl font-extrabold tracking-tight text-gray-900">
                How FlashID Works
              </h2>
              <div>
                {HOW_IT_WORKS.map((step, i) => (
                  <div
                    key={i}
                    className="relative flex items-start gap-3 pb-5 last:pb-0"
                  >
                    {i < HOW_IT_WORKS.length - 1 && (
                      <div className="absolute left-4 top-8 h-full w-px bg-emerald-200" />
                    )}
                    <div className="relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white ring-4 ring-white">
                      {i + 1}
                    </div>
                    <div className="pt-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {step.actor}
                      </p>
                      <p className="text-xs text-gray-600">{step.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border-2 border-emerald-600 bg-white p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                  <Shield className="h-4 w-4" />
                </div>
                <h2 className="text-xl font-extrabold tracking-tight text-gray-900">
                  Security You Can Trust
                </h2>
              </div>

              <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {SECURITY_POINTS.map((point) => (
                  <li key={point} className="flex items-center gap-2.5">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <span className="text-sm text-gray-700">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function PreviewSection() {
  const screens = [
    'Citizen Dashboard',
    'Manage Account',
    'Credential Wallet',
    'Verification Screen',
  ]

  return (
    <section id="preview" className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
            Application Preview
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {screens.map((label) => (
            <div key={label} className="space-y-3">
              <div className="flex aspect-[9/16] items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">
                <span className="px-4 text-center text-sm text-gray-400">
                  Screenshot
                </span>
              </div>
              <p className="text-center text-sm font-medium text-gray-700">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
