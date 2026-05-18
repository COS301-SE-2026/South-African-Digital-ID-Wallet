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

const mockTopBar = {
  title: 'Officials Dashboard',
  description: 'Upload and Manage citizen digital credentials.',
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
      <AppSidebar navSections={officialsNavSections} user={mockUser} />
      <div className="flex-1">
        <AppTopBar
          title={mockTopBar.title}
          description={mockTopBar.description}
          user={{
            name: mockUser.name,
            initials: mockUser.initials,
          }}
          showNotifications={false}
        />
        {children}
      </div>
    </div>
  )
}
