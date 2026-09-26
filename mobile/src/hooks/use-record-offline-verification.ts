import { useCallback } from 'react'
import { toOfflineVerification } from '@/lib/offline/offline-audit'
import type { VerificationResult } from '@/lib/offline/verify'
import { offlineService } from '@/services/offline-service'
import { useNetworkStatus } from './use-network-status'

export const useRecordOfflineVerification = () => {
  const { isOffline } = useNetworkStatus()

  return useCallback(
    (result: VerificationResult) => {
      // Queued first so no scan is lost; with signal it is uploaded straight away (checklist 5.2a).
      void offlineService
        .queueOfflineVerification(
          toOfflineVerification(result, Math.floor(Date.now() / 1000))
        )
        .then(() =>
          isOffline ? undefined : offlineService.syncOfflineVerifications()
        )
        .catch(() => {
          // A failed upload stays queued, and OfflineVerificationSync retries it on the next trigger.
        })
    },
    [isOffline]
  )
}
