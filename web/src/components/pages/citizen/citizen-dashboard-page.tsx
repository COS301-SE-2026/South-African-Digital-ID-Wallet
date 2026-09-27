'use client'
import { useEffect, useState } from 'react'
import { WalletHeroCard } from '@/components/molecules/hero-card-citizen-dashboard/hero-card-citizen-dashboard'
import { ActivityOverviewCard } from '@/components/molecules/activity-overview-card/activity-overview-card'
import { CredentialsList } from '@/components/molecules/credentials-list/credentials-list'
import { TrustedDevices } from '@/components/molecules/trusted-devices/trusted-devices'
import { NotificationsList } from '@/components/molecules/notifications-list/notifications-list'
import { AccountCardCitizenDashboard } from '@/components/molecules/citizen-dashboard-account-card/citizen-dashboard-account-card'
import { FraudAlertFlow } from '@/components/organisms/fraud-alert-flow'
import type { SecurityAlert } from '@/components/organisms/fraud-alert-flow'
import { fraudDetectionService } from '@/services/fraud-detection-service'
import type { FraudAlertDetailsResponse } from '@/services/fraud-detection-service'

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return new Intl.DateTimeFormat('en-ZA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
    .format(date)
    .replace(',', ' •')
}
function formatNumber(value: number | null, suffix: string): string {
  if (value === null || Number.isNaN(value)) {
    return 'Unavailable'
  }
  return `${Math.round(value).toLocaleString('en-ZA')} ${suffix}`
}
function formatElapsedTime(minutes: number | null): string {
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
    parts.push(
      `${remainingMinutes} minute${remainingMinutes === 1 ? '' : 's'}`
    )
  }
  if (parts.length === 0) {
    return 'Less than 1 minute'
  }
  return `~${parts.join(', ')}`
}
function getLocationLabel(location: {
  label: string
  city: string | null
  country: string | null
}): string {
  if (location.label.trim()) {
    return location.label
  }
  const parts = [location.city, location.country].filter(
    (value): value is string => Boolean(value?.trim())
  )
  return parts.length > 0 ? parts.join(', ') : 'Location unavailable'
}
function mapFraudAlertToSecurityAlert(
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
  const severity = details.riskLevel === 'High' ? 'high' : 'medium'
  return {
    id: details.id,
    severity,
    title: details.title || 'High risk security event',
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

export default function CitizenDashboardPage() {
  const [securityAlert, setSecurityAlert] = useState<SecurityAlert | null>(null)
  useEffect(() => {
    let isMounted = true
    const loadSecurityAlert = async () => {
      try {
        const overview = await fraudDetectionService.getOverview()
        if (
          !isMounted ||
          !overview.hasActiveAlert ||
          !overview.latestAlert
        ) {
          return
        }
        const alertDetails =
          await fraudDetectionService.getAlertDetails(
            overview.latestAlert.id
          )
        if (!isMounted) {
          return
        }
        setSecurityAlert(mapFraudAlertToSecurityAlert(alertDetails))
      } catch (error) {
        if (isMounted) {
          console.error(
            'Unable to load the security alert from the backend.',
            error
          )
        }
      }
    }
    void loadSecurityAlert()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="flex min-h-full overflow-x-hidden bg-[#f6f2ea]">
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
        <div className="mt-4 grid min-h-0 flex-1 grid-cols-1 gap-4 lg:mt-6 lg:grid-cols-12 lg:gap-6">
          <section className="min-w-0 space-y-4 lg:col-span-8 lg:space-y-6">
            {securityAlert && (
              <FraudAlertFlow alert={securityAlert} />
            )}
            <WalletHeroCard />
            <CredentialsList />
            <NotificationsList />
          </section>
          <aside className="min-w-0 space-y-4 lg:col-span-4 lg:space-y-6">
            <AccountCardCitizenDashboard />
            <div id="activity-overview">
              <ActivityOverviewCard />
            </div>
            <div id="trusted-devices-overview">
              <TrustedDevices />
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}