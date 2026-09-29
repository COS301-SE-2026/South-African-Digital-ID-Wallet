import * as React from 'react'
import { X } from 'lucide-react'
import {
  modalCloseButtonClassName,
  modalOverlayClassName,
  modalPanelClassName,
  modalTitleClassName,
} from '@/components/atoms/modal/modal-styles'

interface DashboardModalProps {
  readonly open: boolean
  readonly title: string
  readonly children: React.ReactNode
  readonly onClose: () => void
}

export function DashboardModal({
  open,
  title,
  children,
  onClose,
}: DashboardModalProps) {
  if (!open) return null

  return (
    <div className={modalOverlayClassName}>
      <div className={`${modalPanelClassName} max-w-3xl`}>
        <div className="flex items-center justify-between gap-4 border-b border-black/10 px-6 py-5">
          <h2 className={modalTitleClassName}>{title}</h2>

          <button
            type="button"
            aria-label="Dismiss dialog"
            onClick={onClose}
            className={modalCloseButtonClassName}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-6">{children}</div>

        <div className="flex justify-end border-t border-black/10 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-deep-green px-5 py-2 text-sm font-semibold text-clean-white transition hover:bg-primary-green"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
