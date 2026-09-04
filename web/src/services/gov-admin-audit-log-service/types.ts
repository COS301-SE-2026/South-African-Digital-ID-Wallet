import type { GovAdminAuditLogRow } from '@/components/organisms/gov-admin-audit-log-table/types'

export type GovAdminAuditLogFilters = {
  search?: string
  action?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
}

export type GovAdminAuditLogResponse = {
  items: GovAdminAuditLogRow[]
  page: number
  pageSize: number
  totalCount: number
}
