'use client'

import * as React from 'react'
import { X } from 'lucide-react'

import {
  modalCloseButtonClassName,
  modalOverlayClassName,
  modalPanelClassName,
  modalTitleClassName,
} from '@/components/atoms/modal/modal-styles'

import type { AccountTerminationModalProps } from './types'

export const AccountTerminationModal = ({
  open,
  onCloseAction,
  onConfirmAction,
}: AccountTerminationModalProps) => {
  if (!open) return null

  return (
    <div className={modalOverlayClassName}>
      <div className="absolute inset-0" onClick={onCloseAction} aria-hidden />

      <div className="relative w-full max-w-[560px]">
        <div className={`${modalPanelClassName} p-6 sm:p-8`}>
          <div className="flex items-start justify-between gap-4">
            <h2 className={modalTitleClassName}>Terminate Account</h2>
            <button
              type="button"
              aria-label="Close"
              onClick={onCloseAction}
              className={modalCloseButtonClassName}
            >
              <X className="h-5 w-5" />
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
              className="rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-clean-white"
            >
              Yes, terminate account
            </button>

            <button
              type="button"
              onClick={onCloseAction}
              className="rounded-xl border border-black/10 px-4 py-2 text-sm font-semibold text-deep-green hover:bg-black/5"
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
