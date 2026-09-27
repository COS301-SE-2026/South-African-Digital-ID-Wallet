import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { offlineService } from '@/services/offline-service'

import { useNetworkStatus } from './use-network-status'
import { offlinePackageKey } from './use-offline-package'

export const usePrefetchOfflinePackages = (
  credentialIds: readonly string[]
) => {
  const queryClient = useQueryClient()
  const { isOffline } = useNetworkStatus()
  // A string, so a new array holding the same ids does not rerun the effect.
  const idsKey = credentialIds.join(',')

  useEffect(() => {
    if (isOffline || !idsKey) {
      return
    }

    for (const credentialId of idsKey.split(',')) {
      // Fills the exact entry useOfflinePackage reads, and skips any already fetched this visit.
      void queryClient.prefetchQuery({
        queryKey: offlinePackageKey(credentialId, false),
        queryFn: () => offlineService.refreshOfflineCache(credentialId),
        staleTime: Infinity,
        retry: false,
      })
    }
  }, [idsKey, isOffline, queryClient])
}
