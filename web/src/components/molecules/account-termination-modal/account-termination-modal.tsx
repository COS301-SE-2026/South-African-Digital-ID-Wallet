'use client'

import * as React from 'react'

import { Modal, modalTitleClassName } from '@/components/atoms/modal'

import type { AccountTerminationModalProps } from './types'

export const AccountTerminationModal = ({
  open,
  onCloseAction,
  onConfirmAction,
}: AccountTerminationModalProps) => {
  if (!open) return null

  return (
    <Modal
      isOpen={open}
      onClose={onCloseAction}
      className="max-w-[560px] p-6 sm:p-8"
    >
      <h2 className={`${modalTitleClassName} pr-10`}>Terminate Account</h2>

      <p className="text-sm text-muted-text mt-3">
        Terminating your account will permanently delete your data and revoke
        access to your Flash ID wallet. This action cannot be undone. If you are
        sure, confirm below.
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
    </Modal>
  )
}

export default AccountTerminationModal
