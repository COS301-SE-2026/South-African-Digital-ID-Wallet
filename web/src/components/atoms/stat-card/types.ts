import type { LucideIcon } from 'lucide-react'

export type StatCardTone = 'green' | 'gold' | 'red' | 'neutral'

export interface StatCardProps {
  icon: LucideIcon
  tone: StatCardTone
  label: string
  value: string | number
  subtext: string
  isActive?: boolean
  onClick?: () => void
}
