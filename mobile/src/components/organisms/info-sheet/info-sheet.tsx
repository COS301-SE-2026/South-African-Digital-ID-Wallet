import { View } from 'react-native'

import { Text } from '@/components/atoms'
import { SettingsSheet } from '@/components/organisms'

import type { InfoSheetProps } from './types'

export const InfoSheet = ({
  isVisible,
  items,
  onClose,
  subtitle,
  testID = 'info-sheet',
  title,
}: InfoSheetProps) => (
  <SettingsSheet
    isVisible={isVisible}
    onClose={onClose}
    subtitle={subtitle}
    testID={testID}
    title={title}
  >
    <View className="gap-4">
      {items.map((item) => (
        <View className="gap-1" key={item.title ?? item.body}>
          {item.title ? (
            <Text className="text-base font-semibold text-text-primary">
              {item.title}
            </Text>
          ) : null}
          <Text variant="sub-sm">{item.body}</Text>
        </View>
      ))}
    </View>
  </SettingsSheet>
)
