import { useMutation } from '@tanstack/react-query'

import { scanService } from '@/services/scan-service'

export const useScanCredential = () => {
  const { data, isPending, mutate, reset } = useMutation({
    mutationFn: scanService.resolveCredential,
  })
  return {
    isResolving: isPending,
    reset,
    resolve: mutate,
    result: data ?? null,
  }
}
