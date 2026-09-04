import { ActivityIndicator, View } from 'react-native'

import { Text } from '@/components/atoms'
import { SettingsSheet } from '@/components/organisms'
import { useUserNotifications } from '@/hooks'
import { colors } from '@/theme/colors'

import type { NotificationsSheetProps } from './types'

const TONE_CLASSNAMES: Record<string, string> = {
  success: 'border-success-green/30 bg-success-green/5',
  warning: 'border-warning-amber/30 bg-warning-amber/5',
  danger: 'border-danger-red/30 bg-danger-red/5',
}

export const NotificationsSheet = ({
  isVisible,
  onClose,
}: NotificationsSheetProps) => {
  const { isError, isPending, notifications } = useUserNotifications(isVisible)

  return (
    <SettingsSheet
      isVisible={isVisible}
      onClose={onClose}
      subtitle="Recent alerts about your account."
      testID="notifications-sheet"
      title="Notifications"
    >
      {isPending ? (
        <ActivityIndicator color={colors.primaryGreen} />
      ) : isError ? (
        <Text variant="sub-sm" className="text-danger-red">
          We could not load your notifications.
        </Text>
      ) : notifications.length === 0 ? (
        <Text variant="sub-sm">You have no notifications right now.</Text>
      ) : (
        <View className="gap-3">
          {notifications.map((notification) => (
            <View
              className={`gap-1 rounded-2xl border px-4 py-3 ${
                TONE_CLASSNAMES[(notification.tone ?? '').toLowerCase()] ??
                'border-border-grey bg-clean-white'
              }`}
              key={notification.id}
              testID={`notification-${notification.id}`}
            >
              <Text className="text-base font-semibold text-text-primary">
                {notification.title}
              </Text>
              <Text variant="sub-sm">{notification.description}</Text>
            </View>
          ))}
        </View>
      )}
    </SettingsSheet>
  )
}
