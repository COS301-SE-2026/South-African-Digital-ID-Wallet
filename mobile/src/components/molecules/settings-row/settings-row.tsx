import { ChevronRight } from 'lucide-react-native'
import { Pressable, View } from 'react-native'

import { Text } from '@/components/atoms'
import { colors } from '@/theme/colors'

import type { SettingsRowProps } from './types'

export const SettingsRow = ({
  Icon,
  label,
  onPress,
  testID,
}: SettingsRowProps) => (
  <Pressable
    accessibilityLabel={label}
    accessibilityRole="button"
    className="flex-row items-center gap-3 px-4 py-4 active:opacity-70"
    onPress={onPress}
    testID={testID}
  >
    <Icon size={20} color={colors.textSecondary} />
    <View className="flex-1">
      <Text className="text-base text-text-primary">{label}</Text>
    </View>
    <ChevronRight size={18} color={colors.neutralMidGrey} />
  </Pressable>
)
