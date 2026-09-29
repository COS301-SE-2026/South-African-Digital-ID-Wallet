import { Pressable, View } from 'react-native'

import { Text } from '@/components/atoms'
import { cn } from '@/lib/utils'

import type { SectionHeaderProps } from './types'

export const SectionHeader = ({
  actionLabel,
  className,
  onActionPress,
  testID,
  title,
}: SectionHeaderProps) => (
  <View
    className={cn('flex-row items-center justify-between', className)}
    testID={testID}
  >
    <Text variant="h4">{title}</Text>
    {actionLabel && onActionPress ? (
      <Pressable accessibilityRole="button" hitSlop={8} onPress={onActionPress}>
        <Text variant="caption" className="font-bold text-primary-green">
          {actionLabel}
        </Text>
      </Pressable>
    ) : null}
  </View>
)
