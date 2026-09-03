import type { LucideIcon } from 'lucide-react-native'

import type { IconTileTone } from '@/components/atoms'

export type AuditLogOutcomeFilter = 'all' | 'Success' | 'Failed' | 'Access'

export type AuditLogItemResponse = {
  action: string
  citizenName: string | null
  citizenSaId: string | null
  createdAt: string
  details: string
  id: string
  ipAddress: string | null
  outcome: string
  performedBy: string
}

export type AuditLogResponse = {
  items: AuditLogItemResponse[]
  page: number
  pageSize: number
  totalCount: number
}

export type AuditLogActionsResponse = {
  actions: string[]
}

export type AuditLogQuery = {
  action?: string
  outcome: AuditLogOutcomeFilter
  search: string
}

export type AuditLogEntry = {
  actor: string
  details: string
  id: string
  Icon: LucideIcon
  ipAddress: string | null
  outcome: string
  saId: string | null
  subject: string | null
  time: string
  title: string
  tone: IconTileTone
}
