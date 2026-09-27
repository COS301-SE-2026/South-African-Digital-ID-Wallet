import { useCallback, useState } from 'react'
import { useRouter } from 'expo-router'
import { Text } from '@/components/atoms'
import { SegmentedTabs } from '@/components/molecules'
import {
  SecurityActivityList,
  SecurityAlertBanner,
} from '@/components/organisms'
import { DetailScreen } from '@/components/templates'
import { useSecurityActivity, useSecurityOverview } from '@/hooks'
import { formatSecurityTime, toRouteLabel } from '@/services/security-service'
import type { SecurityOverviewPageProps } from './types'

const TABS = [
  { label: 'Overview', name: 'overview' },
  { label: 'Activity', name: 'activity' },
  { label: 'Settings', name: 'settings' },
]

export const SecurityOverviewPage = ({
  settingsContent,
}: SecurityOverviewPageProps) => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const overview = useSecurityOverview()
  // The full history is only fetched once the Activity tab is opened
  const activity = useSecurityActivity(activeTab === 'activity')
  const alert = overview.alert

  // A deep link has nothing to go back to, so fall back to home
  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back()
      return
    }
    router.replace('/citizen/home')
  }, [router])

  return (
    <DetailScreen
      onBack={handleBack}
      testID="security-overview"
      title="Security"
    >
      <SegmentedTabs
        activeName={activeTab}
        onChange={setActiveTab}
        options={TABS}
        testID="security-tabs"
        variant="underline"
      />
      {activeTab === 'overview' ? (
        <>
          {alert ? (
            <SecurityAlertBanner
              footer={[
                formatSecurityTime(alert.detectedAt),
                toRouteLabel(alert),
              ]}
              message={alert.message}
              onPress={() =>
                router.push({
                  params: { alertId: alert.id },
                  pathname: '/citizen/security/[alertId]',
                })
              }
              testID="security-latest-alert"
              title={alert.title}
            />
          ) : null}
          <SecurityActivityList
            entries={overview.recentActivity}
            isError={overview.isError}
            isPending={overview.isPending}
            title="Recent security activity"
          />
        </>
      ) : null}
      {activeTab === 'activity' ? (
        <SecurityActivityList
          entries={activity.entries}
          isError={activity.isError}
          isPending={activity.isPending}
          title="All security activity"
        />
      ) : null}
      {activeTab === 'settings'
        ? (settingsContent ?? (
            <Text variant="sub-sm" testID="security-settings-placeholder">
              Security settings will appear here.
            </Text>
          ))
        : null}
    </DetailScreen>
  )
}
