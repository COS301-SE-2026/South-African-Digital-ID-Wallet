import { Pressable, View } from 'react-native'

import { cn } from '@/lib/utils'

import type { CardProps } from './types'

const BASE = 'rounded-2xl border border-border-grey bg-clean-white p-4'

export const Card = ({
  accessibilityLabel,
  children,
  className,
  onPress,
  testID,
}: CardProps) => {
  if (!onPress) {
    return (
      <View className={cn(BASE, className)} testID={testID}>
        {children}
      </View>
    )
  }
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      className={cn(BASE, 'active:opacity-85', className)}
      onPress={onPress}
      testID={testID}
    >
      {children}
    </Pressable>
  )
}
