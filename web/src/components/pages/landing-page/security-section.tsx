import {
  FileBadge,
  Fingerprint,
  KeyRound,
  LockKeyhole,
  Smartphone,
} from 'lucide-react'
import borderStyles from '@/styles/landing-effects.module.css'

const PROTECTIONS = [
  {
    icon: FileBadge,
    title: 'Government-issued credentials',
    description: 'A home for your supported official credentials.',
  },
  {
    icon: KeyRound,
    title: 'Digital signatures',
    description:
      'Designed to help verify the source and authenticity of a credential.',
  },
  {
    icon: Smartphone,
    title: 'Trusted device management',
    description: 'See and manage the devices connected to your account.',
  },
  {
    icon: LockKeyhole,
    title: 'Protected communication',
    description: 'Protection for information moving between services.',
  },
]

export function SecuritySection() {
  return (
    <section
      aria-labelledby="landing-security-title"
      className="mt-24 sm:mt-28"
    >
      <div className="mb-9 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-green">
            Privacy meets peace of mind
          </p>
          <h3
            id="landing-security-title"
            className="mt-3 max-w-xl text-3xl font-bold leading-tight tracking-tight text-deep-green sm:text-4xl"
          >
            <span className="inline-block text-deep-green">
              Security that supports confidence.
            </span>
          </h3>
        </div>
      </div>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <li
          className={`${borderStyles.flowBorder} relative flex flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-primary-green/[0.06] via-cream-background to-accent-gold/[0.05] p-7 sm:col-span-2 lg:col-span-1 lg:row-span-2 sm:p-8`}
        >
          <div className="flex items-start justify-between gap-8">
            <span className="rounded-full bg-clean-white/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-primary-green">
              You choose what to share
            </span>
            <Fingerprint
              className="h-7 w-7 shrink-0 text-primary-green"
              strokeWidth={1.4}
              aria-hidden="true"
            />
          </div>
          <div className="my-9 sm:my-12">
            <h4 className="text-sm font-bold text-primary-green">
              Selective disclosure
            </h4>
            <p className="mt-3 max-w-xs text-3xl font-semibold leading-[1.15] tracking-tight text-deep-green">
              Less information.
              <br />
              More control.
            </p>
            <p className="mt-4 max-w-xs text-sm leading-7 text-muted-text">
              Share the details that are needed. Keep the rest private.
            </p>
          </div>
          <div
            aria-hidden="true"
            className="flex items-center justify-between gap-3 border-t border-deep-green/10 pt-5"
          >
            <span className="text-xs font-semibold text-deep-green">
              Your identity, on your terms.
            </span>
          </div>
        </li>
        {PROTECTIONS.map(({ icon: Icon, title, description }) => (
          <li
            key={title}
            className={`${borderStyles.flowBorder} ${borderStyles.smallCardSwipe} ${borderStyles.cardSurface} rounded-3xl bg-clean-white p-6 motion-safe:transition-[transform,box-shadow] motion-safe:duration-300 motion-safe:hover:-translate-y-1 hover:shadow-[0_16px_35px_-24px_rgba(5,59,44,0.35)] sm:p-7`}
          >
            <Icon
              className={borderStyles.cardWatermark}
              strokeWidth={1}
              aria-hidden="true"
            />
            <div className="relative flex items-start gap-4">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-clean-white/80 text-primary-green shadow-sm ring-1 ring-deep-green/10">
                <Icon
                  className="h-5 w-5"
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
              </span>
              <h4 className="pt-2 text-base font-bold leading-6 text-deep-green">
                {title}
              </h4>
            </div>
            <p className="relative mt-5 border-t border-deep-green/10 pt-4 text-sm leading-7 text-muted-text">
              {description}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
