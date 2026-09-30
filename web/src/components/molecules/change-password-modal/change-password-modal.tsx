'use client'

import * as React from 'react'

import { Modal, modalTitleClassName } from '@/components/atoms/modal'

import { ChangePasswordCard } from '@/components/molecules/change-password-card'

import type { ChangePasswordModalProps } from './types'

export const ChangePasswordModal = ({
  open,
  onCloseAction,
}: ChangePasswordModalProps) => {
  if (!open) return null

  return (
    <Modal
      isOpen={open}
      onClose={onCloseAction}
      className="max-w-[720px] p-6 sm:p-8"
    >
      <h2 className={`${modalTitleClassName} pr-10`}>Change your Password</h2>

      <div className="mt-4">
        <ChangePasswordCard />
      </div>
    </Modal>
  )
}

export default ChangePasswordModal
