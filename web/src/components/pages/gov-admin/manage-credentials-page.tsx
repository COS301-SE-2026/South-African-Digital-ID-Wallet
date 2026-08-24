'use client'
import { useMemo, useState } from 'react'
import { SearchBar } from '@/components/atoms/search-bar'
import { CredentialStatsFilter } from '@/components/organisms/credential-stats-filter'
import { SearchResultsTable } from '@/components/organisms/search-results-table'
import { CredentialDetailsModal } from '@/components/organisms/credential-details-modal'
import type { SearchResultRow } from '@/components/organisms/search-results-table/types'
import type { CredentialFilter } from '@/components/organisms/credential-stats-filter/types'
import type { CredentialDetail } from '@/components/organisms/credential-details-modal/types'

const RESULTS_PER_PAGE = 15
const EXPIRING_SOON_DAYS = 30

function isExpiringSoon(expiresOn: string, withinDays: number): boolean {
  const daysUntilExpiry =
    (new Date(expiresOn).getTime() - Date.now()) / (1000 * 60 * 60 * 24)

  return daysUntilExpiry >= 0 && daysUntilExpiry <= withinDays
}

function applyStatFilter(
  rows: SearchResultRow[],
  filter: CredentialFilter,
  expiringSoonDays: number
): SearchResultRow[] {
  switch (filter) {
    case 'active':
      return rows.filter((row) => row.status === 'active')
    case 'suspended':
      return rows.filter((row) => row.status === 'suspended')
    case 'expiring':
      return rows.filter((row) =>
        isExpiringSoon(row.expiresOn, expiringSoonDays)
      )
    case 'all':
    default:
      return rows
  }
}

export function ManageCredentialsPage() {
  const [rows, setRows] = useState<SearchResultRow[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statFilter, setStatFilter] = useState<CredentialFilter>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeModalRow, setActiveModalRow] = useState<SearchResultRow | null>(
    null
  )
  const [selectedCredentials, setSelectedCredentials] = useState<
    CredentialDetail[]
  >([])
  const searchedRows = useMemo(() => {
    if (!searchQuery.trim()) {
      return rows
    }
    const query = searchQuery.toLowerCase()

    return rows.filter(
      (row) =>
        row.firstName.toLowerCase().includes(query) ||
        row.surname.toLowerCase().includes(query) ||
        row.idNumber.replace(/\s/g, '').includes(query.replace(/\s/g, ''))
    )
  }, [rows, searchQuery])

  const filteredRows = useMemo(
    () => applyStatFilter(searchedRows, statFilter, EXPIRING_SOON_DAYS),
    [searchedRows, statFilter]
  )

  const totalResults = filteredRows.length

  const totalPages = Math.max(1, Math.ceil(totalResults / RESULTS_PER_PAGE))

  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * RESULTS_PER_PAGE,
    currentPage * RESULTS_PER_PAGE
  )

  const handleStatFilterChange = (filter: CredentialFilter) => {
    setStatFilter(filter)
    setCurrentPage(1)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handleViewCredentials = (row: SearchResultRow) => {
    setActiveModalRow(row)
    setSelectedCredentials([])
  }

  const handleCloseModal = () => {
    setActiveModalRow(null)
    setSelectedCredentials([])
  }

  const handleRevoke = (credential: CredentialDetail) => {
    console.log('revoke credential', credential.id)
  }

  return (
    <div className="flex min-h-full overflow-x-hidden bg-[#f6f2ea]">
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
        <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4 lg:mt-6 lg:gap-6">
          <SearchBar
            value={searchQuery}
            placeholder="Search by name, ID number or credential ID..."
            onChange={handleSearchChange}
          />

          <CredentialStatsFilter
            rows={searchedRows}
            value={statFilter}
            onChange={handleStatFilterChange}
            expiringSoonDays={EXPIRING_SOON_DAYS}
          />

          <SearchResultsTable
            rows={paginatedRows}
            currentPage={currentPage}
            totalPages={totalPages}
            totalResults={totalResults}
            resultsPerPage={RESULTS_PER_PAGE}
            onPageChange={setCurrentPage}
            onViewCredentials={handleViewCredentials}
          />
        </div>
      </main>

      <CredentialDetailsModal
        isOpen={activeModalRow !== null}
        onClose={handleCloseModal}
        citizenName={
          activeModalRow
            ? `${activeModalRow.firstName} ${activeModalRow.surname}`
            : ''
        }
        credentials={selectedCredentials}
        onRevoke={handleRevoke}
      />
    </div>
  )
}
