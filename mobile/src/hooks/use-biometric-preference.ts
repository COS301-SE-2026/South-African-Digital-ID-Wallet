import { useCallback, useEffect, useState } from 'react'
import * as LocalAuthentication from 'expo-local-authentication'
import { Alert } from 'react-native'

import { useSignOut } from '@/hooks/use-sign-out'
import { useAuthStore } from '@/stores/auth-store'

export const useBiometricPreference = () => {
  const isEnabled = useAuthStore((state) => state.isBiometricEnabled)
  const setBiometricEnabled = useAuthStore((state) => state.setBiometricEnabled)
  const [isSupported, setIsSupported] = useState(false)
  const signOut = useSignOut()

  useEffect(() => {
    void (async () => {
      const [hasHardware, isEnrolled] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
      ])
      setIsSupported(hasHardware && isEnrolled)
    })()
  }, [])

  const toggle = useCallback(
    async (nextValue: boolean) => {
      if (nextValue) {
        await setBiometricEnabled(true)
        return
      }
      Alert.alert(
        'Turn off biometric unlock?',
        'You will be signed out and will need your email and password to sign in again.',
        [
          { style: 'cancel', text: 'Cancel' },
          {
            onPress: () => {
              void (async () => {
                await setBiometricEnabled(false)
                await signOut()
              })()
            },
            style: 'destructive',
            text: 'Turn off',
          },
        ]
      )
    },
    [setBiometricEnabled, signOut]
  )

  return { isEnabled, isSupported, toggle }
}
