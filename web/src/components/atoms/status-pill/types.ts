import type { ReactNode } from 'react'

export type StatusPillIntent = 'active' | 'danger' | 'inactive' | 'warning'

export type StatusPillProps = {
  children: ReactNode
  className?: string
  intent?: StatusPillIntent
}
