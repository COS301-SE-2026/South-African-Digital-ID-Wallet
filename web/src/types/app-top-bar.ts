export type TopBarUser = {
  name: string
  initials: string
  // START FLASHID — PROFILE AVATAR PHOTO
  photoUrl?: string | null
  // END FLASHID — PROFILE AVATAR PHOTO
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
