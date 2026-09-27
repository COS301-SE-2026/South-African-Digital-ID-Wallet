import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  mockSecurityService,
  toOpenAlert,
  toSecurityActivityEntries,
} from '@/services/security-service'
import type {
  SecureAccountRequest,
  SecureAccountResponse,
  SecurityService,
} from '@/services/security-service'

// INTEGRATION: swap to securityService (same interface) to use the real API
const service: SecurityService = mockSecurityService

export const securityKeys = {
  activity: ['security', 'activity'] as const,
  alert: (alertId: string) => ['security', 'alert', alertId] as const,
  overview: ['security', 'overview'] as const,
  result: (alertId: string) => ['security', 'result', alertId] as const,
}

export const useSecurityOverview = () => {
  const { data, isError, isPending, refetch } = useQuery({
    queryFn: service.getOverview,
    queryKey: securityKeys.overview,
    staleTime: 30_000,
  })
  return {
    alert: toOpenAlert(data),
    isError,
    isPending,
    recentActivity: toSecurityActivityEntries(data?.recentActivity),
    refetch,
  }
}

export const useSecurityActivity = (isEnabled: boolean) => {
  const { data, isError, isPending } = useQuery({
    enabled: isEnabled,
    queryFn: () => service.getActivity(),
    queryKey: securityKeys.activity,
  })
  return { entries: toSecurityActivityEntries(data), isError, isPending }
}

export const useSecurityAlert = (alertId: string) => {
  const { data, isError, isPending } = useQuery({
    enabled: Boolean(alertId),
    queryFn: () => service.getAlert(alertId),
    queryKey: securityKeys.alert(alertId),
  })
  return { alert: data ?? null, isError, isPending }
}

export const useSecureAccount = (alertId: string) => {
  const queryClient = useQueryClient()
  const { isPending, mutateAsync } = useMutation({
    mutationFn: (request: SecureAccountRequest) =>
      service.secureAccount(alertId, request),
    onSuccess: (result) => {
      // INTEGRATION: store result.token here first, because the backend has just invalidated the old one
      // The token is stripped so it never sits in the query cache
      queryClient.setQueryData<SecureAccountResponse>(
        securityKeys.result(alertId),
        { ...result, expiresAt: undefined, token: undefined }
      )
      void queryClient.invalidateQueries({ queryKey: securityKeys.overview })
      void queryClient.invalidateQueries({ queryKey: securityKeys.activity })
      void queryClient.invalidateQueries({
        queryKey: securityKeys.alert(alertId),
      })
    },
  })
  return { isSecuring: isPending, secureAccount: mutateAsync }
}

// Written by useSecureAccount just before navigating, so no request is needed
export const useSecureAccountResult = (
  alertId: string
): SecureAccountResponse | null =>
  useQueryClient().getQueryData<SecureAccountResponse>(
    securityKeys.result(alertId)
  ) ?? null
