import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import FlashidEmergency from '@/../modules/flashid-emergency'
import { emergencyService } from '@/services'
import type { EmergencyProfile, SaveEmergencyProfileRequest } from '@/services'

import { emergencyKeys } from './use-emergency-device'

const syncLockScreen = async (profile: EmergencyProfile): Promise<boolean> => {
  try {
    if (!profile.isEnabled) {
      await FlashidEmergency.disableEmergency()
      return true
    }
    if (!(await FlashidEmergency.isConfigured())) {
      return true
    }
    const credential = await emergencyService.getOfflineCredential()
    await FlashidEmergency.setOfflineBundle(credential.sdJwt)
    return true
  } catch {
    return false
  }
}

export const useEmergencyProfile = () => {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryFn: emergencyService.getProfile,
    queryKey: emergencyKeys.profile,
  })

  const mutation = useMutation({
    mutationFn: async (request: SaveEmergencyProfileRequest) => {
      const profile = await emergencyService.saveProfile(request)
      const isLockScreenCurrent = await syncLockScreen(profile)
      return { isLockScreenCurrent, profile }
    },
    onSuccess: async ({ profile }) => {
      queryClient.setQueryData(emergencyKeys.profile, profile)
      await queryClient.invalidateQueries({ queryKey: emergencyKeys.device })
    },
  })

  return {
    isLoading: query.isLoading,
    isSaving: mutation.isPending,
    loadError: query.error,
    lockScreenOutOfDate: mutation.data?.isLockScreenCurrent === false,
    profile: query.data,
    save: mutation.mutateAsync,
    saveError: mutation.error,
  }
}

export const useEmergencyDeviceStatus = () => {
  const { data, isLoading } = useQuery({
    queryFn: () => FlashidEmergency.isConfigured(),
    queryKey: emergencyKeys.device,
  })

  return { isChecking: isLoading, isConfigured: data ?? false }
}
