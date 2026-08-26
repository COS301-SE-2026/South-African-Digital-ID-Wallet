import { useCallback, useState } from 'react'
import * as LocalAuthentication from 'expo-local-authentication'
import { useFocusEffect } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'

import { Button, Text } from '@/components/atoms'
import { colors } from '@/theme/colors'

import { BiometricGateProps, GateStatus } from './types'

const UNAVAILABLE_ERRORS = ['not_enrolled', 'not_available', 'no_hardware']

export const BiometricGate = ({ children, prompt }: BiometricGateProps) => {
  const [status, setStatus] = useState<GateStatus>('checking')
  const authenticate = useCallback(async () => {
    setStatus('checking')
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: prompt,
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    })
    if (result.success) {
      setStatus('unlocked')
      return
    }
    setStatus(
      UNAVAILABLE_ERRORS.includes(result.error) ? 'unavailable' : 'locked'
    )
  }, [prompt])

  useFocusEffect(
    useCallback(() => {
      void authenticate()
      return () => setStatus('locked')
    }, [authenticate])
  )

  if (status === 'unlocked') {
    return <>{children}</>
  }

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-cream-background px-6">
      {status === 'checking' ? (
        <ActivityIndicator color={colors.primaryGreen} size="large" />
      ) : status === 'unavailable' ? (
        <>
          <Text variant="h3">Device lock required</Text>
          <Text variant="sub-md" className="text-center">
            Set up a screen lock or biometrics on this device to show your
            digital ID.
          </Text>
        </>
      ) : (
        <>
          <Text variant="h3">Identity check</Text>
          <Text variant="sub-md" className="text-center">
            {prompt}
          </Text>
          <Button label="Try again" onPress={() => void authenticate()} />
        </>
      )}
    </View>
  )
}
