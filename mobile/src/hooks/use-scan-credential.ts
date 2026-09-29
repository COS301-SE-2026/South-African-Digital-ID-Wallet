import { useMutation, useQueryClient } from '@tanstack/react-query'

import { scanService } from '@/services/scan-service'

import { officialDashboardKeys } from './use-official-dashboard'

export const useScanCredential = () => {
  const queryClient = useQueryClient()
  const { data, isPending, mutate, reset } = useMutation({
    mutationFn: scanService.resolveCredential,
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: officialDashboardKeys.activity,
      }),
  })
  return {
    isResolving: isPending,
    reset,
    resolve: mutate,
    result: data ?? null,
  }
}
