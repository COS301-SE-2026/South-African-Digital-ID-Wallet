import type { LucideIcon } from 'lucide-react'
import type { OfficialActivityItem } from '@/services/official-dashboard-service/types'

// Re-exported from the service so there is one definition, not two that drift apart
export type { OfficialActivityItem }

export type OfficialActivityTone = 'green' | 'blue' | 'red'

export interface OfficialActivityLogItem {
  id: string
  summary: string
  timestamp: string
  icon: LucideIcon
  tone: OfficialActivityTone
}

export interface ActivityCardProps {
  activity: OfficialActivityItem[]
}
