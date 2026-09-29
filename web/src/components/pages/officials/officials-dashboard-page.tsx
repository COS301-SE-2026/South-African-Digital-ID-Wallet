'use client'
import { useEffect, useState } from 'react'
import { IdCard, QrCode, UserPlus } from 'lucide-react'
import { QuickActionsCard } from '@/components/molecules/quick-action-card/quick-action-card'
import { ActivityCard } from '@/components/organisms/activity-card/activity-card'
import { AuditLogTable } from '@/components/organisms/audit-log-table/audit-log-table'
import {
  getOfficialActivity,
  getOfficialAuditLogs,
} from '@/services/official-dashboard-service'
import type {
  AuditLogItem,
  OfficialActivityItem,
} from '@/services/official-dashboard-service/types'

const AUDIT_LOG_PAGE_SIZE = 7
const SEARCH_DEBOUNCE_MS = 300

export default function OfficialsDashboardPage() {
  const [activity, setActivity] = useState<OfficialActivityItem[]>([])
  const [activityError, setActivityError] = useState<string | null>(null)
  useEffect(() => {
    let ignore = false
    const load = async () => {
      setActivityError(null)
      try {
        const res = await getOfficialActivity(5)
        if (!ignore) setActivity(res.items)
      } catch (err) {
        console.error('Failed to load official activity', err)
        if (!ignore) setActivityError('Could not load recent activity.')
      }
    }
    load()
    return () => {
      ignore = true
    }
  }, [])

  const [rows, setRows] = useState<AuditLogItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [auditLoading, setAuditLoading] = useState(true)
  const [auditError, setAuditError] = useState<string | null>(null)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timeout)
  }, [search])

  useEffect(() => {
    let ignore = false
    const load = async () => {
      setAuditLoading(true)
      setAuditError(null)
      try {
        const res = await getOfficialAuditLogs({
          page,
          pageSize: AUDIT_LOG_PAGE_SIZE,
          search: debouncedSearch.trim() || undefined,
        })
        if (!ignore) {
          setRows(res.items)
          setTotalCount(res.totalCount)
        }
      } catch (err) {
        console.error('Failed to load audit logs', err)
        if (!ignore) {
          setAuditError('Could not load audit logs.')
          setRows([])
          setTotalCount(0)
        }
      } finally {
        if (!ignore) setAuditLoading(false)
      }
    }
    load()
    return () => {
      ignore = true
    }
  }, [page, debouncedSearch])

  const totalPages = Math.max(1, Math.ceil(totalCount / AUDIT_LOG_PAGE_SIZE))

  return (
    <div className="flex min-h-full overflow-x-hidden bg-[#f6f2ea]">
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <QuickActionsCard
            icon={<UserPlus className="h-5 w-5" />}
            title="Onboard Citizen"
            description="Register a new citizen onto FlashID."
            href="/officials/onboard-citizen"
          />
          <QuickActionsCard
            icon={<IdCard className="h-5 w-5" />}
            title="Issue Drivers License"
            description="Issue a driver's license to an active citizen."
            href="/officials/issue-drivers-license"
          />
          <QuickActionsCard
            icon={<QrCode className="h-5 w-5" />}
            title="Verify QR Code"
            description="Scan and verify a citizen's QR code."
            href="/officials/verifications"
          />
        </div>
        <div className="mt-4 grid min-h-0 flex-1 grid-cols-1 gap-4 lg:mt-6 lg:grid-cols-12 lg:gap-6">
          <section className="min-w-0 lg:col-span-4">
            {activityError ? (
              <p className="text-sm text-red-600" role="alert">
                {activityError}
              </p>
            ) : (
              <ActivityCard activity={activity} />
            )}
          </section>
          <section className="min-w-0 lg:col-span-8">
            {auditError ? (
              <p className="text-sm text-red-600" role="alert">
                {auditError}
              </p>
            ) : (
              <AuditLogTable
                rows={rows}
                search={search}
                onSearchChange={setSearch}
                currentPage={page}
                totalPages={totalPages}
                totalResults={totalCount}
                resultsPerPage={AUDIT_LOG_PAGE_SIZE}
                onPageChange={setPage}
                isLoading={auditLoading}
              />
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
