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

export type RefreshCredentials = {
  refreshToken: string
  refreshTokenExpiresAt: string
}

type AuthState = {
  expiresAt: string | null
  isAuthenticated: boolean
  isBiometricEnabled: boolean
  isLocked: boolean
  isRestoring: boolean
  lock: () => void
  refreshToken: string | null
  refreshTokenExpiresAt: string | null
  replaceToken: (
    token: string,
    expiresAt: string,
    refresh?: RefreshCredentials
  ) => void
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

export const sessionExpiresAt = ({
  expiresAt,
  refreshToken,
  refreshTokenExpiresAt,
}: Pick<AuthState, 'expiresAt' | 'refreshToken' | 'refreshTokenExpiresAt'>) =>
  refreshToken && refreshTokenExpiresAt ? refreshTokenExpiresAt : expiresAt

const SIGNED_OUT = {
  expiresAt: null,
  isAuthenticated: false,
  isLocked: false,
  isRestoring: false,
  refreshToken: null,
  refreshTokenExpiresAt: null,
  token: null,
  user: null,
} as const

const persist = (
  token: string,
  expiresAt: string,
  user: AuthUser,
  refreshToken: string | null,
  refreshTokenExpiresAt: string | null
) =>
  void saveSession({
    expiresAt,
    refreshToken: refreshToken ?? undefined,
    refreshTokenExpiresAt: refreshTokenExpiresAt ?? undefined,
    token,
    user,
  }).catch(() => {})

export const useAuthStore = create<AuthState>((set, get) => ({
  ...SIGNED_OUT,
  isBiometricEnabled: false,
  isRestoring: true,
  lock: () => set({ isLocked: true }),
  unlock: () => set({ isLocked: false }),
  replaceToken: (token, expiresAt, refresh) => {
    const { user } = get()
    const refreshToken = refresh?.refreshToken ?? get().refreshToken
    const refreshTokenExpiresAt =
      refresh?.refreshTokenExpiresAt ?? get().refreshTokenExpiresAt
    setAuthToken(token)
    if (user) {
      persist(token, expiresAt, user, refreshToken, refreshTokenExpiresAt)
    }
    set({ expiresAt, refreshToken, refreshTokenExpiresAt, token })
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

    const refreshToken = session?.refreshToken ?? null
    const refreshTokenExpiresAt = session?.refreshTokenExpiresAt ?? null
    const expiry = session
      ? sessionExpiresAt({
          expiresAt: session.expiresAt,
          refreshToken,
          refreshTokenExpiresAt,
        })
      : null

    // A stored session is only ever resumed behind a biometric check.
    // Without one there is nothing guarding it, so discard it.
    if (!session || !expiry || hasExpired(expiry) || !isBiometricEnabled) {
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
      refreshToken,
      refreshTokenExpiresAt,
      token: session.token,
      user: session.user,
    })
  },
  signIn: ({
    deviceToken,
    expiresAt,
    names,
    refreshToken,
    refreshTokenExpiresAt,
    role,
    surname,
    token,
    userId,
  }) => {
    const user = { names, role, surname, userId }
    setAuthToken(token)
    if (deviceToken) {
      setDeviceToken(deviceToken)
      void saveDeviceToken(deviceToken).catch(() => {})
    }
    persist(
      token,
      expiresAt,
      user,
      refreshToken ?? null,
      refreshTokenExpiresAt ?? null
    )
    set({
      expiresAt,
      isAuthenticated: true,
      isLocked: false,
      isRestoring: false,
      refreshToken: refreshToken ?? null,
      refreshTokenExpiresAt: refreshTokenExpiresAt ?? null,
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
