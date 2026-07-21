'use client'

import { WalletHeroCard } from '@/components/molecules/hero-card-citizen-dashboard/hero-card-citizen-dashboard'
import { ActivityOverviewCard } from '@/components/molecules/activity-overview-card/activity-overview-card'
import { CredentialsList } from '@/components/molecules/credentials-list/credentials-list'
import { TrustedDevices } from '@/components/molecules/trusted-devices/trusted-devices'
import { NotificationsList } from '@/components/molecules/notifications-list/notifications-list'
import { useUser } from '@/context/user-context'
import { AccountCardCitizenDashboard } from '@/components/molecules/citizen-dashboard-account-card/citizen-dashboard-account-card'

export default function CitizenDashboardPage() {
  const { user } = useUser()

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f2ea]">
      <main className="flex-1 p-6 flex flex-col min-h-0 overflow-auto">
        <div className="grid grid-cols-12 gap-6 mt-6 flex-1 min-h-0">
          <section className="col-span-8 space-y-6 min-h-0">
            <WalletHeroCard />
            <CredentialsList />
            <NotificationsList />
          </section>

          <aside className="col-span-4 space-y-6 min-h-0">
            <AccountCardCitizenDashboard />
            <ActivityOverviewCard />
            <TrustedDevices />
          </aside>
        </div>
      </main>
    </div>
  )
}
