'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
// START FLASHID — PROFILE AVATAR PHOTO
import { useQuery } from '@tanstack/react-query'
import { credentialService } from '@/services/credential-service'
import type { CredentialResponse } from '@/services/credential-service/types'
// END FLASHID — PROFILE AVATAR PHOTO

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

// START FLASHID — PROFILE AVATAR PHOTO
const getPreferredCitizenPhotoUrl = (
  credentials: CredentialResponse[] | undefined
) => {
  if (!credentials) return null

  const identityPhoto = credentials.find(
    (credential) =>
      credential.type === 'IdentityDocument' &&
      typeof credential.photoUrl === 'string' &&
      credential.photoUrl.trim().length > 0
  )?.photoUrl
  if (identityPhoto) return identityPhoto.trim()

  const driversLicensePhoto = credentials.find(
    (credential) =>
      credential.type === 'DriversLicense' &&
      typeof credential.photoUrl === 'string' &&
      credential.photoUrl.trim().length > 0
  )?.photoUrl
  return driversLicensePhoto?.trim() ?? null
}
// END FLASHID — PROFILE AVATAR PHOTO

export function AppShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const header = pageHeaders[pathname] ?? defaultPageHeader
  const { user, loading, logout } = useUser()
  const router = useRouter()
  // START FLASHID — PROFILE AVATAR PHOTO
  const { data: credentials } = useQuery({
    queryKey: ['credentials', 'me', user?.userId],
    queryFn: () => credentialService.getMine(),
    enabled: user?.role === 'Citizen' && Boolean(user.userId),
  })
  const photoUrl =
    user?.role === 'Citizen' ? getPreferredCitizenPhotoUrl(credentials) : null
  // END FLASHID — PROFILE AVATAR PHOTO

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
  // START FLASHID — PROFILE AVATAR PHOTO
  const profileUser = { name: displayName, initials, photoUrl }
  // END FLASHID — PROFILE AVATAR PHOTO

  return (
    <div className="flex min-h-screen overflow-hidden lg:h-screen">
      {/* START FLASHID — PROFILE AVATAR PHOTO */}
      <AppSidebar
        navSections={navSections}
        user={profileUser}
        onLogout={logout}
      />
      {/* END FLASHID — PROFILE AVATAR PHOTO */}

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="p-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          {/* START FLASHID — PROFILE AVATAR PHOTO */}
          <AppSidebar
            navSections={navSections}
            user={profileUser}
            onLogout={logout}
            variant="mobile"
            onNavigate={() => setMobileNavOpen(false)}
          />
          {/* END FLASHID — PROFILE AVATAR PHOTO */}
        </SheetContent>
      </Sheet>

      <div className="flex min-h-screen flex-1 flex-col overflow-hidden">
        {/* START FLASHID — PROFILE AVATAR PHOTO */}
        <AppTopBar
          title={header.title}
          description={header.description}
          user={profileUser}
          showNotifications={false}
          onMenuClick={() => setMobileNavOpen(true)}
        />
        {/* END FLASHID — PROFILE AVATAR PHOTO */}
        <div
          className="relative flex-1 overflow-y-auto"
          data-testid="page-content"
        >
          {children}
        </div>
      </div>
    </div>
  )
}
