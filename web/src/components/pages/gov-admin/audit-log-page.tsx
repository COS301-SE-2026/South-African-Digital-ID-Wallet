'use client'
import { useMemo, useState } from 'react'
import { Text } from '@/components/atoms/text'
import { GovAdminAuditLogTable } from '@/components/organisms/gov-admin-audit-log-table'
import { GovAdminAuditLogDetailsPanel } from '@/components/organisms/gov-admin-audit-log-table/gov-admin-audit-log-details-panel'
import type { GovAdminAuditLogRow } from '@/components/organisms/gov-admin-audit-log-table/types'

const RESULTS_PER_PAGE = 10

const MOCK_AUDIT_LOGS: GovAdminAuditLogRow[] = [
  {
    id: '1',
    createdAt: '2024-06-02T10:42:15',
    action: 'REVOKE_CREDENTIAL',
    outcome: 'Success',
    userName: 'Nomsa P. Dlamini',
    role: 'Government Administrator',
    entityType: "Driver's Licence",
    entityId: 'DL-2024-0089123',
    description: "Driver's Licence revoked by administrator.",
    ipAddress: '102.168.1.23',
    device: 'Windows 11 • Chrome 125.0',
    location: 'Pretoria, South Africa',
    previousStatus: 'Active',
    newStatus: 'Revoked',
    revocationReason: 'Document compromised',
  },
  {
    id: '2',
    createdAt: '2024-06-02T10:40:02',
    action: 'ISSUE_CREDENTIAL',
    outcome: 'Success',
    userName: 'Thabo Ndlovu',
    role: 'Government Administrator',
    entityType: 'ID Document',
    entityId: 'ID-2024-0001234',
    description: 'ID Document issued to citizen.',
    ipAddress: '102.168.1.23',
    device: 'Windows 11 • Chrome 125.0',
    location: 'Pretoria, South Africa',
  },
  {
    id: '3',
    createdAt: '2024-06-02T10:31:48',
    action: 'LOGIN_SUCCESS',
    outcome: 'Success',
    userName: 'Thandi Mokoena',
    role: 'Super Administrator',
    entityType: undefined,
    entityId: undefined,
    description: 'Successful login via Web Portal.',
    ipAddress: '102.168.1.23',
    device: 'Windows 11 • Chrome 125.0',
    location: 'Pretoria, South Africa',
  },
  {
    id: '4',
    createdAt: '2024-06-02T10:28:19',
    action: 'UPDATE_OFFICIAL',
    outcome: 'Success',
    userName: 'Mandla Bhengu',
    role: 'Government Administrator',
    entityType: 'Official Profile',
    entityId: 'OFF-000245',
    description: 'Official profile details updated.',
    ipAddress: '102.168.1.23',
    device: 'Windows 11 • Chrome 125.0',
    location: 'Pretoria, South Africa',
  },
  {
    id: '5',
    createdAt: '2024-06-02T10:19:07',
    action: 'CREATE_INSTITUTION',
    outcome: 'Success',
    userName: 'Thandi Mokoena',
    role: 'Super Administrator',
    entityType: 'Institution',
    entityId: 'INS-000078',
    description: 'New institution created.',
    ipAddress: '102.168.1.23',
    device: 'Windows 11 • Chrome 125.0',
    location: 'Pretoria, South Africa',
  },
  {
    id: '6',
    createdAt: '2024-06-02T10:12:33',
    action: 'PASSWORD_RESET',
    outcome: 'Success',
    userName: 'Nomsa P. Dlamini',
    role: 'Government Administrator',
    entityType: 'Official',
    entityId: 'OFF-000311',
    description: 'Password reset for official account.',
    ipAddress: '102.168.1.23',
    device: 'Windows 11 • Chrome 125.0',
    location: 'Pretoria, South Africa',
  },
]

export default function AuditLogPage() {
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRow, setSelectedRow] = useState<GovAdminAuditLogRow | null>(
    null
  )
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return MOCK_AUDIT_LOGS
    return MOCK_AUDIT_LOGS.filter((row) =>
      [
        row.action,
        row.userName,
        row.role,
        row.entityType,
        row.entityId,
        row.ipAddress,
      ]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(query))
    )
  }, [search])
  const totalResults = filteredRows.length
  const totalPages = Math.max(1, Math.ceil(totalResults / RESULTS_PER_PAGE))
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * RESULTS_PER_PAGE
    return filteredRows.slice(start, start + RESULTS_PER_PAGE)
  }, [filteredRows, currentPage])
  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }
  const handleViewDetails = (row: GovAdminAuditLogRow) => {
    setSelectedRow(row)
    setIsPanelOpen(true)
  }
  const handleClosePanel = () => {
    setIsPanelOpen(false)
  }
  return (
    <div className="flex h-full w-full flex-col gap-4 p-6">
      <Text
        as="h1"
        variant="sub-sm"
        className="text-2xl font-bold text-deep-green"
      >
        Audit Log
      </Text>
      <GovAdminAuditLogTable
        rows={paginatedRows}
        search={search}
        onSearchChange={handleSearchChange}
        currentPage={currentPage}
        totalPages={totalPages}
        totalResults={totalResults}
        resultsPerPage={RESULTS_PER_PAGE}
        onPageChange={setCurrentPage}
        onViewDetails={handleViewDetails}
        isLoading={false}
      />
      <GovAdminAuditLogDetailsPanel
        row={selectedRow}
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
      />
    </div>
  )
}
