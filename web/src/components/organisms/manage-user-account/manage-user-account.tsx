'use client'

import { useState } from 'react'

import {
  AccountCard,
  ManageUserTrustedDevices,
  UpdateEmailModal,
  UpdatePasswordModal,
  UpdateEmailCard,
  UpdatePasswordCard,
  DeleteAccountCard,
} from '@/components/molecules'

export function ManageUserAccount() {
  const [openEmail, setOpenEmail] = useState(false)
  const [openPass, setOpenPass] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      <main className="flex flex-1 flex-col gap-5 overflow-hidden p-5">
        <div className="grid min-h-0 flex-1 grid-cols-2 gap-5">
          <AccountCard />

          <div className="flex min-h-0 flex-col gap-5">
            <div className="h-[45%] min-h-[300px]">
              <ManageUserTrustedDevices />
            </div>

            <div className="grid flex-1 grid-cols-2 gap-5">
              <UpdateEmailCard onAction={() => setOpenEmail(true)} />
              <UpdatePasswordCard onAction={() => setOpenPass(true)} />
            </div>
          </div>
        </div>

        <DeleteAccountCard />

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
