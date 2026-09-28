import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import FlashidEmergency from '@/../modules/flashid-emergency'
import { emergencyService } from '@/services'
import type { EmergencyProfile, SaveEmergencyProfileRequest } from '@/services'

import { emergencyKeys } from './use-emergency-device'

const syncLockScreen = async (profile: EmergencyProfile) => {
  try {
    if (!profile.isEnabled) {
      await FlashidEmergency.disableEmergency()
      return
    }
    if (!(await FlashidEmergency.isConfigured())) {
      return
    }
    const credential = await emergencyService.getOfflineCredential()
    await FlashidEmergency.setOfflineBundle(credential.sdJwt)
  } catch {
    return
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
      const saved = await emergencyService.saveProfile(request)
      await syncLockScreen(saved)
      return saved
    },
    onSuccess: async (saved) => {
      queryClient.setQueryData(emergencyKeys.profile, saved)
      await queryClient.invalidateQueries({ queryKey: emergencyKeys.device })
    },
  })

  return {
    isLoading: query.isLoading,
    isSaving: mutation.isPending,
    loadError: query.error,
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
