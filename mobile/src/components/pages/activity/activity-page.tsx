import { useState } from 'react'
import { Filter } from 'lucide-react-native'
import { RefreshControl, ScrollView } from 'react-native'

import { IconButton, SegmentedTabs } from '@/components/molecules'
import type { SegmentedTabOption } from '@/components/molecules'
import { ActivityFilterSheet, ActivityTimeline } from '@/components/organisms'
import { WalletScreen } from '@/components/templates'
import { useActivityHistory } from '@/hooks'
import type { ActivityFilterName } from '@/services/citizen-dashboard-service'
import { colors } from '@/theme/colors'

import type { ActivityPageProps } from './types'

const FILTERS: SegmentedTabOption[] = [
  { label: 'All', name: 'all' },
  { label: 'Logins', name: 'login' },
  { label: 'Verifications', name: 'verification' },
  { label: 'Shares', name: 'share' },
]

export const ActivityPage = ({
  subtitle,
  testID = 'activity-page',
  title = 'Activity',
}: ActivityPageProps) => {
  const {
    category,
    groups,
    isError,
    isPending,
    isRefetching,
    range,
    refetch,
    setCategory,
    setRange,
  } = useActivityHistory()
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  return (
    <WalletScreen
      action={
        <IconButton
          accessibilityLabel="Filter activity"
          color={colors.textPrimary}
          Icon={Filter}
          onPress={() => setIsFilterOpen(true)}
          testID="activity-filter-button"
        />
      }
      subtitle={subtitle}
      testID={testID}
      title={title}
    >
      <SegmentedTabs
        activeName={category}
        onChange={(name) => setCategory(name as ActivityFilterName)}
        options={FILTERS}
        testID="activity-tabs"
        variant="underline"
      />
      <ScrollView
        className="mt-5"
        contentContainerClassName="pb-10"
        refreshControl={
          <RefreshControl
            onRefresh={() => void refetch()}
            refreshing={isRefetching}
            tintColor={colors.primaryGreen}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <ActivityTimeline
          groups={groups}
          isError={isError}
          isPending={isPending}
        />
      </ScrollView>

      <ActivityFilterSheet
        isVisible={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onSelect={setRange}
        range={range}
      />
    </WalletScreen>
  )
}
