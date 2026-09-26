import { useCallback, useState } from 'react'

import { requiresKeyBinding } from '@/lib/offline/key-binding'
import {
  PayloadFrameAccumulator,
  type AccumulatedPayload,
} from '@/lib/offline/qr-frame-accumulator'
import {
  verifyPresentation,
  type TrustData,
  type VerificationResult,
} from '@/lib/offline/verify'

export type OfflineScanProgress = { received: number; total: number }

// Every payload frame is in, and a bound credential also has its K frame.
const isReadyToVerify = (snapshot: AccumulatedPayload): boolean =>
  snapshot.complete &&
  snapshot.presentation !== null &&
  (snapshot.keyBindingJwt !== null ||
    !requiresKeyBinding(snapshot.presentation))

export const useOfflineScan = (
  trust: TrustData | null,
  isTrustLoading = false,
  onResult?: (result: VerificationResult) => void
) => {
  // useState's lazy initialiser builds the accumulator on the first render only, never again.
  const [accumulator] = useState(() => new PayloadFrameAccumulator())
  const [progress, setProgress] = useState<OfflineScanProgress | null>(null)
  const [result, setResult] = useState<VerificationResult | null>(null)

  const addFrame = useCallback(
    (rawText: string) => {
      // The camera keeps reading the same code until the result screen replaces it, so later
      // frames are ignored rather than collected and verified a second time.
      if (result) {
        return
      }

      let snapshot: AccumulatedPayload

      try {
        snapshot = accumulator.add(rawText)
      } catch {
        // A misread frame is skipped: the display cycles, so the same frame comes round again.
        return
      }

      // Still collecting, waiting for a bound credential's K frame, or waiting for the verifier's
      // keys. The code keeps cycling, so a later frame completes it once everything is in.
      if (!isReadyToVerify(snapshot) || isTrustLoading) {
        setProgress({ received: snapshot.received, total: snapshot.total })
        return
      }

      accumulator.reset()
      setProgress(null)

      const verification: VerificationResult = trust
        ? verifyPresentation(
            `${snapshot.presentation}${snapshot.keyBindingJwt ?? ''}`,
            trust,
            { now: Math.floor(Date.now() / 1000) }
          )
        : { ok: false, code: 'STALE_TRUST_DATA', warnings: [] }

      setResult(verification)
      onResult?.(verification)
    },
    [accumulator, isTrustLoading, onResult, result, trust]
  )

  const reset = useCallback(() => {
    accumulator.reset()
    setProgress(null)
    setResult(null)
  }, [accumulator])

  return { addFrame, progress, reset, result }
}
