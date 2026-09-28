import { View } from 'react-native'

import { Card, Skeleton, Text } from '@/components/atoms'
import { ActivityRow } from '@/components/molecules'

import type { ActivityTimelineProps } from './types'

export const ActivityTimeline = ({
  groups,
  isError,
  isPending,
  onSelect,
  testID = 'activity-timeline',
}: ActivityTimelineProps) => {
  if (isPending) {
    return (
      <View className="gap-3" testID="activity-timeline-loading">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
      </View>
    )
  }

  if (isError) {
    return (
      <Text
        variant="sub-sm"
        className="text-danger-red"
        testID="activity-timeline-error"
      >
        We could not load your activity. Pull down to try again.
      </Text>
    )
  }

  if (groups.length === 0) {
    return (
      <Text variant="sub-sm" testID="activity-timeline-empty">
        Nothing here yet. Events show up as soon as they happen.
      </Text>
    )
  }

  return (
    <View className="gap-6" testID={testID}>
      {groups.map((group) => (
        <View className="gap-2" key={group.label}>
          <Text variant="sub-sm" className="font-semibold text-text-primary">
            {group.label}
          </Text>
          {group.entries.map((entry) => (
            <Card
              accessibilityLabel={entry.title}
              className="px-3 py-0.5"
              key={entry.id}
              onPress={onSelect ? () => onSelect(entry) : undefined}
              testID={`activity-entry-${entry.id}`}
            >
              <ActivityRow
                description={entry.description}
                Icon={entry.Icon}
                iconShape="rounded"
                timestamp={entry.time}
                title={entry.title}
                tone={entry.tone}
              />
            </Card>
          ))}
        </View>
      ))}
    </View>
  )
}
