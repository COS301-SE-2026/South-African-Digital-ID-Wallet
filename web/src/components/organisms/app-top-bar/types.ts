export type TopBarUser = {
  name: string
  initials: string
  subtitle?: string
}

export type AppTopBarProps = {
  title: string
  description: string
  user: TopBarUser
  showNotifications?: boolean
  notificationCount?: number
  onMenuClick?: () => void
}
