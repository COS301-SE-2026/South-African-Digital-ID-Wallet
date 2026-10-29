import type { SidebarNavSection, SidebarUser } from '@/types/navigation'

export type AppSidebarProps = {
  navSections: SidebarNavSection[]
  // START FLASHID — PROFILE AVATAR PHOTO
  user: SidebarUser
  // END FLASHID — PROFILE AVATAR PHOTO
  onLogout: () => void | Promise<void>
  variant?: 'desktop' | 'mobile'
  onNavigate?: () => void
}
