'use client'

import * as React from 'react'
import type { AccountTerminationModalProps } from '@/types/account-termination-modal'

export const AccountTerminationModal = ({
  open,
  onCloseAction,
  onConfirmAction,
}: AccountTerminationModalProps) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCloseAction} />

      <div className="relative w-[min(560px,95%)] mx-auto">
        <div className="bg-card rounded-3xl border p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-2xl font-bold">Terminate Account</h2>
            <button
              aria-label="Close"
              onClick={onCloseAction}
              className="text-muted-text"
            >
              ✕
            </button>
          </div>

          <p className="text-sm text-muted-text mt-3">
            Terminating your account will permanently delete your data and
            revoke access to your Flash ID wallet. This action cannot be undone.
            If you are sure, confirm below.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={onConfirmAction}
              className="bg-destructive px-4 py-2 rounded-2xl text-clean-white font-semibold"
            >
              Yes, terminate account
            </button>

            <button
              type="button"
              onClick={onCloseAction}
              className="px-4 py-2 rounded-2xl border text-muted-text"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountTerminationModal
