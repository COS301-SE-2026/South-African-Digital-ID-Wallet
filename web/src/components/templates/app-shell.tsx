'use client'

import { usePathname } from 'next/navigation'
import { AppSidebar } from '../organisms/app-sidebar'
import { AppTopBar } from '../organisms/app-top-bar'
import {
  officialsNavSections,
  citizenNavSections,
  governmentAdminNavSections,
} from '@/config/navigation'
import { defaultPageHeader, pageHeaders } from '@/config/page-headers'
import { useUser } from '@/context/user-context'

{
  /* TODO : Update navbar collection and mock user data as login implemented and session management added :) */
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  {
    /* This section uses the URL to determine the headers (Title and description) necessary for the page
    Add more page titles and descriptions to config/page-headers */
  }

  const header = pageHeaders[pathname] ?? defaultPageHeader
  const { user } = useUser()

  const navSections = user
    ? user.role === 'Official'
      ? officialsNavSections
      : user.role === 'GovernmentAdministrator'
        ? governmentAdminNavSections
        : citizenNavSections
    : citizenNavSections

  const displayName = user
    ? `${user.names ?? ''} ${user.surname ?? ''}`.trim() || user.email
    : 'Guest'

  const initials = user
    ? (user.names?.[0] ?? user.email?.[0] ?? 'U') + (user.surname?.[0] ?? '')
    : 'G'

  const idLabel = user ? `ID: ••••••${String(user.userId).slice(-3)}` : ''

  return (
    <div className=" flex h-screen overflow-hidden">
      {/* TODO: Update navSections to work with loggeed in user role :)*/}
      <AppSidebar
        navSections={navSections}
        user={{ name: displayName, initials, idLabel }}
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
