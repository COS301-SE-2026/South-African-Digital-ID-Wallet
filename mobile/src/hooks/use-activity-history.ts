import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { normalizeRole } from '@/lib/roles'
import {
  citizenDashboardService,
  filterActivityEntries,
  groupActivityEntries,
  officialActivityToResponse,
  toActivityEntries,
} from '@/services/citizen-dashboard-service'
import type {
  ActivityFilterName,
  ActivityRange,
} from '@/services/citizen-dashboard-service'
import { useAuthStore } from '@/stores/auth-store'

import { citizenDashboardKeys } from './use-citizen-dashboard'

const OFFICIAL_ACTIVITY_KEY = ['dashboard', 'activity', 'official'] as const

export const useActivityHistory = () => {
  const isOfficial = useAuthStore(
    (state) => normalizeRole(state.user?.role) === 'official'
  )
  const [category, setCategory] = useState<ActivityFilterName>('all')
  const [range, setRange] = useState<ActivityRange>('all')

  const { data, isError, isPending, isRefetching, refetch } = useQuery({
    queryFn: isOfficial
      ? () =>
          citizenDashboardService
            .getOfficialActivity()
            .then(officialActivityToResponse)
      : citizenDashboardService.getActivity,
    queryKey: isOfficial
      ? OFFICIAL_ACTIVITY_KEY
      : citizenDashboardKeys.activity,
    staleTime: 30_000,
  })

  const groups = useMemo(
    () =>
      groupActivityEntries(
        filterActivityEntries(toActivityEntries(data), { category, range })
      ),
    [category, data, range]
  )

  return {
    category,
    groups,
    isError,
    isPending,
    isRefetching,
    range,
    refetch,
    setCategory,
    setRange,
  }
}
