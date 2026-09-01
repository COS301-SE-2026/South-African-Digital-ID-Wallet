import { ArrowLeft } from 'lucide-react-native'
import { Pressable, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Text } from '@/components/atoms'
import { colors } from '@/theme/colors'

import type { DetailScreenProps } from './types'

export const DetailScreen = ({
  action,
  children,
  onBack,
  testID = 'detail-screen',
  title,
}: DetailScreenProps) => {
  const insets = useSafeAreaInsets()
  return (
    <View
      className="flex-1 bg-clean-white"
      style={{ paddingTop: insets.top }}
      testID={testID}
    >
      <View className="flex-row items-center px-3 py-2">
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          className="h-10 w-10 items-center justify-center rounded-full active:opacity-60"
          onPress={onBack}
          testID="detail-back-button"
        >
          <ArrowLeft size={22} color={colors.textPrimary} />
        </Pressable>
        <Text
          className="flex-1 text-center text-base font-bold text-text-primary"
          numberOfLines={1}
        >
          {title}
        </Text>
        <View className="h-10 w-10" />
      </View>

      <ScrollView
        contentContainerClassName="gap-5 px-5 pb-8"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>

      {action ? (
        <View className="border-t border-border-grey px-5 pb-4 pt-4">
          {action}
        </View>
      ) : null}
    </View>
  )
}
