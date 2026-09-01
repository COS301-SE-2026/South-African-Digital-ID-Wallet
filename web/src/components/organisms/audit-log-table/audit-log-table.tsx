'use client'
import { useEffect, useMemo, useState } from 'react'
import { Text } from '@/components/atoms/text'
import { TablePagination } from '@/components/molecules/table-pagination'
import type { AuditLogItem } from './types'
const RESULTS_PER_PAGE = 7
const SEARCH_DEBOUNCE_MS = 300

type AuditLogTableProps = {
  rows?: AuditLogItem[]
}

export const AuditLogTable = ({ rows = [] }: AuditLogTableProps) => {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search)
      setCurrentPage(1)
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timeout)
  }, [search])
  const filteredRows = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase()
    if (!query) {
      return rows
    }
    return rows.filter(
      (row) =>
        row.action.toLowerCase().includes(query) ||
        row.performedBy.toLowerCase().includes(query)
    )
  }, [rows, debouncedSearch])
  const totalResults = filteredRows.length
  const totalPages = Math.max(1, Math.ceil(totalResults / RESULTS_PER_PAGE))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedRows = filteredRows.slice(
    (safeCurrentPage - 1) * RESULTS_PER_PAGE,
    safeCurrentPage * RESULTS_PER_PAGE
  )

  return (
    <div className="w-full rounded-[26px] bg-gradient-to-r from-black via-accent-gold via-national-red via-national-blue to-primary-green p-[2px]">
      <div className="flex w-full flex-col overflow-hidden rounded-[24px] bg-card p-6">
        <div className="flex shrink-0 items-center justify-between">
          <Text
            as="h2"
            variant="h4"
            className="!text-lg font-extrabold text-deep-green"
          >
            Audit Log Table
          </Text>
        </div>
        <Text
          as="p"
          variant="sub-sm"
          className="mt-1 shrink-0 !text-xs text-muted-text"
        >
          Records of actions performed in the system.
        </Text>
        <div className="mt-4 shrink-0">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by action or official..."
            aria-label="Search audit logs by action or official"
            className="h-12 w-full rounded-2xl border border-black/15 bg-card px-4 text-sm text-text-primary outline-none placeholder:text-muted-text focus:border-primary-green focus:ring-1 focus:ring-primary-green"
          />
        </div>
        {paginatedRows.length === 0 ? (
          <div className="flex min-h-[280px] items-center justify-center text-center">
            <Text
              as="span"
              variant="sub-sm"
              className="!text-sm text-muted-text"
            >
              {rows.length === 0
                ? 'No audit log entries found.'
                : 'No matching audit log entries found.'}
            </Text>
          </div>
        ) : (
          <>
            <div className="mt-4 max-h-[380px] overflow-y-auto pr-1">
              <table className="w-full min-w-[650px] table-fixed border-collapse">
                <thead className="sticky top-0 z-10 bg-card">
                  <tr className="border-b border-black/10">
                    <th className="w-[18%] px-5 py-3 text-left">
                      <Text
                        as="span"
                        variant="caption"
                        className="whitespace-nowrap !text-[11px] font-bold uppercase tracking-wide text-muted-text"
                      >
                        Date &amp; Time
                      </Text>
                    </th>
                    <th className="w-[20%] px-5 py-3 text-left">
                      <Text
                        as="span"
                        variant="caption"
                        className="whitespace-nowrap !text-[11px] font-bold uppercase tracking-wide text-muted-text"
                      >
                        Action
                      </Text>
                    </th>
                    <th className="w-[25%] px-5 py-3 text-left">
                      <Text
                        as="span"
                        variant="caption"
                        className="whitespace-nowrap !text-[11px] font-bold uppercase tracking-wide text-muted-text"
                      >
                        Citizen / Details
                      </Text>
                    </th>
                    <th className="w-[20%] px-5 py-3 text-left">
                      <Text
                        as="span"
                        variant="caption"
                        className="whitespace-nowrap !text-[11px] font-bold uppercase tracking-wide text-muted-text"
                      >
                        Performed By
                      </Text>
                    </th>
                    <th className="w-[17%] px-5 py-3 text-left">
                      <Text
                        as="span"
                        variant="caption"
                        className="whitespace-nowrap !text-[11px] font-bold uppercase tracking-wide text-muted-text"
                      >
                        Type
                      </Text>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedRows.map((row, index) => {
                    const date = new Date(row.createdAt)
                    return (
                      <tr
                        key={row.id}
                        className={`border-b border-black/10 align-middle ${
                          index % 2 === 0 ? 'bg-card' : 'bg-black/[0.02]'
                        }`}
                      >
                        <td className="whitespace-nowrap px-5 py-4">
                          <div className="!text-xs font-medium text-text-primary">
                            {date.toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                          <div className="mt-1 !text-[11px] text-muted-text">
                            {date.toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>
                        <td className="max-w-0 px-5 py-4">
                          <div className="truncate !text-sm font-semibold text-text-primary">
                            {row.action}
                          </div>
                        </td>
                        <td className="max-w-0 px-5 py-4">
                          <div className="truncate !text-sm font-semibold text-text-primary">
                            {row.citizenName}
                          </div>
                          <div className="truncate !text-xs text-muted-text">
                            {row.citizenIdMasked}
                          </div>
                        </td>
                        <td className="max-w-0 px-5 py-4">
                          <div className="truncate !text-sm text-text-primary">
                            {row.performedBy}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 !text-xs font-medium ${
                              row.outcome === 'Success'
                                ? 'bg-primary-green/10 text-primary-green'
                                : 'bg-national-red/10 text-national-red'
                            }`}
                          >
                            {row.outcome}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-4 shrink-0 border-t border-black/10 pt-3">
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalResults={totalResults}
                resultsPerPage={RESULTS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
