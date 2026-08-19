'use client'
import { useMemo, useState } from 'react'
import { SearchBar } from '@/components/atoms/search-bar'
import { CredentialStatsFilter } from '@/components/organisms/credential-stats-filter'
import { SearchResultsTable } from '@/components/organisms/search-results-table'
import type { SearchResultRow } from '@/components/organisms/search-results-table/types'
import type { CredentialFilter } from '@/components/organisms/credential-stats-filter/types'

const RESULTS_PER_PAGE = 15
const EXPIRING_SOON_DAYS = 30

const MOCK_ROWS: SearchResultRow[] = [
  {
    id: '1',
    initials: 'TS',
    firstName: 'Thabo',
    surname: 'Ndlovu',
    idNumber: '860101 5385 088',
    dateJoined: '2023-01-15',
    expiresOn: '2034-01-15',
    status: 'active',
  },
  {
    id: '2',
    initials: 'NP',
    firstName: 'Nomsa',
    surname: 'Dlamini',
    idNumber: '900215 1122 065',
    dateJoined: '2023-01-15',
    expiresOn: '2026-09-05',
    status: 'active',
  },
  {
    id: '3',
    initials: 'JM',
    firstName: 'Jabulani',
    surname: 'Mthembu',
    idNumber: '920303 5678 083',
    dateJoined: '2023-01-15',
    expiresOn: '2034-03-03',
    status: 'suspended',
  },
  {
    id: '4',
    initials: 'LP',
    firstName: 'Lerato',
    surname: 'Pheko',
    idNumber: '880808 3344 090',
    dateJoined: '2023-01-15',
    expiresOn: '2026-08-30',
    status: 'active',
  },
  {
    id: '5',
    initials: 'SK',
    firstName: 'Sipho',
    surname: 'Khumalo',
    idNumber: '870707 2211 087',
    dateJoined: '2023-01-15',
    expiresOn: '2034-07-07',
    status: 'revoked',
  },
]

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
  const [searchQuery, setSearchQuery] = useState('')
  const [statFilter, setStatFilter] = useState<CredentialFilter>('all')
  const [currentPage, setCurrentPage] = useState(1)

  const searchedRows = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_ROWS

    const query = searchQuery.toLowerCase()
    return MOCK_ROWS.filter(
      (row) =>
        row.firstName.toLowerCase().includes(query) ||
        row.surname.toLowerCase().includes(query) ||
        row.idNumber.replace(/\s/g, '').includes(query.replace(/\s/g, ''))
    )
  }, [searchQuery])

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
    console.log('view credentials', row.id)
  }

  return (
    <div className="flex min-h-full overflow-x-hidden bg-[#f6f2ea]">
      <main className="flex flex-1 min-h-0 flex-col overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
        <div className="mt-4 flex flex-1 min-h-0 flex-col gap-4 lg:mt-6 lg:gap-6">
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
    </div>
  )
}
