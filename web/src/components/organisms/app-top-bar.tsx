import { Bell, ChevronDown } from 'lucide-react'

type TopBarUser = {
  name: string
  initials: string
  subtitle?: string
}

type AppTopBarProps = {
  title: string
  description: string
  user: TopBarUser
  showNotifications?: boolean
  notificationCount?: number
}

export function AppTopBar({
  title,
  description,
  user,
  showNotifications = true,
  notificationCount = 0,
}: Readonly<AppTopBarProps>) {}
