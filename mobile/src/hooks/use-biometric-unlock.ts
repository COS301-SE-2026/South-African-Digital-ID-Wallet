import { useCallback, useState } from 'react'
import * as LocalAuthentication from 'expo-local-authentication'

export type UnlockStatus =
  | 'idle'
  | 'checking'
  | 'unlocked'
  | 'denied'
  | 'unavailable'

const UNAVAILABLE_ERRORS = ['not_enrolled', 'not_available', 'no_hardware']

export const useBiometricUnlock = () => {
  const [status, setStatus] = useState<UnlockStatus>('idle')

  const unlock = useCallback(async (prompt: string): Promise<UnlockStatus> => {
    setStatus('checking')
    // SECRET means a PIN, pattern or password; the prompt falls back to it
    // on phones whose biometrics apps cannot use.
    const level = await LocalAuthentication.getEnrolledLevelAsync()
    if (level === LocalAuthentication.SecurityLevel.NONE) {
      setStatus('unavailable')
      return 'unavailable'
    }
    const result = await LocalAuthentication.authenticateAsync({
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
      promptMessage: prompt,
    })
    const next: UnlockStatus = result.success
      ? 'unlocked'
      : UNAVAILABLE_ERRORS.includes(result.error)
        ? 'unavailable'
        : 'denied'
    setStatus(next)
    return next
  }, [])

  const reset = useCallback(() => setStatus('idle'), [])

  return { reset, status, unlock }
}
