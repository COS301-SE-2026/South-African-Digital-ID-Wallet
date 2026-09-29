import type { SecurityAlert } from '@/components/organisms/fraud-alert-flow/types'
import type { FraudAlertDetailsResponse } from './types'

export function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  const formattedDate = new Intl.DateTimeFormat('en-ZA', {
    dateStyle: 'medium',
  }).format(date)
  const formattedTime = new Intl.DateTimeFormat('en-ZA', {
    timeStyle: 'short',
  }).format(date)
  return `${formattedDate} • ${formattedTime}`
}
export function formatNumber(value: number | null, suffix: string): string {
  if (value === null || Number.isNaN(value)) {
    return 'Unavailable'
  }
  return `${Math.round(value).toLocaleString('en-ZA')} ${suffix}`
}
export function formatElapsedTime(minutes: number | null): string {
  if (minutes === null || minutes <= 0 || Number.isNaN(minutes)) {
    return 'Unavailable'
  }
  const totalMinutes = Math.round(minutes)
  const days = Math.floor(totalMinutes / 1440)
  const hours = Math.floor((totalMinutes % 1440) / 60)
  const remainingMinutes = totalMinutes % 60
  const parts: string[] = []
  if (days > 0) {
    parts.push(`${days} day${days === 1 ? '' : 's'}`)
  }
  if (hours > 0) {
    parts.push(`${hours} hour${hours === 1 ? '' : 's'}`)
  }
  if (remainingMinutes > 0 && parts.length < 2) {
    parts.push(`${remainingMinutes} minute${remainingMinutes === 1 ? '' : 's'}`)
  }
  if (parts.length === 0) {
    return 'Less than 1 minute'
  }
  return `~${parts.join(', ')}`
}
export function getLocationLabel(location: {
  label: string
  city: string | null
  country: string | null
}): string {
  const label = location.label.trim()
  if (label) {
    return label
  }
  const parts = [location.city, location.country].filter(
    (value): value is string => Boolean(value?.trim())
  )
  return parts.length > 0 ? parts.join(', ') : 'Location unavailable'
}
export function mapFraudAlertToSecurityAlert(
  details: FraudAlertDetailsResponse
): SecurityAlert {
  const suspiciousLocation = details.suspiciousLocation
  const previousLocation = details.previousLocation
  const suspiciousLocationLabel = getLocationLabel(suspiciousLocation)
  const previousLocationLabel = previousLocation
    ? getLocationLabel(previousLocation)
    : 'No previous location available'
  const previousLoginTimestamp = previousLocation
    ? formatDate(previousLocation.occurredAt)
    : 'Unavailable'
  const locationAccuracy =
    suspiciousLocation.latitude !== null &&
    suspiciousLocation.longitude !== null
      ? 'Approximate location'
      : 'Location unavailable'
  const severity =
    details.riskLevel === 'High'
      ? 'high'
      : details.riskLevel === 'Medium'
        ? 'medium'
        : 'low'

  return {
    id: details.id,
    severity,
    title: details.title || `${details.riskLevel} risk security event`,
    summary:
      details.message ||
      'We detected suspicious login activity on your account. Please review the details and secure your account.',
    detailsDescription: details.isImpossibleTravel
      ? 'This appears to be an impossible travel attempt based on location, time and device information.'
      : 'This security event requires your attention.',
    newLogin: {
      location: suspiciousLocationLabel,
      timestamp: formatDate(
        suspiciousLocation.occurredAt || details.detectedAt
      ),
    },
    previousLogin: {
      location: previousLocationLabel,
      timestamp: previousLoginTimestamp,
    },
    travel: {
      distance: formatNumber(details.distanceKm, 'km'),
      impliedSpeed: formatNumber(details.impliedSpeedKmh, 'km/h'),
      timeBetweenLogins: formatElapsedTime(details.elapsedMinutes),
    },
    device: {
      name: details.deviceDescription || 'Unknown device',
      ipAddress: details.ipAddress || 'Unavailable',
      locationAccuracy,
    },
  }
}
