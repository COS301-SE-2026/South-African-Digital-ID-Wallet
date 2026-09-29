import { Pressable, View } from 'react-native'

import { Text } from '@/components/atoms'
import { cn } from '@/lib/utils'

import type { SegmentedTabsProps, SegmentedTabsVariant } from './types'

const CONTAINERS: Record<SegmentedTabsVariant, string> = {
  pill: 'flex-row gap-1 rounded-2xl border border-border-grey bg-cream-background p-1',
  underline: 'flex-row border-b border-border-grey',
}

const OPTIONS: Record<SegmentedTabsVariant, string> = {
  pill: 'flex-1 items-center rounded-xl py-2.5 active:opacity-70',
  underline:
    'flex-1 items-center border-b-2 border-transparent pb-3 active:opacity-70',
}

const ACTIVE_OPTIONS: Record<SegmentedTabsVariant, string> = {
  pill: 'bg-clean-white',
  underline: 'border-primary-green',
}

const ACTIVE_LABELS: Record<SegmentedTabsVariant, string> = {
  pill: 'text-deep-green',
  underline: 'text-primary-green',
}

export const SegmentedTabs = ({
  activeName,
  onChange,
  options,
  testID = 'segmented-tabs',
  variant = 'pill',
}: SegmentedTabsProps) => (
  <View className={CONTAINERS[variant]} testID={testID}>
    {options.map((option) => {
      const isActive = option.name === activeName
      return (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: isActive }}
          className={cn(OPTIONS[variant], isActive && ACTIVE_OPTIONS[variant])}
          key={option.name}
          onPress={() => onChange(option.name)}
          testID={`${testID}-${option.name}`}
        >
          <Text
            className={cn(
              'text-sm font-semibold',
              isActive ? ACTIVE_LABELS[variant] : 'text-muted-text'
            )}
          >
            {option.label}
          </Text>
        </Pressable>
      )
    })}
  </View>
)
