'use client'

import { useCallback, useEffect, useState } from 'react'
import { WalletHeroCard } from '@/components/molecules/hero-card-citizen-dashboard/hero-card-citizen-dashboard'
import { ActivityOverviewCard } from '@/components/molecules/activity-overview-card/activity-overview-card'
import { CredentialsList } from '@/components/molecules/credentials-list/credentials-list'
import { TrustedDevices } from '@/components/molecules/trusted-devices/trusted-devices'
import { NotificationsList } from '@/components/molecules/notifications-list/notifications-list'
import { AccountCardCitizenDashboard } from '@/components/molecules/citizen-dashboard-account-card/citizen-dashboard-account-card'
import { FraudAlertFlow } from '@/components/organisms/fraud-alert-flow'
import type { SecurityAlert } from '@/components/organisms/fraud-alert-flow'
import { fraudDetectionService } from '@/services/fraud-detection-service'
import { mapFraudAlertToSecurityAlert } from '@/services/fraud-detection-service/mappers'

export default function CitizenDashboardPage() {
  const [securityAlert, setSecurityAlert] = useState<SecurityAlert | null>(null)
  const [securityAlertError, setSecurityAlertError] = useState<string | null>(null)
  const reloadSecurityAlert = useCallback(async () => {
    try {
      setSecurityAlertError(null)
      const overview = await fraudDetectionService.getOverview()
      if (!overview.hasActiveAlert || !overview.latestAlert) {
        setSecurityAlert(null)
        return
      }
      const alertDetails =
        await fraudDetectionService.getAlertDetails(
          overview.latestAlert.id
        )
      setSecurityAlert(mapFraudAlertToSecurityAlert(alertDetails))
    } catch (error) {
      console.error(
        'Unable to load the security alert from the backend.',
        error
      )
      setSecurityAlertError(
        'We could not check your latest security activity. Please refresh the page and try again.'
      )
    }
  }, [])
  useEffect(() => {
    void reloadSecurityAlert()
  }, [reloadSecurityAlert])
  return (
    <div className="flex min-h-full overflow-x-hidden bg-[#f6f2ea]">
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
        <div className="mt-4 grid min-h-0 flex-1 grid-cols-1 gap-4 lg:mt-6 lg:grid-cols-12 lg:gap-6">
          <section className="min-w-0 space-y-4 lg:col-span-8 lg:space-y-6">
            {securityAlertError && (
              <div
                role="alert"
                className="rounded-2xl border border-accent-gold/40 bg-accent-gold/10 p-4"
              >
                {securityAlertError}
              </div>
            )}
            {securityAlert && (
              <FraudAlertFlow
                alert={securityAlert}
                onResolved={reloadSecurityAlert}
              />
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