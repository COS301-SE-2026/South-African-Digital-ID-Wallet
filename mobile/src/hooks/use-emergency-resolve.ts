import { useCallback, useState } from 'react'
import { useMutation } from '@tanstack/react-query'

import {
  emergencyService,
  resolveEmergencyError,
} from '@/services/emergency-service'
import type { ResolveEmergencyRequest } from '@/services/emergency-service'

import { useBiometricUnlock } from './use-biometric-unlock'

const GATE_PROMPT = 'Confirm you are opening this emergency profile'

export const useEmergencyResolve = () => {
  const { reset: resetUnlock, status, unlock } = useBiometricUnlock()
  const [gateError, setGateError] = useState<string | null>(null)

  const {
    data,
    error,
    isPending,
    mutateAsync,
    reset: resetMutation,
  } = useMutation({ mutationFn: emergencyService.resolve })

  const resolve = useCallback(
    async (request: ResolveEmergencyRequest) => {
      setGateError(null)
      const gate = await unlock(GATE_PROMPT)
      if (gate === 'denied') {
        setGateError('Identity check failed. The profile was not opened.')
        return null
      }
      if (gate === 'unavailable') {
        setGateError(
          'This device has no enrolled biometrics. Emergency scanning requires one.'
        )
        return null
      }
      return mutateAsync(request)
    },
    [mutateAsync, unlock]
  )

  const reset = useCallback(() => {
    setGateError(null)
    resetUnlock()
    resetMutation()
  }, [resetMutation, resetUnlock])

  return {
    error: gateError ?? (error ? resolveEmergencyError(error) : null),
    isResolving: isPending || status === 'checking',
    profile: data ?? null,
    reset,
    resolve,
  }
}
