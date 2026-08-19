'use client'

import { WalletHeroCard } from '@/components/molecules/hero-card-citizen-dashboard/hero-card-citizen-dashboard'
import { ActivityOverviewCard } from '@/components/molecules/activity-overview-card/activity-overview-card'
import { CredentialsList } from '@/components/molecules/credentials-list/credentials-list'
import { TrustedDevices } from '@/components/molecules/trusted-devices/trusted-devices'
import { NotificationsList } from '@/components/molecules/notifications-list/notifications-list'
import { AccountCardCitizenDashboard } from '@/components/molecules/citizen-dashboard-account-card/citizen-dashboard-account-card'

export default function CitizenDashboardPage() {
  return (
    <div className="flex min-h-full overflow-x-hidden bg-[#f6f2ea]">
      <main className="flex flex-1 min-h-0 flex-col overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
        <div className="mt-4 grid flex-1 min-h-0 grid-cols-1 gap-4 lg:mt-6 lg:grid-cols-12 lg:gap-6">
          <section className="min-w-0 space-y-4 lg:col-span-8 lg:space-y-6">
            <WalletHeroCard />
            <CredentialsList />
            <NotificationsList />
          </section>

          <aside className="min-w-0 space-y-4 lg:col-span-4 lg:space-y-6">
            <AccountCardCitizenDashboard />
            <ActivityOverviewCard />
            <TrustedDevices />
          </aside>
        </div>
      </main>
    </div>
  )
}
