import type { Dispatch, SetStateAction } from 'react'
export type AuditLogOutcome = 'Success' | 'Failed'
export interface AuditLogItem {
  id: string
  createdAt: string
  action: string
  citizenName: string
  citizenIdMasked: string
  performedBy: string
  outcome: AuditLogOutcome
}
export interface AuditLogHistoryResponse {
  items: AuditLogItem[]
  page: number
  pageSize: number
  totalCount: number
}
export interface AuditLogApiError {
  error: {
    code: string
    message: string
    traceId: string
  }
}

export interface AuditLogTableProps {
  rows: AuditLogItem[]
  currentPage: number
  totalPages: number
  totalResults: number
  resultsPerPage: number
  onPageChange: Dispatch<SetStateAction<number>>
  isLoading: boolean
}
