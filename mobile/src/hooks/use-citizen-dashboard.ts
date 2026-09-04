import { useQuery } from '@tanstack/react-query'

import { useAuthStore } from '@/stores/auth-store'
import {
  citizenDashboardService,
  officialActivityToResponse,
  toActivityEntries,
  toIdentityStatus,
} from '@/services/citizen-dashboard-service'
import { normalizeRole } from '@/lib/roles'
import { officialDashboardKeys } from './use-official-dashboard'

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
  const isOfficial = useAuthStore(
    (state) => normalizeRole(state.user?.role) === 'official'
  )
  const { data, isError, isPending, refetch } = useQuery({
    queryFn: isOfficial
      ? () =>
          citizenDashboardService
            .getOfficialActivity()
            .then(officialActivityToResponse)
      : citizenDashboardService.getActivity,
    queryKey: isOfficial
      ? officialDashboardKeys.recentActivity
      : citizenDashboardKeys.activity,
    staleTime: 30_000,
  })
  return {
    entries: toActivityEntries(data).slice(0, limit),
    isError,
    isPending,
    refetch,
  }
}
