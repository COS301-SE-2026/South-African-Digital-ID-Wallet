import { ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import type { CitizenDashboardScreenProps } from './types'

export const CitizenDashboardScreen = ({
  children,
  header,
  testID = 'citizen-dashboard-screen',
}: CitizenDashboardScreenProps) => {
  const insets = useSafeAreaInsets()
  return (
    <View className="flex-1 bg-cream-background" testID={testID}>
      <View
        className="bg-deep-green px-5 pb-20"
        style={{ paddingTop: insets.top + 12 }}
      >
        {header}
      </View>
      <ScrollView
        className="-mt-14"
        contentContainerClassName="gap-6 px-5 pb-10"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  )
}
