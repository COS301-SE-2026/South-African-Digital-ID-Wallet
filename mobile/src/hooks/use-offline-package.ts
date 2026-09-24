import { useQuery } from '@tanstack/react-query'
import { readOfflineCache } from '@/lib/offline/offline-cache'
import { offlineService } from '@/services/offline-service'
import { useNetworkStatus } from './use-network-status'

export const offlinePackageKey = (
  credentialId: string | undefined,
  isOffline: boolean
) => ['offline-package', credentialId, isOffline] as const
export const useOfflinePackage = (credentialId: string | undefined) => {
  const { isOffline } = useNetworkStatus()

  const { data, isFetching } = useQuery({
    // Keyed on connectivity too, so regaining signal refreshes and losing it falls back to the phone.
    queryKey: offlinePackageKey(credentialId, isOffline),
    enabled: Boolean(credentialId),
    // Online, fetch this credential's package plus the trust data, which also rewrites the cache.
    // Offline, read what is already on the phone. Either way the result is the cache contents.
    queryFn: () =>
      isOffline
        ? readOfflineCache()
        : offlineService.refreshOfflineCache(credentialId as string),
    // Online, once per visit is enough, a package lasts 30 days. Offline, the cache is reread every time, because a refresh made while online may have changed it since.
    staleTime: isOffline ? 0 : Infinity,
    retry: false,
    // Offline this query reads the phone's cache, so it must run even when TanStack pauses the rest.
    networkMode: 'always',
  })

  return {
    offlinePackage: (credentialId && data?.packages[credentialId]) || null,
    isPreparing: isFetching,
  }
}
