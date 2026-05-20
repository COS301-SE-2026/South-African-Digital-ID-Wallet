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

  return null
}
