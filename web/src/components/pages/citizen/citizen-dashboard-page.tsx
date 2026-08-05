'use client'

import {
  AccountCardCitizenDashboard,
  ActivityOverviewCard,
  CredentialsList,
  NotificationsList,
  TrustedDevices,
  WalletHeroCard,
} from '@/components/molecules'

export default function CitizenDashboardPage() {
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
