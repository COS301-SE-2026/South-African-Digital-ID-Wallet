import type { StatusPillProps, StatusPillIntent } from './types'

const intent_classnames: Record<StatusPillIntent, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-muted text-muted-foreground',
  suspended: 'bg-amber-100 text-amber-700',
  revoked: 'bg-red-100 text-red-700',
}

export function StatusPill({
  children,
  intent = 'active',
}: Readonly<StatusPillProps>) {
  return (
    <span
      className={`px-4 py-1 rounded-full text-sm font-semibold ${intent_classnames[intent]}`}
    >
      {children}
    </span>
  )
}
