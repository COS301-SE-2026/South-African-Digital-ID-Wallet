export type CredentialStatus = 'active' | 'suspended' | 'revoked'

export type SearchResultRow = {
  id: string
  initials: string
  firstName: string
  surname: string
  idNumber: string
  dateJoined: string
  expiresOn: string
}

export type SearchResultsTableProps = {
  rows: SearchResultRow[]
  currentPage: number
  totalPages: number
  totalResults: number
  resultsPerPage: number
  onPageChange: (page: number) => void
  onViewCredentials: (row: SearchResultRow) => void
}
