import { useQuery } from '@tanstack/react-query'

import { readOfflineCache } from '@/lib/offline/offline-cache'
import { offlineService } from '@/services/offline-service'

import { useNetworkStatus } from './use-network-status'

// Shared with usePrefetchOfflinePackages, so a package prepared at login is reused by Share.
export const offlinePackageKey = (
  credentialId: string | undefined,
  isOffline: boolean
) => ['offline-package', credentialId, isOffline] as const

// NetInfo can report online while the API is unreachable (captive portal, weak signal, API down),
// so a failed refresh still falls back to whatever is on the phone.
const refreshOrReadCache = async (credentialId: string) => {
  try {
    return await offlineService.refreshOfflineCache(credentialId)
  } catch {
    return readOfflineCache()
  }
}

export const useOfflinePackage = (credentialId: string | undefined) => {
  const { isOffline } = useNetworkStatus()

  const { data, isFetching } = useQuery({
    // Keyed on connectivity too, so regaining signal refreshes and losing it falls back to the phone.
    queryKey: offlinePackageKey(credentialId, isOffline),
    enabled: Boolean(credentialId),
    // Either way the result is the cache contents: refreshed online, as stored offline.
    queryFn: () =>
      isOffline
        ? readOfflineCache()
        : refreshOrReadCache(credentialId as string),
    // Online, once per visit is enough: a package lasts 30 days. Offline, the cache is reread
    // every time, because a refresh made while online may have changed it since.
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
