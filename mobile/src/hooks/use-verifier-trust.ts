import { useQuery } from '@tanstack/react-query'
import { readOfflineCache } from '@/lib/offline/offline-cache'
import { offlineService } from '@/services/offline-service'
import { useNetworkStatus } from './use-network-status'

export const useVerifierTrust = () => {
  const { isOffline } = useNetworkStatus()

  const { data } = useQuery({
    queryKey: ['verifier-trust', isOffline],
    queryFn: () =>
      isOffline ? readOfflineCache() : offlineService.refreshTrustData(),
    staleTime: Infinity,
    retry: false,
  })

  return { trust: data?.trust ?? null }
}
