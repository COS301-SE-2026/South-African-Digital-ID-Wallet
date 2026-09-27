import { X } from 'lucide-react'
import { Text } from '@/components/atoms/text'
import { Button } from '@/components/ui/button'
import type { DashboardModalProps } from './types'

export function DashboardModal({
  open,
  title,
  children,
  onClose,
  showBottomClose = true,
}: DashboardModalProps) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-3xl border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b p-6">
          <Text
            as="h2"
            variant="h3"
            className="text-text-primary"
          >
            {title}
          </Text>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close"
            className="rounded-xl p-2"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="max-h-[500px] overflow-y-auto p-6">
          {children}
        </div>
        {showBottomClose && (
          <div className="flex justify-end border-t p-6">
            <Button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-2 font-semibold"
            >
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}