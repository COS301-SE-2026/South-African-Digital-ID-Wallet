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

const AUDIT_LOG_FETCH_SIZE = 1000
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
  const [auditLoading, setAuditLoading] = useState(true)
  const [auditError, setAuditError] = useState<string | null>(null)
  useEffect(() => {
    let ignore = false
    const load = async () => {
      setAuditLoading(true)
      setAuditError(null)
      try {
        const res = await getOfficialAuditLogs({
          page: 1,
          pageSize: AUDIT_LOG_FETCH_SIZE,
        })
        if (!ignore) setRows(res.items)
      } catch (err) {
        console.error('Failed to load audit logs', err)
        if (!ignore) {
          setAuditError('Could not load audit logs.')
          setRows([])
        }
      } finally {
        if (!ignore) setAuditLoading(false)
      }
    }
    load()
    return () => {
      ignore = true
    }
  }, [])
  return (
    <div className="flex min-h-full overflow-x-hidden bg-[#f6f2ea]">
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <QuickActionsCard
            icon={<UserPlus className="h-5 w-5" />}
            title="Onboard Citizen"
            description="Register a new citizen onto FlashID."
            href="/onboard-citizen"
          />
          <QuickActionsCard
            icon={<IdCard className="h-5 w-5" />}
            title="Issue Drivers License"
            description="Issue a driver's license to an active citizen."
            href="/officials/issue-license"
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
            ) : auditLoading ? (
              <p className="text-sm text-muted-text">Loading audit logs…</p>
            ) : (
              <AuditLogTable rows={rows} />
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
