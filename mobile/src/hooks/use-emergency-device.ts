import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as Device from 'expo-device'

import FlashidEmergency from '@/../modules/flashid-emergency'
import { emergencyService } from '@/services'

export const emergencyKeys = {
  device: ['emergency', 'device'] as const,
  profile: ['emergency', 'profile'] as const,
}

export const useRegisterEmergencyDevice = () => {
  const queryClient = useQueryClient()

  const { error, isPending, mutate } = useMutation({
    mutationFn: async () => {
      const key = await FlashidEmergency.generateEmergencyKey()

      const { handle } = await emergencyService.registerDevice({
        deviceLabel: Device.modelName ?? 'Android device',
        isStrongBoxBacked: key.isStrongBoxBacked,
        platform: 'android',
        publicKeySpki: key.publicKeySpki,
      })

      await FlashidEmergency.setEmergencyHandle(handle)

      const credential = await emergencyService.getOfflineCredential()
      await FlashidEmergency.setOfflineBundle(credential.sdJwt)

      return { handle, isStrongBoxBacked: key.isStrongBoxBacked }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: emergencyKeys.profile })
      await queryClient.invalidateQueries({ queryKey: emergencyKeys.device })
    },
  })

  return { error, isRegistering: isPending, register: mutate }
}
