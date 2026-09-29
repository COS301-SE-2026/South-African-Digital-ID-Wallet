import { useEffect, useRef } from 'react'
import { AppState, Platform } from 'react-native'

import FlashidEmergency from '@/../modules/flashid-emergency'
import { useNetworkStatus } from '@/hooks/use-network-status'
import { normalizeRole } from '@/lib/roles'
import { emergencyService } from '@/services/emergency-service'
import { useAuthStore } from '@/stores/auth-store'

const REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000

export const EmergencyLockScreenRefresh = () => {
  const isCitizen = useAuthStore(
    (state) =>
      state.isAuthenticated && normalizeRole(state.user?.role) === 'citizen'
  )
  const { isOnline } = useNetworkStatus()
  const lastRefreshAt = useRef(0)

  useEffect(() => {
    if (Platform.OS !== 'android' || !isCitizen || !isOnline) {
      return
    }

    const refresh = () => {
      const now = Date.now()
      if (now - lastRefreshAt.current < REFRESH_INTERVAL_MS) {
        return
      }
      lastRefreshAt.current = now

      void (async () => {
        if (!(await FlashidEmergency.isConfigured())) {
          return
        }
        const credential = await emergencyService.getOfflineCredential()
        await FlashidEmergency.setOfflineBundle(credential.sdJwt)
      })().catch(() => {
        lastRefreshAt.current = 0
      })
    }

    refresh()
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        refresh()
      }
    })

    return () => subscription.remove()
  }, [isCitizen, isOnline])

  return null
}
