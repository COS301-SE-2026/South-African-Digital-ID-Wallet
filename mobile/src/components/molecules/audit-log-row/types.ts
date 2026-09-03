import type { AuditLogEntry } from '@/services/audit-log-service'

export type AuditLogRowProps = {
  entry: AuditLogEntry
  testID?: string
}
