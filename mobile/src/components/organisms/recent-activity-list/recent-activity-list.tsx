import { View } from 'react-native'

import { Card, Divider, Skeleton, Text } from '@/components/atoms'
import { ActivityRow, SectionHeader } from '@/components/molecules'
import { useRecentActivity } from '@/hooks'

import type { RecentActivityListProps } from './types'

export const RecentActivityList = ({
  onViewAll,
  title = 'Recent Activity',
}: RecentActivityListProps) => {
  const { entries, isError, isPending } = useRecentActivity()

  return (
    <View className="gap-3" testID="recent-activity-list">
      <SectionHeader
        actionLabel="View all"
        onActionPress={onViewAll}
        title={title}
      />
      <Card className="py-1">
        {isPending ? (
          <View className="gap-4 py-3" testID="recent-activity-loading">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </View>
        ) : isError ? (
          <Text
            variant="sub-sm"
            className="py-4 text-danger-red"
            testID="recent-activity-error"
          >
            We could not load your recent activity.
          </Text>
        ) : entries.length === 0 ? (
          <Text
            variant="sub-sm"
            className="py-4"
            testID="recent-activity-empty"
          >
            No activity yet. Your account events will show up here.
          </Text>
        ) : (
          entries.map((entry, index) => (
            <View key={entry.id}>
              {index > 0 ? <Divider /> : null}
              <ActivityRow
                description={entry.description}
                Icon={entry.Icon}
                testID={`activity-row-${entry.id}`}
                timestamp={entry.timestamp}
                title={entry.title}
                tone={entry.tone}
              />
            </View>
          ))
        )}
      </Card>
    </View>
  )
}
