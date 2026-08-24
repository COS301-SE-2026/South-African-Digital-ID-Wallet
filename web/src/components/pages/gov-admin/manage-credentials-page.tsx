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

type MockRowSeed = [
  id: string,
  initials: string,
  firstName: string,
  surname: string,
  idNumber: string,
  dateJoined: string,
  expiresOn: string,
  status: SearchResultRow['status'],
]

const MOCK_ROW_SEEDS: MockRowSeed[] = [
  [
    '1',
    'TS',
    'Thabo',
    'Ndlovu',
    '860101 5385 088',
    '2023-01-15',
    '2034-01-15',
    'active',
  ],
  [
    '2',
    'NP',
    'Nomsa',
    'Dlamini',
    '900215 1122 065',
    '2023-01-15',
    '2026-09-05',
    'active',
  ],
  [
    '3',
    'JM',
    'Jabulani',
    'Mthembu',
    '920303 5678 083',
    '2023-01-15',
    '2034-03-03',
    'suspended',
  ],
  [
    '4',
    'LP',
    'Lerato',
    'Pheko',
    '880808 3344 090',
    '2023-01-15',
    '2026-08-30',
    'active',
  ],
  [
    '5',
    'SK',
    'Sipho',
    'Khumalo',
    '870707 2211 087',
    '2023-01-15',
    '2034-07-07',
    'revoked',
  ],
]

const MOCK_ROWS: SearchResultRow[] = MOCK_ROW_SEEDS.map(
  ([
    id,
    initials,
    firstName,
    surname,
    idNumber,
    dateJoined,
    expiresOn,
    status,
  ]) => ({
    id,
    initials,
    firstName,
    surname,
    idNumber,
    dateJoined,
    expiresOn,
    status,
  })
)

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
function getCredentialsForRow(row: SearchResultRow): CredentialDetail[] {
  const fullName = `${row.firstName} ${row.surname}`

  const shared = {
    status: row.status,
    issuedOn: '02 June 2024',
    expiresOn: '02 June 2029',
    citizen: {
      fullName,
      idNumber: row.idNumber,
      dateOfBirth: '15 February 1990',
      email: `${row.firstName.toLowerCase()}.${row.surname.toLowerCase()}@email.com`,
      phone: '+27 73 123 4567',
      address: '123 Mkhize Street, Umlazi, Durban, 4031',
    },
    issuedBy: {
      administrator: 'Thandi Mokoena',
      department: 'Home Affairs - KZN',
      office: 'Umlazi Branch Office',
      reference: `HA-KZN-2024-${row.id.padStart(5, '0')}`,
    },
    activity: {
      verifications: 24,
      lastVerifiedOn: '29 Aug 2026',
      lastVerifiedAt: '10:24 AM',
      devicesUsed: 3,
    },
  }

  return [
    {
      id: `${row.id}-dl`,
      type: 'drivers-licence',
      label: "Driver's Licence",
      credentialId: `DL-2024-${row.id.padStart(7, '0')}`,
      ...shared,
    },
    {
      id: `${row.id}-id`,
      type: 'id-card',
      label: 'ID Card',
      credentialId: `ID-2024-${row.id.padStart(7, '0')}`,
      ...shared,
    },
  ]
}

export function ManageCredentialsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statFilter, setStatFilter] = useState<CredentialFilter>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeModalRow, setActiveModalRow] = useState<SearchResultRow | null>(
    null
  )

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
    setActiveModalRow(row)
  }

  const handleCloseModal = () => {
    setActiveModalRow(null)
  }

  const handleRevoke = (credential: CredentialDetail) => {
    console.log('revoke credential', credential.id)
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

      <CredentialDetailsModal
        isOpen={activeModalRow !== null}
        onClose={handleCloseModal}
        citizenName={
          activeModalRow
            ? `${activeModalRow.firstName} ${activeModalRow.surname}`
            : ''
        }
        credentials={activeModalRow ? getCredentialsForRow(activeModalRow) : []}
        onRevoke={handleRevoke}
      />
    </div>
  )
}
