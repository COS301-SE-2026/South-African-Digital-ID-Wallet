import { ChevronRight, ShieldAlert, ShieldCheck } from 'lucide-react-native'
import { Pressable, View } from 'react-native'

import { IconTile, Skeleton, Text } from '@/components/atoms'
import { cn } from '@/lib/utils'
import { colors } from '@/theme/colors'

import type { SecurityStatusCardProps } from './types'

const alertCountLabel = (count: number) =>
  `${count} active security ${count === 1 ? 'alert' : 'alerts'}`

export const SecurityStatusCard = ({
  activeAlertCount,
  alertTitle,
  isPending,
  onPress,
  testID = 'security-status-card',
}: SecurityStatusCardProps) => {
  if (isPending) {
    return <Skeleton className="h-20" />
  }

  const isAtRisk = activeAlertCount > 0
  const handlePress = isAtRisk ? onPress : undefined
  const Container = handlePress ? Pressable : View

  return (
    <Container
      accessibilityRole={handlePress ? 'button' : undefined}
      className={cn(
        'flex-row items-center gap-3 rounded-2xl border p-4 active:opacity-85',
        isAtRisk
          ? 'border-danger-red/30 bg-danger-red/10'
          : 'border-primary-green/30 bg-primary-green/10'
      )}
      onPress={handlePress}
      testID={testID}
    >
      <IconTile
        Icon={isAtRisk ? ShieldAlert : ShieldCheck}
        shape="circle"
        tone={isAtRisk ? 'red' : 'green'}
      />
      <View className="flex-1 gap-0.5">
        <Text
          className={cn(
            'text-base font-bold',
            isAtRisk ? 'text-danger-red' : 'text-deep-green'
          )}
        >
          {isAtRisk ? 'Your account is at risk' : 'Your account is protected'}
        </Text>
        <Text variant="sub-sm" className="text-text-primary">
          {isAtRisk
            ? alertCountLabel(activeAlertCount)
            : "No active security alerts. We'll keep watching."}
        </Text>
        {isAtRisk && alertTitle ? (
          <Text variant="caption">{`Latest: ${alertTitle}`}</Text>
        ) : null}
      </View>
      {handlePress ? <ChevronRight color={colors.danger} size={18} /> : null}
    </Container>
  )
}
