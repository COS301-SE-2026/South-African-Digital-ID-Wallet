import { create } from 'zustand'

import { setAuthToken } from '@/lib/api'
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
  signIn: (session: LoginResponse) => void
  signOut: () => void
  token: string | null
  user: AuthUser | null
}

export const useAuthStore = create<AuthState>((set) => ({
  expiresAt: null,
  isAuthenticated: false,
  token: null,
  user: null,
  signIn: ({ expiresAt, names, role, surname, token, userId }) => {
    setAuthToken(token)
    set({
      expiresAt,
      isAuthenticated: true,
      token,
      user: { names, role, surname, userId },
    })
  },
  signOut: () => {
    setAuthToken(null)
    set({ expiresAt: null, isAuthenticated: false, token: null, user: null })
  },
}))
