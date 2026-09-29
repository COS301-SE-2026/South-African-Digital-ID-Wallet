import { useEffect, useRef } from 'react'
import { AppState, type AppStateStatus } from 'react-native'

import { useAuthStore } from '@/stores/auth-store'

const MAX_BACKGROUND_MS = 2 * 60 * 1000

export const SessionLockWatcher = () => {
  const backgroundAtRef = useRef<number | null>(null)
  useEffect(() => {
    const handleChange = (nextState: AppStateStatus) => {
      const { expiresAt, isAuthenticated, isBiometricEnabled, lock, signOut } =
        useAuthStore.getState()
      if (!isAuthenticated) {
        return
      }
      if (nextState === 'background') {
        backgroundAtRef.current = Date.now()
        return
      }
      if (nextState !== 'active') {
        return
      }
      const backgroundedAt = backgroundAtRef.current
      backgroundAtRef.current = null
      const tokenExpired = expiresAt
        ? new Date(expiresAt).getTime() <= Date.now()
        : false
      const idledOut =
        backgroundedAt !== null &&
        Date.now() - backgroundedAt > MAX_BACKGROUND_MS

      if (tokenExpired || (idledOut && !isBiometricEnabled)) {
        signOut()
        return
      }
      if (idledOut) {
        lock()
      }
    }
    const subscription = AppState.addEventListener('change', handleChange)
    return () => subscription.remove()
  }, [])
  return null
}
