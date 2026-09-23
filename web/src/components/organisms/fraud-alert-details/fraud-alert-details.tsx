import {
  AlertTriangle,
  Clock3,
  Gauge,
  History,
  LockKeyhole,
  MapPin,
  MonitorSmartphone,
} from 'lucide-react'
import { Text } from '@/components/atoms/text'
import { Button } from '@/components/ui/button'
import type { DetailRowProps, FraudAlertDetailsProps,} from './types'

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
  onOpenGuidance,
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
      <section>
        <Text
          as="h3"
          variant="h4"
          className="mb-3 text-base text-deep-green"
        >
          Travel details
        </Text>
        <div className="space-y-4 rounded-2xl border border-border-grey p-4">
          <DetailRow
            icon={MapPin}
            label="Distance"
            value={alert.travel.distance}
          />
          <DetailRow
            icon={Gauge}
            label="Implied travel speed"
            value={alert.travel.impliedSpeed}
          />
          <DetailRow
            icon={Clock3}
            label="Time between logins"
            value={alert.travel.timeBetweenLogins}
          />
        </div>
      </section>

      <section>
        <Text
          as="h3"
          variant="h4"
          className="mb-3 text-base text-deep-green"
        >
          Device and network
        </Text>
        <div className="space-y-4 rounded-2xl border border-border-grey p-4">
          <DetailRow
            icon={MonitorSmartphone}
            label="Device"
            value={alert.device.name}
          />
          <DetailRow
            icon={LockKeyhole}
            label="IP address"
            value={alert.device.ipAddress}
          />
          <DetailRow
            icon={MapPin}
            label="Location accuracy"
            value={alert.device.locationAccuracy}
          />
        </div>
      </section>
      <Button
        type="button"
        className="w-full"
        onClick={onOpenGuidance}
      >
        How to keep your account secure
      </Button>
    </div>
  )
}