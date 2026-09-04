import { useCallback, useState } from 'react'
import { useFocusEffect, useRouter } from 'expo-router'
import { HelpCircle, ShieldAlert, Zap, ZapOff } from 'lucide-react-native'
import { ActivityIndicator, View } from 'react-native'

import { Button, Card, IconTile, Text } from '@/components/atoms'
import { IconButton } from '@/components/molecules'
import {
  QrCameraScanner,
  ScanResultCard,
  ScannerHelpModal,
} from '@/components/organisms'
import { DetailScreen, ScannerScreen } from '@/components/templates'
import { useScanCredential } from '@/hooks'
import { parseScannedToken, resolveScanError } from '@/services/scan-service'
import { colors } from '@/theme/colors'

export const QrScannerPage = () => {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState('')
  const [isFocused, setIsFocused] = useState(true)
  const [isHelpVisible, setIsHelpVisible] = useState(false)
  const [isTorchOn, setIsTorchOn] = useState(false)
  const { isResolving, reset, resolve, result } = useScanCredential()

  // The scanner lives in a tab, so the camera would keep running and the
  // disclosed fields would stay on screen after the user moves away.
  useFocusEffect(
    useCallback(() => {
      setIsFocused(true)
      return () => {
        setIsFocused(false)
        setErrorMessage('')
        reset()
      }
    }, [reset])
  )

  const handleScan = useCallback(
    (rawText: string) => {
      const parsed = parseScannedToken(rawText)
      if (!parsed) {
        setErrorMessage('This is not a valid FlashID QR code.')
        return
      }
      if (parsed.type === 'badge') {
        setErrorMessage('Scanning official badges is not available yet.')
        return
      }
      resolve(parsed.token, {
        onError: (error) => setErrorMessage(resolveScanError(error)),
      })
    },
    [resolve]
  )

  const handleScanAgain = useCallback(() => {
    setErrorMessage('')
    reset()
  }, [reset])

  if (result) {
    return (
      <DetailScreen
        action={
          <Button
            label="Scan another code"
            onPress={handleScanAgain}
            testID="scan-again-button"
          />
        }
        onBack={handleScanAgain}
        testID="scan-result-screen"
        title="Verification result"
      >
        <ScanResultCard
          credentialType={result.credentialType}
          disclosedFields={result.disclosedFields}
        />
        <Text variant="caption" className="text-center">
          Only the fields the holder chose to share are shown.
        </Text>
      </DetailScreen>
    )
  }

  if (errorMessage) {
    return (
      <DetailScreen
        action={
          <Button
            label="Scan again"
            onPress={handleScanAgain}
            testID="scan-again-button"
          />
        }
        onBack={handleScanAgain}
        testID="scan-error-screen"
        title="Verification failed"
      >
        <Card className="items-center gap-3 rounded-3xl p-8">
          <IconTile Icon={ShieldAlert} size="lg" tone="soft-red" />
          <Text variant="h3">Verification failed</Text>
          <Text variant="sub-sm" className="text-center">
            {errorMessage}
          </Text>
        </Card>
      </DetailScreen>
    )
  }

  return (
    <ScannerScreen
      action={
        <IconButton
          accessibilityLabel={isTorchOn ? 'Turn flash off' : 'Turn flash on'}
          Icon={isTorchOn ? ZapOff : Zap}
          onPress={() => setIsTorchOn((current) => !current)}
          testID="scanner-torch-button"
        />
      }
      footer={
        <View className="items-center gap-1.5">
          <IconButton
            accessibilityLabel="How to scan"
            Icon={HelpCircle}
            onPress={() => setIsHelpVisible(true)}
            testID="scanner-help-button"
          />
          <Text variant="caption" className="text-clean-white/70">
            How to scan
          </Text>
        </View>
      }
      onBack={router.canGoBack() ? () => router.back() : undefined}
      subtitle="Position the QR code within the frame to scan"
      title="Scan QR Code"
    >
      <View className="flex-1">
        <QrCameraScanner
          isTorchOn={isTorchOn}
          onScan={handleScan}
          paused={isResolving || !isFocused}
        />
        {isResolving ? (
          <View
            className="absolute inset-0 items-center justify-center gap-3 bg-secure-night/70"
            testID="scan-processing-overlay"
          >
            <ActivityIndicator color={colors.primaryGreen} size="large" />
            <Text variant="sub-sm" className="text-clean-white">
              Verifying credential...
            </Text>
          </View>
        ) : null}
        <ScannerHelpModal
          isVisible={isHelpVisible}
          onClose={() => setIsHelpVisible(false)}
        />
      </View>
    </ScannerScreen>
  )
}
