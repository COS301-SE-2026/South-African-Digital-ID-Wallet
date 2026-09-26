import { Check, X } from 'lucide-react'
import { Text } from '@/components/atoms'
import type { VerificationCheckProps } from './types'

export function VerificationCheck({
  title,
  status,
  description,
  failed = false,
}: Readonly<VerificationCheckProps>) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          failed
            ? 'bg-danger-red text-clean-white'
            : 'bg-success-green text-clean-white'
        }`}
      >
        {failed ? (
          <X className="h-3 w-3" />
        ) : (
          <Check
            className="h-3 w-3"
            strokeWidth={3}
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Text
            variant="sub-sm"
            className="font-semibold text-deep-green"
          >
            {title}
          </Text>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              failed
                ? 'bg-danger-red/10 text-danger-red'
                : 'bg-success-green/10 text-success-green'
            }`}
          >
            {status}
          </span>
        </div>
        <Text variant="caption" className="mt-1">
          {description}
        </Text>
      </div>
    </div>
  )
}