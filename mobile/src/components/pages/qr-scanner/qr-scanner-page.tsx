import { useCallback, useEffect, useState } from 'react'
import { useFocusEffect, useNavigation, useRouter } from 'expo-router'
import { BottomTabNavigationProp } from 'expo-router/tabs'
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
import {
  useNetworkStatus,
  useOfflineScan,
  useScanCredential,
  useVerifierTrust,
 useRecordOfflineVerification } from '@/hooks'
import {
  describeVerificationFailure,
  toOfflineScanDisplay,
} from '@/lib/offline/offline-scan-display'
import { parseScannedToken, resolveScanError } from '@/services/scan-service'
import { colors } from '@/theme/colors'

export const QrScannerPage = () => {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState('')
  const [isFocused, setIsFocused] = useState(true)
  const [isHelpVisible, setIsHelpVisible] = useState(false)
  const [isTorchOn, setIsTorchOn] = useState(false)
  const { isResolving, reset, resolve, result } = useScanCredential()
  const { isOffline } = useNetworkStatus()
  const { isLoading: isTrustLoading, trust } = useVerifierTrust()
  const recordOfflineVerification = useRecordOfflineVerification()
  const {
    addFrame,
    progress: offlineProgress,
    reset: resetOfflineScan,
    result: offlineResult,
  } = useOfflineScan(trust, isTrustLoading, recordOfflineVerification)

  // Leaving the tab does not unmount this screen, so the result and any half-collected offline code are cleared on the way out,
  // and coming back alwats starts a fresh scan.
  useFocusEffect(
    useCallback(() => {
      setIsFocused(true)
      return () => {
        setIsFocused(false)
        setErrorMessage('')
        reset()
        resetOfflineScan()
      }
    }, [reset, resetOfflineScan])
  )

  const handleScan = useCallback(
    (rawText: string) => {
      // Offline frames are collected until the whole presentation has arrived, then verified on
      // this phone with no network call.
      if (rawText.startsWith('FID1:')) {
        addFrame(rawText)
        return
      }

      const parsed = parseScannedToken(rawText)
      if (!parsed) {
        setErrorMessage('This is not a valid FlashID QR code.')
        return
      }
      if (parsed.type === 'badge') {
        setErrorMessage('Scanning official badges is not available yet.')
        return
      }

      // Online codes are resolved by the server, so without signal the verifier is told what to asj for instead.
      if (isOffline) {
        setErrorMessage(
          'No connection. Ask the citizen to show their offline code.'
        )
        return
      }
      resolve(parsed.token, {
        onError: (error) => setErrorMessage(resolveScanError(error)),
      })
    },
    [addFrame, isOffline, resolve]
  )

  const handleScanAgain = useCallback(() => {
    setErrorMessage('')
    reset()
    // The offline result lives in its own hook, so it is cleared too or its screen stays up
    resetOfflineScan()
  }, [reset, resetOfflineScan])

  const navigation =
    useNavigation<BottomTabNavigationProp<Record<string, object | undefined>>>()

  // The tab bar ignores a press on the open tab, so pressing Verify here starts a new scan instead.
  useEffect(
    () => navigation.addListener('tabPress', handleScanAgain),
    [handleScanAgain, navigation]
  )

  // Derived rather than stored, so it can never drift from the verification result it describes.
  const displayedError =
    errorMessage ||
    (offlineResult && !offlineResult.ok
      ? describeVerificationFailure(offlineResult.code)
      : '')

  if (offlineResult?.ok) {
    const display = toOfflineScanDisplay(
      offlineResult.vct,
      offlineResult.claims
    )

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
        testID="offline-scan-result-screen"
        title="Verification result"
      >
        <ScanResultCard
          credentialType={display.credentialType}
          disclosedFields={display.disclosedFields}
        />
        <Text variant="caption" className="text-center">
          Verified offline on this phone. Only the fields the holder chose to
          share are shown.
        </Text>
        {offlineResult.warnings.map((warning) => (
          <Text
            key={warning}
            variant="caption"
            className="text-center text-warning-orange"
          >
            {warning}
          </Text>
        ))}
      </DetailScreen>
    )
  }

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

  if (displayedError) {
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
            {displayedError}
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
        {offlineProgress ? (
          <View
            className="absolute bottom-10 left-0 right-0 items-center"
            testID="offline-scan-progress"
          >
            <Text variant="sub-sm" className="text-clean-white">
              Receiving offline code: {offlineProgress.received} of{' '}
              {offlineProgress.total}
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
