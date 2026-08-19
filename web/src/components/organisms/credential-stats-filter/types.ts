import type { SearchResultRow } from '@/components/organisms/search-results-table/types'
export type CredentialFilter = 'all' | 'active' | 'suspended' | 'expiring'

export type CredentialStatsFilterProps = {
  rows: SearchResultRow[]
  value: CredentialFilter
  onChange: (filter: CredentialFilter) => void
  expiringSoonDays?: number
}
