export type NotificationItem = {
  id: string
  title: string
  subtitle?: string
  time?: string
}

export type NotificationsListProps = {
  notifications?: NotificationItem[]
}
