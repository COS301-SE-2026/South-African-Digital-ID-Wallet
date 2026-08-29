import { Pressable, View } from 'react-native'

import { Text } from '@/components/atoms'
import { cn } from '@/lib/utils'
import { colors } from '@/theme/colors'

import type { NavTabItemProps } from './types'

export const NavTabItem = ({
  Icon,
  isFocused,
  label,
  onPress,
  testID,
  variant = 'default',
}: NavTabItemProps) => {
  const isCenter = variant === 'center'
  const iconColor = isCenter
    ? colors.white
    : isFocused
      ? colors.green
      : colors.neutralMidGrey

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: isFocused }}
      className="flex-1 items-center justify-end gap-1 active:opacity-70"
      onPress={onPress}
      testID={testID}
    >
      <View
        className={cn(
          'items-center justify-center',
          isCenter &&
            '-mt-7 h-14 w-14 rounded-full bg-primary-green shadow-lg shadow-deep-green/40'
        )}
      >
        <Icon size={isCenter ? 26 : 24} color={iconColor} />
      </View>
      <Text
        variant="caption"
        className={cn(
          isFocused ? 'font-bold text-deep-green' : 'text-neutral-mid-grey'
        )}
      >
        {label}
      </Text>
    </Pressable>
  )
}
