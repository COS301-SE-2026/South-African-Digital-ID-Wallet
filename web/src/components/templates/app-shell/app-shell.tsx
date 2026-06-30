'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { type UserRole, DEFAULT_USER_ROLE_DASHBOARD } from '@/types/roles'
import { getAllowedRoles } from '@/config/roles/route-permissions'
import { useUser } from '@/context/user-context'
import { AppSidebar } from '../../organisms/app-sidebar/app-sidebar'
import { AppTopBar } from '../../organisms/app-top-bar/app-top-bar'
import {
  officialsNavSections,
  citizenNavSections,
  governmentAdminNavSections,
} from '@/config/navigation/navigation'
import {
  defaultPageHeader,
  pageHeaders,
} from '@/config/page-headers/page-headers'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const header = pageHeaders[pathname] ?? defaultPageHeader
  const { user, loading, logout } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (loading) {
      return
    }
    if (!user) {
      router.replace('/')
      return
    }
    const allowed = getAllowedRoles(pathname)
    if (allowed && !allowed.includes(user.role as UserRole)) {
      router.replace(DEFAULT_USER_ROLE_DASHBOARD[user.role as UserRole] ?? '/')
    }
  }, [user, loading, pathname, router])

  if (!loading && !user) {
    return null
  }

  let navSections = citizenNavSections

  if (user?.role === 'Official') {
    navSections = officialsNavSections
  } else if (user?.role === 'GovernmentAdministrator') {
    navSections = governmentAdminNavSections
  } else if (user?.role === 'Citizen') {
    navSections = citizenNavSections
  }

  const displayName = user
    ? `${user.names ?? ''} ${user.surname ?? ''}`.trim() || user.email
    : ''

  const initials = user
    ? (user.names?.[0] ?? user.email?.[0] ?? 'U') + (user.surname?.[0] ?? '')
    : ''

  const idLabel = user ? `ID: ••••••${String(user.userId).slice(-3)}` : ''

  return (
    <div className=" flex h-screen overflow-hidden">
      {/* TODO: Update navSections to work with loggeed in user role :)*/}
      <AppSidebar
        navSections={navSections}
        user={{ name: displayName, initials, idLabel }}
        onLogout={logout}
      />
      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        <AppTopBar
          title={header.title}
          description={header.description}
          user={{ name: displayName, initials }}
          showNotifications={false}
        />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
