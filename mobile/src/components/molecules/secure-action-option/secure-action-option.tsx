import { Pressable, View } from 'react-native'
import { IconTile, Text } from '@/components/atoms'
import { cn } from '@/lib/utils'
import type { SecureActionOptionProps } from './types'

export const SecureActionOption = ({
  description,
  Icon,
  isRecommended = false,
  isSelected,
  onPress,
  testID,
  title,
}: SecureActionOptionProps) => (
  <Pressable
    accessibilityLabel={title}
    accessibilityRole="radio"
    accessibilityState={{ checked: isSelected }}
    className={cn(
      'flex-row items-center gap-3 rounded-2xl border-2 bg-clean-white p-4 active:opacity-85',
      isSelected ? 'border-deep-green' : 'border-border-grey'
    )}
    onPress={onPress}
    testID={testID}
  >
    <IconTile Icon={Icon} size="sm" tone="soft-green" />
    <View className="flex-1 gap-1">
      <Text variant="sub-sm" className="font-semibold text-text-primary">
        {title}
      </Text>
      <Text variant="caption">{description}</Text>
      {isRecommended ? (
        <View className="self-start rounded-full bg-primary-green/10 px-2 py-0.5">
          <Text variant="caption" className="font-semibold text-primary-green">
            Recommended
          </Text>
        </View>
      ) : null}
    </View>
    <View
      className={cn(
        'h-5 w-5 items-center justify-center rounded-full border-2',
        isSelected ? 'border-deep-green' : 'border-neutral-mid-grey'
      )}
    >
      {isSelected ? (
        <View className="h-2.5 w-2.5 rounded-full bg-deep-green" />
      ) : null}
    </View>
  </Pressable>
)
