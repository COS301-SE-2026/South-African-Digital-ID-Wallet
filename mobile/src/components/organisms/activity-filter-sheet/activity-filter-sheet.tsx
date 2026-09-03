import { Check } from 'lucide-react-native'
import { Pressable, View } from 'react-native'

import { Text } from '@/components/atoms'
import { SettingsSheet } from '@/components/organisms'
import type { ActivityRange } from '@/services/citizen-dashboard-service'
import { colors } from '@/theme/colors'

import type { ActivityFilterSheetProps } from './types'

const RANGES: { label: string; value: ActivityRange }[] = [
  { label: 'All time', value: 'all' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
]

export const ActivityFilterSheet = ({
  isVisible,
  onClose,
  onSelect,
  range,
  testID = 'activity-filter-sheet',
}: ActivityFilterSheetProps) => (
  <SettingsSheet
    isVisible={isVisible}
    onClose={onClose}
    subtitle="Choose how far back to look."
    testID={testID}
    title="Filter activity"
  >
    <View className="gap-2">
      {RANGES.map((option) => {
        const isActive = option.value === range
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            className="flex-row items-center justify-between rounded-2xl border border-border-grey px-4 py-3.5 active:opacity-70"
            key={option.value}
            onPress={() => {
              onSelect(option.value)
              onClose()
            }}
            testID={`${testID}-${option.value}`}
          >
            <Text className="text-base font-semibold text-text-primary">
              {option.label}
            </Text>
            {isActive ? <Check size={18} color={colors.primaryGreen} /> : null}
          </Pressable>
        )
      })}
    </View>
  </SettingsSheet>
)
