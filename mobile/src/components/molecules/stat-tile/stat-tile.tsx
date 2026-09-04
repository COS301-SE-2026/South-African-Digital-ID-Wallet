import { View } from 'react-native'

import { Card, IconTile, Skeleton, Text } from '@/components/atoms'

import type { StatTileProps } from './types'

export const StatTile = ({
  caption,
  className,
  Icon,
  isPending = false,
  label,
  testID,
  tone = 'soft-green',
  value,
}: StatTileProps) => (
  <Card className={className} testID={testID}>
    <IconTile Icon={Icon} size="sm" tone={tone} />
    <Text variant="caption" className="mt-3">
      {label}
    </Text>
    {isPending ? (
      <Skeleton className="mt-1 h-7 w-12" />
    ) : (
      <Text variant="h2">{value}</Text>
    )}
    {caption ? <Text variant="caption">{caption}</Text> : null}
  </Card>
)
