import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  mockSecurityService,
  securityService,
  toOpenAlert,
  toSecurityActivityEntries,
} from '@/services/security-service'
import type {
  DismissAlertRequest,
  SecureAccountRequest,
  SecureAccountResponse,
  SecurityService,
  SecuritySettingsResponse,
  UpdateSecuritySettingsRequest,
} from '@/services/security-service'
import { useAuthStore } from '@/stores/auth-store'
import { useSecurityResultStore } from '@/stores/security-result-store'

const service: SecurityService =
  process.env.EXPO_PUBLIC_SECURITY_MOCK === 'true'
    ? mockSecurityService
    : securityService

export const securityKeys = {
  activity: ['security', 'activity'] as const,
  alert: (alertId: string) => ['security', 'alert', alertId] as const,
  overview: ['security', 'overview'] as const,
  settings: ['security', 'settings'] as const,
}

const useRefreshSecurity = () => {
  const queryClient = useQueryClient()
  return (alertId: string) => {
    for (const queryKey of [
      securityKeys.overview,
      securityKeys.activity,
      securityKeys.alert(alertId),
      securityKeys.settings,
    ]) {
      void queryClient.invalidateQueries({ queryKey })
    }
  }
}

export const useSecurityOverview = () => {
  const { data, isError, isPending, refetch } = useQuery({
    queryFn: service.getOverview,
    queryKey: securityKeys.overview,
    staleTime: 30_000,
  })
  return {
    activeAlertCount: data?.activeAlertCount ?? 0,
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
  const refreshSecurity = useRefreshSecurity()
  const replaceToken = useAuthStore((state) => state.replaceToken)
  const saveResult = useSecurityResultStore((state) => state.save)
  const { isPending, mutateAsync } = useMutation({
    mutationFn: (request: SecureAccountRequest) =>
      service.secureAccount(alertId, request),
    onSuccess: (result) => {
      if (result.token && result.expiresAt) {
        replaceToken(result.token, result.expiresAt)
      }
      saveResult(alertId, {
        ...result,
        expiresAt: undefined,
        token: undefined,
      })
      refreshSecurity(alertId)
    },
  })
  return { isSecuring: isPending, secureAccount: mutateAsync }
}

export const useDismissAlert = (alertId: string) => {
  const refreshSecurity = useRefreshSecurity()
  const { isPending, mutateAsync } = useMutation({
    mutationFn: (request: DismissAlertRequest) =>
      service.dismissAlert(alertId, request),
    onSuccess: () => refreshSecurity(alertId),
  })
  return { dismissAlert: mutateAsync, isDismissing: isPending }
}

export const useSecureAccountResult = (
  alertId: string
): SecureAccountResponse | null =>
  useSecurityResultStore((state) => state.results[alertId] ?? null)

export const useSecuritySettings = () => {
  const { data, isError, isPending } = useQuery({
    queryFn: service.getSettings,
    queryKey: securityKeys.settings,
  })
  return { isError, isPending, settings: data ?? null }
}

export const useUpdateSecuritySettings = () => {
  const queryClient = useQueryClient()
  const { isPending, mutateAsync } = useMutation({
    mutationFn: (request: UpdateSecuritySettingsRequest) =>
      service.updateSettings(request),
    onSuccess: (settings) => {
      queryClient.setQueryData<SecuritySettingsResponse>(
        securityKeys.settings,
        settings
      )
    },
  })
  return { isUpdating: isPending, updateSettings: mutateAsync }
}
