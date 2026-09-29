'use client'

import * as React from 'react'
import { X } from 'lucide-react'

import {
  modalCloseButtonClassName,
  modalOverlayClassName,
  modalPanelClassName,
  modalTitleClassName,
} from '@/components/atoms/modal/modal-styles'

import { ChangePasswordCard } from '@/components/molecules/change-password-card'

import type { ChangePasswordModalProps } from './types'

export const ChangePasswordModal = ({
  open,
  onCloseAction,
}: ChangePasswordModalProps) => {
  if (!open) return null

  return (
    <div className={modalOverlayClassName}>
      <div className="absolute inset-0" onClick={onCloseAction} aria-hidden />

      <div className="relative w-full max-w-[720px]">
        <div className={`${modalPanelClassName} p-6 sm:p-8`}>
          <div className="flex items-start justify-between gap-4">
            <h2 className={modalTitleClassName}>Change your Password</h2>
            <button
              type="button"
              aria-label="Close"
              onClick={onCloseAction}
              className={modalCloseButtonClassName}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4">
            <ChangePasswordCard />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChangePasswordModal
