'use client'

import * as React from 'react'
import { AppSidebar } from '@/components/organisms/app-sidebar'
import { AppTopBar } from '@/components/organisms/app-top-bar'
import { AccountCard } from '@/components/molecules/account-card/account-card'
import { ActivityOverviewCard } from '@/components/molecules/activity-overview-card/activity-overview-card'
import { StatusPill } from '@/components/atoms/status-pill/status-pill'
import { useUser } from '@/context/user-context'
import { citizenNavSections } from '@/config/navigation'
import { CredentialsList } from '@/components/molecules/credentials-list/credentials-list'
import { TrustedDevices } from '@/components/molecules/trusted-devices/trusted-devices'
import { NotificationsList } from '@/components/molecules/notifications-list/notifications-list'

export default function CitizenDashboardPage() {
  const { user } = useUser()
  //mock information. change it for actual data stuffs
  const stats = [
    { label: 'Active Credentials', value: 2 },
    { label: 'Verifications This Month', value: 8 },
    { label: 'Security Score', value: '92%' },
  ]

  return (
    <div className="flex h-screen overflow-hidden">
      <main className="flex-1 p-6 flex flex-col min-h-0">
        <div className="grid grid-cols-12 gap-6 mt-6 flex-1 min-h-0 overflow-auto pr-2">
          <section className="col-span-8 space-y-6 min-h-0 flex flex-col">
            <div className="bg-card rounded-3xl border p-6 flex items-center justify-between gap-6">
              <div>
                <StatusPill intent="active">Identity verified</StatusPill>
                <h1 className="text-3xl font-bold mt-3">
                  Your Flash ID wallet is now active.
                </h1>
                <p className="text-muted-text mt-2">
                  Present a secure QR code.
                </p>
                <div className="mt-4 flex gap-3">
                  <button className="bg-primary text-primary-foreground px-4 py-2 rounded-2xl font-semibold">
                    Generate QR Code
                  </button>
                  <button className="bg-muted px-4 py-2 rounded-2xl">
                    Request a New Credential
                  </button>
                </div>
              </div>

              <div className="w-36 h-36 bg-gradient-to-br from-green-600 to-green-400 rounded-2xl flex items-center justify-center text-white font-bold">
                QR
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="bg-card rounded-2xl border p-4">
                  <div className="text-muted-text text-sm">{s.label}</div>
                  <div className="text-2xl font-bold mt-2">{s.value}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
              <div className="min-h-0 flex flex-col">
                <AccountCard />
                <div className="mt-4">
                  <CredentialsList />
                </div>
              </div>

              <div className="space-y-4 min-h-0 flex flex-col">
                <ActivityOverviewCard />
              </div>
            </div>
          </section>

          <aside className="col-span-4 space-y-6">
            <div className="bg-card rounded-3xl border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="rounded-full bg-primary h-12 w-12 flex items-center justify-center text-white font-bold">
                    {(user?.names?.[0] ?? 'U') + (user?.surname?.[0] ?? '')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {user?.names ?? 'Guest User'} {user?.surname ?? ''}
                  </div>
                  <div className="text-muted-text text-sm">
                    {user
                      ? `ID ending ••••${String(user.userId).slice(-3)}`
                      : 'Not signed in'}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-muted-text text-sm">Trust</div>
                <div className="h-3 bg-muted rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-3 bg-gradient-to-r from-green-500 to-yellow-400"
                    style={{ width: '92%' }}
                  />
                </div>
              </div>
            </div>

            <TrustedDevices />

            <NotificationsList />
          </aside>
        </div>
      </main>
    </div>
  )
}
