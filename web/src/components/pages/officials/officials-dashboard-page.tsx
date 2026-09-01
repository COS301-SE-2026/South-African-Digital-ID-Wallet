'use client'
import { IdCard, QrCode, UserPlus } from 'lucide-react'
import { QuickActionsCard } from '@/components/molecules/quick-action-card/quick-action-card'
import { ActivityCard } from '@/components/organisms/activity-card/activity-card'
import { AuditLogTable } from '@/components/organisms/audit-log-table/audit-log-table'
import type { AuditLogItem } from '@/components/organisms/audit-log-table/types'
import type { OfficialActivityItem } from '@/components/organisms/activity-card/types'

const MOCK_ACTIVITY: OfficialActivityItem[] = [
  {
    id: '1',
    eventType: 'OnboardCitizen',
    details: 'Maria Nkosi was successfully onboarded.',
    createdAt: '2026-09-01T10:24:00Z',
  },
  {
    id: '2',
    eventType: 'DriverLicenseIssued',
    details: "Driver's license issued to Maria Nkosi.",
    createdAt: '2026-09-01T10:20:00Z',
  },
  {
    id: '3',
    eventType: 'QrCodeVerified',
    details: "Verified driver's license for Johan Meyer.",
    createdAt: '2026-09-01T09:55:00Z',
  },
  {
    id: '4',
    eventType: 'OnboardCitizen',
    details: 'Thabo Mokoena was successfully onboarded.',
    createdAt: '2026-09-01T09:30:00Z',
  },
  {
    id: '5',
    eventType: 'OnboardCitizenFailed',
    details: 'Citizen onboarding failed for Lerato Nkosi.',
    createdAt: '2026-09-01T09:10:00Z',
  },
]

const MOCK_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: '1',
    createdAt: '2026-09-01T08:30:00',
    action: 'Citizen Onboarded',
    citizenName: 'Thabo Mokoena',
    citizenIdMasked: '900101•••••••',
    performedBy: 'Sarah Williams',
    outcome: 'Success',
  },
  {
    id: '2',
    createdAt: '2026-09-01T09:15:00',
    action: "Driver's License Issued",
    citizenName: 'Lerato Nkosi',
    citizenIdMasked: '950512•••••••',
    performedBy: 'John Smith',
    outcome: 'Success',
  },
  {
    id: '3',
    createdAt: '2026-09-01T09:40:00',
    action: 'QR Code Verified',
    citizenName: 'Johan Meyer',
    citizenIdMasked: '880723•••••••',
    performedBy: 'Sarah Williams',
    outcome: 'Success',
  },
  {
    id: '4',
    createdAt: '2026-09-01T10:05:00',
    action: 'Citizen Onboarded',
    citizenName: 'Nomsa Dlamini',
    citizenIdMasked: '910215•••••••',
    performedBy: 'Thabo Nkosi',
    outcome: 'Success',
  },
  {
    id: '5',
    createdAt: '2026-09-01T10:25:00',
    action: 'Citizen Onboarding Failed',
    citizenName: 'Lerato Nkosi',
    citizenIdMasked: '950512•••••••',
    performedBy: 'John Smith',
    outcome: 'Failed',
  },
]

export default function OfficialsDashboardPage() {
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
            <ActivityCard activity={MOCK_ACTIVITY} />
          </section>
          <section className="min-w-0 lg:col-span-8">
            <AuditLogTable rows={MOCK_AUDIT_LOGS} />
          </section>
        </div>
      </main>
    </div>
  )
}
