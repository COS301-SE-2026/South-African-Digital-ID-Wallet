import { create } from 'zustand'

import { setAuthToken } from '@/lib/api'
import { clearSession, loadSession, saveSession } from '@/lib/secure-session'
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
  isRestoring: boolean
  restore: () => Promise<void>
  signIn: (session: LoginResponse) => void
  signOut: () => void
  token: string | null
  user: AuthUser | null
}

const hasExpired = (expiresAt: string) =>
  new Date(expiresAt).getTime() <= Date.now()

const SIGNED_OUT = {
  expiresAt: null,
  isAuthenticated: false,
  isRestoring: false,
  token: null,
  user: null,
} as const

export const useAuthStore = create<AuthState>((set) => ({
  ...SIGNED_OUT,
  isRestoring: true,
  restore: async () => {
    const session = await loadSession()
    if (!session || hasExpired(session.expiresAt)) {
      await clearSession()
      setAuthToken(null)
      set(SIGNED_OUT)
      return
    }
    setAuthToken(session.token)
    set({
      expiresAt: session.expiresAt,
      isAuthenticated: true,
      isRestoring: false,
      token: session.token,
      user: session.user,
    })
  },
  signIn: ({ expiresAt, names, role, surname, token, userId }) => {
    const user = { names, role, surname, userId }
    setAuthToken(token)
    void saveSession({ expiresAt, token, user }).catch(() => {})
    set({ expiresAt, isAuthenticated: true, isRestoring: false, token, user })
  },
  signOut: () => {
    setAuthToken(null)
    void clearSession()
    set(SIGNED_OUT)
  },
}))
