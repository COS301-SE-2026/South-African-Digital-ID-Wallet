import { useQuery } from '@tanstack/react-query'

import {
  citizenDashboardService,
  toWalletCredentials,
} from '@/services/citizen-dashboard-service'

import { citizenDashboardKeys } from './use-citizen-dashboard'

export const useWalletCredentials = () => {
  const { data, isError, isPending, refetch } = useQuery({
    queryFn: citizenDashboardService.getCredentials,
    queryKey: citizenDashboardKeys.credentials,
    staleTime: 60_000,
  })
  return { credentials: toWalletCredentials(data), isError, isPending, refetch }
}

export const useWalletCredential = (id: string | undefined) => {
  const { credentials, isError, isPending, refetch } = useWalletCredentials()
  return {
    credential: credentials.find((item) => item.id === id) ?? null,
    isError,
    isPending,
    refetch,
  }
}
