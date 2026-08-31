'use client'
import { UserPlus, IdCard, QrCode } from 'lucide-react'
import { QuickActionsCard } from '@/components/molecules/quick-action-card/quick-action-card'
import { ActivityCard } from '@/components/organisms/activity-card/activity-card'
import { AuditLogTable } from '@/components/organisms/audit-log-table/audit-log-table'

export default function OfficialsDashboardPage() {
  return (
    <div className="flex min-h-full overflow-x-hidden bg-[#f6f2ea]">
      <main className="flex flex-1 min-h-0 flex-col overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
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
            description="Scan and verify a citizens QR code."
            href="/officials/verifications"
          />
        </div>
        <div className="mt-4 grid flex-1 min-h-0 grid-cols-1 gap-4 lg:mt-6 lg:grid-cols-12 lg:gap-6">
          <section className="min-w-0 lg:col-span-4">
            <ActivityCard />
          </section>
          <section className="min-w-0 lg:col-span-8">
            <AuditLogTable />
          </section>
        </div>
      </main>
    </div>
  )
}
