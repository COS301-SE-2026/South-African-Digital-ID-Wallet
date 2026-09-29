import { View } from 'react-native'

import { Text } from '@/components/atoms'
import { cn } from '@/lib/utils'

import type { DividerProps } from './types'

export const Divider = ({ className, label }: DividerProps) => {
  if (!label) {
    return <View className={cn('h-px bg-border-grey', className)} />
  }
  return (
    <View className={cn('flex-row items-center gap-4', className)}>
      <View className="h-px flex-1 bg-border-grey" />
      <Text variant="caption" className="tracking-widest">
        {label}
      </Text>
      <View className="h-px flex-1 bg-border-grey" />
    </View>
  )
}
