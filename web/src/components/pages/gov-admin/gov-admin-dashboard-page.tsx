'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Building2,
  IdCard,
  Users,
  UploadCloud,
  ShieldCheck,
  Landmark,
} from 'lucide-react'
import { AdminStatCard } from '@/components/molecules/admin-stat-card/admin-stat-card'
import type { AdminStatItem } from '@/components/molecules/admin-stat-card/types'
import { AdminActivityFeed } from '@/components/organisms/admin-activity-feed/admin-activity-feed'
import { AnalyticsOverview } from '@/components/organisms/analytics-overview/analytics-overview'
import type {
  AnalyticsOverviewData,
  AnalyticsRange,
} from '@/components/organisms/analytics-overview/types'
import { QuickActionsRow } from '@/components/organisms/quick-action-row/quick-action-row'
import {
  getGovernmentAdminDashboardSummary,
  getGovernmentAdminAnalytics,
} from '@/services/gov-admin-dashboard-service'

const QUICK_ACTIONS = [
  {
    key: 'upload-institution',
    icon: <UploadCloud className="h-5 w-5" />,
    title: 'Upload Institution',
    description: 'Register a new institution',
    href: '/gov-admin/upload-institution',
  },
  {
    key: 'manage-credentials',
    icon: <ShieldCheck className="h-5 w-5" />,
    title: 'Manage Credentials',
    description: 'Issue, revoke, or review issued credentials',
    href: '/gov-admin/manage-credentials',
  },
  {
    key: 'view-institutions',
    icon: <Landmark className="h-5 w-5" />,
    title: 'View Institutions',
    description: 'Browse registered institutions',
    href: '/gov-admin/view-institutions',
  },
]

const EMPTY_ANALYTICS: AnalyticsOverviewData = {
  rangeDays: 30,
  verifications: {
    value: 0,
    changePct: 0,
    series: [],
  },
  credentialsIssued: {
    value: 0,
    changePct: 0,
    series: [],
  },
  activeOfficials: {
    value: 0,
    changePct: 0,
    series: [],
  },
  activeInstitutions: {
    value: 0,
    changePct: 0,
    series: [],
  },
}

export default function GovAdminDashboardPage() {
  const [analyticsRange, setAnalyticsRange] = useState<AnalyticsRange>('30d')
  const {
    data: dashboardSummary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
  } = useQuery({
    queryKey: ['gov-admin-dashboard-summary'],
    queryFn: getGovernmentAdminDashboardSummary,
    staleTime: 15 * 1000,
  })
  const {
    data: analytics,
    isLoading: isAnalyticsLoading,
    isError: isAnalyticsError,
  } = useQuery({
    queryKey: ['gov-admin-dashboard-analytics', analyticsRange],
    queryFn: () => getGovernmentAdminAnalytics(analyticsRange),
    staleTime: 60 * 1000,
  })

  const statItems: AdminStatItem[] = [
    {
      icon: Users,
      label: 'Users',
      value: dashboardSummary?.counts.users ?? 0,
      href: '/gov-admin/users',
    },
    {
      icon: Building2,
      label: 'Institutions',
      value: dashboardSummary?.counts.institutions ?? 0,
      href: '/gov-admin/institutions',
    },
    {
      icon: IdCard,
      label: 'Credentials Issued',
      value: dashboardSummary?.counts.credentialsIssued ?? 0,
      href: '/gov-admin/credentials',
    },
  ]

  return (
    <div className="flex min-h-full overflow-x-hidden bg-[#f6f2ea]">
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
          <div className="flex min-w-0 flex-col gap-4 lg:col-span-4">
            <QuickActionsRow actions={QUICK_ACTIONS} />
            <AdminStatCard items={statItems} />
          </div>
          <section className="min-w-0 min-h-0 lg:col-span-8">
            <AdminActivityFeed items={dashboardSummary?.activityFeed ?? []} />
          </section>
        </div>
        <div className="mt-4 lg:mt-6">
          <AnalyticsOverview
            data={analytics ?? EMPTY_ANALYTICS}
            range={analyticsRange}
            onRangeChange={setAnalyticsRange}
          />
        </div>
      </main>
    </div>
  )
}
