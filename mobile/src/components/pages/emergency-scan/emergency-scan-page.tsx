import { useCallback, useState } from 'react'
import { useFocusEffect } from 'expo-router'
import { ScrollView } from 'react-native'

import { Button } from '@/components/atoms'
import {
  BreakGlassGate,
  EmergencyProfileCard,
  QrCameraScanner,
} from '@/components/organisms'
import { ScannerScreen } from '@/components/templates'
import { useEmergencyResolve } from '@/hooks'
import { parseScannedToken } from '@/services/scan-service'

export const EmergencyScanPage = () => {
  const [code, setCode] = useState<string | null>(null)
  const [scanError, setScanError] = useState('')
  const { error, isResolving, profile, reset, resolve } = useEmergencyResolve()

  const handleStartOver = useCallback(() => {
    setCode(null)
    setScanError('')
    reset()
  }, [reset])

  useFocusEffect(useCallback(() => handleStartOver, [handleStartOver]))

  const handleScan = useCallback((rawText: string) => {
    const parsed = parseScannedToken(rawText)
    if (parsed?.type === 'emergency') {
      setScanError('')
      setCode(parsed.token)
      return
    }
    if (parsed?.type === 'emergency-offline') {
      setScanError('Offline emergency codes are not supported yet.')
      return
    }
    setScanError('This is not a FlashID emergency code.')
  }, [])

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

  if (profile) {
    return (
      <ScannerScreen
        footer={
          <Button
            label="Done"
            onPress={handleStartOver}
            testID="emergency-done-button"
          />
        }
        onBack={handleStartOver}
        testID="emergency-profile-screen"
        title="Emergency profile"
      >
        <ScrollView contentContainerStyle={{ paddingTop: 8 }}>
          <EmergencyProfileCard profile={profile} />
        </ScrollView>
      </ScannerScreen>
    )
  }

  if (code !== null) {
    return (
      <ScannerScreen
        onBack={handleStartOver}
        testID="emergency-gate-screen"
        title="Confirm emergency access"
      >
        <BreakGlassGate
          error={error}
          isSubmitting={isResolving}
          onCancel={handleStartOver}
          onConfirm={handleConfirm}
        />
      </ScannerScreen>
    )
  }

  return (
    <ScannerScreen
      subtitle={scanError || 'Scan the emergency QR on the locked phone'}
      testID="emergency-scan-screen"
      title="Emergency scan"
    >
      <QrCameraScanner onScan={handleScan} testID="emergency-camera" />
    </ScannerScreen>
  )
}
