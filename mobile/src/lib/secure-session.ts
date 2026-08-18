import * as SecureStore from 'expo-secure-store'

const SESSION_KEY = 'flashid.session'

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
