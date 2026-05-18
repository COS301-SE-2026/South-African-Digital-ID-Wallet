'use client'

import { usePathname } from 'next/navigation'
import { AppSidebar } from '../organisms/app-sidebar'
import { AppTopBar } from '../organisms/app-top-bar'
import { officialsNavSections } from '@/config/navigation'
import { defaultPageHeader, pageHeaders } from '@/config/page-headers'

{
  /* TODO : Update navbar collection and mock user data as login implemented and session management added :) */
}

const mockUser = {
  name: 'Unathi Tshakalisa',
  initials: 'UT',
  idLabel: 'ID: •••••••084',
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  {
    /* This section uses the URL to determine the headers (Title and description) necessary for the page
    Add more page titles and descriptions to config/page-headers */
  }

  const header = pageHeaders[pathname] ?? defaultPageHeader

  return (
    <div className=" flex h-screen overflow-hidden">
      {/* TODO: Update navSections to work with loggeed in user role :)*/}
      <AppSidebar navSections={officialsNavSections} user={mockUser} />
      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        <AppTopBar
          title={header.title}
          description={header.description}
          user={{
            name: mockUser.name,
            initials: mockUser.initials,
          }}
          showNotifications={false}
        />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
