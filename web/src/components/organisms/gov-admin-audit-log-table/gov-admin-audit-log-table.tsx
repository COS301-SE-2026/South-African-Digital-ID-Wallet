'use client'
import { Eye } from 'lucide-react'
import { Text } from '@/components/atoms/text'
import { TablePagination } from '@/components/molecules/table-pagination'
import type { GovAdminAuditLogTableProps } from './types'

const formatDate = (value: string) =>
  new Date(value).toLocaleString('en-GB', {
    dateStyle: 'short',
    timeStyle: 'short',
  })

export const GovAdminAuditLogTable = ({
  rows,
  search,
  onSearchChange,
  currentPage,
  totalPages,
  totalResults,
  resultsPerPage,
  onPageChange,
  onViewDetails,
  isLoading,
}: Readonly<GovAdminAuditLogTableProps>) => {
  const hasSearch = search.trim().length > 0

  return (
    <div className="flex h-full w-full flex-col rounded-[24px] bg-card p-6">
      <div className="shrink-0">
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by Action, User, Role..."
          aria-label="Search audit logs"
          className="h-12 w-full rounded-2xl border border-black/15 bg-card px-4 text-sm text-text-primary outline-none placeholder:text-muted-text focus:border-primary-green focus:ring-1 focus:ring-primary-green"
        />
      </div>

      {isLoading ? (
        <div
          className="flex flex-1 items-center justify-center text-center"
          aria-busy="true"
        >
          <Text as="span" variant="sub-sm" className="!text-sm text-muted-text">
            Loading audit logs…
          </Text>
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-center">
          <Text as="span" variant="sub-sm" className="!text-sm text-muted-text">
            {hasSearch
              ? 'No matching audit log entries found.'
              : 'No audit log entries found.'}
          </Text>
        </div>
      ) : (
        <>
          <ul className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto md:hidden">
            {rows.map((row) => (
              <li
                key={row.id}
                className="rounded-2xl border border-black/10 bg-card p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p
                      className={`break-words text-sm font-bold [overflow-wrap:anywhere] ${
                        row.outcome === 'Success'
                          ? 'text-text-primary'
                          : 'text-national-red'
                      }`}
                    >
                      {row.action}
                    </p>
                    <p className="mt-1 text-xs text-muted-text">
                      {formatDate(row.createdAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onViewDetails(row)}
                    className="shrink-0 text-muted-text transition hover:text-deep-green"
                    aria-label={`View details for ${row.action}`}
                    data-cy={`view-gov-audit-details-mobile-${row.id}`}
                  >
                    <Eye className="h-6 w-6" />
                  </button>
                </div>
                <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
                  <dt className="font-bold uppercase tracking-wide text-muted-text">
                    User
                  </dt>
                  <dd
                    className="truncate font-semibold text-text-primary"
                    title={row.userName ?? undefined}
                  >
                    {row.userName ?? 'Unknown'}
                  </dd>
                  <dt className="font-bold uppercase tracking-wide text-muted-text">
                    Role
                  </dt>
                  <dd className="truncate font-semibold text-text-primary">
                    {row.role ?? 'Unknown'}
                  </dd>
                </dl>
              </li>
            ))}
          </ul>

          <div className="mt-4 hidden min-h-0 flex-1 overflow-auto pr-1 md:block">
            <table className="w-full table-fixed border-collapse">
              <thead className="sticky top-0 z-10 bg-card">
                <tr className="border-b border-black/10">
                  {['Time', 'Action', 'User', 'Role', 'Details'].map(
                    (label, i) => (
                      <th
                        key={label}
                        className={`px-4 py-3 text-left ${
                          [
                            'w-[18%]',
                            'w-[27%]',
                            'w-[25%]',
                            'w-[20%]',
                            'w-[10%]',
                          ][i]
                        }`}
                      >
                        <Text
                          as="span"
                          variant="caption"
                          className="whitespace-nowrap !text-[11px] font-bold uppercase tracking-wide text-muted-text"
                        >
                          {label}
                        </Text>
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`border-b border-black/10 align-middle ${
                      index % 2 === 0 ? 'bg-card' : 'bg-black/[0.02]'
                    }`}
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-text-primary">
                      {formatDate(row.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        title={row.action}
                        className={`block break-words text-xs font-bold leading-4 [overflow-wrap:anywhere] ${
                          row.outcome === 'Success'
                            ? 'text-text-primary'
                            : 'text-national-red'
                        }`}
                      >
                        {row.action}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        title={row.userName ?? undefined}
                        className="block truncate text-xs font-semibold text-text-primary"
                      >
                        {row.userName ?? '- Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="block truncate text-xs font-semibold text-text-primary">
                        {row.role ?? 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => onViewDetails(row)}
                        className="text-muted-text transition hover:text-deep-green"
                        aria-label={`View details for ${row.action}`}
                        data-cy={`view-gov-audit-details-${row.id}`}
                      >
                        <Eye className="h-6 w-6" />
                      </button>
                    </td>
                  </tr>
                ))}
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
  )
}
