import { useCallback, useState } from 'react'
import { useRouter } from 'expo-router'
import { SegmentedTabs } from '@/components/molecules'
import {
  SecurityActivityList,
  SecuritySettingsPanel,
  SecurityStatusCard,
} from '@/components/organisms'
import { DetailScreen } from '@/components/templates'
import { useSecurityActivity, useSecurityOverview } from '@/hooks'

const TABS = [
  { label: 'Overview', name: 'overview' },
  { label: 'Activity', name: 'activity' },
  { label: 'Settings', name: 'settings' },
]

export const SecurityOverviewPage = () => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const overview = useSecurityOverview()
  const activity = useSecurityActivity(activeTab === 'activity')
  const alert = overview.alert

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
          <SecurityStatusCard
            activeAlertCount={overview.activeAlertCount}
            alertTitle={alert?.title}
            isPending={overview.isPending}
            onPress={
              alert
                ? () =>
                    router.push({
                      params: { alertId: alert.id },
                      pathname: '/citizen/security/[alertId]',
                    })
                : undefined
            }
            testID="security-status"
          />
          <SecurityActivityList
            actionLabel="See all"
            entries={overview.recentActivity}
            isError={overview.isError}
            isPending={overview.isPending}
            onActionPress={() => setActiveTab('activity')}
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
      {activeTab === 'settings' ? <SecuritySettingsPanel /> : null}
    </DetailScreen>
  )
}
