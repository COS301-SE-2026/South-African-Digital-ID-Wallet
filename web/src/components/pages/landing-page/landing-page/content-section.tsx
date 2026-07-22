import {
  Check,
  ShieldCheck,
  Zap,
  Users,
  FileCheck,
  ArrowRight,
  Shield,
} from 'lucide-react'

const FEATURES = [
  {
    icon: ShieldCheck,
    tone: 'green' as const,
    title: 'Secure by Design',
    description: 'Advanced encryption and privacy-first approach.',
  },
  {
    icon: Zap,
    tone: 'gold' as const,
    title: 'Fast & Reliable',
    description: 'Quick verifications for better user experiences.',
  },
  {
    icon: Users,
    tone: 'green' as const,
    title: 'For Everyone',
    description: 'Built for businesses and individuals alike.',
  },
  {
    icon: FileCheck,
    tone: 'red' as const,
    title: 'Global Compliance',
    description: 'Meets international verification standards.',
  },
]

const TONE_BORDER = {
  green: 'border-l-emerald-600',
  gold: 'border-l-yellow-500',
  red: 'border-l-red-600',
} as const

const TONE_ICON_BG = {
  green: 'bg-emerald-50 text-emerald-700',
  gold: 'bg-yellow-50 text-yellow-600',
  red: 'bg-red-50 text-red-600',
} as const

export function LandingPageContent() {
  return (
    <main className="flex-1">
      <section className="relative w-full overflow-hidden min-h-[calc(100vh-80px)] flex items-center">
        <div className="pointer-events-none absolute -bottom-32 -right-32 hidden xl:block h-[420px] w-[420px] rotate-[20deg]">
          <div className="absolute inset-0 rounded-[3rem] bg-emerald-700" />
          <div className="absolute inset-[16px] rounded-[3rem] bg-white" />
          <div className="absolute inset-[24px] rounded-[3rem] bg-yellow-400" />
          <div className="absolute inset-[32px] rounded-[3rem] bg-white" />
          <div className="absolute inset-[40px] rounded-[3rem] bg-red-600" />
          <div className="absolute inset-[48px] rounded-[3rem] bg-white" />
          <div className="absolute inset-[56px] rounded-[3rem] bg-blue-600" />
        </div>

        <div className="relative w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 xl:gap-20 items-center">
            <div className="relative z-10 space-y-6 sm:space-y-8 lg:space-y-10">
              <div className="inline-flex items-center gap-3 rounded-full border border-gray-200 bg-white px-5 py-2.5 shadow-sm">
                <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <Check
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                    strokeWidth={3}
                  />
                </span>
                <span className="text-base sm:text-lg font-medium text-gray-900">
                  Secure Identity. Smarter Decisions.
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.1] tracking-tight text-gray-900">
                Your next step toward a safer digital{' '}
                <span className="text-emerald-600">South Africa</span>
              </h1>

              <div className="flex h-1.5 w-48 sm:w-56 md:w-64 overflow-hidden rounded-full">
                <span className="h-full flex-1 bg-emerald-600" />
                <span className="h-full flex-1 bg-yellow-400" />
                <span className="h-full flex-1 bg-black" />
                <span className="h-full flex-1 bg-red-600" />
                <span className="h-full flex-1 bg-blue-600" />
              </div>

              <p className="text-lg sm:text-xl leading-relaxed text-gray-600 max-w-xl">
                FlashID provides fast, secure, and reliable identity. Protect
                what matters most with confidence.
              </p>

              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-white" />
                </span>
                <p className="text-base sm:text-lg text-gray-600">
                  Designed for Simplicity.Built for Trust.{' '}
                  <span className="font-semibold text-emerald-600">
                    Proudly South African.
                  </span>
                </p>
              </div>
            </div>

            <div className="relative z-10 space-y-5 sm:space-y-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-5">
                {FEATURES.map(({ icon: Icon, tone, title, description }) => (
                  <div
                    key={title}
                    className={`flex items-start gap-4 sm:gap-5 rounded-2xl border-l-4 bg-white p-5 sm:p-6 shadow-sm transition-all duration-200 hover:shadow-md ${TONE_BORDER[tone]}`}
                  >
                    <div
                      className={`flex h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center rounded-full ${TONE_ICON_BG[tone]}`}
                    >
                      <Icon
                        className="h-6 w-6 sm:h-7 sm:w-7"
                        strokeWidth={2.25}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        {title}
                      </h3>
                      <p className="text-sm sm:text-base leading-relaxed text-gray-500">
                        {description}
                      </p>
                    </div>

                    <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 text-emerald-600" />
                  </div>
                ))}
              </div>

              <div className="hidden sm:flex justify-center">
                <div className="relative flex h-32 w-32 sm:h-36 sm:w-36 lg:h-40 lg:w-40 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-50 to-white border-2 border-emerald-200 shadow-lg">
                  <Shield className="relative h-16 w-16 sm:h-18 sm:w-18 lg:h-20 lg:w-20 text-emerald-600" />
                  <Check className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
