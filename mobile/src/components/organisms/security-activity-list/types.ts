import type { SecurityActivityEntry } from '@/services/security-service'

export type SecurityActivityListProps = {
  entries: SecurityActivityEntry[]
  isError: boolean
  isPending: boolean
  title: string
}
