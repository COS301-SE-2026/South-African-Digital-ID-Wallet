import type { Dispatch, SetStateAction } from 'react'
import type {
  AuditLogHistoryResponse,
  AuditLogItem,
  AuditLogOutcome,
  AuditLogCategory,
} from '@/services/official-dashboard-service/types'

export type {
  AuditLogCategory,
  AuditLogHistoryResponse,
  AuditLogItem,
  AuditLogOutcome,
}

export type AuditLogApiError = {
  error: {
    code: string
    message: string
    traceId: string
  }
}

export type AuditLogTableProps = {
  rows: AuditLogItem[]
  search: string
  onSearchChange: (value: string) => void
  currentPage: number
  totalPages: number
  totalResults: number
  resultsPerPage: number
  onPageChange: Dispatch<SetStateAction<number>>
  isLoading: boolean
  category: AuditLogCategory
  onCategoryChange: (category: AuditLogCategory) => void
}
