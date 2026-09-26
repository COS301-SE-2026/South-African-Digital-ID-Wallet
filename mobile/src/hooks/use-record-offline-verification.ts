import { useCallback } from 'react'
import { toOfflineVerification } from '@/lib/offline/offline-audit'
import type { VerificationResult } from '@/lib/offline/verify'
import { normalizeRole } from '@/lib/roles'
import { offlineService } from '@/services/offline-service'
import { useAuthStore } from '@/stores/auth-store'
import { useNetworkStatus } from './use-network-status'

export const useRecordOfflineVerification = () => {
  const { isOffline } = useNetworkStatus()
  const verifierId = useAuthStore((state) => state.user?.userId)
  const isOfficial = useAuthStore(
    (state) => normalizeRole(state.user?.role) === 'official'
  )

  return useCallback(
    (result: VerificationResult) => {
      // Only officials' scans belong in the audit trail, and the backend refuses anyone else's.
      if (!verifierId || !isOfficial) {
        return
      }

      // Queued first so no scan is lost; with signal it is uploaded straight away (checklist 5.2a).
      void offlineService
        .queueOfflineVerification(
          toOfflineVerification(
            result,
            Math.floor(Date.now() / 1000),
            verifierId
          )
        )
        .then(() =>
          isOffline
            ? undefined
            : offlineService.syncOfflineVerifications(verifierId)
        )
        .catch(() => {
          // A failed upload stays queued, and OfflineVerificationSync retries it on the next trigger.
        })
    },
    [isOffline, isOfficial, verifierId]
  )
}
