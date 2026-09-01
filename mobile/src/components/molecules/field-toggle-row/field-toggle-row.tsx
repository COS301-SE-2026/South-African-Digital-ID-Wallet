import { Lock } from 'lucide-react-native'
import { Switch, View } from 'react-native'

import { Text } from '@/components/atoms'
import { colors } from '@/theme/colors'

import type { FieldToggleRowProps } from './types'

export const FieldToggleRow = ({
  isLocked = false,
  isOn,
  label,
  onToggle,
  testID,
}: FieldToggleRowProps) => (
  <View
    className="flex-row items-center justify-between rounded-2xl border border-border-grey bg-clean-white px-4 py-3"
    testID={testID}
  >
    <View className="flex-1 flex-row items-center gap-2 pr-3">
      <Text className="text-base font-semibold text-text-primary">{label}</Text>
      {isLocked ? <Lock size={13} color={colors.textMuted} /> : null}
    </View>
    <Switch
      disabled={isLocked}
      ios_backgroundColor={colors.border}
      onValueChange={onToggle}
      testID={testID ? `${testID}-switch` : undefined}
      thumbColor={colors.white}
      trackColor={{ false: colors.border, true: colors.primaryGreen }}
      value={isOn}
    />
  </View>
)
