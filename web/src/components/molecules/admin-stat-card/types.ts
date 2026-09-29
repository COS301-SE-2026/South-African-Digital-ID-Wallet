import type { LucideIcon } from 'lucide-react'

export interface AdminStatItem {
  icon: LucideIcon
  label: string
  value: number
  href: string
}

export interface AdminStatCardProps {
  items: AdminStatItem[]
}
