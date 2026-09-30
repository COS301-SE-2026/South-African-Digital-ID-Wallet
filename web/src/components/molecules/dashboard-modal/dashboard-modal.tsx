'use client'

import { useEffect, useId } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  modalCloseButtonClassName,
  modalOverlayClassName,
  modalPanelClassName,
  modalTitleClassName,
} from '@/components/atoms/modal'
import type { DashboardModalProps } from './types'

export function DashboardModal({
  open,
  title,
  children,
  onClose,
  showBottomClose = true,
}: DashboardModalProps) {
  const titleId = useId()

  useEffect(() => {
    if (!open) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) {
    return null
  }

  return (
    <div className={modalOverlayClassName}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`${modalPanelClassName} max-w-3xl`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-black/10 px-6 py-5">
          <h2 id={titleId} className={modalTitleClassName}>
            {title}
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close dialog"
            className={modalCloseButtonClassName}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-6">{children}</div>
        {showBottomClose && (
          <div className="flex justify-end border-t border-black/10 px-6 py-4">
            <Button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-deep-green px-5 py-2 text-sm font-semibold text-clean-white hover:bg-primary-green"
            >
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
