import type { AuditLogEntry } from '@/services/audit-log-service'

export type AuditLogListProps = {
  entries: AuditLogEntry[]
  hasNextPage: boolean
  isError: boolean
  isFetchingNextPage: boolean
  isPending: boolean
  onLoadMore: () => void
  testID?: string
}
