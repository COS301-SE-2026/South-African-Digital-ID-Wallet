import type { LucideIcon } from 'lucide-react'

export type SidebarNavItem = {
  label: string
  href: string
  icon: LucideIcon
}

export type SidebarNavSection = {
  title: string
  items: SidebarNavItem[]
}

export type SidebarUser = {
  name: string
  initials: string
  idLabel: string
}
