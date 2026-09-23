import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react-native'
import { View } from 'react-native'
import QRCode from 'react-native-qrcode-svg'

import { Button, Text } from '@/components/atoms'
import { CountdownRing } from '@/components/molecules'
import { QR_LIFETIME_SECONDS } from '@/services/qr-service'
import { colors } from '@/theme/colors'

import type { QrCodeCardProps } from './types'

const QR_SIZE = 236
const OFFLINE_FRAME_RATE = 8
const OFFLINE_FRAME_INTERVAL_MS = 1000 / OFFLINE_FRAME_RATE

export const QrCodeCard = ({
  onCancel,
  onRefresh,
  secondsRemaining,
  testID = 'qr-code-card',
  token,
  offlineFrames = [],
}: QrCodeCardProps) => {
  const [frameIndex, setFrameIndex] = useState(0)
  const isOffline = offlineFrames.length > 0
  const isExpired = secondsRemaining <= 0

  useEffect(() => {
    if (!isOffline || offlineFrames.length <= 1) {
      return
    }

    const interval = setInterval(() => {
      setFrameIndex((currentIndex) => (currentIndex + 1) % offlineFrames.length)
    }, OFFLINE_FRAME_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [isOffline, offlineFrames.length])

  const currentFrameIndex =
    isOffline && offlineFrames.length > 0
      ? frameIndex % offlineFrames.length
      : 0

  const qrValue = isOffline
    ? (offlineFrames[currentFrameIndex] ?? '')
    : (token ?? '')

  return (
    <View
      className="items-center gap-5 rounded-3xl bg-clean-white p-6"
      testID={testID}
    >
      <View className="overflow-hidden rounded-2xl">
        <QRCode
          backgroundColor={colors.white}
          color={colors.black}
          // logo covers modules, and dense offline frames need every one of them to scan at 8fps
          logo={isOffline ? undefined : require('../../../../assets/icon.png')}
          logoBackgroundColor={colors.white}
          logoBorderRadius={12}
          logoSize={46}
          quietZone={12}
          size={QR_SIZE}
          value={qrValue}
        />

        {!isOffline && isExpired ? (
          <View
            className="absolute inset-0 items-center justify-center bg-clean-white/90"
            testID="qr-expired-overlay"
          >
            <Text variant="h4" className="text-danger-red">
              Code expired
            </Text>
            <Text variant="caption">Refresh to show a new one</Text>
          </View>
        ) : null}
      </View>

      {isOffline ? (
        <View className="items-center gap-1" testID="offline-frame-status">
          <Text variant="sub-md" className="text-center text-text-primary">
            Showing offline verification code
          </Text>
          <Text variant="caption" testID="offline-frame-progress">
            Frame {currentFrameIndex + 1} of {offlineFrames.length}
          </Text>
        </View>
      ) : (
        <Text variant="sub-md" className="text-center text-text-primary">
          Present this QR code to verify your identity
        </Text>
      )}

      {isOffline ? null : (
        <View className="items-center gap-2">
          <Text variant="caption">This code expires in</Text>
          <CountdownRing
            secondsRemaining={secondsRemaining}
            totalSeconds={QR_LIFETIME_SECONDS}
          />
        </View>
      )}

      <View className="w-full gap-3">
        <Button
          label="Refresh Code"
          LeftIcon={RefreshCw}
          onPress={onRefresh}
          testID="qr-refresh-button"
          variant="secondary"
        />
        <Button
          label="Cancel"
          onPress={onCancel}
          testID="qr-cancel-button"
          variant="danger"
        />
      </View>
    </View>
  )
}
