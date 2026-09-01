import { useQuery } from '@tanstack/react-query'

import {
  citizenDashboardService,
  toActivityEntries,
  toIdentityStatus,
} from '@/services/citizen-dashboard-service'

export const RECENT_ACTIVITY_LIMIT = 3

export const citizenDashboardKeys = {
  activity: ['dashboard', 'activity'] as const,
  credentials: ['dashboard', 'credentials'] as const,
}

export const useIdentityStatus = () => {
  const { data, isError, isPending, refetch } = useQuery({
    queryFn: citizenDashboardService.getCredentials,
    queryKey: citizenDashboardKeys.credentials,
    staleTime: 60_000,
  })
  return { isError, isPending, refetch, summary: toIdentityStatus(data) }
}

export const useRecentActivity = (limit = RECENT_ACTIVITY_LIMIT) => {
  const { data, isError, isPending, refetch } = useQuery({
    queryFn: citizenDashboardService.getActivity,
    queryKey: citizenDashboardKeys.activity,
    staleTime: 30_000,
  })
  return {
    entries: toActivityEntries(data).slice(0, limit),
    isError,
    isPending,
    refetch,
  }
}
