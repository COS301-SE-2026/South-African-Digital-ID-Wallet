import type { LucideIcon } from 'lucide-react'

export type ActivityStatItem = {
  id: string
  label: string
  value: number
  icon: LucideIcon
  tone: 'green' | 'amber' | 'blue'
}

export type ActivityLogItem = {
  id: string
  title: string
  timestamp: string
  icon: LucideIcon
  tone: 'green' | 'blue' | 'amber'
}
