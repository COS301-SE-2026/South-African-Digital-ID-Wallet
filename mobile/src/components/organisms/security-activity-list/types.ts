import type { SecurityActivityEntry } from '@/services/security-service'

export type SecurityActivityListProps = {
  actionLabel?: string
  entries: SecurityActivityEntry[]
  isError: boolean
  isPending: boolean
  onActionPress?: () => void
  title: string
}
