import { useEffect } from 'react'
import { AppState } from 'react-native'
import { useNetworkStatus } from '@/hooks'
import { offlineService } from '@/services/offline-service'
import { useAuthStore } from '@/stores/auth-store'

// Uploads scans queued while offline: when someone signs in, when signal returns, and whenever the
// app comes back to the foreground (checklist 5.5). Only the signed-in official's own scans are sent.
export const OfflineVerificationSync = () => {
  const verifierId = useAuthStore((state) =>
    state.isAuthenticated ? state.user?.userId : undefined
  )
  const { isOnline } = useNetworkStatus()

  useEffect(() => {
    if (!verifierId || !isOnline) {
      return
    }

    const sync = () => {
      void offlineService.syncOfflineVerifications(verifierId).catch(() => {
        // Still queued; the next trigger tries again.
      })
    }

    sync()
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        sync()
      }
    })

    return () => subscription.remove()
  }, [isOnline, verifierId])

  return null
}
