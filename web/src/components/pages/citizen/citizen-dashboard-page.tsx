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
}
