'use client'
import { useCallback, useEffect, useState } from 'react'
import { SearchBar } from '@/components/atoms/search-bar'
import { SearchResultsTable } from '@/components/organisms/search-results-table'
import { CredentialDetailsModal } from '@/components/organisms/credential-details-modal'
import { credentialService } from '@/services/credential-service'
import {
  mapCredentialResponseToDetail,
  mapCitizenSearchResultToRow,
} from '@/services/credential-service/credential-mapper'
import { revocationReasons } from '@/components/organisms/revoke-credentials-modal/constants'
import type { SearchResultRow } from '@/components/organisms/search-results-table/types'
import type { CredentialDetail } from '@/components/organisms/credential-details-modal/types'
import type { RevocationReason } from '@/components/organisms/revoke-credentials-modal'

const RESULTS_PER_PAGE = 15
const SEARCH_DEBOUNCE_MS = 300

export function ManageCredentialsPage() {
  const [rows, setRows] = useState<SearchResultRow[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [activeCitizenId, setActiveCitizenId] = useState<string | null>(null)
  const [activeCitizenName, setActiveCitizenName] = useState('')
  const [selectedCredentials, setSelectedCredentials] = useState<
    CredentialDetail[]
  >([])

  const totalPages = Math.max(1, Math.ceil(totalResults / RESULTS_PER_PAGE))

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      credentialService
        .search(searchQuery, currentPage, RESULTS_PER_PAGE)
        .then((response) => {
          setRows(response.results.map(mapCitizenSearchResultToRow))
          setTotalResults(response.totalResults)
        })
        .catch(() => {
          setRows([])
          setTotalResults(0)
        })
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timeoutId)
  }, [searchQuery, currentPage])

  const refreshSelectedCitizenCredentials = useCallback(
    async (citizenId: string) => {
      const credentials =
        await credentialService.getCredentialsForCitizen(citizenId)
      setSelectedCredentials(credentials.map(mapCredentialResponseToDetail))
    },
    []
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handleViewCredentials = async (row: SearchResultRow) => {
    setActiveCitizenId(row.id)
    setActiveCitizenName(`${row.firstName} ${row.surname}`)
    setSelectedCredentials([])
    await refreshSelectedCitizenCredentials(row.id)
  }

  const handleCloseModal = () => {
    setActiveCitizenId(null)
    setActiveCitizenName('')
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

    if (activeCitizenId) {
      await refreshSelectedCitizenCredentials(activeCitizenId)
    }
  }

  const handleReinstate = async (credential: CredentialDetail) => {
    await credentialService.reinstate(credential.id, {
      reason: 'Reinstated by administrator.',
    })

    if (activeCitizenId) {
      await refreshSelectedCitizenCredentials(activeCitizenId)
    }
  }

  return (
    <div className="flex min-h-full overflow-x-hidden bg-[#f6f2ea]">
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
        <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4 lg:mt-6 lg:gap-6">
          <SearchBar
            value={searchQuery}
            placeholder="Search by name, surname or ID number..."
            onChange={handleSearchChange}
          />
          <SearchResultsTable
            rows={rows}
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
        isOpen={activeCitizenId !== null}
        onClose={handleCloseModal}
        citizenName={activeCitizenName}
        credentials={selectedCredentials}
        onRevoke={handleRevoke}
        onReinstate={handleReinstate}
      />
    </div>
  )
}
