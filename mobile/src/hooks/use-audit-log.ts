import { useEffect, useMemo, useState } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'

import {
  auditLogService,
  toAuditLogEntries,
} from '@/services/audit-log-service'
import type {
  AuditLogOutcomeFilter,
  AuditLogResponse,
} from '@/services/audit-log-service'

const SEARCH_DEBOUNCE_MS = 300
const ACTIONS_STALE_TIME = 5 * 60_000

export const auditLogKeys = {
  actions: ['official', 'audit-log', 'actions'] as const,
  history: (search: string, outcome: string, action: string | undefined) =>
    ['official', 'audit-log', { action, outcome, search }] as const,
}

export const useAuditLog = () => {
  const [action, setAction] = useState<string | undefined>(undefined)
  const [outcome, setOutcome] = useState<AuditLogOutcomeFilter>('all')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timeout = setTimeout(
      () => setDebouncedSearch(search),
      SEARCH_DEBOUNCE_MS
    )
    return () => clearTimeout(timeout)
  }, [search])

  const history = useInfiniteQuery({
    getNextPageParam: (
      lastPage: AuditLogResponse,
      pages: AuditLogResponse[]
    ) => {
      const loaded = pages.reduce((count, page) => count + page.items.length, 0)
      return loaded < lastPage.totalCount ? lastPage.page + 1 : undefined
    },
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      auditLogService.getHistory(
        { action, outcome, search: debouncedSearch },
        pageParam
      ),
    queryKey: auditLogKeys.history(debouncedSearch, outcome, action),
    staleTime: 30_000,
  })

  const { data: actions } = useQuery({
    queryFn: auditLogService.getActions,
    queryKey: auditLogKeys.actions,
    staleTime: ACTIONS_STALE_TIME,
  })

  const entries = useMemo(
    () => toAuditLogEntries(history.data?.pages.flatMap((page) => page.items)),
    [history.data]
  )

  return {
    action,
    actions: actions ?? [],
    entries,
    fetchNextPage: history.fetchNextPage,
    hasNextPage: history.hasNextPage,
    isError: history.isError,
    isFetchingNextPage: history.isFetchingNextPage,
    isPending: history.isPending,
    isRefetching: history.isRefetching,
    outcome,
    refetch: history.refetch,
    search,
    setAction,
    setOutcome,
    setSearch,
    totalCount: history.data?.pages[0]?.totalCount ?? 0,
  }
}
