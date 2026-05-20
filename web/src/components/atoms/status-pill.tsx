import type { StatusPillProps } from '@/types/status-pill'

export function StatusPill({
  children,
  intent = 'active',
}: Readonly<StatusPillProps>) {
  const base = 'px-4 py-1 rounded-full text-sm font-semibold'
  const cls =
    intent === 'active'
      ? `bg-green-100 text-green-700 ${base}`
      : `bg-muted text-muted-foreground ${base}`

  return <span className={cls}>{children}</span>
}
