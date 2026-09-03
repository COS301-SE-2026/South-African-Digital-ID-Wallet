import { ActivityIndicator, View } from 'react-native'

import { Text } from '@/components/atoms'
import { LinkedDeviceRow } from '@/components/molecules'
import { SettingsSheet } from '@/components/organisms'
import { useTrustedDevices } from '@/hooks'
import { formatActivityTimestamp } from '@/lib/format-date'
import { colors } from '@/theme/colors'

import type { LinkedDevicesSheetProps } from './types'

export const LinkedDevicesSheet = ({
  isVisible,
  onClose,
}: LinkedDevicesSheetProps) => {
  const { devices, isError, isPending, isUnlinking, unlink } =
    useTrustedDevices(isVisible)

  return (
    <SettingsSheet
      isVisible={isVisible}
      onClose={onClose}
      subtitle="Devices that can sign in to your account."
      testID="linked-devices-sheet"
      title="Linked Devices"
    >
      {isPending ? (
        <ActivityIndicator color={colors.primaryGreen} />
      ) : isError ? (
        <Text variant="sub-sm" className="text-danger-red">
          We could not load your devices. Try again later.
        </Text>
      ) : devices.length === 0 ? (
        <Text variant="sub-sm">
          No linked devices yet. A device appears here once it has been verified
          on sign in.
        </Text>
      ) : (
        <View className="gap-3">
          {devices.map((device) => (
            <LinkedDeviceRow
              isCurrent={device.isCurrentDevice}
              isUnlinking={isUnlinking}
              key={device.id}
              lastActive={formatActivityTimestamp(device.lastActive)}
              location={[device.lastKnownCity, device.lastKnownCountry]
                .filter(Boolean)
                .join(', ')}
              name={device.deviceName || device.operatingSystem || 'Device'}
              onUnlink={() => unlink(device.id)}
              testID={`linked-device-${device.id}`}
            />
          ))}
        </View>
      )}
    </SettingsSheet>
  )
}
