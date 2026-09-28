import { useCallback, useState } from 'react'
import * as Crypto from 'expo-crypto'

import { EMERGENCY_CLAIM_SET } from '@/lib/offline/emergency-claims'
import { offlineService } from '@/services/offline-service'
import { useAuthStore } from '@/stores/auth-store'

import { useBiometricUnlock } from './use-biometric-unlock'
import { useOfflineScan } from './use-offline-scan'
import { useVerifierTrust } from './use-verifier-trust'

const GATE_PROMPT = 'Confirm you are opening this emergency profile'

export const useEmergencyOfflineRead = () => {
  const { trust, isLoading: isTrustLoading } = useVerifierTrust()
  const {
    addFrame,
    presentation,
    progress,
    reset: resetScan,
    result,
  } = useOfflineScan(trust, isTrustLoading, undefined, EMERGENCY_CLAIM_SET)
  const { reset: resetUnlock, unlock } = useBiometricUnlock()
  const responderId = useAuthStore((state) => state.user?.userId)

  const [accessedAt, setAccessedAt] = useState<Date | null>(null)
  const [gateError, setGateError] = useState<string | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)

  const confirm = useCallback(
    async (justification: string) => {
      if (!result?.ok || !responderId || !presentation) {
        return
      }

      setGateError(null)
      setIsConfirming(true)

      try {
        const gate = await unlock(GATE_PROMPT)
        if (gate === 'denied') {
          setGateError('Identity check failed. The profile was not opened.')
          return
        }
        if (gate === 'unavailable') {
          setGateError(
            'This device has no enrolled biometrics. Emergency scanning requires one.'
          )
          return
        }

        const nowMs = Date.now()
        await offlineService.queueEmergencyAccess({
          id: Crypto.randomUUID(),
          responderId,
          revocationIndex: result.revocationIndex,
          justification,
          accessedAt: Math.floor(nowMs / 1000),
          presentation,
        })
        setAccessedAt(new Date(nowMs))
      } catch {
        setGateError(
          'This access could not be recorded on the phone. The profile was not opened.'
        )
      } finally {
        setIsConfirming(false)
      }
    },
    [presentation, responderId, result, unlock]
  )

  const reset = useCallback(() => {
    resetScan()
    resetUnlock()
    setAccessedAt(null)
    setGateError(null)
    setIsConfirming(false)
  }, [resetScan, resetUnlock])

  return {
    accessedAt,
    addFrame,
    confirm,
    gateError,
    isConfirming,
    progress,
    reset,
    result,
  }
}
