'use client'

import * as React from 'react'

import { AccountCard, ActivityOverviewCard } from '@/components/molecules'
import {
  ChangePasswordModal,
  AccountTerminationModal,
} from '@/components/molecules'
import { AppSidebar } from '@/components/organisms/app-sidebar'
import { AppTopBar } from '@/components/organisms/app-top-bar'
import { useUser } from '@/context/user-context'
import { manageUserAccountNavSections } from '@/config/navigation'

import type { ManageUserAccountUser } from './types'

const user: ManageUserAccountUser = {
  name: 'Unathi Tshakalisa',
  initials: 'UT',
  idLabel: '••••084',
}

export function ManageUserAccount() {
  const [showModal, setShowModal] = React.useState(false)
  const [showTerminate, setShowTerminate] = React.useState(false)
  const { logout } = useUser()

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar
        navSections={manageUserAccountNavSections}
        user={user}
        onLogout={logout}
      />

      <main className="flex-1 p-4 flex flex-col min-h-0">
        <AppTopBar
          title="Security & Recovery"
          description="Manage your account security, recovery options and data controls."
          user={{ name: user.name, initials: user.initials }}
        />

        <div className="grid grid-cols-2 gap-4 mt-4 flex-1 items-stretch min-h-0 overflow-auto pr-2">
          <div className="min-h-0 flex flex-col h-full">
            <div className="flex-1 h-full">
              <AccountCard />
            </div>
          </div>

          <div className="space-y-4 min-h-0 flex flex-col">
            <div className="flex-1 min-h-0">
              <ActivityOverviewCard />
            </div>

            <div className="bg-card rounded-3xl border p-4 flex flex-col items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="w-full bg-primary py-2 px-4 rounded-2xl text-primary-foreground font-semibold text-sm"
              >
                Change Password
              </button>

              <button
                type="button"
                onClick={() => setShowTerminate(true)}
                className="w-full bg-destructive py-2 px-4 rounded-2xl text-clean-white font-semibold text-sm"
              >
                Terminate Account
              </button>
            </div>
          </div>
        </div>

        <ChangePasswordModal
          open={showModal}
          onCloseAction={() => setShowModal(false)}
        />
        <AccountTerminationModal
          open={showTerminate}
          onCloseAction={() => setShowTerminate(false)}
          onConfirmAction={() => {
            setShowTerminate(false)
            alert('Account terminated demo')
          }}
        />
      </main>
    </div>
  )
}
