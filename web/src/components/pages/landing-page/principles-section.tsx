import { Fingerprint, ShieldCheck, Users, Zap } from 'lucide-react'
import effects from './landing-effects.module.css'

const PRINCIPLES = [
  {
    icon: ShieldCheck,
    label: 'Secure by design',
    detail: 'Protection at every step.',
    theme: 'bg-primary-green/10 text-primary-green',
  },
  {
    icon: Zap,
    label: 'Instant verification',
    detail: 'Less waiting. More doing.',
    theme: 'bg-accent-gold/15 text-deep-green',
  },
  {
    icon: Fingerprint,
    label: 'Privacy protected',
    detail: 'Share only what is needed.',
    theme: 'bg-accent-gold/15 text-deep-green',
  },
  {
    icon: Users,
    label: 'Built for South Africa',
    detail: 'Local purpose. Everyday impact.',
    theme: 'bg-primary-green/10 text-primary-green',
  },
]

export function PrinciplesSection() {
  return (
    <section
      aria-label="FlashID principles"
      className={`${effects.ambientSection} bg-cream-background px-6 py-10 sm:px-8 sm:py-14 lg:px-10`}
    >
      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:gap-6">
        <div
          className={`${effects.flowBorder} relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-deep-green p-7 sm:p-10`}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border border-accent-gold/20"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-28 right-12 h-64 w-64 rounded-full border border-clean-white/10"
          />
          <p className="relative text-xs font-bold uppercase tracking-[0.18em] text-accent-gold">
            The FlashID difference
          </p>
          <div className="relative my-8 lg:my-10">
            <h2 className="max-w-md text-3xl font-bold leading-[1.12] tracking-tight text-clean-white sm:text-4xl">
              One wallet.
              <br />
              <span className="text-accent-gold">Everyday confidence.</span>
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-7 text-clean-white/75">
              A simpler identity experience, built around what matters to you.
            </p>
          </div>
          <div className="relative flex items-center gap-3 border-t border-clean-white/15 pt-5">
            <span
              aria-hidden="true"
              className="h-1.5 w-8 rounded-full bg-accent-gold"
            />
            <span className="text-xs font-medium text-clean-white/80">
              Less friction. More possibility.
            </span>
          </div>
        </div>
        <ul className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-2">
          {PRINCIPLES.map(({ icon: Icon, label, detail, theme }) => (
            <li
              key={label}
              className={`${effects.flowBorder} ${effects.smallCardSwipe} ${effects.cardSurface} group flex flex-col rounded-3xl bg-clean-white p-5 shadow-sm motion-safe:transition-[transform,box-shadow] motion-safe:duration-300 motion-safe:hover:-translate-y-1 hover:shadow-[0_18px_36px_-24px_rgba(5,59,44,0.35)] sm:p-7`}
            >
              <Icon
                className={effects.cardWatermark}
                strokeWidth={1}
                aria-hidden="true"
              />
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
                <span
                  className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 ring-inset ring-primary-green/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] ${theme}`}
                >
                  <Icon
                    className="h-6 w-6"
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />
                </span>
                <h3 className="text-base font-bold tracking-tight text-deep-green sm:text-lg">
                  {label}
                </h3>
              </div>
              <p className="relative mt-5 border-t border-deep-green/10 pt-4 text-xs leading-6 text-muted-text sm:text-sm">
                {detail}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
