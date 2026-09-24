'use client'

import { WalletHeroCard } from '@/components/molecules/hero-card-citizen-dashboard/hero-card-citizen-dashboard'
import { ActivityOverviewCard } from '@/components/molecules/activity-overview-card/activity-overview-card'
import { CredentialsList } from '@/components/molecules/credentials-list/credentials-list'
import { TrustedDevices } from '@/components/molecules/trusted-devices/trusted-devices'
import { NotificationsList } from '@/components/molecules/notifications-list/notifications-list'
import { AccountCardCitizenDashboard } from '@/components/molecules/citizen-dashboard-account-card/citizen-dashboard-account-card'
import { FraudAlertFlow } from '@/components/organisms/fraud-alert-flow'
import type { SecurityAlert } from '@/components/organisms/fraud-alert-flow'

const demoSecurityAlert: SecurityAlert = {
  id: 'demo-impossible-travel-alert',
  severity: 'high',
  title: 'High risk security event',
  summary:
    'We detected a possible impossible travel attempt on your account. Please review the details and secure your account.',
  detailsDescription:
    'This appears to be an impossible travel attempt based on location, time and device information.',
  newLogin: {
    location: 'London, UK',
    timestamp: 'May 14, 2026 • 16:22',
  },
  previousLogin: {
    location: 'Johannesburg, ZA',
    timestamp: 'May 12, 2026 • 09:14',
  },
  travel: {
    distance: '5,200 km',
    impliedSpeed: '612 km/h',
    timeBetweenLogins: '~2 days, 7 hours',
  },
  device: {
    name: 'Chrome on Windows',
    ipAddress: 'Masked for your security',
    locationAccuracy: 'Approximate location',
  },
}

export default function CitizenDashboardPage() {
  return (
    <div className="flex min-h-full overflow-x-hidden bg-[#f6f2ea]">
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
        <div className="mt-4 grid min-h-0 flex-1 grid-cols-1 gap-4 lg:mt-6 lg:grid-cols-12 lg:gap-6">
          <section className="min-w-0 space-y-4 lg:col-span-8 lg:space-y-6">
            <FraudAlertFlow alert={demoSecurityAlert} />
            <WalletHeroCard />
            <CredentialsList />
            <NotificationsList />
          </section>
          <aside className="min-w-0 space-y-4 lg:col-span-4 lg:space-y-6">
            <AccountCardCitizenDashboard />
            <div id="activity-overview">
              <ActivityOverviewCard />
            </div>
            <div id="trusted-devices-overview">
              <TrustedDevices />
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}