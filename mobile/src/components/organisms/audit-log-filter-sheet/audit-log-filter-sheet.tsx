import { Check } from 'lucide-react-native'
import { Pressable, ScrollView, View } from 'react-native'

import { Text } from '@/components/atoms'
import { SettingsSheet } from '@/components/organisms'
import { humanizeAction } from '@/services/audit-log-service'
import { colors } from '@/theme/colors'

import type { AuditLogFilterSheetProps } from './types'

const ALL_VALUE = 'all'

export const AuditLogFilterSheet = ({
  action,
  actions,
  isVisible,
  onClose,
  onSelect,
  testID = 'audit-log-filter-sheet',
}: AuditLogFilterSheetProps) => {
  const options = [
    { label: 'All actions', value: ALL_VALUE },
    ...actions.map((name) => ({ label: humanizeAction(name), value: name })),
  ]
  const activeValue = action ?? ALL_VALUE

  return (
    <SettingsSheet
      isVisible={isVisible}
      onClose={onClose}
      subtitle="Narrow the log to a single kind of event."
      testID={testID}
      title="Filter by action"
    >
      <ScrollView className="max-h-96" showsVerticalScrollIndicator={false}>
        <View className="gap-2">
          {options.map((option) => {
            const isActive = option.value === activeValue
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                className="flex-row items-center justify-between rounded-2xl border border-border-grey px-4 py-3.5 active:opacity-70"
                key={option.value}
                onPress={() => {
                  onSelect(
                    option.value === ALL_VALUE ? undefined : option.value
                  )
                  onClose()
                }}
                testID={`${testID}-${option.value}`}
              >
                <Text className="text-base font-semibold text-text-primary">
                  {option.label}
                </Text>
                {isActive ? (
                  <Check size={18} color={colors.primaryGreen} />
                ) : null}
              </Pressable>
            )
          })}
        </View>
      </ScrollView>
    </SettingsSheet>
  )
}
