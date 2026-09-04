import * as SecureStore from 'expo-secure-store'

const SESSION_KEY = 'flashid.session'
const BIOMETRIC_KEY = 'flashid.biometric-unlock'

export type PersistedSession = {
  expiresAt: string
  token: string
  user: { names: string; role: string; surname: string; userId: string }
}

export const saveSession = (session: PersistedSession) =>
  SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session), {
    keychainAccessible: SecureStore.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
  })

export const clearSession = () => SecureStore.deleteItemAsync(SESSION_KEY)

export const loadSession = async (): Promise<PersistedSession | null> => {
  const raw = await SecureStore.getItemAsync(SESSION_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as PersistedSession
  } catch {
    await clearSession()
    return null
  }
}

const BIOMETRIC_PROMPTED_KEY = 'flashid.biometric-prompted'

export const setBiometricPrompted = () =>
  SecureStore.setItemAsync(BIOMETRIC_PROMPTED_KEY, '1')

export const getBiometricPrompted = async () =>
  (await SecureStore.getItemAsync(BIOMETRIC_PROMPTED_KEY)) === '1'

export const setBiometricPreference = (isEnabled: boolean) =>
  SecureStore.setItemAsync(BIOMETRIC_KEY, isEnabled ? '1' : '0')

export const getBiometricPreference = async () =>
  (await SecureStore.getItemAsync(BIOMETRIC_KEY)) === '1'
