export interface GovAdminAuditLogRow {
  id: string
  createdAt: string
  action: string
  userName?: string
  role?: string
  entityType?: string
  entityId?: string
  ipAddress?: string
  outcome: 'Success' | 'Failure'
  description?: string
  device?: string
  location?: string
  previousStatus?: string
  newStatus?: string
  revocationReason?: string
}
export interface GovAdminAuditLogTableProps {
  rows: GovAdminAuditLogRow[]
  search: string
  onSearchChange: (value: string) => void
  currentPage: number
  totalPages: number
  totalResults: number
  resultsPerPage: number
  onPageChange: (page: number) => void
  onViewDetails: (row: GovAdminAuditLogRow) => void
  isLoading: boolean
}
export interface GovAdminAuditLogDetailsPanelProps {
  row: GovAdminAuditLogRow | null
  isOpen: boolean
  onClose: () => void
}
