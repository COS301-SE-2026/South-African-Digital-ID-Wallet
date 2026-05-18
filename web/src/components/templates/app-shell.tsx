import { AppSidebar } from '../organisms/app-sidebar'
import { AppTopBar } from '../organisms/app-top-bar'
import { officialsNavSections } from '@/config/navigation'

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
