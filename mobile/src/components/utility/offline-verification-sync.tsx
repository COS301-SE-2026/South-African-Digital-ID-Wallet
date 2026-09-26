import { useEffect } from 'react'
import { AppState } from 'react-native'
import { useNetworkStatus } from '@/hooks'
import { offlineService } from '@/services/offline-service'
import { useAuthStore } from '@/stores/auth-store'

// Uploads scans queued while offline: when someone signs in, when signal returns, and whenever the
// app comes back to the foreground (checklist 5.5).
export const OfflineVerificationSync = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const { isOnline } = useNetworkStatus()

  useEffect(() => {
    if (!isAuthenticated || !isOnline) {
      return
    }

    const sync = () => {
      void offlineService.syncOfflineVerifications().catch(() => {
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
  }, [isAuthenticated, isOnline])

  return null
}
