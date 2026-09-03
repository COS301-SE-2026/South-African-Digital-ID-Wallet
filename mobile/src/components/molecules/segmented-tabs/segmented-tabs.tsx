import { Pressable, View } from 'react-native'

import { Text } from '@/components/atoms'
import { cn } from '@/lib/utils'

import type { SegmentedTabsProps } from './types'

export const SegmentedTabs = ({
  activeName,
  onChange,
  options,
  testID = 'segmented-tabs',
}: SegmentedTabsProps) => (
  <View
    className="flex-row gap-1 rounded-2xl border border-border-grey bg-cream-background p-1"
    testID={testID}
  >
    {options.map((option) => {
      const isActive = option.name === activeName
      return (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: isActive }}
          className={cn(
            'flex-1 items-center rounded-xl py-2.5 active:opacity-70',
            isActive && 'bg-clean-white'
          )}
          key={option.name}
          onPress={() => onChange(option.name)}
          testID={`${testID}-${option.name}`}
        >
          <Text
            className={cn(
              'text-sm font-semibold',
              isActive ? 'text-deep-green' : 'text-muted-text'
            )}
          >
            {option.label}
          </Text>
        </Pressable>
      )
    })}
  </View>
)
