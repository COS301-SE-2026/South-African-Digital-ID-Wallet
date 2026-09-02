import { Smartphone } from 'lucide-react-native'
import { Pressable, View } from 'react-native'

import { Text } from '@/components/atoms'
import { colors } from '@/theme/colors'

import type { LinkedDeviceRowProps } from './types'

export const LinkedDeviceRow = ({
  isCurrent,
  isUnlinking = false,
  lastActive,
  location,
  name,
  onUnlink,
  testID,
}: LinkedDeviceRowProps) => (
  <View
    className="flex-row items-center gap-3 rounded-2xl border border-border-grey bg-clean-white px-4 py-3"
    testID={testID}
  >
    <Smartphone size={20} color={colors.textSecondary} />
    <View className="flex-1">
      <Text className="text-base font-semibold text-text-primary">{name}</Text>
      <Text variant="caption">
        {[location, lastActive].filter(Boolean).join(' · ')}
      </Text>
    </View>
    {isCurrent ? (
      <Text variant="caption" className="font-semibold text-primary-green">
        This device
      </Text>
    ) : (
      <Pressable
        accessibilityLabel={`Unlink ${name}`}
        accessibilityRole="button"
        disabled={isUnlinking}
        hitSlop={8}
        onPress={onUnlink}
        testID={testID ? `${testID}-unlink` : undefined}
      >
        <Text variant="caption" className="font-semibold text-danger-red">
          Unlink
        </Text>
      </Pressable>
    )}
  </View>
)
