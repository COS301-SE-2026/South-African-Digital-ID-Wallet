import { ArrowLeft } from 'lucide-react-native'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Text } from '@/components/atoms'
import { IconButton } from '@/components/molecules'

import type { ScannerScreenProps } from './types'

export const ScannerScreen = ({
  action,
  children,
  footer,
  onBack,
  subtitle,
  testID = 'scanner-screen',
  title,
}: ScannerScreenProps) => {
  const insets = useSafeAreaInsets()
  return (
    <View
      className="flex-1 bg-secure-night"
      style={{ paddingBottom: insets.bottom, paddingTop: insets.top }}
      testID={testID}
    >
      <View className="flex-row items-center px-3 py-2">
        {onBack ? (
          <IconButton
            accessibilityLabel="Go back"
            Icon={ArrowLeft}
            onPress={onBack}
            testID="scanner-back-button"
          />
        ) : (
          <View className="h-10 w-10" />
        )}
        <Text
          className="flex-1 text-center text-base font-bold text-clean-white"
          numberOfLines={1}
        >
          {title}
        </Text>
        <View className="h-10 w-10 items-center justify-center">{action}</View>
      </View>

      {subtitle ? (
        <Text
          variant="sub-sm"
          className="px-12 pb-2 pt-3 text-center text-clean-white/70"
        >
          {subtitle}
        </Text>
      ) : null}

      <View className="flex-1">{children}</View>

      {footer ? <View className="px-10 pb-4 pt-6">{footer}</View> : null}
    </View>
  )
}
