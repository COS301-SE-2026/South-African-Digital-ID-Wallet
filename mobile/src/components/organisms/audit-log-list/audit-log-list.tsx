import { View } from 'react-native'

import { Button, Skeleton, Text } from '@/components/atoms'
import { AuditLogRow } from '@/components/molecules'

import type { AuditLogListProps } from './types'

const SKELETON_KEYS = ['a', 'b', 'c', 'd']

export const AuditLogList = ({
  entries,
  hasNextPage,
  isError,
  isFetchingNextPage,
  isPending,
  onLoadMore,
  testID = 'audit-log-list',
}: AuditLogListProps) => {
  if (isPending) {
    return (
      <View className="gap-3" testID="audit-log-list-loading">
        {SKELETON_KEYS.map((key) => (
          <Skeleton className="h-24 rounded-2xl" key={key} />
        ))}
      </View>
    )
  }

  if (isError) {
    return (
      <Text
        variant="sub-sm"
        className="text-danger-red"
        testID="audit-log-list-error"
      >
        We could not load the audit log. Pull down to try again.
      </Text>
    )
  }

  if (entries.length === 0) {
    return (
      <Text variant="sub-sm" testID="audit-log-list-empty">
        No audit entries match your filters.
      </Text>
    )
  }

  return (
    <View className="gap-3" testID={testID}>
      {entries.map((entry) => (
        <AuditLogRow
          entry={entry}
          key={entry.id}
          testID={`audit-log-entry-${entry.id}`}
        />
      ))}
      {hasNextPage ? (
        <Button
          disabled={isFetchingNextPage}
          label={isFetchingNextPage ? 'Loading...' : 'Load more'}
          onPress={onLoadMore}
          testID="audit-log-load-more"
          variant="secondary"
        />
      ) : null}
    </View>
  )
}
