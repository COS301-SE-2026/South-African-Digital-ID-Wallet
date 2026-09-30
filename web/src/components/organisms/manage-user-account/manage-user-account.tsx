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
    <div className="flex bg-background lg:h-screen lg:overflow-hidden">
      <main className="flex flex-1 flex-col gap-4 p-4 sm:gap-5 sm:p-5 lg:overflow-hidden">
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
          <AccountCard />
          <div className="flex min-h-0 flex-col gap-4 sm:gap-5">
            <div className="min-h-[300px] lg:h-[45%]">
              <ManageUserTrustedDevices />
            </div>
            <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
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
