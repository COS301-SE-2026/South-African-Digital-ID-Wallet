import { useQuery } from '@tanstack/react-query'

import { readOfflineCache } from '@/lib/offline/offline-cache'
import { offlineService } from '@/services/offline-service'

import { useNetworkStatus } from './use-network-status'

export const useOfflinePackage = (credentialId: string | undefined) => {
  const { isOffline } = useNetworkStatus()

  const { data, isFetching } = useQuery({
    // Keyed on connectivity too, so regaining signal refreshes and losing it falls back to the phone.
    queryKey: ['offline-package', credentialId, isOffline],
    enabled: Boolean(credentialId),
    // Online, fetch this credential's package plus the trust data, which also rewrites the cache.
    // Offline, read what is already on the phone. Either way the result is the cache contents.
    queryFn: () =>
      isOffline
        ? readOfflineCache()
        : offlineService.refreshOfflineCache(credentialId as string),
    // A package lasts 30 days and the backend decides when to re-mint, so once per visit is enough.
    staleTime: Infinity,
    retry: false,
  })

  return {
    offlinePackage: (credentialId && data?.packages[credentialId]) || null,
    isPreparing: isFetching,
  }
}
