import { View } from 'react-native'
import { Card, Divider, Skeleton, Text } from '@/components/atoms'
import { ActivityRow, SectionHeader } from '@/components/molecules'
import type { SecurityActivityListProps } from './types'

export const SecurityActivityList = ({
  entries,
  isError,
  isPending,
  title,
}: SecurityActivityListProps) => (
  <View className="gap-3" testID="security-activity-list">
    <SectionHeader title={title} />
    <Card className="py-1">
      {isPending ? (
        <View className="gap-4 py-3" testID="security-activity-loading">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </View>
      ) : isError ? (
        <Text
          variant="sub-sm"
          className="py-4 text-danger-red"
          testID="security-activity-error"
        >
          We could not load your security activity.
        </Text>
      ) : entries.length === 0 ? (
        <Text
          variant="sub-sm"
          className="py-4"
          testID="security-activity-empty"
        >
          No security activity yet.
        </Text>
      ) : (
        entries.map((entry, index) => (
          <View key={entry.id}>
            {index > 0 ? <Divider /> : null}
            <ActivityRow
              description={entry.description}
              Icon={entry.Icon}
              testID={`security-activity-${entry.id}`}
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
