import {
  AlertTriangle,
  History,
  MapPin,
} from 'lucide-react'
import { Text } from '@/components/atoms/text'
import type {
  DetailRowProps,
  FraudAlertDetailsProps,
} from './types'

function DetailRow({
  icon: Icon,
  label,
  value,
}: DetailRowProps) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary-green" />

      <div className="min-w-0">
        <Text
          as="p"
          variant="caption"
          className="font-semibold text-muted-text"
        >
          {label}
        </Text>

        <Text
          as="p"
          variant="sub-sm"
          className="mt-0.5 font-semibold text-text-primary"
        >
          {value}
        </Text>
      </div>
    </div>
  )
}

export function FraudAlertDetails({
  alert,
}: FraudAlertDetailsProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-2xl border border-danger-red/20 bg-danger-red/10 p-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-danger-red" />

        <div>
          <Text
            as="p"
            variant="sub-sm"
            className="font-bold text-danger-red"
          >
            High risk
          </Text>

          <Text
            as="p"
            variant="sub-sm"
            className="mt-1 text-text-primary"
          >
            {alert.detailsDescription}
          </Text>
        </div>
      </div>

      <section>
        <Text
          as="h3"
          variant="h4"
          className="mb-3 text-base text-deep-green"
        >
          Login information
        </Text>
        <div className="space-y-4 rounded-2xl border border-border-grey p-4">
          <DetailRow
            icon={MapPin}
            label="Location (new)"
            value={`${alert.newLogin.location} • ${alert.newLogin.timestamp}`}
          />

          <DetailRow
            icon={History}
            label="Previous location"
            value={`${alert.previousLogin.location} • ${alert.previousLogin.timestamp}`}
          />
        </div>
      </section>
    </div>
  )
}