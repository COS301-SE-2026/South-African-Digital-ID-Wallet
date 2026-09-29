export interface AdminActivityItem {
  id: string
  eventType: string
  details: string
  createdAt: string
}

export interface AdminActivityFeedProps {
  items: AdminActivityItem[]
  isLoading?: boolean
}
