'use client'
import { Text } from '@/components/atoms/text'
import { TablePagination } from '@/components/molecules/table-pagination'
import type { AuditLogTableProps } from './types'

const humanizeAction = (action: string) =>
  action.replace(/([a-z0-9])([A-Z])/g, '$1 $2')

const formatSaId = (saId: string) =>
  /^\d{13}$/.test(saId)
    ? `${saId.slice(0, 6)} ${saId.slice(6, 10)} ${saId.slice(10)}`
    : saId

export const AuditLogTable = ({
  rows,
  search,
  onSearchChange,
  currentPage,
  totalPages,
  totalResults,
  resultsPerPage,
  onPageChange,
  isLoading,
}: Readonly<AuditLogTableProps>) => {
  const hasSearch = search.trim().length > 0

  return (
    <div className="flex h-full w-full flex-col rounded-[26px] bg-gradient-to-r from-black via-accent-gold via-national-red via-national-blue to-primary-green p-[2px]">
      <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-[24px] bg-card p-6">
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
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by action, citizen or official..."
            aria-label="Search audit logs by action, citizen or official"
            className="h-12 w-full rounded-2xl border border-black/15 bg-card px-4 text-sm text-text-primary outline-none placeholder:text-muted-text focus:border-primary-green focus:ring-1 focus:ring-primary-green"
          />
        </div>
        {isLoading ? (
          <div
            className="flex flex-1 items-center justify-center text-center"
            aria-busy="true"
          >
            <Text
              as="span"
              variant="sub-sm"
              className="!text-sm text-muted-text"
            >
              Loading audit logs…
            </Text>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-center">
            <Text
              as="span"
              variant="sub-sm"
              className="!text-sm text-muted-text"
            >
              {hasSearch
                ? 'No matching audit log entries found.'
                : 'No audit log entries found.'}
            </Text>
          </div>
        ) : (
          <>
            <div className="mt-4 min-h-0 flex-1 overflow-auto pr-1">
              <table className="w-full min-w-[520px] table-fixed border-collapse">
                <thead className="sticky top-0 z-10 bg-card">
                  <tr className="border-b border-black/10">
                    <th className="w-[16%] px-4 py-3 text-left">
                      <Text
                        as="span"
                        variant="caption"
                        className="whitespace-nowrap !text-[11px] font-bold uppercase tracking-wide text-muted-text"
                      >
                        Date &amp; Time
                      </Text>
                    </th>
                    <th className="w-[20%] px-4 py-3 text-left">
                      <Text
                        as="span"
                        variant="caption"
                        className="whitespace-nowrap !text-[11px] font-bold uppercase tracking-wide text-muted-text"
                      >
                        Action
                      </Text>
                    </th>
                    <th className="w-[30%] px-4 py-3 text-left">
                      <Text
                        as="span"
                        variant="caption"
                        className="whitespace-nowrap !text-[11px] font-bold uppercase tracking-wide text-muted-text"
                      >
                        Citizen / Details
                      </Text>
                    </th>
                    <th className="w-[19%] px-4 py-3 text-left">
                      <Text
                        as="span"
                        variant="caption"
                        className="whitespace-nowrap !text-[11px] font-bold uppercase tracking-wide text-muted-text"
                      >
                        Performed By
                      </Text>
                    </th>
                    <th className="w-[15%] px-4 py-3 text-left">
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
                  {rows.map((row, index) => {
                    const date = new Date(row.createdAt)
                    return (
                      <tr
                        key={row.id}
                        className={`border-b border-black/10 align-top ${
                          index % 2 === 0 ? 'bg-card' : 'bg-black/[0.02]'
                        }`}
                      >
                        <td className="whitespace-nowrap px-4 py-3">
                          <div className="!text-xs font-medium text-text-primary">
                            {date.toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                          <div className="mt-1 !text-[11px] text-muted-text">
                            {date.toLocaleTimeString('en-GB', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="!text-xs font-semibold leading-4 text-text-primary">
                            {humanizeAction(row.action)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {row.citizenName ? (
                            <>
                              <div className="truncate !text-xs font-semibold text-text-primary">
                                {row.citizenName}
                              </div>
                              {row.citizenSaId ? (
                                <div className="mt-0.5 truncate whitespace-nowrap !text-[11px] tabular-nums text-muted-text">
                                  {formatSaId(row.citizenSaId)}
                                </div>
                              ) : null}
                            </>
                          ) : (
                            <span className="!text-xs text-muted-text">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="truncate !text-xs text-text-primary">
                            {row.performedBy}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 !text-[11px] font-medium ${
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
                resultsPerPage={resultsPerPage}
                onPageChange={onPageChange}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
