'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { type UserRole, DEFAULT_USER_ROLE_DASHBOARD } from '@/types/roles'
import { getAllowedRoles } from '@/config/roles/route-permissions'
import { useUser } from '@/context/user-context'
import { AppSidebar } from '../../organisms/app-sidebar/app-sidebar'
import { AppTopBar } from '../../organisms/app-top-bar/app-top-bar'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const header = pageHeaders[pathname] ?? defaultPageHeader
  const { user, loading, logout } = useUser()
  const router = useRouter()

  const allowed = !loading && user ? getAllowedRoles(pathname) : null
  const hasAccess =
    !!user && (!allowed || allowed.includes(user.role as UserRole))

  useEffect(() => {
    if (loading) {
      return
    }
    if (!user) {
      router.replace('/')
      return
    }
    if (!hasAccess) {
      router.replace(DEFAULT_USER_ROLE_DASHBOARD[user.role as UserRole] ?? '/')
    }
  }, [user, loading, pathname, router, hasAccess])

  if (loading) {
    return <div>Load</div>
  }

  if (!user || !hasAccess) {
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

  const idLabel = user
    ? `ID: ••••••${String(user.saId ?? user.userId).slice(-3)}`
    : ''

  return (
    <div className=" flex h-screen overflow-hidden">
      <AppSidebar
        navSections={navSections}
        user={{ name: displayName, initials, idLabel }}
        onLogout={logout}
      />

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="p-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <AppSidebar
            navSections={navSections}
            user={{ name: displayName, initials, idLabel }}
            onLogout={logout}
            variant="mobile"
            onNavigate={() => setMobileNavOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        <AppTopBar
          title={header.title}
          description={header.description}
          user={{ name: displayName, initials }}
          showNotifications={false}
          onMenuClick={() => setMobileNavOpen(true)}
        />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
