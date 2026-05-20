'use client'

import * as React from 'react'
import { ChangePasswordCard } from './change-password-card'
import type { ChangePasswordModalProps } from '@/types/change-password-modal'

export const ChangePasswordModal = ({
  open,
  onCloseAction,
}: ChangePasswordModalProps) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCloseAction}
        aria-hidden
      />

      <div className="relative w-[min(720px,95%)] mx-auto">
        <div className="bg-card rounded-3xl border p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-2xl font-bold">Change your Password</h2>
            <button
              aria-label="Close"
              onClick={onCloseAction}
              className="text-muted-text"
            >
              ✕
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
