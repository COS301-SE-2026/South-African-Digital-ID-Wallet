import { RefreshCw } from 'lucide-react-native'
import { View } from 'react-native'
import QRCode from 'react-native-qrcode-svg'

import { Button, Text } from '@/components/atoms'
import { CountdownRing } from '@/components/molecules'
import { SettingsSheet } from '@/components/organisms'
import { QR_LIFETIME_SECONDS } from '@/services/qr-service'
import { colors } from '@/theme/colors'

import type { OfficialBadgeSheetProps } from './types'

const QR_SIZE = 220

export const OfficialBadgeSheet = ({
  isVisible,
  onClose,
  onRefresh,
  secondsRemaining,
  testID = 'official-badge-sheet',
  token,
}: OfficialBadgeSheetProps) => (
  <SettingsSheet
    isVisible={isVisible}
    onClose={onClose}
    subtitle="Let a citizen scan this to confirm you are a registered official."
    testID={testID}
    title="Verify my badge"
  >
    <View className="items-center gap-5">
      {token ? (
        <View className="overflow-hidden rounded-2xl">
          <QRCode
            backgroundColor={colors.white}
            color={colors.black}
            quietZone={12}
            size={QR_SIZE}
            value={token}
          />
          {secondsRemaining <= 0 ? (
            <View
              className="absolute inset-0 items-center justify-center bg-clean-white/90"
              testID="official-badge-expired"
            >
              <Text variant="h4" className="text-danger-red">
                Badge expired
              </Text>
              <Text variant="caption">Refresh to show a new one</Text>
            </View>
          ) : null}
        </View>
      ) : (
        <View
          className="rounded-2xl bg-border-grey"
          style={{ height: QR_SIZE, width: QR_SIZE }}
          testID="official-badge-sheet-loading"
        />
      )}

      <View className="items-center gap-2">
        <Text variant="caption">This badge expires in</Text>
        <CountdownRing
          secondsRemaining={secondsRemaining}
          totalSeconds={QR_LIFETIME_SECONDS}
        />
      </View>

      <Button
        className="w-full"
        label="Refresh Badge"
        LeftIcon={RefreshCw}
        onPress={onRefresh}
        testID="official-badge-refresh"
        variant="secondary"
      />
    </View>
  </SettingsSheet>
)
