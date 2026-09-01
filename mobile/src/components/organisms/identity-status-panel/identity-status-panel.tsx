import { ShieldCheck } from 'lucide-react-native'
import { View } from 'react-native'

import { Card, Skeleton, Text } from '@/components/atoms'
import { StatusSummaryCard } from '@/components/molecules'
import { useIdentityStatus } from '@/hooks'

import type { IdentityStatusPanelProps } from './types'

export const IdentityStatusPanel = ({ onPress }: IdentityStatusPanelProps) => {
  const { isError, isPending, summary } = useIdentityStatus()
  if (isPending) {
    return (
      <Card testID="identity-status-loading">
        <View className="flex-row items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <View className="flex-1 gap-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-32" />
          </View>
        </View>
      </Card>
    )
  }
  if (isError) {
    return (
      <Card testID="identity-status-error">
        <Text variant="sub-sm" className="text-danger-red">
          We could not load your identity status. Pull down to try again.
        </Text>
      </Card>
    )
  }
  return (
    <StatusSummaryCard
      description={summary.description}
      Icon={ShieldCheck}
      label={summary.label}
      onPress={onPress}
      testID="identity-status-card"
      tone={summary.tone}
      value={summary.value}
    />
  )
}
