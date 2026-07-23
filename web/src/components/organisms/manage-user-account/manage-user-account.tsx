'use client'

import {
  AccountCard,
  SelectiveDisclosureCard,
  UpdateEmailCard,
  UpdatePasswordCard,
  DeleteAccountCard,
} from '@/components/molecules'

import { AppSidebar } from '@/components/organisms/app-sidebar'
import { AppTopBar } from '@/components/organisms/app-top-bar'

import type { ManageUserAccountUser } from './types'

type ManageUserAccountProps = {
  user: ManageUserAccountUser
  navSections: React.ComponentProps<typeof AppSidebar>['navSections']
  onLogout: () => void
}

export function ManageUserAccount({
  user,
  navSections,
  onLogout,
}: ManageUserAccountProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar navSections={navSections} user={user} onLogout={onLogout} />
      <main className="flex-1 flex flex-col p-4 gap-4">
        <AppTopBar
          title="Account management"
          description="Manage your account and data controls."
          user={{
            name: user.name,
            initials: user.initials,
          }}
        />
        <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
          <AccountCard />
          <div className="flex flex-col gap-4 min-h-0">
            <div className="flex-[2] min-h-0">
              <SelectiveDisclosureCard />
            </div>
            <div className="grid grid-cols-2 gap-4 flex-1">
              <UpdateEmailCard />
              <UpdatePasswordCard />
            </div>
          </div>
        </div>
        <div className="shrink-0">
          <DeleteAccountCard />
        </div>
      </main>
    </div>
  )
}
