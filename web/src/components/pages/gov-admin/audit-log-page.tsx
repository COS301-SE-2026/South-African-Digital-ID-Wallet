'use client'
import { useEffect, useState } from 'react'
import { GovAdminAuditLogTable } from '@/components/organisms/gov-admin-audit-log-table'
import { GovAdminAuditLogDetailsPanel } from '@/components/organisms/gov-admin-audit-log-table/gov-admin-audit-log-details-panel'
import type { GovAdminAuditLogRow } from '@/components/organisms/gov-admin-audit-log-table/types'
import { getGovAdminAuditLogs } from '@/services/gov-admin-audit-log-service/gov-admin-audit-log-service'

const RESULTS_PER_PAGE = 10
const SEARCH_DEBOUNCE_MS = 300

export default function AuditLogPage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRow, setSelectedRow] = useState<GovAdminAuditLogRow | null>(
    null
  )
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  const [rows, setRows] = useState<GovAdminAuditLogRow[]>([])
  const [totalResults, setTotalResults] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search)
      setCurrentPage(1)
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timeout)
  }, [search])

  useEffect(() => {
    let ignore = false
    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await getGovAdminAuditLogs({
          page: currentPage,
          pageSize: RESULTS_PER_PAGE,
          search: debouncedSearch.trim() || undefined,
        })
        if (!ignore) {
          setRows(res.items)
          setTotalResults(res.totalCount)
        }
      } catch (err) {
        console.error('Failed to load audit logs', err)
        if (!ignore) {
          setError('Could not load audit logs.')
          setRows([])
          setTotalResults(0)
        }
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }
    load()
    return () => {
      ignore = true
    }
  }, [currentPage, debouncedSearch])

  const totalPages = Math.max(1, Math.ceil(totalResults / RESULTS_PER_PAGE))

  const handleSearchChange = (value: string) => {
    setSearch(value)
  }
  const handleViewDetails = (row: GovAdminAuditLogRow) => {
    setSelectedRow(row)
    setIsPanelOpen(true)
  }
  const handleClosePanel = () => {
    setIsPanelOpen(false)
  }

  return (
    <div className="flex min-h-full overflow-x-hidden bg-[#f6f2ea]">
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
        <div className="relative flex min-h-[560px] flex-1 flex-col rounded-[26px] bg-gradient-to-r from-black via-accent-gold via-national-red via-national-blue to-primary-green p-[2px] *:flex-1">
          {error ? (
            <div className="flex items-center justify-center rounded-[24px] bg-card p-6">
              <p className="text-sm text-national-red" role="alert">
                {error}
              </p>
            </div>
          ) : (
            <GovAdminAuditLogTable
              rows={rows}
              search={search}
              onSearchChange={handleSearchChange}
              currentPage={currentPage}
              totalPages={totalPages}
              totalResults={totalResults}
              resultsPerPage={RESULTS_PER_PAGE}
              onPageChange={setCurrentPage}
              onViewDetails={handleViewDetails}
              isLoading={isLoading}
            />
          )}
        </div>
      </main>
      <GovAdminAuditLogDetailsPanel
        row={selectedRow}
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
      />
    </div>
  )
}
