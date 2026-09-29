import { create } from 'zustand'
import { setAuthToken, setDeviceToken } from '@/lib/api'
import { loadDeviceToken, saveDeviceToken } from '@/lib/device-identity'
import {
  clearSession,
  getBiometricPreference,
  loadSession,
  saveSession,
  setBiometricPreference,
} from '@/lib/secure-session'
import { offlineService } from '@/services/offline-service'
import type { LoginResponse } from '@/services/login-service'

export type AuthUser = {
  names: string
  role: string
  surname: string
  userId: string
}

type AuthState = {
  expiresAt: string | null
  isAuthenticated: boolean
  isBiometricEnabled: boolean
  isLocked: boolean
  isRestoring: boolean
  lock: () => void
  replaceToken: (token: string, expiresAt: string) => void
  restore: () => Promise<void>
  setBiometricEnabled: (isEnabled: boolean) => Promise<void>
  signIn: (session: LoginResponse) => void
  signOut: () => void
  token: string | null
  unlock: () => void
  user: AuthUser | null
}

const hasExpired = (expiresAt: string) =>
  new Date(expiresAt).getTime() <= Date.now()

const SIGNED_OUT = {
  expiresAt: null,
  isAuthenticated: false,
  isLocked: false,
  isRestoring: false,
  token: null,
  user: null,
} as const

export const useAuthStore = create<AuthState>((set, get) => ({
  ...SIGNED_OUT,
  isBiometricEnabled: false,
  isRestoring: true,
  lock: () => set({ isLocked: true }),
  unlock: () => set({ isLocked: false }),
  replaceToken: (token, expiresAt) => {
    const { user } = get()
    setAuthToken(token)
    if (user) {
      void saveSession({ expiresAt, token, user }).catch(() => {})
    }
    set({ expiresAt, token })
  },
  setBiometricEnabled: async (isEnabled) => {
    await setBiometricPreference(isEnabled).catch(() => {})
    set({ isBiometricEnabled: isEnabled })
  },
  restore: async () => {
    const [session, storedDeviceToken, isBiometricEnabled] = await Promise.all([
      loadSession(),
      loadDeviceToken(),
      getBiometricPreference(),
    ])
    setDeviceToken(storedDeviceToken)

    if (!session || hasExpired(session.expiresAt) || !isBiometricEnabled) {
      await clearSession()
      await offlineService.clearOfflineData().catch(() => {})
      setAuthToken(null)
      set({ ...SIGNED_OUT, isBiometricEnabled })
      return
    }

    setAuthToken(session.token)
    set({
      expiresAt: session.expiresAt,
      isAuthenticated: true,
      isBiometricEnabled,
      isLocked: true,
      isRestoring: false,
      token: session.token,
      user: session.user,
    })
  },
  signIn: ({ deviceToken, expiresAt, names, role, surname, token, userId }) => {
    const user = { names, role, surname, userId }
    setAuthToken(token)
    if (deviceToken) {
      setDeviceToken(deviceToken)
      void saveDeviceToken(deviceToken).catch(() => {})
    }
    void saveSession({ expiresAt, token, user }).catch(() => {})
    set({
      expiresAt,
      isAuthenticated: true,
      isLocked: false,
      isRestoring: false,
      token,
      user,
    })
  },
  signOut: () => {
    setAuthToken(null)
    void clearSession()
    void offlineService.clearOfflineData().catch(() => {})
    set(SIGNED_OUT)
  },
}))
