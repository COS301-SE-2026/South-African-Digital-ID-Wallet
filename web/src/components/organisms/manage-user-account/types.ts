import { AppSidebar } from '@/components/organisms/app-sidebar'

export type ManageUserAccountUser = {
  name: string
  initials: string
  idLabel: string
}

export type ManageUserAccountProps = {
  user: ManageUserAccountUser
  navSections: React.ComponentProps<typeof AppSidebar>['navSections']
  onLogout: () => void
}
