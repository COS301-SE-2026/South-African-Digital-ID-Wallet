import type * as React from 'react'
import type { SidebarNavSection, SidebarUser } from '@/types/navigation'

export type AppSidebarProps = {
  navSections: SidebarNavSection[]
  user: SidebarUser
}
