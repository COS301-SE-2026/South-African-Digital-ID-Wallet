import { cn } from '@/lib/utils'

import type { StatusPillIntent, StatusPillProps } from './types'

const BASE_STYLE = 'rounded-full px-4 py-1 text-sm font-semibold'

const STATUS_PILL_INTENT_CLASSNAMES: Record<StatusPillIntent, string> = {
  active: 'bg-success-green/15 text-success-green',
  danger: 'bg-danger-red/10 text-danger-red',
  inactive: 'bg-muted text-muted-foreground',
  warning: 'bg-accent-gold/20 text-deep-green',
}

export function StatusPill({
  children,
  className,
  intent = 'active',
}: Readonly<StatusPillProps>) {
  return (
    <span
      className={cn(
        BASE_STYLE,
        STATUS_PILL_INTENT_CLASSNAMES[intent],
        className
      )}
    >
      {children}
    </span>
  )
}
