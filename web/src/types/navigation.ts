export type SidebarIconName =
  | 'dashboard'
  | 'credentials'
  | 'qr'
  | 'notifications'
  | 'biometrics'
  | 'history'
  | 'settings'
  | 'users'
  | 'shield'

export type SidebarNavItem = {
  label: string
  href: string
  icon: SidebarIconName
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
