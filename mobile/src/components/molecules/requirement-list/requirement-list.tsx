import { View } from 'react-native'

import { Text } from '@/components/atoms'
import { cn } from '@/lib/utils'

import type { RequirementListProps } from './types'

export const RequirementList = ({ items, testID }: RequirementListProps) => {
  if (items.every((item) => item.met)) {
    return null
  }

  return (
    <View className="gap-1" testID={testID}>
      {items.map((item) => (
        <Text
          key={item.label}
          variant="caption"
          className={cn(
            item.met ? 'text-muted-text line-through' : 'text-danger-red'
          )}
        >
          {item.label}
        </Text>
      ))}
    </View>
  )
}
