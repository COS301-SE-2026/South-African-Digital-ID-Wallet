import { View } from 'react-native'

import { Card, IconTile, Text } from '@/components/atoms'
import { cn } from '@/lib/utils'

import type { AuditLogRowProps } from './types'

const OUTCOME_STYLES: Record<string, string> = {
  Access: 'text-national-blue',
  Failed: 'text-danger-red',
  Success: 'text-primary-green',
}

export const AuditLogRow = ({ entry, testID }: AuditLogRowProps) => {
  const meta = [entry.saId, entry.ipAddress].filter(Boolean).join('  ·  ')

  return (
    <Card className="gap-3" testID={testID}>
      <View className="flex-row items-start gap-3">
        <IconTile
          Icon={entry.Icon}
          shape="rounded"
          size="sm"
          tone={entry.tone}
        />
        <View className="flex-1 gap-0.5">
          <Text variant="sub-sm" className="font-semibold text-text-primary">
            {entry.title}
          </Text>
          <Text variant="caption" numberOfLines={2}>
            {entry.details}
          </Text>
        </View>
        <Text variant="caption">{entry.time}</Text>
      </View>

      <View className="gap-1 border-t border-border-grey pt-2.5">
        <View className="flex-row items-center gap-2">
          <Text variant="caption" numberOfLines={1} className="flex-1">
            {entry.subject ? `${entry.actor} • ${entry.subject}` : entry.actor}
          </Text>
          <Text
            variant="caption"
            className={cn(
              'font-semibold',
              OUTCOME_STYLES[entry.outcome] ?? OUTCOME_STYLES.Success
            )}
          >
            {entry.outcome}
          </Text>
        </View>
        {meta ? (
          <Text variant="caption" numberOfLines={1} testID={`${testID}-meta`}>
            {meta}
          </Text>
        ) : null}
      </View>
    </Card>
  )
}
