import {
  ArrowRight,
  MapPin,
  ShieldAlert,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { FraudAlertSummaryProps } from './types'

export function FraudAlertSummary({
  alert,
  onViewDetails,
}: FraudAlertSummaryProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-2xl border border-danger-red/20 bg-danger-red/10 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger-red text-clean-white">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div>
          <p className="font-bold text-danger-red">{alert.title}</p>
          <p className="mt-1 text-sm leading-6 text-text-primary">
            {alert.summary}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onViewDetails}
        className="flex w-full items-center gap-3 rounded-2xl border border-border-grey p-4 text-left transition hover:bg-muted"
      >
        <MapPin className="h-6 w-6 shrink-0 text-danger-red" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-danger-red">
            New login detected
          </p>
          <p className="mt-1 text-sm font-semibold text-text-primary">
            {alert.newLogin.location}
          </p>
          <p className="mt-1 text-xs text-muted-text">
            {alert.newLogin.timestamp}
          </p>
        </div>
        <ArrowRight className="h-5 w-5 shrink-0 text-deep-green" />
      </button>
      <Button
        type="button"
        className="w-full"
        onClick={onViewDetails}
      >
        View more details
      </Button>
    </div>
  )
}