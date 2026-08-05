import { X } from 'lucide-react'

import { DashboardModalProps } from './types'

export function DashboardModal({
  open,
  title,
  children,
  onClose,
}: DashboardModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-3xl border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b p-6">
          <h2 className="text-2xl font-bold">{title}</h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[500px] overflow-y-auto p-6">{children}</div>

        <div className="flex justify-end border-t p-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-primary px-5 py-2 font-semibold text-primary-foreground"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
