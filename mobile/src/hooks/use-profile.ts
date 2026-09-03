import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { profileService } from '@/services/profile-service'
import type { UpdatePasswordRequest } from '@/services/profile-service'

export const profileKeys = {
  account: ['profile', 'account'] as const,
  devices: ['profile', 'devices'] as const,
  notifications: ['profile', 'notifications'] as const,
  profile: ['profile', 'me'] as const,
}

export const useProfile = () => {
  const { data, isError, isPending } = useQuery({
    queryFn: profileService.getProfile,
    queryKey: profileKeys.profile,
    staleTime: 60_000,
  })
  return { isError, isPending, profile: data ?? null }
}

export const useAccountDetails = (isEnabled: boolean) => {
  const { data } = useQuery({
    enabled: isEnabled,
    queryFn: profileService.getAccount,
    queryKey: profileKeys.account,
    staleTime: 60_000,
  })
  return { account: data ?? null }
}

export const useTrustedDevices = (isEnabled: boolean) => {
  const queryClient = useQueryClient()
  const { data, isError, isPending } = useQuery({
    enabled: isEnabled,
    queryFn: profileService.getTrustedDevices,
    queryKey: profileKeys.devices,
  })
  const { isPending: isUnlinking, mutate } = useMutation({
    mutationFn: profileService.unlinkDevice,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: profileKeys.devices }),
  })
  return {
    devices: data ?? [],
    isError,
    isPending,
    isUnlinking,
    unlink: mutate,
  }
}

export const useUserNotifications = (isEnabled: boolean) => {
  const { data, isError, isPending } = useQuery({
    enabled: isEnabled,
    queryFn: profileService.getNotifications,
    queryKey: profileKeys.notifications,
  })
  return { isError, isPending, notifications: data ?? [] }
}

export const useUpdatePassword = () => {
  const { mutateAsync } = useMutation({
    mutationFn: (dto: UpdatePasswordRequest) =>
      profileService.updatePassword(dto),
  })
  return { updatePassword: mutateAsync }
}

export const useEmailChange = () => {
  const queryClient = useQueryClient()
  const confirm = useMutation({
    mutationFn: profileService.confirmEmailChange,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: profileKeys.profile })
      void queryClient.invalidateQueries({ queryKey: profileKeys.account })
    },
  })
  const request = useMutation({ mutationFn: profileService.requestEmailChange })
  const resend = useMutation({ mutationFn: profileService.resendEmailOtp })
  const verify = useMutation({ mutationFn: profileService.verifyPassword })

  return {
    confirmEmail: confirm.mutateAsync,
    requestEmail: request.mutateAsync,
    resendOtp: resend.mutateAsync,
    verifyPassword: verify.mutateAsync,
  }
}
