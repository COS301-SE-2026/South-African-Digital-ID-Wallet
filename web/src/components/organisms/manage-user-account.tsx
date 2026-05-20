'use client'

import * as React from 'react'
import { AppSidebar } from '@/components/organisms/app-sidebar'
import { AppTopBar } from '@/components/organisms/app-top-bar'
import { AccountCard, ActivityOverviewCard } from '@/components/molecules'
import {
  ChangePasswordModal,
  AccountTerminationModal,
} from '@/components/molecules'
import type { SidebarNavSection } from '@/types/navigation'

const navSections: SidebarNavSection[] = [
  {
    title: 'Citizen Portal',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
      { label: 'My Credentials', href: '/credentials', icon: 'credentials' },
      { label: 'Share QR Code', href: '/share-qr', icon: 'qr' },
      { label: 'Verifications', href: '/verifications', icon: 'users' },
      { label: 'Notifications', href: '/notifications', icon: 'notifications' },
    ],
  },
  {
    title: 'Security',
    items: [
      {
        label: 'Login & Biometrics',
        href: '/login-biometrics',
        icon: 'biometrics',
      },
      {
        label: 'Verification History',
        href: '/verification-history',
        icon: 'history',
      },
      {
        label: 'Privacy Settings',
        href: '/privacy-settings',
        icon: 'settings',
      },
      {
        label: 'Security & Recovery',
        href: '/security-recovery',
        icon: 'shield',
      },
    ],
  },
]

const user = {
  name: 'Unathi Tshakalisa',
  initials: 'UT',
  idLabel: '••••084',
}

export function ManageUserAccount() {
  const [showModal, setShowModal] = React.useState(false)
  const [showTerminate, setShowTerminate] = React.useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar navSections={navSections} user={user} />

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
