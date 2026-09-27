import {
  CircleCheck,
  Clock,
  Fingerprint,
  Globe,
  KeyRound,
  Laptop,
  MapPin,
  MonitorSmartphone,
  ShieldAlert,
} from 'lucide-react-native'
import type { LucideIcon } from 'lucide-react-native'
import type { IconTileTone } from '@/components/atoms'
import {
  formatActivityTime,
  formatActivityTimestamp,
  formatIdDate,
} from '@/lib/format-date'
import type {
  FraudAlertDetailsResponse,
  FraudAlertSummaryResponse,
  SecureAccountAction,
  SecurityActivityEntry,
  SecurityActivityResponse,
  SecurityDetail,
  SecurityOverviewResponse,
} from './types'

export const SECURE_ACTION_ICONS: Record<SecureAccountAction, LucideIcon> = {
  AddExtraVerification: Fingerprint,
  LogOutOtherDevices: MonitorSmartphone,
  ResetPassword: KeyRound,
}

// Renders as "14 May 2026 · 16:22" in the phone's local time
export const formatSecurityTime = (value: string): string => {
  const day = formatIdDate(value)
  return day ? `${day} · ${formatActivityTime(value)}` : ''
}

// Manual grouping gives identical output on every device and in Jest
const withThousands = (value: number): string =>
  Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')

export const formatDistance = (
  distanceKm: number | null
): string | undefined =>
  distanceKm === null
    ? undefined
    : `± ${withThousands(distanceKm)} km from your last location`

export const toRouteLabel = (alert: FraudAlertSummaryResponse): string =>
  alert.previousLocationLabel
    ? `${alert.previousLocationLabel} → ${alert.suspiciousLocationLabel}`
    : alert.suspiciousLocationLabel

// Only an open alert should drive the home card and the red banner
export const toOpenAlert = (
  overview: SecurityOverviewResponse | undefined
): FraudAlertSummaryResponse | null => {
  const alert = overview?.latestAlert
  return overview?.hasActiveAlert && alert?.status === 'Open' ? alert : null
}

const toneFor = (item: SecurityActivityResponse): IconTileTone => {
  // The backend marks Medium and High as suspicious
  if (!item.isSuspicious) {
    return 'soft-green'
  }
  return item.riskLevel === 'High' ? 'soft-red' : 'soft-amber'
}

export const toSecurityActivityEntries = (
  items: SecurityActivityResponse[] | undefined,
  now?: Date
): SecurityActivityEntry[] =>
  (items ?? []).map((item) => ({
    description: item.locationLabel,
    Icon: item.isSuspicious ? ShieldAlert : CircleCheck,
    id: item.id,
    timestamp: formatActivityTimestamp(item.occurredAt, now),
    title: item.title,
    tone: toneFor(item),
  }))

export const toEventDetails = (
  alert: FraudAlertDetailsResponse
): SecurityDetail[] => [
  {
    Icon: Clock,
    label: 'Event time',
    value: formatSecurityTime(alert.detectedAt),
  },
  {
    hint: formatDistance(alert.distanceKm),
    Icon: MapPin,
    label: 'Location',
    value: alert.suspiciousLocationLabel,
  },
  {
    hint: alert.isNewDevice ? 'First time we have seen this device' : undefined,
    Icon: Laptop,
    label: 'Device',
    value: alert.deviceDescription || 'Unknown device',
  },
  { Icon: Globe, label: 'IP address', value: alert.ipAddress },
]
