import type { ReactNode } from 'react'

export type StatusPillProps = {
  children: ReactNode
  intent?: 'active' | 'inactive'
}
