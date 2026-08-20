import type { StatCardProps, StatCardTone } from './types'

const toneStyles: Record<
  StatCardTone,
  { bg: string; text: string; ring: string }
> = {
  green: {
    bg: 'bg-primary-green/10',
    text: 'text-primary-green',
    ring: 'ring-primary-green',
  },
  gold: {
    bg: 'bg-accent-gold/10',
    text: 'text-accent-gold',
    ring: 'ring-accent-gold',
  },
  red: {
    bg: 'bg-national-red/10',
    text: 'text-national-red',
    ring: 'ring-national-red',
  },
  neutral: {
    bg: 'bg-deep-green/10',
    text: 'text-deep-green',
    ring: 'ring-deep-green',
  },
}

export function StatCard({
  icon: Icon,
  tone,
  label,
  value,
  subtext,
  isActive = false,
  onClick,
}: Readonly<StatCardProps>) {
  const styles = toneStyles[tone]
  const isInteractive = typeof onClick === 'function'

  const cardClassName = `flex items-center gap-4 rounded-xl border bg-clean-white p-5 text-left transition-shadow ${
    isActive ? `border-transparent ring-2 ${styles.ring}` : 'border-border-grey'
  } ${isInteractive ? 'w-full cursor-pointer' : ''}`

  const content = (
    <>
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${styles.bg}`}
      >
        <Icon className={`h-6 w-6 ${styles.text}`} strokeWidth={2} />
      </div>
      <div>
        <p className="text-sm text-muted-text">{label}</p>
        <p className="text-2xl font-semibold text-deep-green">{value}</p>
        <p className="text-xs text-muted-text">{subtext}</p>
      </div>
    </>
  )

  if (isInteractive) {
    return (
      <button
        type="button"
        aria-pressed={isActive}
        onClick={onClick}
        className={cardClassName}
      >
        {content}
      </button>
    )
  }

  return <div className={cardClassName}>{content}</div>
}
