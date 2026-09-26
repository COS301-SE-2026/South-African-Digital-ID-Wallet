import { useQuery } from '@tanstack/react-query'
import { readOfflineCache } from '@/lib/offline/offline-cache'
import { offlineService } from '@/services/offline-service'
import { useNetworkStatus } from './use-network-status'

export const useVerifierTrust = () => {
  const { isOffline } = useNetworkStatus()

  const { data, isPending } = useQuery({
    queryKey: ['verifier-trust', isOffline],
    queryFn: () =>
      isOffline ? readOfflineCache() : offlineService.refreshTrustData(),
    staleTime: isOffline ? 0 : Infinity,
    retry: false,
    // Offline this query reads the phone's cache, so it must run even when TanStack pauses the rest.
    networkMode: 'always',
  })

  return { trust: data?.trust ?? null, isLoading: isPending }
}
