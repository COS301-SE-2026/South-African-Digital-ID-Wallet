import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Text } from '@/components/atoms'

import type { WalletScreenProps } from './types'

export const WalletScreen = ({
  action,
  children,
  subtitle,
  testID = 'wallet-screen',
  title,
}: WalletScreenProps) => {
  const insets = useSafeAreaInsets()
  return (
    <View className="flex-1 bg-cream-background" testID={testID}>
      <View
        className="flex-row items-start justify-between px-5 pb-5"
        style={{ paddingTop: insets.top + 12 }}
      >
        <View className="flex-1 pr-3">
          <Text variant="h1">{title}</Text>
          {subtitle ? (
            <Text variant="sub-sm" className="mt-1">
              {subtitle}
            </Text>
          ) : null}
        </View>
        {action}
      </View>
      <View className="flex-1 px-5">{children}</View>
    </View>
  )
}
