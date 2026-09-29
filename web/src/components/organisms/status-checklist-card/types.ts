import type { LucideIcon } from 'lucide-react'

export type StatusChecklistItem = {
  done: boolean
  label: string
}

export type StatusChecklistCardProps = {
  className?: string
  icon?: LucideIcon
  items: StatusChecklistItem[]
  title: string
}
