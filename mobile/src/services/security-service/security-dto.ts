import {
  CircleCheck,
  Clock,
  Fingerprint,
  Gauge,
  Globe,
  KeyRound,
  Laptop,
  MapPin,
  MonitorSmartphone,
  ShieldAlert,
} from 'lucide-react-native'
import type { LucideIcon } from 'lucide-react-native'
import type { IconTileTone } from '@/components/atoms'
import type { StatusBadgeTone } from '@/components/molecules'
import {
  formatActivityTime,
  formatActivityTimestamp,
  formatIdDate,
} from '@/lib/format-date'
import type {
  FraudAlertDetailsResponse,
  FraudAlertSummaryResponse,
  FraudRiskLevel,
  SecureAccountAction,
  SecurityActivityEntry,
  SecurityActivityResponse,
  SecurityAlertNotice,
  SecurityBadge,
  SecurityDetail,
  SecurityLocationResponse,
  SecurityOverviewResponse,
  SecurityStat,
} from './types'

export const SECURE_ACTION_ICONS: Record<SecureAccountAction, LucideIcon> = {
  AddExtraVerification: Fingerprint,
  LogOutOtherDevices: MonitorSmartphone,
  ResetPassword: KeyRound,
}

const RISK_BADGE_TONES: Record<FraudRiskLevel, StatusBadgeTone> = {
  High: 'danger',
  Low: 'success',
  Medium: 'warning',
}

export const toRiskBadge = (level: FraudRiskLevel): SecurityBadge => ({
  label: level,
  tone: RISK_BADGE_TONES[level],
})

export const formatSecurityTime = (value: string): string => {
  const day = formatIdDate(value)
  return day ? `${day} · ${formatActivityTime(value)}` : ''
}

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

export const formatElapsed = (minutes: number): string => {
  const total = Math.max(0, Math.round(minutes))
  const hours = Math.floor(total / 60)
  const rest = total % 60
  if (hours === 0) {
    return `${rest} min`
  }
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`
}

const formatCoordinates = (
  location: SecurityLocationResponse
): string | undefined =>
  location.latitude === null || location.longitude === null
    ? undefined
    : `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`

export const toTravelPointCaption = (
  location: SecurityLocationResponse
): string =>
  [formatCoordinates(location), formatSecurityTime(location.occurredAt)]
    .filter(Boolean)
    .join('\n')

export const toTravelStats = (
  alert: FraudAlertDetailsResponse
): SecurityStat[] => {
  const stats: SecurityStat[] = []
  if (alert.distanceKm !== null) {
    stats.push({
      label: 'Distance',
      value: `${withThousands(alert.distanceKm)} km`,
    })
  }
  if (alert.elapsedMinutes !== null) {
    stats.push({
      label: 'Time between',
      value: formatElapsed(alert.elapsedMinutes),
    })
  }
  if (alert.impliedSpeedKmh !== null) {
    stats.push({
      label: 'Implied speed',
      value: `${withThousands(alert.impliedSpeedKmh)} km/h`,
    })
  }
  return stats
}

export const toRouteLabel = (alert: FraudAlertSummaryResponse): string =>
  alert.previousLocationLabel
    ? `${alert.previousLocationLabel} → ${alert.suspiciousLocationLabel}`
    : alert.suspiciousLocationLabel

export const toOpenAlert = (
  overview: SecurityOverviewResponse | undefined
): FraudAlertSummaryResponse | null => {
  const alert = overview?.latestAlert
  return overview?.hasActiveAlert && alert?.status === 'Open' ? alert : null
}

const toneFor = (item: SecurityActivityResponse): IconTileTone => {
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
    badge: item.riskScore > 0 ? toRiskBadge(item.riskLevel) : null,
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
    badge: alert.isNewDevice
      ? { label: 'New device', tone: 'danger' }
      : undefined,
    hint: alert.isNewDevice ? 'First time we have seen this device' : undefined,
    Icon: Laptop,
    label: 'Device',
    value: alert.deviceDescription || 'Unknown device',
  },
  { Icon: Globe, label: 'IP address', value: alert.ipAddress },
]

export const toNoticeDetails = (
  notice: SecurityAlertNotice
): SecurityDetail[] => [
  {
    hint: formatSecurityTime(notice.occurredAt),
    Icon: MapPin,
    label: 'Location',
    value: notice.location || 'Unknown location',
  },
  {
    Icon: Laptop,
    label: 'Device',
    value: notice.deviceDescription || 'Unknown device',
  },
  {
    badge: toRiskBadge(notice.riskLevel),
    Icon: Gauge,
    label: 'Risk level',
    value: `Risk score ${notice.riskScore}/100`,
  },
]
