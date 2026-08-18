import type { StatCardProps, StatCardTone } from './types'

const toneStyles: Record<StatCardTone, { bg: string; text: string }> = {
  green: { bg: 'bg-primary-green/10', text: 'text-primary-green' },
  gold: { bg: 'bg-accent-gold/10', text: 'text-accent-gold' },
  red: { bg: 'bg-national-red/10', text: 'text-national-red' },
  neutral: { bg: 'bg-deep-green/10', text: 'text-deep-green' },
}

export function StatCard({
  icon: Icon,
  tone,
  label,
  value,
  subtext,
}: StatCardProps) {
  const styles = toneStyles[tone]
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border-grey bg-clean-white p-5">
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
    </div>
  )
}
