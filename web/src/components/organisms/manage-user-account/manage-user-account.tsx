'use client'

import { useState } from 'react'

import {
  AccountCard,
  SelectiveDisclosureCard,
  UpdateEmailModal,
  UpdatePasswordModal,
  UpdateEmailCard,
  UpdatePasswordCard,
  DeleteAccountCard,
} from '@/components/molecules'
import { AppTopBar } from '@/components/organisms/app-top-bar'
import { AppSidebar } from '@/components/organisms/app-sidebar'

import type { ManageUserAccountProps } from './types'

export function ManageUserAccount({
  user,
  navSections,
  onLogout,
}: ManageUserAccountProps) {
  const [openEmail, setOpenEmail] = useState(false)
  const [openPass, setOpenPass] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      <main className="flex-1 flex flex-col p-4 gap-4">
        <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
          <AccountCard />
          <div className="flex flex-col gap-4 min-h-0">
            <div className="flex-[2] min-h-0">
              <SelectiveDisclosureCard />
            </div>
            <div className="grid grid-cols-2 gap-4 flex-1">
              <UpdateEmailCard onAction={() => setOpenEmail(true)} />
              <UpdatePasswordCard onAction={() => setOpenPass(true)} />
            </div>
          </div>
        </div>
        <div className="shrink-0">
          <DeleteAccountCard />
        </div>
        <UpdateEmailModal
          open={openEmail}
          onCloseAction={() => setOpenEmail(false)}
        />
        <UpdatePasswordModal
          open={openPass}
          onCloseAction={() => setOpenPass(false)}
        />
      </main>
    </div>
  )
}
