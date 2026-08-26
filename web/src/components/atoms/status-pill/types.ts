import type { ReactNode } from 'react'

export type StatusPillIntent = 'active' | 'inactive' | 'suspended' | 'revoked'

export type StatusPillProps = {
  children: ReactNode
  intent?: StatusPillIntent
}
