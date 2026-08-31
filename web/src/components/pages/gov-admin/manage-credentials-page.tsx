'use client'
import { useMemo, useState } from 'react'
import { SearchBar } from '@/components/atoms/search-bar'
import { SearchResultsTable } from '@/components/organisms/search-results-table'
import { CredentialDetailsModal } from '@/components/organisms/credential-details-modal'
import { credentialService } from '@/services/credential-service'
import { revocationReasons } from '@/components/organisms/revoke-credentials-modal/constants'
import type { SearchResultRow } from '@/components/organisms/search-results-table/types'
import type { CredentialDetail } from '@/components/organisms/credential-details-modal/types'
import type { RevocationReason } from '@/components/organisms/revoke-credentials-modal'

const RESULTS_PER_PAGE = 15

export function ManageCredentialsPage() {
  const [rows] = useState<SearchResultRow[]>([])
  const [searchQuery, setSearchQuery] = useState('')
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

  const totalResults = searchedRows.length
  const totalPages = Math.max(1, Math.ceil(totalResults / RESULTS_PER_PAGE))

  const paginatedRows = searchedRows.slice(
    (currentPage - 1) * RESULTS_PER_PAGE,
    currentPage * RESULTS_PER_PAGE
  )

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

  const handleRevoke = async (
    credential: CredentialDetail,
    payload: { reason: RevocationReason; notes: string }
  ) => {
    const reasonLabel =
      revocationReasons.find((r) => r.value === payload.reason)?.label ??
      payload.reason
    const combinedReason = payload.notes
      ? `${reasonLabel}: ${payload.notes}`
      : reasonLabel

    await credentialService.revoke(credential.id, {
      newStatus: 'Revoked',
      reason: combinedReason,
    })
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
