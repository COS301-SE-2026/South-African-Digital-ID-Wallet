import { ShieldCheck, Zap, Users, FileCheck, ArrowRight } from 'lucide-react'

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
    tone: 'gold' as const,
    title: 'Global Compliance',
    description: 'Meets international verification standards.',
  },
]

export function LandingPageContent() {
  return (
    <main>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 pb-20 pt-16 lg:grid-cols-2 lg:px-10 lg:pt-24">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-forest/15 bg-brand-forest/5 px-4 py-2">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-forest text-white">
                <ShieldCheck className="h-3 w-3" strokeWidth={3} />
              </span>

              <span className="text-sm font-medium text-brand-forestDark">
                Secure Identity. Smarter Decisions.
              </span>
            </div>

            <h1 className="mt-6 text-5xl font-extrabold leading-[1.08] tracking-tight text-brand-forestDark sm:text-6xl">
              Your next step toward a safer digital{' '}
              <span className="text-brand-forest">South</span>{' '}
              <span className="relative inline-block text-brand-green">
                Africa
                <span className="absolute -bottom-1 left-0 h-1 w-full bg-gradient-to-r from-brand-forest via-brand-gold to-brand-red" />
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-neutral-500">
              VerifyID provides fast, secure, and reliable identity verification
              for businesses and individuals. Protect what matters most with
              confidence.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-forest px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-forestDark hover:shadow-md">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </button>

              <button className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-forest/30 bg-transparent px-6 py-3 text-sm font-semibold text-brand-forest transition-all duration-200 hover:bg-brand-forest/5">
                Request a Demo
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-14">
              <p className="text-sm font-semibold text-brand-forestDark">
                Built for Trust. Designed for Simplicity.
              </p>

              <span className="mt-2 block h-0.5 w-10 bg-brand-forest" />
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-center">
            <div className="relative flex h-[420px] w-[420px] items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/60 to-transparent" />
              <div className="absolute h-[380px] w-[380px] rounded-full border border-dashed border-brand-forest/25" />

              <span className="absolute left-[22%] top-[10%] h-3 w-3 rounded-full bg-brand-forest" />
              <span className="absolute right-[8%] top-[28%] h-3 w-3 rounded-full bg-brand-gold" />
              <span className="absolute bottom-[16%] left-[10%] h-3 w-3 rounded-full bg-brand-red" />
              <span className="absolute bottom-[8%] right-[16%] h-3 w-3 rounded-full bg-brand-blue" />

              <svg
                width="200"
                height="230"
                viewBox="0 0 200 230"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-xl"
              >
                <path
                  d="M100 0L195 35V105C195 160 155 205 100 230C45 205 5 160 5 105V35L100 0Z"
                  fill="#8CAF8C"
                />
                <path
                  d="M100 18L178 47V105C178 152 143 190 100 211C57 190 22 152 22 105V47L100 18Z"
                  fill="#1B4332"
                />
                <path
                  d="M65 112L88 136L138 84"
                  stroke="#E8A93B"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-10">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, tone, title, description }) => (
            <div
              key={title}
              className="group flex flex-col justify-between rounded-2xl border border-black/5 bg-white p-6 transition-shadow duration-200 hover:shadow-md"
            >
              <div>
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full ${
                    tone === 'green'
                      ? 'bg-brand-forest/10 text-brand-forest'
                      : 'bg-brand-gold/15 text-brand-goldDark'
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={2.25} />
                </div>

                <h3 className="mt-4 text-base font-semibold text-brand-forestDark">
                  {title}
                </h3>

                <p className="mt-1.5 text-sm leading-relaxed text-neutral-500">
                  {description}
                </p>
              </div>

              <button
                aria-label={`Learn more about ${title}`}
                className="mt-6 flex h-8 w-8 items-center justify-center rounded-full text-brand-forest transition-transform duration-200 group-hover:translate-x-1"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
