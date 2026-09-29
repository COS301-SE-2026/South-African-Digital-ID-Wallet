import { ShieldAlert } from 'lucide-react-native'
import { Pressable, View } from 'react-native'
import { Text } from '@/components/atoms'
import { colors } from '@/theme/colors'
import type { SecurityAlertCardProps } from './types'

export const SecurityAlertCard = ({
  alert,
  onPress,
}: SecurityAlertCardProps) => {
  if (!alert) {
    return null
  }
  return (
    <View
      className="gap-3 rounded-2xl bg-deep-green p-5"
      testID="security-alert-card"
    >
      <View className="flex-row items-center gap-2">
        <ShieldAlert color={colors.white} size={20} />
        <Text className="flex-1 text-base font-semibold text-clean-white">
          Security
        </Text>
        <View className="h-2.5 w-2.5 rounded-full bg-national-red" />
      </View>
      <Text variant="h4" className="text-clean-white">
        Identity risk detected
      </Text>
      <Text variant="sub-sm" className="text-clean-white/80">
        {alert.isImpossibleTravel
          ? "We've detected a possible impossible travel event on your account."
          : alert.message}
      </Text>
      <Pressable
        accessibilityRole="button"
        className="self-start rounded-full bg-clean-white px-5 py-2.5 active:opacity-85"
        onPress={() => onPress(alert.id)}
        testID="security-alert-view-details"
      >
        <Text className="text-sm font-semibold text-deep-green">
          View details
        </Text>
      </Pressable>
    </View>
  )
}
