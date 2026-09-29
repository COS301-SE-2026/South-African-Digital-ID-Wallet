import { Pressable, View } from 'react-native'

import { cn } from '@/lib/utils'
import { colors } from '@/theme/colors'

import type { IconButtonProps } from './types'

export const IconButton = ({
  accessibilityLabel,
  className,
  color = colors.white,
  hasBadge = false,
  Icon,
  onPress,
  size = 22,
  testID,
}: IconButtonProps) => (
  <Pressable
    accessibilityLabel={accessibilityLabel}
    accessibilityRole="button"
    hitSlop={10}
    onPress={onPress}
    testID={testID}
    className={cn(
      'h-10 w-10 items-center justify-center rounded-full active:opacity-70',
      className
    )}
  >
    <Icon size={size} color={color} />
    {hasBadge ? (
      <View
        className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border border-deep-green bg-accent-gold"
        testID={testID ? `${testID}-badge` : undefined}
      />
    ) : null}
  </Pressable>
)
