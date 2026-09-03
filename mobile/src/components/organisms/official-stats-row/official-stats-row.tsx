import { ShieldCheck } from 'lucide-react-native'
import { View } from 'react-native'

import { Card, IconTile, Skeleton, Text } from '@/components/atoms'

import type { OfficialStatsRowProps } from './types'

const caption = (isCapped: boolean, isError: boolean) => {
  if (isError) return 'We could not load your stats. Pull down to try again.'
  if (isCapped) return 'Showing recent activity only'
  return 'Checks completed at your institution today'
}

export const OfficialStatsRow = ({
  isCapped,
  isError = false,
  isPending = false,
  testID = 'official-stats-row',
  todayCount,
}: OfficialStatsRowProps) => (
  <Card className="flex-row items-center gap-4 p-5" testID={testID}>
    <IconTile Icon={ShieldCheck} size="lg" tone="soft-green" />
    <View className="flex-1" testID="stat-verifications-today">
      <Text variant="caption">Verifications today</Text>
      {isPending ? (
        <Skeleton className="mt-1 h-8 w-16" />
      ) : (
        <Text variant="h1">
          {isError ? '—' : `${todayCount}${isCapped ? '+' : ''}`}
        </Text>
      )}
      <Text variant="caption" className="mt-0.5">
        {caption(isCapped, isError)}
      </Text>
    </View>
  </Card>
)
