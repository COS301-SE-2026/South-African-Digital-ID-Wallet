import { useQuery } from '@tanstack/react-query'

import { officialService } from '@/services/official-service'

export const officialDashboardKeys = {
  activity: ['official', 'activity'] as const,
  badge: ['official', 'badge'] as const,
  recentActivity: ['official', 'recent-activity'] as const,
  stats: ['official', 'stats'] as const,
}

const BADGE_STALE_TIME = 45_000

export const useOfficerBadge = () => {
  const { data, isError, isPending, refetch } = useQuery({
    queryFn: officialService.getBadge,
    queryKey: officialDashboardKeys.badge,
    staleTime: BADGE_STALE_TIME,
  })
  return { badge: data ?? null, isError, isPending, refetch }
}

export const useOfficialStats = () => {
  const { data, isError, isPending, isRefetching, refetch } = useQuery({
    queryFn: officialService.getStats,
    queryKey: officialDashboardKeys.stats,
    staleTime: 30_000,
  })

  return {
    isError,
    isPending,
    isRefetching,
    refetch,
    stats: data ?? {
      todayCount: 0,
      isCapped: false,
    },
  }
}
