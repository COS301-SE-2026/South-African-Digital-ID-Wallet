import { useCallback, useMemo, useState } from 'react'
import { useFocusEffect } from 'expo-router'

import { Button, Text } from '@/components/atoms'
import {
  BreakGlassGate,
  EmergencyProfileCard,
  QrCameraScanner,
} from '@/components/organisms'
import { DetailScreen, ScannerScreen } from '@/components/templates'
import { useEmergencyOfflineRead, useEmergencyResolve } from '@/hooks'
import { toOfflineEmergencyProfile } from '@/lib/offline/emergency-display'
import { describeVerificationFailure } from '@/lib/offline/offline-scan-display'
import { parseScannedToken } from '@/services/scan-service'

const OFFLINE_FRAME_PREFIX = 'FID1:'

export const EmergencyScanPage = () => {
  const [code, setCode] = useState<string | null>(null)
  const [scanError, setScanError] = useState('')
  const { error, isResolving, profile, reset, resolve } = useEmergencyResolve()
  const offline = useEmergencyOfflineRead()
  const { addFrame: addOfflineFrame, reset: resetOffline } = offline

  const handleStartOver = useCallback(() => {
    setCode(null)
    setScanError('')
    reset()
    resetOffline()
  }, [reset, resetOffline])

  useFocusEffect(useCallback(() => handleStartOver, [handleStartOver]))

  const handleScan = useCallback(
    (rawText: string) => {
      if (rawText.startsWith(OFFLINE_FRAME_PREFIX)) {
        setScanError('')
        addOfflineFrame(rawText)
        return
      }

      const parsed = parseScannedToken(rawText)
      if (parsed?.type === 'emergency') {
        setScanError('')
        setCode(parsed.token)
        return
      }
      setScanError('This is not a FlashID emergency code.')
    },
    [addOfflineFrame]
  )

  const handleConfirm = useCallback(
    (justification: string) => {
      if (code === null) {
        return
      }
      void resolve({ code, justification, wasOffline: false }).catch(
        () => undefined
      )
    },
    [code, resolve]
  )

  const offlineProfile = useMemo(
    () =>
      offline.result?.ok && offline.accessedAt
        ? toOfflineEmergencyProfile(offline.result.claims, offline.accessedAt)
        : null,
    [offline.accessedAt, offline.result]
  )

  const shownProfile = profile ?? offlineProfile

  if (shownProfile) {
    return (
      <DetailScreen
        action={
          <Button
            label="Scan another code"
            onPress={handleStartOver}
            testID="emergency-done-button"
          />
        }
        onBack={handleStartOver}
        testID="emergency-profile-screen"
        title="Emergency profile"
      >
        <EmergencyProfileCard profile={shownProfile} />
        <Text variant="caption" className="text-center">
          {offlineProfile
            ? 'Read offline on this phone. The citizen is told when this phone reconnects.'
            : 'This access has been recorded and the citizen has been notified.'}
        </Text>
      </DetailScreen>
    )
  }

  if (code !== null || offline.result?.ok) {
    const isOffline = code === null
    return (
      <DetailScreen
        onBack={handleStartOver}
        testID="emergency-gate-screen"
        title="Confirm emergency access"
      >
        <BreakGlassGate
          error={isOffline ? offline.gateError : error}
          isOffline={isOffline}
          isSubmitting={isOffline ? offline.isConfirming : isResolving}
          onCancel={handleStartOver}
          onConfirm={
            isOffline
              ? (justification) => void offline.confirm(justification)
              : handleConfirm
          }
        />
      </DetailScreen>
    )
  }

  const offlineFailure =
    offline.result && !offline.result.ok
      ? describeVerificationFailure(offline.result.code)
      : ''
  const receiving = offline.progress
    ? `Receiving offline code: ${offline.progress.received} of ${offline.progress.total}`
    : ''

  return (
    <ScannerScreen
      action={
        offlineFailure ? (
          <Button
            label="Retry"
            onPress={resetOffline}
            testID="emergency-offline-retry"
            variant="text"
          />
        ) : undefined
      }
      subtitle={
        offlineFailure ||
        receiving ||
        scanError ||
        'Scan the emergency QR on the locked phone'
      }
      testID="emergency-scan-screen"
      title="Emergency scan"
    >
      <QrCameraScanner onScan={handleScan} testID="emergency-camera" />
    </ScannerScreen>
  )
}
