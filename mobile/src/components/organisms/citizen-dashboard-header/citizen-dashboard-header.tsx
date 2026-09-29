import { Bell } from 'lucide-react-native'
import { View } from 'react-native'

import { Text } from '@/components/atoms'
import { IconButton } from '@/components/molecules'

import type { CitizenDashboardHeaderProps } from './types'

export const CitizenDashboardHeader = ({
  hasUnreadNotifications = false,
  name,
  onNotificationsPress,
  subtitle,
}: CitizenDashboardHeaderProps) => (
  <View className="gap-2" testID="citizen-dashboard-header">
    <View className="flex-row items-start justify-between">
      <View className="flex-1" />
      <IconButton
        accessibilityLabel="Notifications"
        hasBadge={hasUnreadNotifications}
        Icon={Bell}
        onPress={onNotificationsPress}
        testID="notifications-button"
      />
    </View>
    <Text variant="h1" className="text-clean-white">
      {`Hello, ${name}`}
    </Text>
    <Text variant="sub-md" className="text-clean-white/70">
      {subtitle}
    </Text>
  </View>
)
