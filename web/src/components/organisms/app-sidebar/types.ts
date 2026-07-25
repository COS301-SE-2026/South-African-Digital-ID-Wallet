import type { SidebarNavSection, SidebarUser } from '@/types/navigation'

export type AppSidebarProps = {
  navSections: SidebarNavSection[]
  user: SidebarUser
  onLogout: () => void | Promise<void>
  variant?: 'desktop' | 'mobile'
  onNavigate?: () => void
}
